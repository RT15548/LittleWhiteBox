// 同一份财务视图给模型与案头读取；预测不修改状态，也不把会费均摊当成到账。
([club, classes, cat]) => {
  const P = cat.price, R = cat.rule;
  const names = Object.keys(club.members).filter(n => club.members[n].status === '在读');
  const cycle = R['会费周期周数'];
  const weekTransactions = club.cashbook;
  const transactions = weekTransactions.filter(t => t.week === club.week && t.day === club.day);
  const heldClasses = weekTransactions.filter(t => t.kind === '课费').length;
  const scheduled = Object.values(classes).filter(k => k.open && k.night > 0);
  const remaining = scheduled.filter(k => k.night >= club.day && k.members.some(n => club.members[n].classWeek !== club.week));
  const weeklyRent = P['整层周租'] + Math.max(0, Object.keys(club.rooms).length - R['周租含互助室']) * P['新增互助室周租']
    + Math.max(0, club.privateRooms - R['周租含包间']) * P['新增包间周租'];
  const frontWage = P['前台工资'], consultantBase = P['咨询师底薪'];
  const classCommission = (heldClasses + remaining.length) * P['咨询师课提成'];
  const weeklyWages = frontWage + consultantBase + classCommission;
  const actualWeeklyWages = frontWage + consultantBase + heldClasses * P['咨询师课提成'];
  const weeklyClassIncome = scheduled.reduce((sum, k) => sum + k.members.length * P['课费'], 0);
  const weeklyMembershipAverage = names.length * P['会员月费'] / cycle;
  const recurringDue = weeklyRent + frontWage + consultantBase + scheduled.length * P['咨询师课提成'];
  const weeklyNet = weeklyClassIncome + weeklyMembershipAverage - recurringDue;
  const now = (club.week - 1) * 7 + club.day;
  const nextDue = names.map(n => ({ name: n, at: (club.members[n].nextFeeWeek - 1) * 7 + club.members[n].nextFeeDay }));
  // 当前剩余一周、再一个完整会费周期。后续周期相同，用周期净额求首次付不起的周日。
  let balance = club.funds, failedDay = balance < 0 ? now : null;
  const thisSunday = club.week * 7;
  const balances = [];
  let commissionClasses = heldClasses;
  for (let day = now; day <= thisSunday + cycle * 7 && failedDay === null; day++) {
    const dow = (day - 1) % 7 + 1, week = Math.floor((day - 1) / 7) + 1;
    for (const fee of nextDue) {
      if (fee.at <= day) { balance += P['会员月费']; fee.at += cycle * 7; }
    }
    if (dow !== 7) {
      for (const cls of scheduled.filter(k => k.night === dow)) {
        const attendees = cls.members.filter(n => week !== club.week || club.members[n].classWeek !== club.week);
        if (attendees.length) { balance += attendees.length * P['课费']; commissionClasses += 1; }
      }
    } else {
      balance -= weeklyRent + frontWage + consultantBase + commissionClasses * P['咨询师课提成'];
      commissionClasses = 0;
      if (balance < 0) failedDay = day;
      if (day > thisSunday) balances.push({ day, balance });
    }
  }
  if (failedDay === null && weeklyNet < 0) {
    const drop = -weeklyNet * cycle;
    for (const point of balances) {
      const cyclesUntilFailure = Math.floor(point.balance / drop) + 1;
      const day = point.day + cyclesUntilFailure * cycle * 7;
      if (failedDay === null || day < failedDay) failedDay = day;
    }
  }
  const receipt = club.receipt;
  const receiptTransactions = !receipt ? [] : receipt.week === club.week
    ? weekTransactions.slice(receipt.start)
    : club.report && receipt.action === 'closeday' ? club.report.transactions.filter(t => t.atClose) : [];
  return {
    weeklyRent, frontWage, consultantBase, classCommission, heldClasses, scheduledClasses: scheduled.length,
    weeklyWages, weeklyDue: weeklyRent + weeklyWages, actualWeeklyWages, actualWeeklyDue: weeklyRent + actualWeeklyWages,
    weeklyClassIncome, weeklyMembershipAverage, weeklyNet,
    runwayWeeks: failedDay === null ? null : Math.ceil((failedDay - now + 1) / 7),
    projectionAssumptions: '按当前在读人数和排班不变、每人到期续会计算；不计新入会、包间、结业答谢、退会、平事与扩租。月费均摊仅用于比较，到账按各人到期日。',
    transactions, weekTransactions,
    lastReceipt: receipt ? { action: receipt.action, week: receipt.week, day: receipt.day, transactions: receiptTransactions,
      delta: receiptTransactions.reduce((sum, t) => sum + t.amount, 0) } : null,
    renewalDue: nextDue.map((fee, i) => ({ name: fee.name, week: club.members[names[i]].nextFeeWeek, day: club.members[names[i]].nextFeeDay })),
  };
}

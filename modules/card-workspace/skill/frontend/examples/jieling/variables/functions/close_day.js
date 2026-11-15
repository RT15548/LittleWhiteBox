// 今日收工：今晚的课、每天的压力、闹事与退会；周日再交租发工资、刷新下周面谈。
// 所有随机数按固定顺序从 rolls 取，重算得到同一天。
([club, desk, rolls]) => {
  const c = JSON.parse(JSON.stringify(club));
  const cat = desk.cat, R = cat.rule, P = cat.price, m = c.members;
  let k = 0;
  const roll = () => rolls[k++ % rolls.length];
  const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
  const sunday = c.day === 7;
  const names = Object.keys(m).filter(n => m[n].status === '在读');
  const start = {};
  for (const n of names) start[n] = { loss: m[n].loss, know: m[n].know, trust: m[n].trust };
  const report = { week: c.week, day: c.day, classes: [], incidents: [], quit: [], income: 0, expense: 0, members: {}, weekly: null };

  function applicant() {
    const sex = roll() <= 50 ? '男' : '女';
    const a = roll();
    const accepts = a <= 45 ? '异性' : a <= 60 ? '同性' : a <= 85 ? '都可' : '只上课';
    const count = roll() <= 60 ? 2 : 3;
    const picked = [];
    for (let guard = 0; picked.length < count && guard < 20; guard++) {
      const i = roll() % cat.lines.length;
      if (!picked.includes(i)) picked.push(i);
    }
    const tags = [];
    for (const i of picked) {
      const line = cat.lines[i];
      const tag = roll() <= 50 ? line.left : line.right;
      if (!tags.includes(tag)) tags.push(tag);
    }
    const s = roll();
    c.seq += 1;
    return {
      id: '来访' + c.seq, sex, accepts, tags,
      hard: roll() <= R['重口几率'],
      stress: s <= 30 ? '轻' : s <= 70 ? '中' : '重',
      loss: R['来访失控下限'] + roll() % (R['来访失控上限'] - R['来访失控下限'] + 1),
      called: false,
    };
  }

  if (!sunday) {
    for (const room of Object.keys(c.rooms)) {
      const cls = desk.classes[room];
      if (!cls.tonight || !cls.members.length) continue;
      if (!cls.open) { report.classes.push({ room, held: false, members: cls.members }); continue; }
      const attend = cls.members.filter(n => m[n].classWeek !== c.week);
      const audited = c.today.audit === room;
      for (const n of attend) {
        const mine = m[n].tags.filter(t => cat.dimOf[t] === cls.dim);
        const peers = cls.members.filter(o => o !== n && m[o].tags.some(t => mine.includes(t))).length;
        const shy = audited && m[n].trust < R['旁听拘束信任线'];
        m[n].loss = clamp(m[n].loss - R['上课降'] - R['同端每人多降'] * Math.min(peers, R['同端最多算']));
        m[n].know = clamp(m[n].know + R['上课了解'] + (audited && !shy ? R['旁听了解'] : 0));
        m[n].trust = clamp(m[n].trust + R['上课信任'] - (shy ? R['旁听拘束信任降'] : 0));
        m[n].classWeek = c.week;
        report.income += P['课费'];
      }
      report.classes.push({ room, held: true, audited, members: attend });
    }
  }

  for (const n of names) {
    const idle = sunday && m[n].classWeek !== c.week ? R['没课周涨'] : 0;
    m[n].loss = clamp(m[n].loss + R['压力日涨'][m[n].stress] + idle);
  }

  for (const n of names) {
    if (m[n].loss >= R['闹事线'] && roll() <= R['闹事几率']) {
      const item = { week: c.week, day: c.day, who: [n], kind: cat.riotKinds[roll() % cat.riotKinds.length], open: true };
      c.incidents.push(item);
      report.incidents.push(item);
      c.reputation -= R['出事口碑降'];
    }
  }

  if (sunday) {
    for (const n of names) if (m[n].loss < R['结业线']) m[n].trust = clamp(m[n].trust - R['留人每周信任降']);
  }

  for (const n of names) {
    if (m[n].trust <= R['退会信任线']) {
      m[n].status = '退会';
      m[n].room = '';
      report.quit.push(n);
      c.reputation -= R['退会口碑降'];
    }
  }

  if (sunday) {
    const active = Object.keys(m).filter(n => m[n].status === '在读').length;
    const rent = Object.keys(c.rooms).length * P['互助室租金'] + c.privateRooms * P['包间租金'];
    const wages = P['前台工资'] + P['咨询师底薪'] + P['咨询师提成'] * active;
    const open = c.incidents.filter(i => i.open).length;
    c.reputation = clamp(c.reputation - R['未处理每周口碑降'] * open);
    report.expense += rent + wages;
    const slots = Math.min(R['面谈名额上限'], R['面谈基础名额'] + Math.floor(c.reputation / R['每多少口碑加一名额']));
    c.applicants = [];
    for (let i = 0; i < slots; i++) c.applicants.push(applicant());
    report.weekly = { rent, wages, openIncidents: open, applicants: slots };
    c.week += 1;
    c.day = 1;
  } else {
    c.day += 1;
  }

  c.funds += report.income - report.expense;
  c.reputation = clamp(c.reputation);
  for (const n of names) {
    report.members[n] = { loss: m[n].loss - start[n].loss, know: m[n].know - start[n].know, trust: m[n].trust - start[n].trust };
  }
  report.funds = c.funds;
  c.today = { audit: '', privates: 0 };
  c.acted = false;
  c.report = report;
  return c;
}

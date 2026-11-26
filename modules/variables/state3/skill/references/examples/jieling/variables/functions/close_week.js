// One week, settled in one place: sessions, slips, departures, rent and standing.
// Interviews refresh after the week's rewards, through the cross-week trigger.
// Every roll comes from the prepared dice in a fixed order, so recomputation gives the same week.
([club, dice]) => {
  let next = 0;
  const roll = () => dice[next++ % dice.length];
  const members = JSON.parse(JSON.stringify(club.members));
  const incidents = club.incidents.map(item => ({ ...item }));
  const openBefore = incidents.filter(item => item.open).length;
  const week = { week: club.week, rooms: {}, roomMembers: {}, gains: {}, graduated: [], quit: [], incidents: [], income: 0, rent: 2000 };
  let held = 0, idle = 0, erupted = 0;
  for (const room of ['一号室', '二号室', '三号室']) {
    // Membership and pair relations come from the derived rooms, so the matching rule lives in room_report only.
    const { members: names, pairs } = club.rooms[room];
    week.roomMembers[room] = [...names];
    if (!names.length) { week.rooms[room] = '空'; continue; }
    if (names.length < 3) {
      idle++;
      week.rooms[room] = '人数不足';
      for (const name of names) {
        if (roll() === 1) { members[name].status = '退会'; members[name].room = ''; week.quit.push(name); }
      }
      continue;
    }
    held++;
    week.rooms[room] = '开课';
    const gain = Object.fromEntries(names.map(name => [name, 1]));
    for (const { a, b, relation: kind } of pairs) {
      if (kind === '相融') {
        gain[a] += 4; gain[b] += 4;
        if (Math.min(members[a].control, members[b].control) < 50 && roll() === 1) {
          week.incidents.push({ week: club.week, who: [a, b], kind: '私下越界', open: true });
        }
      } else if (kind === '同类') { gain[a] += 3; gain[b] += 3; }
      else if (kind === '平淡') { gain[a] += 1; gain[b] += 1; }
      else {
        const die = roll();
        const delta = die >= 4 ? 8 : -4;
        gain[a] += delta; gain[b] += delta;
        if (die === 1) {
          erupted++;
          week.incidents.push({ week: club.week, who: [a, b], kind: '当场冲突', open: true });
        }
      }
    }
    for (const name of names) {
      const member = members[name], controlBefore = member.control;
      member.control = Math.max(0, Math.min(100, member.control + gain[name]));
      week.gains[name] = member.control - controlBefore;
      week.income += 300;
      if (member.control >= 80) { member.status = '结业'; member.room = ''; week.graduated.push(name); }
    }
  }
  incidents.push(...week.incidents);
  const reputation = club.reputation + 2 * held + 5 * week.graduated.length - 3 * idle - 5 * erupted;
  const exposure = club.exposure + 10 * openBefore + 5 * week.incidents.length - (incidents.some(item => item.open) ? 0 : 5);
  const boundedReputation = Math.max(0, Math.min(100, reputation));
  return { ...club, members, incidents,
    week: club.week + 1,
    funds: club.funds + week.income - week.rent,
    reputation: boundedReputation,
    exposure: Math.max(0, Math.min(100, exposure)),
    lastWeek: week };
}

// 执行一个已经通过 check 的操作（收工除外），返回新的会所状态。
// 需要骰子的操作（开包间、送结业）从 rolls 依次取 1～100 的数。
([club, desk, op, x, y, z, rolls]) => {
  const c = JSON.parse(JSON.stringify(club));
  const cat = desk.cat, R = cat.rule, P = cat.price, m = c.members;
  let k = 0;
  const roll = () => rolls[k++ % rolls.length];
  const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
  const same = q => (q.a === x && q.b === y) || (q.a === y && q.b === x);
  if (op === 'act') c.acted = true;
  else if (op === 'call') { c.applicants.find(a => a.id === x).called = true; c.acted = true; }
  else if (op === 'audit') { c.today.audit = x; c.acted = true; }
  else if (op === 'talk') {
    m[x].know = clamp(m[x].know + R['谈话了解']);
    m[x].talkWeek = c.week;
    c.acted = true;
  }
  else if (op === 'setroom') c.rooms[x] = { dim: y, night: z };
  else if (op === 'assign') m[x].room = y;
  else if (op === 'private') {
    const pair = desk.matches.find(same);
    const A = m[x], B = m[y];
    const raw = R['包间基础顺利率'] + R['每多一项咬合加'] * (pair.locks.length - 1)
      + (Math.min(A.know, B.know) - R['包间了解线']) / 2
      - Math.max(0, Math.max(A.loss, B.loss) - 50) / 2;
    const chance = Math.max(R['顺利率下限'], Math.min(R['顺利率上限'], Math.round(raw)));
    const smooth = roll() <= chance;
    let hurt = '';
    c.funds += 2 * P['包间费'];
    if (smooth) {
      for (const M of [A, B]) {
        M.loss = clamp(M.loss - R['包间顺利失控降']);
        M.trust = clamp(M.trust + R['包间顺利信任升']);
      }
    } else {
      hurt = roll() <= 50 ? x : y;
      m[hurt].trust = clamp(m[hurt].trust - R['受委屈信任降']);
      c.incidents.push({ week: c.week, day: c.day, who: [x, y], kind: '包间不顺', open: true });
      c.reputation -= R['出事口碑降'];
    }
    c.consents = c.consents.filter(q => !same(q));
    c.today.privates += 1;
    c.acted = true;
    c.lastEvent = { kind: '包间', week: c.week, day: c.day, who: [x, y], chance, smooth, hurt };
  }
  else if (op === 'graduate') {
    m[x].status = '结业';
    m[x].room = '';
    c.reputation += R['结业口碑升'];
    const thanks = roll() <= R['答谢几率'];
    if (thanks) c.funds += P['答谢'];
    c.lastEvent = { kind: '结业', week: c.week, day: c.day, who: [x], thanks };
  }
  else if (op === 'dismiss') {
    m[x].status = '退会';
    m[x].room = '';
    c.reputation -= R['劝退口碑降'];
    c.lastEvent = { kind: '劝退', week: c.week, day: c.day, who: [x] };
  }
  else if (op === 'handle') { c.incidents[x].open = false; c.funds -= P['平事']; }
  else if (op === 'expand') {
    if (x === '互助室') {
      c.rooms[cat.roomNames[Object.keys(c.rooms).length]] = { dim: '', night: 0 };
      c.funds -= P['扩互助室'];
    } else {
      c.privateRooms += 1;
      c.funds -= P['扩包间'];
    }
  }
  else if (op === 'admit') {
    const a = c.applicants.find(q => q.id === x);
    m[y] = { sex: a.sex, accepts: a.accepts, tags: a.tags, hard: a.hard, stress: a.stress, loss: a.loss,
      trust: R['新会员信任'], know: R['新会员了解'], status: '在读', room: '', classWeek: 0, talkWeek: 0, xp: z, note: '' };
    c.applicants = c.applicants.filter(q => q.id !== x);
    c.funds += P['入会费'];
  }
  else if (op === 'decline') c.applicants = c.applicants.filter(q => q.id !== x);
  else if (op === 'consent') c.consents.push({ a: x, b: y });
  else if (op === 'note') m[x].note = y;
  c.acted = true;
  c.reputation = clamp(c.reputation);
  return c;
}

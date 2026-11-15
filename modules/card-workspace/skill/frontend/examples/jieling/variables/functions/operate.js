// 记账只在实际收付款时发生；收工日报与案头账本均引用这些流水。
([club, desk, op, x, y, z, rolls]) => {
  const c = JSON.parse(JSON.stringify(club));
  const cat = desk.cat, R = cat.rule, P = cat.price, m = c.members;
  let k = 0;
  const roll = () => rolls[k++ % rolls.length];
  const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
  const same = q => (q.a === x && q.b === y) || (q.a === y && q.b === x);
  c.receipt = { action: op, week: c.week, day: c.day, start: c.cashbook.length };
  const pay = (kind, amount, who) => {
    c.cashbook.push({ week: c.week, day: c.day, kind, who, amount });
    c.funds += amount;
  };
  const clearPerson = name => { c.consents = c.consents.filter(q => q.a !== name && q.b !== name); };
  if (op === 'call') {
    const a = c.applicants.find(q => q.id === x);
    const surnames = '陈林黄张李王刘杨吴周徐孙马朱胡郭何高罗郑梁谢宋唐许韩冯邓曹彭曾肖田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范廖石金邹熊孟秦';
    const given = a.sex === '女' ? '静宁安妍舒琳清悦薇瑶思桐婉晴雅岚昕嘉涵月若芸柔宜曼萱' : '明安成远川泽言修然景浩航嘉衡绍文瑞卓清辰宇松知廷毅承';
    const used = new Set(Object.keys(m).concat(c.applicants.map(q => q.name)));
    let id = Number(a.id.replace(/\D/g, ''));
    do {
      let n = id++, tail = '';
      const surname = surnames[n % surnames.length];
      n = Math.floor(n / surnames.length);
      do { tail = given[n % given.length] + tail; n = Math.floor(n / given.length) - 1; } while (n >= 0);
      a.name = surname + tail;
    } while (used.has(a.name));
    a.called = true;
  }
  else if (op === 'audit') c.today.audit = x;
  else if (op === 'talk') { m[x].know = clamp(m[x].know + R['谈话了解']); m[x].talkWeek = c.week; }
  else if (op === 'setroom') c.rooms[x] = { dim: y, night: z };
  else if (op === 'assign') m[x].room = y;
  else if (op === 'private') {
    const pair = desk.matches.find(same), A = m[x], B = m[y];
    const raw = R['包间基础顺利率'] + R['每多一项咬合加'] * (pair.locks.length - 1)
      + (Math.min(A.know, B.know) - R['包间了解线']) / 2
      - Math.max(0, Math.max(A.loss, B.loss) - 50) / 2;
    const chance = Math.max(R['顺利率下限'], Math.min(R['顺利率上限'], Math.round(raw)));
    const smooth = roll() <= chance;
    let hurt = '';
    pay('包间费', P['包间费'], [x]);
    pay('包间费', P['包间费'], [y]);
    if (smooth) {
      for (const M of [A, B]) { M.loss = clamp(M.loss - R['包间顺利失控降']); M.trust = clamp(M.trust + R['包间顺利信任升']); }
    } else {
      hurt = roll() <= 50 ? x : y;
      m[hurt].trust = clamp(m[hurt].trust - R['受委屈信任降']);
      c.incidents.push({ week: c.week, day: c.day, who: [x, y], kind: '包间不顺', open: true });
      c.reputation -= R['出事口碑降'];
    }
    c.consents = c.consents.filter(q => !same(q));
    c.today.privates += 1;
    c.lastEvent = { kind: '包间', week: c.week, day: c.day, who: [x, y], chance, smooth, hurt };
  }
  else if (op === 'graduate') {
    m[x].status = '结业'; m[x].room = ''; clearPerson(x);
    c.reputation += R['结业口碑升'];
    const thanks = roll() <= R['答谢几率'];
    if (thanks) pay('结业答谢', P['答谢'], [x]);
    c.lastEvent = { kind: '结业', week: c.week, day: c.day, who: [x], thanks };
  }
  else if (op === 'dismiss') {
    m[x].status = '退会'; m[x].room = ''; clearPerson(x);
    c.reputation -= R['劝退口碑降'];
    c.lastEvent = { kind: '劝退', week: c.week, day: c.day, who: [x] };
  }
  else if (op === 'handle') { c.incidents[x].open = false; pay('平事', -P['平事'], c.incidents[x].who); }
  else if (op === 'expand') {
    if (x === '互助室') {
      c.rooms[cat.roomNames[Object.keys(c.rooms).length]] = { dim: '', night: 0 };
      pay('扩互助室', -P['扩互助室'], []);
    } else { c.privateRooms += 1; pay('扩包间', -P['扩包间'], []); }
  }
  else if (op === 'admit') {
    const a = c.applicants.find(q => q.id === x);
    m[a.name] = { sex: a.sex, accepts: a.accepts, tags: a.tags, hard: a.hard, stress: a.stress, loss: a.loss,
      trust: R['新会员信任'], know: R['新会员了解'], status: '在读', room: '', classWeek: 0, talkWeek: 0,
      xp: '登记表勾选：' + a.tags.join('、'),
      nextFeeWeek: c.week + R['会费周期周数'], nextFeeDay: c.day };
    c.applicants = c.applicants.filter(q => q.id !== x);
    pay('入会费', P['入会费'], [a.name]);
    pay('会员月费', P['会员月费'], [a.name]);
  }
  else if (op === 'decline') c.applicants = c.applicants.filter(q => q.id !== x);
  else if (op === 'consent') c.consents.push({ a: x, b: y });
  c.acted = true;
  c.reputation = clamp(c.reputation);
  return c;
}

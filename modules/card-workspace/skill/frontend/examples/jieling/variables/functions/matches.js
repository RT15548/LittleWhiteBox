// 能排包间的一对：性别与接受对象互相对得上、重口开关一致、至少一项左右咬合。
// 案头、两个模型和开包间的成功率都读这里，配对规则只写在这一处。
([members, consents, cat]) => {
  const accepts = (x, y) => x.accepts === '都可'
    || (x.accepts === '异性' && x.sex !== y.sex)
    || (x.accepts === '同性' && x.sex === y.sex);
  const names = Object.keys(members).filter(n => members[n].status === '在读');
  const out = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = members[names[i]], b = members[names[j]];
      if (!accepts(a, b) || !accepts(b, a) || a.hard !== b.hard) continue;
      const locks = [];
      for (const l of cat.lines) {
        const hit = (a.tags.includes(l.left) && b.tags.includes(l.right)) || (a.tags.includes(l.right) && b.tags.includes(l.left));
        if (hit) locks.push(l.left === l.right ? l.left : l.left + '↔' + l.right);
      }
      if (!locks.length) continue;
      const line = cat.rule['包间了解线'];
      const agreed = consents.some(q => (q.a === names[i] && q.b === names[j]) || (q.a === names[j] && q.b === names[i]));
      out.push({ a: names[i], b: names[j], locks, ready: a.know >= line && b.know >= line, agreed });
    }
  }
  return out;
}

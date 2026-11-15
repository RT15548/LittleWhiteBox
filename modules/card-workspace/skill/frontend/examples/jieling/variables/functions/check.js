// 一个操作此刻能不能做：能做返回空字符串，不能做返回原因。
// 原因会出现在结算诊断里，面板直接拿来提示老板。
([club, desk, op, x, y, z]) => {
  const cat = desk.cat, R = cat.rule, P = cat.price, m = club.members;
  const live = n => Object.prototype.hasOwnProperty.call(m, n) && m[n].status === '在读';
  const pairOf = (a, b) => desk.matches.find(q => (q.a === a && q.b === b) || (q.a === b && q.b === a));
  const app = id => club.applicants.find(a => a.id === id);
  if (desk.phase !== '经营中') return '会所已经破产';
  switch (op) {
    case 'act': return '';
    case 'closeday': return club.acted ? '' : '今天还没发生什么';
    case 'call': return !app(x) ? '本周没有这位来访者' : app(x).called ? '这位已经请进来过了' : '';
    case 'audit': {
      const room = desk.classes[x];
      if (!room) return '没有' + x;
      if (!room.tonight) return x + '今晚没课';
      if (!room.open) return x + '人数不够，今晚开不了课';
      return club.today.audit ? '今晚已经在旁听' + club.today.audit : '';
    }
    case 'talk':
      if (!live(x)) return '没有这位在读会员';
      return m[x].talkWeek === club.week ? '这周已经找' + x + '谈过了' : '';
    case 'setroom': {
      if (!desk.classes[x]) return '没有' + x;
      if (desk.classes[x].members.length) return x + '里还有人，人走空才能改';
      if (!cat.dims.includes(y)) return '没有这个维度';
      return Number.isInteger(z) && z >= 1 && z <= 6 ? '' : '上课只能排在周一到周六';
    }
    case 'assign': {
      if (!live(x)) return '没有这位在读会员';
      if (y === '') return m[x].room ? '' : x + '本来就没分班';
      const room = desk.classes[y];
      if (!room) return '没有' + y;
      if (m[x].room === y) return x + '已经在' + y;
      if (!room.dim) return y + '还没定维度';
      if (!m[x].tags.some(t => cat.dimOf[t] === room.dim)) return x + '的登记表上没有勾' + room.dim;
      return room.members.length >= R['每间最多'] ? y + '已经坐满' : '';
    }
    case 'private': {
      if (club.day === 7) return '周日不开包间';
      const q = pairOf(x, y);
      if (!q) return x + '和' + y + '不是能排包间的一对';
      if (!q.ready) return '会所对两人的底还没摸清';
      if (!q.agreed) return '两人还没都同意这一场';
      return club.today.privates >= club.privateRooms ? '今晚的包间都用掉了' : '';
    }
    case 'graduate':
      if (!live(x)) return '没有这位在读会员';
      return m[x].loss < R['结业线'] ? '' : x + '的失控还没降到可以结业';
    case 'dismiss': return live(x) ? '' : '没有这位在读会员';
    case 'handle': {
      const item = club.incidents[x];
      if (!item || !item.open) return '这件事不存在或已经处理过';
      return club.funds < P['平事'] ? '账上的钱不够平这件事' : '';
    }
    case 'expand':
      if (x === '互助室') {
        if (Object.keys(club.rooms).length >= R['互助室上限']) return '互助室已经扩到头了';
        return club.funds < P['扩互助室'] ? '账上的钱不够' : '';
      }
      if (club.privateRooms >= R['包间上限']) return '包间已经扩到头了';
      return club.funds < P['扩包间'] ? '账上的钱不够' : '';
    case 'admit':
      if (!app(x)) return '本周没有这位来访者';
      if (!app(x).called) return '还没请这位来访者进来面谈';
      if (!app(x).name) return '这位来访者还没有登记姓名';
      return Object.prototype.hasOwnProperty.call(m, app(x).name) ? '名册里已经有' + app(x).name : '';
    case 'decline':
      if (!app(x)) return '本周没有这位来访者';
      return app(x).called ? '' : '还没请这位来访者进来面谈';
    case 'consent': {
      if (club.day === 7) return '周日不开包间';
      if (club.today.privates >= club.privateRooms) return '今晚的包间都用掉了';
      const q = pairOf(x, y);
      if (!q) return x + '和' + y + '不是能排包间的一对';
      if (!q.ready) return '会所对两人的底还没摸清';
      return q.agreed ? '这一场两人已经同意过了' : '';
    }
  }
  return '未知操作';
}

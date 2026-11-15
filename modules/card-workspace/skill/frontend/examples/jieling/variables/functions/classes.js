// 每间互助室此刻的班：谁在、够不够开、今晚是不是它的课。
// 会员在哪间屋只存在会员身上，这里由名册推出。
([members, rooms, day, cat]) => {
  const out = {};
  for (const room of Object.keys(rooms)) {
    const names = Object.keys(members).filter(n => members[n].status === '在读' && members[n].room === room);
    out[room] = {
      dim: rooms[room].dim,
      night: rooms[room].night,
      members: names,
      open: names.length >= cat.rule['开班人数'],
      tonight: rooms[room].night === day,
    };
  }
  return out;
}

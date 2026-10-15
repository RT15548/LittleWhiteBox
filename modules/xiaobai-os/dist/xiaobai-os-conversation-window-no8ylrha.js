/* eslint-disable */
var e = Object.freeze({
  recent: 10,
  maximum: 30
});
function r(a, n) {
  const t = Math.min(a?.end ?? n, n);
  return {
    start: Math.max(0, t - e.maximum, Math.min(a?.start ?? t - e.recent, t - 1)),
    end: t
  };
}
export {
  r as n,
  e as t
};

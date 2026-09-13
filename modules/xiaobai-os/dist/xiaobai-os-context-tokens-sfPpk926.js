/* eslint-disable */
var t = 3.35, n = new TextEncoder();
function r(e = "") {
  return Math.ceil(n.encode(String(e || "")).length / t);
}
export {
  r as t
};

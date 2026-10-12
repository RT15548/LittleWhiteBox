/* eslint-disable */
var e = "LittleWhiteBox", r = (() => {
  try {
    const t = new URL(import.meta.url).pathname.match(/\/scripts\/extensions\/third-party\/([^/]+)\//);
    return t?.[1] ? decodeURIComponent(t[1]) : e;
  } catch {
    return e;
  }
})(), a = `scripts/extensions/third-party/${r}`;
export {
  a as t
};

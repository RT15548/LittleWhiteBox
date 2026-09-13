/* eslint-disable */
var e = null;
async function r() {
  if (!e) throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return await e();
}
export {
  r as t
};

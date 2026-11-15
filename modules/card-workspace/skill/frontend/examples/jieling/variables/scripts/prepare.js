// 每批结算取一次外部事实：这一批是不是老板在面板上点的，以及这批要用的骰子（1～100）。
// 更新模型提交时带着阶段，面板直接提交时没有阶段。
return {
  panel: !run.stage,
  rolls: Array.from({ length: 200 }, () => Math.floor(Math.random() * 100) + 1),
};

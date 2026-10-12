/** Immediate circumstances, selected from the actual rescue state rather than conversation claims. */
export const RESCUE_COPY = {
    confined: '你被关在锁着的牢门内，能隔门交谈，但无法走出去。眼前要先脱困；牢门由外侧过道上的机关打开，现场的 playerMechanisms 给出位置与开闭状态。',
    released: '牢门已经打开，你能走出牢房，当前要脱困返营。可答应跟随玩家，沿可独行的安全路线自行返营，或留在牢房等候小门接应；行动和路线见本轮资料。',
    returned: '你已脱困并完成返营。此刻的位置与跟随、赶路状态见现场资料，过去被关押的经历不代表现在仍被关着。',
} as const;

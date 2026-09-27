export const ADMINISTRATOR_POLICY = Object.freeze({
    inputBudget: 158_000, summaryTrigger: 128_000, summaryOutput: 4_000, imageTokens: 6_000,
    pageSize: 20, windowSize: 60, textBlock: 4_000,
    streamInterval: 100, maxImageBytes: 4 * 1024 * 1024, maxToolRounds: 32, evidenceChars: 1_000_000,
    chatReadFloors: 20, chatSearchMatches: 20, chatQueryChars: 200,
});
export const ADMINISTRATOR_IMAGE_TYPES = Object.freeze(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

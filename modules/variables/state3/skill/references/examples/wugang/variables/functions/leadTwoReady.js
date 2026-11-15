(input, { get }) => { const ex=get(['docket','exhibits','EX-03']); return ex.inspected && ex.tested === 'match' && ex.legalChain && ex.contamination === 'clean' && !ex.destroyed; }

(input, { get }) => { const ex=get(['docket','exhibits','EX-05']); return ex.inspected && ex.tested === 'match' && ex.legalChain && ex.contamination === 'clean' && !ex.destroyed; }

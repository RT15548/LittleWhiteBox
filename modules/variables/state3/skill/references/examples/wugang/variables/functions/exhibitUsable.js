(input, { get }) => { const ex=get(['docket','exhibits',input[0]]); return !!ex && !!ex.custodian && ex.legalChain === true && ex.contamination === 'clean' && ex.destroyed === false; }

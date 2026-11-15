(input, { get }) => { const ex=get(['docket','exhibits',input[0]]); return !!ex && ex.custodian === '' && !ex.destroyed && ex.legalChain && ex.contamination === 'clean'; }

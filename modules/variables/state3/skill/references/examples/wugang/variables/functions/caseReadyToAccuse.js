(input, { get }) => {
  const ids=input[0];
  if (!Array.isArray(ids) || ids.length < 2 || new Set(ids).size !== ids.length) return false;
  const exhibits=ids.map(id=>get(['docket','exhibits',id]));
  return exhibits.every(ex=>ex && ex.custodian && !ex.destroyed && ex.contamination === 'clean' && ex.legalChain) && exhibits.some(ex=>ex.inspected && ex.tested === 'match');
}

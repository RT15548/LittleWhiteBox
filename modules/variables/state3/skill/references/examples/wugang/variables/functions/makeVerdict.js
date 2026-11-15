(input, { get }) => {
  const code=input[0], ids=input[1];
  const supported=ids.some(id=>{
    const ex=get(['docket','exhibits',id]);
    return ['EX-03','EX-04'].includes(id) && ex.inspected && ex.tested === 'match';
  });
  const correct=code === 'suspect_b' && supported;
  return {status:correct?'right_accuse':'wrong_accuse',label:correct?'真相归位':'错判',accused:code,evidenceUsed:ids,
    reason:correct?'本次提交的检验结论支持这项指控。':'本次提交的证物未能支持这项指控。'};
}

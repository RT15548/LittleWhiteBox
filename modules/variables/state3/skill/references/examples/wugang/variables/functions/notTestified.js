(input, { get }) => { const person=get(['docket','people',input[0]]); return !!person && input[0] !== 'clerk' && !person.testified; }

(input, { get }) => get(['docket','verdict','status']) === 'ongoing' && get(['docket','clock','minute']) < get(['docket','clock','limit'])

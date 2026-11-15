(input, { get }) => Math.min(input[0], Math.max(0, get(['docket','clock','limit']) - get(['docket','clock','minute'])))

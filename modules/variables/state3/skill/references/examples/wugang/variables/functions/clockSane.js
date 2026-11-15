(input, { get }) => { const clock=get(['docket','clock']); return Number.isInteger(clock.minute) && clock.limit === 480 && clock.minute >= 0 && clock.minute <= clock.limit; }

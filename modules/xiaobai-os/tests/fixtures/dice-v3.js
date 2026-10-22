// Synthetic records and paid overrides produced by b13d9608's actual
// prepareActionCheck -> rerollCheck -> createResultOverride, with deterministic RNG.
// Freeze independently from current types; no user chat or credentials are included.
export const savedV3 = [
    {
        records: { schemaVersion: 3, checks: [{ id: 'd20-saved', rule: 'd20',
            request: { action: 'Climb the wet wall', stat: 'Agility', difficulty: 'hard',
                stakes: 'Reach the balcony unseen, or make noise and draw a guard.' },
            roll: 9, dc: 13, outcome: 'failure' }] },
        override: { basis: '662c6dc7f55a681d51578fb031829d0824e77980fa0241feca287ecfafcfa5dc',
            version: 'paid-reroll', result: { rule: 'd20', roll: 2, outcome: 'failure' } },
    },
    {
        records: { schemaVersion: 3, checks: [{ id: 'coc7-saved', rule: 'coc7',
            request: { action: 'Climb the wet wall', stat: '运动', difficulty: 'hard',
                stakes: 'Reach the balcony unseen, or make noise and draw a guard.' },
            result: { value: 20, units: 4, tens: 4, roll: 44, threshold: 10, level: 'failure', verdict: 'not_achieved' } }] },
        override: { basis: '58faa79c7cafc670477ace85a9076dac23ec01cd2b4323f18f4fa34daf5eb9a8',
            version: 'paid-reroll', result: { rule: 'coc7', roll: 100, units: 0, tens: 0, level: 'fumble', verdict: 'not_achieved' } },
    },
];

// Produced by a32c28d0 prepareActionCheck with the same input and RNG.
export const savedV1 = { schemaVersion: 1, checks: [{ id: 'd20-saved',
    request: { action: 'Climb the wet wall', stat: 'Agility', difficulty: 'hard',
        stakes: 'Reach the balcony unseen, or make noise and draw a guard.' },
    roll: 9, dc: 13, outcome: 'failure', offset: 0,
    prefixDigest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }] };

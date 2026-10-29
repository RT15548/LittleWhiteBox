// Captured from the unmodified schema-4 producer (upstream e30ebadf), before
// consequences became mandatory for new requests. Paid bases are frozen too.
export const savedV4 = [
    {
        records: { schemaVersion: 4, checks: [{ id: 'saved-v4-d20', rule: 'd20',
            request: { action: 'Climb the wet wall', stat: 'athletics', difficulty: 'hard' },
            roll: 9, dc: 13, outcome: 'failure' }] },
        override: { basis: '95c21dca750d5ee4308173d12fb5de2d0c494da124d4f57779320ecbfd814c76',
            version: 'paid-v4-d20', result: { rule: 'd20', roll: 17, outcome: 'success' } },
    },
    {
        records: { schemaVersion: 4, checks: [{ id: 'saved-v4-coc7', rule: 'coc7',
            request: { action: 'Climb the wet wall', stat: '运动', difficulty: 'hard' },
            result: { value: 20, units: 4, tens: 4, roll: 44, threshold: 10, level: 'failure', verdict: 'not_achieved' } }] },
        override: { basis: '82c8ca5017b0621cebb47799feacbfa157137578cc6321919585d9efa88df527',
            version: 'paid-v4-coc7', result: { rule: 'coc7', roll: 88, units: 8, tens: 8, level: 'failure', verdict: 'not_achieved' } },
    },
];

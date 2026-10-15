/** Fixed-step combat tuning. Chapter composition lives in courtyard-encounters, not here. */
export const COMBAT_POLICY = Object.freeze({
    rootRingGap: Math.PI / 2,
    mobHp: 1.8, enemyLimit: 6, bossEnemyLimit: 5, simultaneousWindups: 2,
    signalTicks: 180, reinforcementWarning: 36, recoveryTicks: 48,
    keeperHp: 3000, wardenHp: 5000, heartHp: 4600, bossControlRecovery: 75,
});
export const wardenCarriesShield = (phase: number) => phase < 3;

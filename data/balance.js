/* =========================================================================
   BALANCE
   Todos los números del juego en un único sitio.
   Para cambiar la dificultad, empieza por aquí.
   ========================================================================= */
window.GC = window.GC || {};
GC.DATA = GC.DATA || {};

GC.DATA.balance = {
  // ---------------------------------------------------------------- Inicio
  startMoney: 10000000,                 // Giovanni es rico. Muy rico.
  startStats: { str: 5, end: 5, spd: 5, tec: 5, men: 5 },
  startSkillPoints: 2,

  // ---------------------------------------------------------------- Tiempo
  dayStartHour: 7,
  nightFrom: 0, nightTo: 6,             // de 00:00 a 05:59 no se puede entrenar
  ringOpen: 8, ringClose: 22,           // horario del pabellón
  sleepHours: 8,
  napHours: 3,
  fightHours: 3,

  // ---------------------------------------------------------------- Vitales
  baseHp: 80, hpPerEnd: 8,              // vida = 80 + Resistencia * 8
  baseEnergy: 50, energyPerMen: 1.5, energyPerTec: 0.5,
  maxFatigue: 100,
  fatigueSlowFrom: 60,                  // a partir de aquí el entrenamiento rinde menos
  fatigueSlowMult: 0.5,
  fullnessPerMeal: 45, fullnessDecayPerHour: 12, fullnessMax: 80,
  sleepFatigue: 70, napFatigue: 20, napEnergyPct: 0.4, napHpPct: 0.25,

  // ---------------------------------------------------------------- Entrenamiento
  diminishing: 60,                      // ganancia * d / (d + stat actual)
  mentalTrainBonus: 0.005,              // +0,5% de ganancia por punto de Mental

  // ---------------------------------------------------------------- Experiencia
  xpBase: 30, xpPerLevel: 15,           // xp para subir = 30 + nivel * 15
  bonusSpEvery: 5,                      // punto de habilidad extra cada 5 niveles

  // ---------------------------------------------------------------- Combate (Giovanni)
  combat: {
    jab:     { cd: 0.7, energy: 3, base: 3, strMult: 0.6 },
    heavy:   { cd: 1.5, energy: 9, base: 7, strMult: 1.4 },
    guard:   { duration: 1.0, cd: 0.35, energy: 2, reduction: 0.5, perfectWindow: 0.25 },
    dodge:   { window: 0.45, cd: 0.85, energy: 5 },
    recover: { duration: 1.6, energy: 22, hpPct: 0.05, vulnerability: 1.25 },
    techTecBonus: 0.01,                 // +1% daño de técnicas por punto de Técnica
    speedCdFactor: 0.012,               // recarga / (1 + Velocidad * factor)
    passiveEvadePerSpd: 0.0015, passiveEvadeCap: 0.15,
    critBase: 0.03, critPerTec: 0.003, critMult: 1.75,
    endReductionPerPoint: 0.004, endReductionCap: 0.45,
    energyRegenPerSec: 1.0,
    mentalResistPerPoint: 0.01, mentalResistCap: 0.6,
    adrenalineHpPct: 0.3, adrenalineDmg: 0.25, adrenalineSpeed: 0.2,
    chainWindow: 1.2, chainMax: 5,
    queueWindow: 0.3,                   // margen para encadenar órdenes
    startEnergyFatiguePenalty: 0.4,     // con cansancio 100 empiezas con -40% de energía
    finalDamageMult: 1.6,                // la Revancha Definitiva: Giovanni lo da todo
    finalTakenMult: 0.35,
  },

  // ---------------------------------------------------------------- Chansey
  chansey: {
    maxHp: 4000,
    regenPerSec: 6, regenPerPhase: 0.25,
    baseReduction: 0.35, reductionPerPhase: 0.04, armorFlat: 2,
    nurseThreshold: 0.10, nurseHealTo: 0.6,
    absurdHitPct: 0.6,
    phaseStarts: [0, 10, 30, 60, 105],  // segundo en el que empieza cada fase
    phaseNames: ['FELIZ', 'CONTENTA', 'ENFADADA', 'ABSURDA', 'JEFE FINAL'],
    actionInterval: [2.4, 2.0, 1.8, 1.5, 1.2],
    powerGrowth: 42,                    // potencia = 1 + (t / powerGrowth)^2
    lowHpHealBoost: 6,
    finalPower: 1.4,
    finalHpMult: 1.3,                    // en la Revancha Definitiva Chansey «va en serio»
    finalDrainFrom: 45,                 // a partir de aquí Chansey se desgasta sola (el clímax llega siempre)
    finalDrainPerSec: 0.035,
    finalCinematicAt: 90,
    firstAction: 2.0,
  },

  // ---------------------------------------------------------------- Recompensas
  rewards: {
    money: 50000,                       // «premio de consolación del público»
    xpBase: 30, xpPerSecond: 1.2, xpPerDamage: 0.02,
    sp: 1, spRecord: 1,
    fatigue: 25, hpLeftPct: 0.1,
  },

  // ---------------------------------------------------------------- Final
  finalRequirements: { fights: 8, level: 10 },
};

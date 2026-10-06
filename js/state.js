/* =========================================================================
   STATE — estructura de la partida y paso del tiempo
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  GC.State = {
    /** Partida nueva. hp/energy se rellenan en Game.newGame() con los máximos. */
    createNew() {
      const b = GC.DATA.balance;
      return {
        version: 1,
        day: 1,
        hour: b.dayStartHour,
        totalHours: 0,
        money: b.startMoney,
        stats: Object.assign({}, b.startStats),
        hp: 0,
        energy: 0,
        fatigue: 0,
        fullness: 0,
        level: 1,
        xp: 0,
        skillPoints: b.startSkillPoints,
        skills: {},           // id -> nivel
        owned: [],            // ids de equipo comprado
        equipped: {},         // ranura -> id
        buffs: [],            // { id, name, stat, amount, hours }
        selectedTech: null,
        flags: {},
        eventsSeen: [],
        intel: 0,             // nº de informes del Expediente Chansey
        titles: [],
        currentTitle: null,
        records: {
          fights: 0, losses: 0, wins: 0,
          bestSurvival: 0, firstSurvival: 0, finalSurvival: 0,
          maxDamage: 0, maxHits: 0, maxDodges: 0, maxSingleHit: 0,
          totalDamage: 0, totalRegens: 0, trainingSessions: 0,
          maxStr: b.startStats.str, maxLevel: 1, spent: 0,
        },
        totals: { punches: 0, km: 0, kg: 0, meditation: 0, sparring: 0, meals: 0, sleeps: 0 },
        history: [],
        finalDone: false,
      };
    },
  };

  GC.Time = {
    /** Avanza el reloj hora a hora (caducan buffs, se digiere la comida). */
    advance(s, hours) {
      const b = GC.DATA.balance;
      for (let i = 0; i < hours; i++) {
        s.hour++;
        s.totalHours++;
        if (s.hour >= 24) { s.hour -= 24; s.day++; }
        s.fullness = Math.max(0, (s.fullness || 0) - b.fullnessDecayPerHour);
        s.buffs.forEach(bf => { bf.hours--; });
      }
      s.buffs = s.buffs.filter(bf => bf.hours > 0);
      GC.Player.clampVitals(s);
    },
    isNight(s) {
      const b = GC.DATA.balance;
      return s.hour >= b.nightFrom && s.hour < b.nightTo;
    },
    ringOpen(s) {
      const b = GC.DATA.balance;
      return s.hour >= b.ringOpen && s.hour < b.ringClose;
    },
  };
})();

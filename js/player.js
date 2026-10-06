/* =========================================================================
   PLAYER — estadísticas derivadas de Giovanni
   effStats(s): estadísticas base + equipo + buffs de comida
   mods(s):     suma de efectos de habilidades, equipo y buffs especiales
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const STAT_KEYS = ['str', 'end', 'spd', 'tec', 'men'];
  GC.STAT_KEYS = STAT_KEYS;
  GC.STAT_NAMES = { str: 'Fuerza', end: 'Resistencia', spd: 'Velocidad', tec: 'Técnica', men: 'Mental' };
  GC.STAT_SHORT = { str: 'FUE', end: 'RES', spd: 'VEL', tec: 'TÉC', men: 'MEN' };

  const Player = {
    equippedItems(s) {
      return Object.values(s.equipped).map(id => GC.Equipment.get(id)).filter(Boolean);
    },

    effStats(s) {
      const out = {};
      STAT_KEYS.forEach(k => { out[k] = s.stats[k]; });
      this.equippedItems(s).forEach(it => {
        STAT_KEYS.forEach(k => { if (it.bonus[k]) out[k] += it.bonus[k]; });
      });
      s.buffs.forEach(b => { if (out[b.stat] !== undefined) out[b.stat] += b.amount; });
      STAT_KEYS.forEach(k => { out[k] = Math.max(1, out[k]); });
      return out;
    },

    mods(s) {
      const m = {};
      const add = (k, v) => { m[k] = (m[k] || 0) + v; };
      for (const id in s.skills) {
        const sk = GC.Skills.get(id);
        const lvl = s.skills[id];
        if (!sk || !lvl || !sk.effects) continue;
        for (const k in sk.effects) add(k, sk.effects[k] * lvl);
      }
      this.equippedItems(s).forEach(it => {
        for (const k in it.bonus) if (!STAT_KEYS.includes(k)) add(k, it.bonus[k]);
      });
      s.buffs.forEach(b => { if (!STAT_KEYS.includes(b.stat)) add(b.stat, b.amount); });
      return m;
    },

    maxHp(s) {
      const b = GC.DATA.balance;
      const e = this.effStats(s);
      const m = this.mods(s);
      return Math.round((b.baseHp + e.end * b.hpPerEnd + (m.maxHp || 0)) * (1 + (m.maxHpPct || 0)));
    },

    maxEnergy(s) {
      const b = GC.DATA.balance;
      const e = this.effStats(s);
      const m = this.mods(s);
      return Math.round(b.baseEnergy + e.men * b.energyPerMen + e.tec * b.energyPerTec + (m.maxEnergy || 0));
    },

    clampVitals(s) {
      const mh = this.maxHp(s);
      const me = this.maxEnergy(s);
      s.hp = Math.max(0, Math.min(mh, Math.round(s.hp)));
      s.energy = Math.max(0, Math.min(me, Math.round(s.energy)));
      s.fatigue = Math.max(0, Math.min(GC.DATA.balance.maxFatigue, Math.round(s.fatigue)));
    },

    xpToNext(level) {
      const b = GC.DATA.balance;
      return b.xpBase + level * b.xpPerLevel;
    },

    /** Suma experiencia. Devuelve cuántos niveles se han subido. */
    addXp(s, amount) {
      const b = GC.DATA.balance;
      s.xp += Math.round(amount);
      let gained = 0;
      while (s.xp >= this.xpToNext(s.level)) {
        s.xp -= this.xpToNext(s.level);
        s.level++;
        s.skillPoints += 1 + (s.level % b.bonusSpEvery === 0 ? 1 : 0);
        gained++;
      }
      s.records.maxLevel = Math.max(s.records.maxLevel, s.level);
      return gained;
    },

    /** Número orientativo de «poder» para mostrar en pantalla. */
    power(s) {
      const e = this.effStats(s);
      return Math.round(STAT_KEYS.reduce((a, k) => a + e[k], 0));
    },
  };

  GC.Player = Player;
})();

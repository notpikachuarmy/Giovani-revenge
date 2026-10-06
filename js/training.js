/* =========================================================================
   TRAINING — entrenar, comer y dormir
   Toda acción consume tiempo. La comida y la cama son gratis e ilimitadas,
   pero el tiempo, la energía y el cansancio no.
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const pickOne = arr => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : '');

  const Training = {
    list() { return GC.DATA.training; },
    get(id) { return GC.DATA.training.find(a => a.id === id); },
    isVisible(s, a) { return !a.unlockFlag || !!s.flags[a.unlockFlag]; },

    /** Ganancia estimada de una estadística (rendimiento decreciente incluido). */
    estimateGain(s, a, stat) {
      const b = GC.DATA.balance;
      const eff = GC.Player.effStats(s);
      const m = GC.Player.mods(s);
      let g = a.gains[stat];
      g *= b.diminishing / (b.diminishing + s.stats[stat]);
      g *= 1 + (m.trainGain || 0) + eff.men * b.mentalTrainBonus;
      if (s.fatigue >= b.fatigueSlowFrom) g *= b.fatigueSlowMult;
      return g;
    },

    check(s, a) {
      const b = GC.DATA.balance;
      if (!this.isVisible(s, a)) return { ok: false, reason: 'No disponible.' };
      if (GC.Time.isNight(s)) return { ok: false, reason: 'Es de madrugada. Hasta los villanos duermen.' };
      if (a.minLevel && s.level < a.minLevel) return { ok: false, reason: `Requiere nivel ${a.minLevel}.` };
      if (s.energy < a.energy) return { ok: false, reason: 'Sin energía suficiente. Come algo o duerme.' };
      if (a.fatigue > 0 && s.fatigue + a.fatigue > b.maxFatigue) return { ok: false, reason: 'Demasiado cansado. Toca descansar.' };
      if (a.hpCostPct && s.hp <= GC.Player.maxHp(s) * (a.hpCostPct + 0.08)) return { ok: false, reason: 'Demasiado magullado para esto. Duerme.' };
      if (a.price && s.money < a.price) return { ok: false, reason: 'Ni siquiera Giovanni puede pagarlo ahora.' };
      return { ok: true };
    },

    perform(s, id) {
      const a = this.get(id);
      if (!a) return { ok: false, reason: 'Entrenamiento desconocido.' };
      const c = this.check(s, a);
      if (!c.ok) return c;

      const b = GC.DATA.balance;
      const slow = s.fatigue >= b.fatigueSlowFrom;
      const gains = {};
      for (const k in a.gains) {
        const g = this.estimateGain(s, a, k);
        s.stats[k] += g;
        gains[k] = g;
      }
      s.energy -= a.energy;
      s.fatigue = Math.max(0, Math.min(b.maxFatigue, s.fatigue + a.fatigue));
      if (a.hpCostPct) s.hp -= Math.round(GC.Player.maxHp(s) * a.hpCostPct);
      if (a.price) { s.money -= a.price; s.records.spent += a.price; }

      let extra = null;
      if (a.risk && Math.random() < a.risk.chance) {
        s.fatigue = Math.min(b.maxFatigue, s.fatigue + a.risk.fatigue);
        extra = a.risk.text;
      }
      for (const k in (a.total || {})) s.totals[k] = (s.totals[k] || 0) + a.total[k];
      s.records.trainingSessions++;

      GC.Time.advance(s, a.hours);
      const levels = GC.Player.addXp(s, a.xp);
      s.records.maxStr = Math.max(s.records.maxStr, s.stats.str);
      GC.Player.clampVitals(s);
      return { ok: true, activity: a, gains, levels, extra, slow, flavor: pickOne(a.flavor) };
    },

    // ------------------------------------------------------------ Comida
    foodList() { return GC.DATA.food; },
    checkFood(s) {
      const b = GC.DATA.balance;
      if ((s.fullness || 0) >= b.fullnessMax) return { ok: false, reason: 'Giovanni está lleno. Hasta su ambición tiene límites.' };
      return { ok: true };
    },
    eat(s, id) {
      const f = GC.DATA.food.find(x => x.id === id);
      if (!f) return { ok: false, reason: 'Ese plato no existe.' };
      const c = this.checkFood(s);
      if (!c.ok) return c;
      const b = GC.DATA.balance;
      s.energy += f.energy;
      s.fatigue -= f.fatigue;
      if (f.hpPct) s.hp += Math.round(GC.Player.maxHp(s) * f.hpPct);
      s.fullness = (s.fullness || 0) + b.fullnessPerMeal;
      if (f.buff) {
        s.buffs = s.buffs.filter(x => x.id !== f.id);
        s.buffs.push({ id: f.id, name: f.name, stat: f.buff.stat, amount: f.buff.amount, hours: f.buff.hours + 1 });
      }
      s.totals.meals++;
      GC.Time.advance(s, 1);
      GC.Player.clampVitals(s);
      return { ok: true, food: f };
    },

    // ------------------------------------------------------------ Descanso
    rest(s, kind) {
      const b = GC.DATA.balance;
      if (kind === 'sleep') {
        GC.Time.advance(s, b.sleepHours);
        s.hp = GC.Player.maxHp(s);
        s.energy = GC.Player.maxEnergy(s);
        s.fatigue -= b.sleepFatigue;
        s.totals.sleeps++;
      } else {
        GC.Time.advance(s, b.napHours);
        s.energy += GC.Player.maxEnergy(s) * b.napEnergyPct;
        s.hp += GC.Player.maxHp(s) * b.napHpPct;
        s.fatigue -= b.napFatigue;
      }
      GC.Player.clampVitals(s);
      return { ok: true };
    },
  };

  GC.Training = Training;
})();

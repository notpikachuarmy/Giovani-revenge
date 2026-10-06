/* =========================================================================
   SKILLS — lógica del árbol de habilidades
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const Skills = {
    get(id) { return GC.DATA.skills.find(s => s.id === id); },
    level(s, id) { return s.skills[id] || 0; },
    byBranch(branch) { return GC.DATA.skills.filter(sk => sk.branch === branch); },

    /** Lista de requisitos no cumplidos (texto). */
    missing(s, sk) {
      const out = [];
      const r = sk.req || {};
      if (r.skills) {
        for (const id in r.skills) {
          if (this.level(s, id) < r.skills[id]) out.push(`${this.get(id).name} nv. ${r.skills[id]}`);
        }
      }
      if (r.level && s.level < r.level) out.push(`Nivel ${r.level}`);
      if (r.stats) {
        const eff = GC.Player.effStats(s);
        for (const k in r.stats) if (eff[k] < r.stats[k]) out.push(`${GC.STAT_NAMES[k]} ${r.stats[k]}`);
      }
      return out;
    },

    /** Todos los requisitos con su estado, para la ficha. */
    reqList(s, sk) {
      const out = [];
      const r = sk.req || {};
      const eff = GC.Player.effStats(s);
      if (r.skills) for (const id in r.skills) out.push({ text: `${this.get(id).name} nv. ${r.skills[id]}`, ok: this.level(s, id) >= r.skills[id] });
      if (r.level) out.push({ text: `Nivel ${r.level}`, ok: s.level >= r.level });
      if (r.stats) for (const k in r.stats) out.push({ text: `${GC.STAT_NAMES[k]} ${r.stats[k]}`, ok: eff[k] >= r.stats[k] });
      return out;
    },

    /** 'max' | 'locked' | 'nopoints' | 'available' */
    status(s, sk) {
      const lvl = this.level(s, sk.id);
      if (lvl >= sk.maxLevel) return 'max';
      if (this.missing(s, sk).length) return 'locked';
      if (s.skillPoints < sk.cost) return 'nopoints';
      return 'available';
    },

    learn(s, id) {
      const sk = this.get(id);
      if (!sk) return { ok: false, reason: 'Habilidad desconocida.' };
      const st = this.status(s, sk);
      if (st === 'max') return { ok: false, reason: 'Ya está al nivel máximo.' };
      if (st === 'locked') return { ok: false, reason: 'Faltan requisitos: ' + this.missing(s, sk).join(', ') };
      if (st === 'nopoints') return { ok: false, reason: `Necesitas ${sk.cost} PH.` };
      s.skillPoints -= sk.cost;
      s.skills[id] = this.level(s, id) + 1;
      if (sk.technique) s.selectedTech = sk.technique;   // la técnica nueva queda seleccionada
      GC.Player.clampVitals(s);
      return { ok: true, level: s.skills[id], skill: sk };
    },

    /** Técnicas desbloqueadas, en orden de definición. */
    techniques(s) {
      return Object.keys(GC.DATA.techniques).filter(t => this.level(s, GC.DATA.techniques[t].skill) > 0);
    },

    totalLevels(s) { return Object.values(s.skills).reduce((a, b) => a + b, 0); },
    maxTotalLevels() { return GC.DATA.skills.reduce((a, sk) => a + sk.maxLevel, 0); },
  };

  GC.Skills = Skills;
})();

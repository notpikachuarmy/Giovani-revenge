/* =========================================================================
   EVENTS — comprobación de eventos, recompensas y títulos
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const Events = {
    get(id) { return GC.DATA.events.find(e => e.id === id); },

    conditionsMet(s, ev, context) {
      if (ev.context !== context) return false;
      if (!ev.repeatable && s.eventsSeen.includes(ev.id)) return false;
      const w = ev.when || {};
      if (w.minDay && s.day < w.minDay) return false;
      if (w.minFights && s.records.fights < w.minFights) return false;
      if (w.minLevel && s.level < w.minLevel) return false;
      if (w.flag && !s.flags[w.flag]) return false;
      if (w.notFlag && s.flags[w.notFlag]) return false;
      if (w.skill) for (const k in w.skill) if ((s.skills[k] || 0) < w.skill[k]) return false;
      if (w.final && !GC.Game.finalReady(s)) return false;
      return true;
    },

    /** Primer evento pendiente para un contexto ('hub', 'shop', 'sleep'). */
    check(s, context) {
      for (const ev of GC.DATA.events) {
        if (!this.conditionsMet(s, ev, context)) continue;
        const chance = ev.when && ev.when.chance ? ev.when.chance : 1;
        if (Math.random() > chance) continue;
        return ev;
      }
      return null;
    },

    markSeen(s, ev) { if (!s.eventsSeen.includes(ev.id)) s.eventsSeen.push(ev.id); },

    /** Aplica recompensas y devuelve textos para mostrarlas. */
    applyRewards(s, r) {
      const out = [];
      if (!r) return out;
      if (r.stats) {
        for (const k in r.stats) { s.stats[k] += r.stats[k]; out.push(`+${r.stats[k]} ${GC.STAT_NAMES[k]}`); }
      }
      if (r.sp) { s.skillPoints += r.sp; out.push(`+${r.sp} punto${r.sp > 1 ? 's' : ''} de habilidad`); }
      if (r.money) { s.money += r.money; out.push(`${r.money > 0 ? '+' : ''}${GC.UI.money(r.money)}`); }
      if (r.xp) {
        const lv = GC.Player.addXp(s, r.xp);
        out.push(`+${r.xp} XP`);
        if (lv) out.push(`¡Nivel ${s.level}!`);
      }
      if (r.item) {
        const it = GC.Equipment.get(r.item);
        if (!s.owned.includes(r.item)) s.owned.push(r.item);
        if (it && it.unlockFlag) s.flags[it.unlockFlag] = true;
        out.push(`Nuevo equipo: ${it ? it.name : r.item} (equípalo en Equipo)`);
      }
      if (r.flag) [].concat(r.flag).forEach(f => { s.flags[f] = true; });
      if (r.intel && GC.Game.unlockIntel(s)) out.push('Nuevo informe en el Expediente Chansey');
      if (r.unlockText) out.push(r.unlockText);
      GC.Player.clampVitals(s);
      return out;
    },
  };

  const Titles = {
    get(id) { return GC.DATA.titles.find(t => t.id === id); },
    /** Desbloquea los títulos cuyos requisitos se cumplan. Devuelve los nuevos. */
    check(s) {
      const fresh = [];
      GC.DATA.titles.forEach(t => {
        if (s.titles.includes(t.id)) return;
        let ok = false;
        try { ok = !!t.check(s); } catch (e) { ok = false; }
        if (ok) { s.titles.push(t.id); fresh.push(t); }
      });
      if (fresh.length) s.currentTitle = fresh[fresh.length - 1].id;
      return fresh;
    },
  };

  GC.Events = Events;
  GC.Titles = Titles;
})();

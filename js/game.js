/* =========================================================================
   GAME — gestor de pantallas y flujo general de la partida
   ========================================================================= */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

(function () {
  const Game = {
    s: null,
    screen: null,
    screenName: null,
    params: null,

    // ------------------------------------------------------------ pantallas
    show(name, params, opts = {}) {
      const scr = GC.Screens[name];
      if (!scr) { console.error('Pantalla inexistente:', name); return; }
      const focus = opts.keepFocus ? this.focusKey() : null;
      const scrollY = window.scrollY;
      if (this.screen && this.screen.leave) this.screen.leave();
      this.screen = scr;
      this.screenName = name;
      this.params = params || {};
      const root = document.getElementById('screen');
      root.className = 'screen-' + name;
      root.innerHTML = scr.render(this.params);
      if (scr.enter) scr.enter(this.params);
      GC.UI.updateHud();
      window.scrollTo(0, opts.keepScroll ? scrollY : 0);
      if (focus) this.restoreFocus(focus);
      else GC.Input.focusFirst();
    },

    /** Vuelve a pintar la pantalla actual conservando foco y scroll. */
    refresh() { this.show(this.screenName, this.params, { keepFocus: true, keepScroll: true }); },

    focusKey() {
      const el = document.activeElement;
      if (!el || !el.dataset || !el.dataset.act) return null;
      return { act: el.dataset.act, arg: el.dataset.arg };
    },
    restoreFocus(k) {
      let sel = `[data-act="${k.act}"]`;
      if (k.arg !== undefined) sel += `[data-arg="${k.arg}"]`;
      const el = document.querySelector('#screen ' + sel);
      if (el && !el.disabled) el.focus({ preventScroll: true });
      else GC.Input.focusFirst();
    },

    // ------------------------------------------------------------ partida
    newGame() {
      const start = () => {
        GC.Save.clear();
        this.s = GC.State.createNew();
        this.s.hp = GC.Player.maxHp(this.s);
        this.s.energy = GC.Player.maxEnergy(this.s);
        GC.Titles.check(this.s);
        this.save();
        this.playStory(GC.DATA.story.intro, {
          title: 'Prólogo',
          then: () => this.playStory(GC.DATA.story.day1, { title: 'Día 1', then: () => this.goHub() }),
        });
      };
      if (GC.Save.exists()) GC.UI.confirm('Ya hay una partida guardada. ¿Empezar de nuevo y sobrescribirla?', start);
      else start();
    },

    continueGame() {
      const d = GC.Save.load();
      if (!d) { GC.UI.toast('No hay ninguna partida guardada.', 'bad'); return; }
      this.s = d;
      GC.Player.clampVitals(d);
      this.goHub();
    },

    deleteSave() {
      GC.UI.confirm('¿Borrar la partida guardada? No se puede deshacer.', () => {
        GC.Save.clear();
        this.s = null;
        GC.UI.toast('Partida borrada.');
        this.show('menu');
      });
    },

    save() { if (this.s) GC.Save.save(this.s); },

    goHub() {
      const ev = this.s && GC.Events.check(this.s, 'hub');
      if (ev) this.playEvent(ev, () => this.goHub());
      else this.show('hub');
    },

    playEvent(ev, then) {
      this.show('event', { event: ev, title: ev.title, lines: ev.lines, choices: ev.choices, then });
    },
    playStory(lines, opts) { this.show('event', Object.assign({ lines }, opts)); },

    /** Tras una acción importante: títulos, guardado, eventos y repintado. */
    afterAction() {
      const s = this.s;
      GC.Titles.check(s).forEach(t => GC.UI.toast(`Nuevo título: <b>${t.name}</b>`, 'gold'));
      this.save();
      const back = this.screenName;
      const ev = GC.Events.check(s, 'hub');
      if (ev) this.playEvent(ev, () => this.show(back));
      else this.refresh();
    },

    finalReady(s) {
      const r = GC.DATA.balance.finalRequirements;
      return s.records.fights >= r.fights && s.level >= r.level;
    },

    unlockIntel(s) {
      if (s.intel >= GC.DATA.intel.length) return null;
      s.intel++;
      return GC.DATA.intel[s.intel - 1];
    },

    randomQuote() { return GC.UI.pick(GC.DATA.story.quotes); },

    // ------------------------------------------------------------ combate
    requestFight(mode) {
      const s = this.s;
      const b = GC.DATA.balance;
      if (!GC.Time.ringOpen(s)) {
        GC.UI.modal({
          title: 'El pabellón está cerrado',
          html: `<p>Abre de ${b.ringOpen}:00 a ${b.ringClose}:00. Ahora son las ${GC.UI.clock(s.hour)}.</p>
                 <p>Giovanni compró el pabellón la semana pasada, pero el conserje sigue sin dejarle entrar fuera de horario.</p>`,
          buttons: [{ label: 'Entendido', cancel: true }],
        });
        return;
      }
      const P = GC.Player;
      const mh = P.maxHp(s), me = P.maxEnergy(s);
      const warnings = [];
      if (mode !== 'final') {
        if (s.hp < mh * 0.5) warnings.push(`Vida baja (${s.hp}/${mh}).`);
        if (s.energy < me * 0.5) warnings.push(`Energía baja (${s.energy}/${me}).`);
        if (s.fatigue >= 60) warnings.push(`Muy cansado (${s.fatigue}/100): empezarás con menos energía.`);
      }
      const start = () => {
        if (mode === 'final') {
          this.playStory(GC.DATA.story.finalIntro, { title: 'La Revancha Definitiva', then: () => this.show('battle', { mode: 'final' }) });
        } else {
          this.show('battle', { mode: 'normal' });
        }
      };
      const intro = mode === 'final'
        ? '<p>Esta vez no es para medir tiempos. Giovanni sube al ring con todo lo aprendido.</p>'
        : `<p>Combate nº ${s.records.fights + 1}. Mejor marca: <b>${GC.UI.time(s.records.bestSurvival)}</b>.</p>`;
      const warn = warnings.length
        ? `<div class="warn-box"><p>Antes de subir:</p><ul>${warnings.map(w => `<li>${w}</li>`).join('')}</ul><p>Conviene comer o dormir primero.</p></div>`
        : '';
      GC.UI.modal({
        title: mode === 'final' ? '¿La última revancha?' : '¿Subir al ring?',
        html: intro + warn,
        buttons: [{ label: '¡Al ring!', action: start }, { label: 'Todavía no', cancel: true }],
      });
    },

    onBattleEnd(bt) {
      const result = this.finishBattle(bt);
      if (result.isFinal) {
        this.playStory(GC.DATA.story.ending, { title: 'Epílogo', cls: 'ending', then: () => this.show('ending', { result }) });
      } else {
        this.show('result', { result, reason: bt.reason });
      }
    },

    /** Aplica el resultado de un combate a la partida y devuelve un resumen. */
    finishBattle(bt) {
      const s = this.s;
      const R = GC.DATA.balance.rewards;
      const r = s.records;
      const st = bt.stats;
      const survival = bt.t;
      const isFinal = bt.mode === 'final';

      r.fights++;
      r.losses++;
      if (r.fights === 1) r.firstSurvival = survival;
      const prev = { bestSurvival: r.bestSurvival };
      const newRecords = [];
      const firstFight = r.fights === 1;
      if (survival > r.bestSurvival) { r.bestSurvival = survival; newRecords.push('survival'); }
      if (st.damage > r.maxDamage) { r.maxDamage = st.damage; newRecords.push('damage'); }
      if (st.hits > r.maxHits) { r.maxHits = st.hits; newRecords.push('hits'); }
      if (st.dodges > r.maxDodges) { r.maxDodges = st.dodges; newRecords.push('dodges'); }
      if (st.maxHit > r.maxSingleHit) { r.maxSingleHit = st.maxHit; newRecords.push('maxHit'); }
      r.totalDamage += st.damage;
      r.totalRegens += st.regens;

      const xp = Math.round(R.xpBase + survival * R.xpPerSecond + st.damage * R.xpPerDamage) * (isFinal ? 2 : 1);
      const sp = R.sp + (!firstFight && newRecords.includes('survival') ? R.spRecord : 0);
      s.skillPoints += sp;
      const levels = GC.Player.addXp(s, xp);
      s.money += R.money;

      // Giovanni sale del ring hecho polvo
      s.hp = Math.max(1, Math.round(GC.Player.maxHp(s) * R.hpLeftPct));
      s.energy = Math.round(bt.mode === 'final' ? 0 : bt.p.energy);
      s.fatigue = Math.min(100, s.fatigue + R.fatigue);
      GC.Time.advance(s, GC.DATA.balance.fightHours);

      const intel = this.unlockIntel(s);
      const entry = {
        n: r.fights, day: s.day, survival, damage: st.damage, taken: st.taken,
        hits: st.hits, dodges: st.dodges, blocks: st.blocks, regens: st.regens, final: isFinal,
      };
      s.history.push(entry);
      if (s.history.length > 40) s.history.shift();
      if (isFinal) { s.finalDone = true; r.finalSurvival = survival; }

      const titles = GC.Titles.check(s);
      this.save();
      return { entry, newRecords, firstFight, xp, sp, levels, money: R.money, intel, titles, prev, isFinal, stats: st };
    },
  };

  GC.Game = Game;
})();

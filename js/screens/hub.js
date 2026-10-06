/* Pantalla: BASE DE GIOVANNI (centro de operaciones) */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.hub = {
  hud: true,

  render() {
    const s = GC.Game.s;
    const UI = GC.UI;
    const losses = s.records.losses;
    const finalAvailable = s.flags.finalUnlocked && !s.finalDone;
    const req = GC.DATA.balance.finalRequirements;
    const marks = Math.min(losses, 24);

    let goal;
    if (s.finalDone) {
      goal = `<p>Revancha completada. Ahora solo quedan las marcas.</p>
        <p class="goal-big">Mejor marca: ${UI.time(s.records.bestSurvival)}</p>`;
    } else if (finalAvailable) {
      goal = '<p>Todo está listo. La Revancha Definitiva te espera.</p>';
    } else {
      const f = Math.min(s.records.fights, req.fights), l = Math.min(s.level, req.level);
      goal = `<p>Camino a la Revancha Definitiva</p>
        ${UI.bar('Combates', f, req.fights, 'goal')}
        ${UI.bar('Nivel', l, req.level, 'goal')}
        <p class="goal-small">Mejor marca: <b>${UI.time(s.records.bestSurvival)}</b></p>`;
    }

    const night = GC.Time.isNight(s);
    const hint = night ? 'Es de madrugada: toca dormir.'
      : s.fatigue >= 80 ? 'Giovanni está agotado. Duerme o come algo.'
      : s.skillPoints >= 2 ? `Tienes ${s.skillPoints} puntos de habilidad sin gastar.`
      : '';

    return `<section class="hub-screen">
      <div class="room panel">
        <div class="room-scene">
          <div class="room-window"><span class="moon ${s.hour >= 20 || s.hour < 7 ? 'on' : ''}"></span></div>
          <div class="room-poster">
            <div class="poster-head">Objetivo</div>
            <div class="poster-pic">${GC.Sprites.html('chansey', { cls: 'mini' })}</div>
            <div class="poster-marks" aria-label="${losses} derrotas">${'✗'.repeat(marks)}</div>
          </div>
          <div class="room-bag"></div>
          <div class="room-giovanni">${GC.Sprites.html('giovanni')}</div>
          <div class="room-floor"></div>
        </div>
        <blockquote class="quote">«${GC.Game.randomQuote()}»<cite>Giovanni</cite></blockquote>
        ${hint ? `<p class="hub-hint">${hint}</p>` : ''}
      </div>

      <div class="hub-side">
        <nav class="hub-menu">
          <button class="btn btn-big" data-act="go" data-arg="training">🥊 Entrenar</button>
          <button class="btn btn-big" data-act="go" data-arg="rest">🍽️ Comer y dormir</button>
          <button class="btn btn-big" data-act="go" data-arg="skills">🧠 Habilidades ${s.skillPoints ? `<span class="badge">${s.skillPoints}</span>` : ''}</button>
          <button class="btn btn-big" data-act="go" data-arg="equipment">🧤 Equipo</button>
          <button class="btn btn-big" data-act="go" data-arg="stats">📊 Estadísticas</button>
          ${finalAvailable ? '<button class="btn btn-big btn-final" data-act="final">👑 La Revancha Definitiva</button>' : ''}
          <button class="btn btn-big btn-fight" data-act="fight">🔔 Combatir contra Chansey</button>
          <button class="btn btn-ghost" data-act="menu">Guardar y salir</button>
        </nav>
        <div class="hub-goal panel">${goal}</div>
      </div>
    </section>`;
  },

  onAction(act, arg) {
    const G = GC.Game;
    if (act === 'go') {
      if (arg === 'equipment') {
        const ev = GC.Events.check(G.s, 'shop');
        if (ev) { G.playEvent(ev, () => G.show('equipment')); return; }
      }
      G.show(arg);
    } else if (act === 'fight') G.requestFight('normal');
    else if (act === 'final') G.requestFight('final');
    else if (act === 'menu') { G.save(); G.show('menu'); GC.UI.toast('Partida guardada.'); }
  },

  back() {
    GC.UI.confirm('¿Guardar y volver al menú principal?', () => { GC.Game.save(); GC.Game.show('menu'); });
  },
};

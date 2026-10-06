/* Pantalla: FINAL */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.ending = {
  hud: false,

  render() {
    const s = GC.Game.s;
    const UI = GC.UI;
    const r = s.records;
    return `<section class="ending-screen">
      <p class="result-kicker">Fin</p>
      <h1 class="ending-title">El Giovanni definitivo</h1>
      <p class="ending-sub">No ganó. Pero ya no es el hombre que cayó la primera vez.</p>
      <div class="ending-compare panel">
        <div><span>Primer combate</span><b>${UI.time(r.firstSurvival)}</b></div>
        <div><span>Mejor marca</span><b>${UI.time(r.bestSurvival)}</b></div>
        <div><span>Días entrenando</span><b>${s.day}</b></div>
        <div><span>Derrotas</span><b>${r.losses}</b></div>
        <div><span>Puñetazos</span><b>${UI.num(s.totals.punches)}</b></div>
        <div><span>Chansey derrotada</span><b>0 veces</b></div>
      </div>
      <p class="ending-note">Título desbloqueado: «EL GIOVANNI DEFINITIVO». Puedes seguir entrenando para batir tus marcas.</p>
      <div class="ending-buttons">
        <button class="btn btn-big btn-primary" data-act="continue">Seguir entrenando</button>
        <button class="btn btn-big" data-act="menu">Menú principal</button>
      </div>
      <p class="credits">Un fangame paródico hecho por fans. Gracias por perder tantas veces.</p>
    </section>`;
  },

  enter() { GC.Audio.play('regen'); },

  onAction(act) {
    if (act === 'continue') GC.Game.goHub();
    else if (act === 'menu') { GC.Game.save(); GC.Game.show('menu'); }
  },
  back() { GC.Game.goHub(); },
};

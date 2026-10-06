/* Pantalla: RESULTADO DEL COMBATE */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.result = {
  hud: false,

  render(p) {
    const s = GC.Game.s;
    const UI = GC.UI;
    const R = p.result;
    const e = R.entry;
    const st = R.stats;
    const D = GC.DATA.story;
    const isNew = k => R.newRecords.includes(k) && !R.firstFight;
    const rec = k => (isNew(k) ? '<span class="new-rec">¡Récord!</span>' : '');

    const rows = [
      ['Duración del combate', UI.time(e.survival), rec('survival')],
      ['Daño infligido', UI.num(st.damage), rec('damage')],
      ['Daño recibido', UI.num(st.taken), ''],
      ['Golpes acertados', UI.num(st.hits), rec('hits')],
      ['Golpes esquivados', UI.num(st.dodges), rec('dodges')],
      ['Golpes bloqueados', UI.num(st.blocks), ''],
      ['Golpe más fuerte', UI.num(st.maxHit), rec('maxHit')],
      ['Regeneraciones de Chansey', UI.num(st.regens), ''],
      ['Mejor marca', UI.time(s.records.bestSurvival), ''],
    ];

    const progress = R.firstFight
      ? `<p class="progress-line">Primer combate. Giovanni sobrevivió <b>${e.survival.toFixed(1).replace('.', ',')} segundos</b>.</p>`
      : `<p class="progress-line">Primer combate: <b>${UI.time(s.records.firstSurvival)}</b> · Hoy: <b>${UI.time(e.survival)}</b></p>`;

    const rewards = [
      `+${R.xp} XP`,
      `+${R.sp} PH`,
      `${UI.money(R.money)} (premio de consolación del público)`,
    ];
    if (R.levels) rewards.push(`¡Nivel ${s.level}!`);
    R.titles.forEach(t => rewards.push(`Nuevo título: «${t.name}»`));

    const headline = p.reason === 'towel' ? 'GIOVANNI TIRA LA TOALLA.' : UI.pick(D.resultHeadlines);
    const said = R.newRecords.includes('survival') && !R.firstFight ? UI.pick(D.giovanniRecord) : UI.pick(D.giovanniNoRecord);

    return `<section class="result-screen">
      <p class="result-kicker">Derrota nº ${e.n}</p>
      <h1 class="result-headline">${headline}</h1>
      <p class="result-sub">${UI.pick(D.chanseyAfter)}</p>
      ${progress}
      <div class="result-body">
        <table class="result-table panel"><tbody>
          ${rows.map(([k, v, x]) => `<tr><td>${k}</td><td>${v}</td><td>${x}</td></tr>`).join('')}
        </tbody></table>
        <div class="result-side">
          <div class="panel">
            <h2>Recompensas</h2>
            <ul class="reward-list">${rewards.map(x => `<li>${x}</li>`).join('')}</ul>
          </div>
          ${R.intel ? `<div class="panel intel-box"><h2>Expediente Chansey</h2><p>${R.intel}</p></div>` : ''}
          <blockquote class="quote">«${said}»<cite>Giovanni</cite></blockquote>
        </div>
      </div>
      <button class="btn btn-big btn-primary" data-act="hub" data-autofocus>Volver a la base</button>
    </section>`;
  },

  enter() { GC.Audio.play(GC.Game.params.result.newRecords.length ? 'levelup' : 'click'); },

  onAction(act) { if (act === 'hub') GC.Game.goHub(); },
  back() { GC.Game.goHub(); },
};

/* Pantalla: ENTRENAMIENTO */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.training = {
  hud: true,
  log: [],

  render() {
    const s = GC.Game.s;
    const UI = GC.UI;
    const T = GC.Training;
    const list = T.list().filter(a => T.isVisible(s, a));

    const cards = list.map(a => {
      const chk = T.check(s, a);
      const gains = Object.keys(a.gains).map(k =>
        `<span class="gain">+${T.estimateGain(s, a, k).toFixed(1).replace('.', ',')} ${GC.STAT_SHORT[k]}</span>`).join('');
      const costs = [
        `<span title="Horas">⏱ ${a.hours} h</span>`,
        `<span title="Energía">⚡ −${a.energy}</span>`,
        `<span title="Cansancio">😓 ${a.fatigue >= 0 ? '+' : '−'}${Math.abs(a.fatigue)}</span>`,
        a.hpCostPct ? `<span title="Vida">❤ −${Math.round(a.hpCostPct * 100)}%</span>` : '',
        a.price ? `<span title="Precio">${UI.money(a.price)}</span>` : '',
      ].join('');
      return `<button class="card train-card ${chk.ok ? '' : 'is-off'}" data-act="train" data-arg="${a.id}">
        <span class="card-head"><span class="card-icon">${a.icon}</span><span class="card-name">${a.name}</span></span>
        <span class="card-desc">${a.desc}</span>
        <span class="card-gains">${gains}</span>
        <span class="card-costs">${costs}</span>
        ${chk.ok ? '' : `<span class="card-reason">${chk.reason}</span>`}
      </button>`;
    }).join('');

    const eff = GC.Player.effStats(s);
    const statRow = GC.STAT_KEYS.map(k =>
      `<div class="mini-stat"><span>${GC.STAT_NAMES[k]}</span><b>${Math.floor(eff[k])}</b></div>`).join('');
    const t = s.totals;

    return `<section class="list-screen training-screen">
      <header class="screen-head">
        <h1>Entrenamiento</h1>
        <button class="btn" data-act="back">Volver a la base</button>
      </header>
      ${s.fatigue >= GC.DATA.balance.fatigueSlowFrom ? '<p class="warn-bar">Giovanni está muy cansado: entrenar rinde la mitad. Come o duerme.</p>' : ''}
      ${GC.Time.isNight(s) ? '<p class="warn-bar">Es de madrugada. Ve a dormir.</p>' : ''}
      <div class="screen-body">
        <div class="card-grid">${cards}</div>
        <aside class="side panel">
          <h2>Giovanni</h2>
          <div class="mini-stats">${statRow}</div>
          <h2>Diario de entrenamiento</h2>
          <ul class="train-log">${this.log.length ? this.log.map(l => `<li>${l}</li>`).join('') : '<li class="muted">Elige un ejercicio para empezar.</li>'}</ul>
          <h2>Acumulado</h2>
          <ul class="totals">
            <li><b>${UI.num(t.punches)}</b> puñetazos</li>
            <li><b>${(t.kg / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 })}</b> toneladas levantadas</li>
            <li><b>${UI.num(t.km)}</b> km recorridos</li>
            <li><b>${UI.num(t.meditation)}</b> minutos meditando</li>
            <li><b>${UI.num(s.records.trainingSessions)}</b> sesiones</li>
          </ul>
        </aside>
      </div>
    </section>`;
  },

  onAction(act, arg) {
    if (act !== 'train') return;
    const s = GC.Game.s;
    const res = GC.Training.perform(s, arg);
    if (!res.ok) { GC.UI.toast(res.reason, 'bad'); GC.Audio.play('deny'); return; }
    GC.Audio.play('train');
    const gains = Object.keys(res.gains).map(k =>
      `+${res.gains[k].toFixed(1).replace('.', ',')} ${GC.STAT_SHORT[k]}`).join(', ');
    let line = `<b>${res.activity.name}</b> (${gains}). ${res.flavor}`;
    if (res.extra) line += ` <span class="bad">${res.extra}</span>`;
    if (res.slow) line += ' <span class="muted">(rendimiento reducido por cansancio)</span>';
    this.log.unshift(line);
    this.log = this.log.slice(0, 6);
    if (res.levels) { GC.Audio.play('levelup'); GC.UI.toast(`¡Nivel ${s.level}! Tienes ${s.skillPoints} PH.`, 'gold'); }
    GC.Game.afterAction();
  },

  back() { GC.Game.goHub(); },
};

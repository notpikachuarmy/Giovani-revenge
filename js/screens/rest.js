/* Pantalla: COMER Y DORMIR (gratis, ilimitado… salvo el tiempo) */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.rest = {
  hud: true,

  render() {
    const s = GC.Game.s;
    const b = GC.DATA.balance;
    const T = GC.Training;
    const food = T.checkFood(s);

    const foods = T.foodList().map(f => {
      const buff = f.buff.stat === 'trainGain'
        ? `+${Math.round(f.buff.amount * 100)}% entrenamiento`
        : `+${f.buff.amount} ${GC.STAT_SHORT[f.buff.stat]}`;
      return `<button class="card food-card ${food.ok ? '' : 'is-off'}" data-act="eat" data-arg="${f.id}">
        <span class="card-head"><span class="card-icon">${f.icon}</span><span class="card-name">${f.name}</span></span>
        <span class="card-desc">${f.desc}</span>
        <span class="card-gains">
          <span class="gain">⚡ +${f.energy}</span>
          <span class="gain">😓 −${f.fatigue}</span>
          ${f.hpPct ? `<span class="gain">❤ +${Math.round(f.hpPct * 100)}%</span>` : ''}
          <span class="gain buff">${buff} (${f.buff.hours} h)</span>
        </span>
        <span class="card-costs"><span>⏱ 1 h</span><span>Gratis</span></span>
      </button>`;
    }).join('');

    const buffs = s.buffs.length
      ? s.buffs.map(x => `<li>${x.name}: <b>${x.stat === 'trainGain' ? '+' + Math.round(x.amount * 100) + '% entrenamiento' : '+' + x.amount + ' ' + GC.STAT_SHORT[x.stat]}</b> (${x.hours} h)</li>`).join('')
      : '<li class="muted">Ninguno. Come algo.</li>';

    return `<section class="list-screen rest-screen">
      <header class="screen-head">
        <h1>Comer y dormir</h1>
        <button class="btn" data-act="back">Volver a la base</button>
      </header>
      <p class="screen-note">La comida y la cama no cuestan nada (es usted Giovanni). Lo que cuesta es el tiempo.</p>
      ${food.ok ? '' : `<p class="warn-bar">${food.reason}</p>`}
      <div class="screen-body">
        <div>
          <h2 class="section-title">Dormitorio</h2>
          <div class="card-grid two">
            <button class="card sleep-card" data-act="sleep">
              <span class="card-head"><span class="card-icon">🛏️</span><span class="card-name">Dormir</span></span>
              <span class="card-desc">Sábanas de seda y un despertador de oro. Recupera todo.</span>
              <span class="card-gains"><span class="gain">❤ máx.</span><span class="gain">⚡ máx.</span><span class="gain">😓 −${b.sleepFatigue}</span></span>
              <span class="card-costs"><span>⏱ ${b.sleepHours} h</span></span>
            </button>
            <button class="card sleep-card" data-act="nap">
              <span class="card-head"><span class="card-icon">💤</span><span class="card-name">Siesta</span></span>
              <span class="card-desc">Un descanso corto en el sillón del despacho.</span>
              <span class="card-gains"><span class="gain">❤ +${Math.round(b.napHpPct * 100)}%</span><span class="gain">⚡ +${Math.round(b.napEnergyPct * 100)}%</span><span class="gain">😓 −${b.napFatigue}</span></span>
              <span class="card-costs"><span>⏱ ${b.napHours} h</span></span>
            </button>
          </div>
          <h2 class="section-title">Cocina del chef</h2>
          <div class="card-grid">${foods}</div>
        </div>
        <aside class="side panel">
          <h2>Efectos activos</h2>
          <ul class="buff-list">${buffs}</ul>
          <h2>Estómago</h2>
          ${GC.UI.bar('Lleno', s.fullness || 0, b.fullnessMax, 'fullness', false)}
        </aside>
      </div>
    </section>`;
  },

  onAction(act, arg) {
    const s = GC.Game.s;
    const T = GC.Training;
    if (act === 'eat') {
      const r = T.eat(s, arg);
      if (!r.ok) { GC.UI.toast(r.reason, 'bad'); GC.Audio.play('deny'); return; }
      GC.Audio.play('train');
      GC.UI.toast(`${r.food.icon} ${r.food.name}. Delicioso.`);
      GC.Game.afterAction();
    } else if (act === 'sleep' || act === 'nap') {
      const before = s.day;
      T.rest(s, act === 'sleep' ? 'sleep' : 'nap');
      GC.Audio.play('train');
      GC.UI.toast(act === 'sleep'
        ? (s.day > before ? `Zzz… Amanece el día ${s.day}.` : 'Zzz… Giovanni se despierta como nuevo.')
        : 'Siesta completada. Giovanni finge que no ha roncado.');
      // Algunos eventos solo ocurren al dormir
      const ev = act === 'sleep' ? GC.Events.check(s, 'sleep') : null;
      if (ev) {
        GC.Game.save();
        GC.Game.playEvent(ev, () => GC.Game.show('rest'));
        return;
      }
      GC.Game.afterAction();
    }
  },

  back() { GC.Game.goHub(); },
};

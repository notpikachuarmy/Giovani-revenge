/* Pantalla: ESTADÍSTICAS Y RÉCORDS */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.stats = {
  hud: true,
  tab: 'giovanni',

  TABS: [
    ['giovanni', 'Giovanni'],
    ['records', 'Récords'],
    ['titles', 'Títulos'],
    ['intel', 'Expediente Chansey'],
    ['history', 'Historial'],
  ],

  render() {
    const tabs = this.TABS.map(([id, name]) =>
      `<button class="tab ${this.tab === id ? 'on' : ''}" data-act="tab" data-arg="${id}">${name}</button>`).join('');
    return `<section class="list-screen stats-screen">
      <header class="screen-head">
        <h1>Estadísticas</h1>
        <button class="btn" data-act="back">Volver a la base</button>
      </header>
      <div class="tabs">${tabs}</div>
      <div class="panel stats-body">${this['tab_' + this.tab]()}</div>
    </section>`;
  },

  tab_giovanni() {
    const s = GC.Game.s;
    const P = GC.Player;
    const c = GC.DATA.balance.combat;
    const eff = P.effStats(s);
    const preview = GC.Battle.create(s, 'normal');
    const f = 1 / (1 + eff.spd * c.speedCdFactor);
    const crit = c.critBase + eff.tec * c.critPerTec + (preview.mods.critChance || 0);
    const rows = GC.STAT_KEYS.map(k => {
      const bonus = eff[k] - s.stats[k];
      return `<tr><td>${GC.STAT_NAMES[k]}</td><td>${Math.floor(s.stats[k])}</td>
        <td class="${bonus > 0 ? 'good' : bonus < 0 ? 'bad' : 'muted'}">${bonus ? (bonus > 0 ? '+' : '') + Math.round(bonus) : '·'}</td>
        <td><b>${Math.floor(eff[k])}</b></td></tr>`;
    }).join('');
    const techs = GC.Skills.techniques(s).map(id => {
      const t = GC.DATA.techniques[id];
      return `<li>${t.name}: ~${Math.round(GC.Battle.techDamage(preview, id))} de daño bruto${t.hits > 1 ? ' por golpe' : ''}</li>`;
    }).join('') || '<li class="muted">Ninguna todavía.</li>';
    return `<div class="two-col">
      <div>
        <h2>Estadísticas</h2>
        <table class="stat-table"><thead><tr><th></th><th>Base</th><th>Extra</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
        <p>Nivel <b>${s.level}</b> · ${s.xp}/${P.xpToNext(s.level)} XP · Poder total <b>${P.power(s)}</b></p>
      </div>
      <div>
        <h2>En combate</h2>
        <ul class="derived">
          <li>Vida máxima: <b>${P.maxHp(s)}</b></li>
          <li>Energía máxima: <b>${P.maxEnergy(s)}</b></li>
          <li>Daño de Golpear: <b>~${Math.round(GC.Battle.baseDamage(preview, 'jab'))}</b></li>
          <li>Daño de Golpe fuerte: <b>~${Math.round(GC.Battle.baseDamage(preview, 'heavy'))}</b></li>
          <li>Probabilidad de crítico: <b>${GC.UI.pct(crit)}</b></li>
          <li>Esquiva pasiva: <b>${GC.UI.pct(Math.min(c.passiveEvadeCap, eff.spd * c.passiveEvadePerSpd))}</b></li>
          <li>Reducción de daño: <b>${GC.UI.pct(Math.min(c.endReductionCap, eff.end * c.endReductionPerPoint))}</b></li>
          <li>Velocidad de acción: <b>×${(1 / f).toFixed(2).replace('.', ',')}</b></li>
          <li>Resistencia a efectos: <b>${GC.UI.pct(Math.min(c.mentalResistCap, eff.men * c.mentalResistPerPoint))}</b></li>
        </ul>
        <h2>Técnicas</h2>
        <ul class="derived">${techs}</ul>
      </div>
    </div>`;
  },

  tab_records() {
    const s = GC.Game.s;
    const r = s.records;
    const UI = GC.UI;
    const rows = [
      ['Mejor tiempo de supervivencia', UI.time(r.bestSurvival)],
      ['Primer combate', UI.time(r.firstSurvival)],
      ['Mayor daño en un combate', UI.num(r.maxDamage)],
      ['Golpe más fuerte', UI.num(r.maxSingleHit)],
      ['Más golpes en un combate', UI.num(r.maxHits)],
      ['Más esquivas en un combate', UI.num(r.maxDodges)],
      ['Combates', UI.num(r.fights)],
      ['Derrotas', UI.num(r.losses)],
      ['Victorias', '0 (Chansey es Chansey)'],
      ['Veces que Chansey se ha regenerado entera', UI.num(r.totalRegens)],
      ['Días de entrenamiento', UI.num(s.day)],
      ['Sesiones de entrenamiento', UI.num(r.trainingSessions)],
      ['Fuerza máxima', Math.floor(r.maxStr)],
      ['Nivel máximo', r.maxLevel],
      ['Niveles de habilidad', `${GC.Skills.totalLevels(s)} / ${GC.Skills.maxTotalLevels()}`],
      ['Equipamiento conseguido', `${s.owned.length} / ${GC.DATA.equipment.length}`],
      ['Daño total infligido', UI.num(r.totalDamage)],
      ['Dinero gastado', UI.money(r.spent)],
      ['Puñetazos de entrenamiento', UI.num(s.totals.punches)],
      ['Toneladas levantadas', (s.totals.kg / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 })],
      ['Kilómetros recorridos', UI.num(s.totals.km)],
      ['Comidas', UI.num(s.totals.meals)],
    ];
    return `<table class="record-table"><tbody>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;
  },

  tab_titles() {
    const s = GC.Game.s;
    const items = GC.DATA.titles.map(t => {
      const have = s.titles.includes(t.id);
      if (!have) return `<div class="title-card locked"><span class="tc-name">???</span><span class="tc-desc">${t.desc}</span></div>`;
      const cur = s.currentTitle === t.id;
      return `<button class="title-card ${cur ? 'on' : ''}" data-act="title" data-arg="${t.id}">
        <span class="tc-name">${t.name}</span><span class="tc-desc">${t.desc}${cur ? ' · En uso' : ''}</span></button>`;
    }).join('');
    return `<p class="screen-note">Pulsa un título conseguido para lucirlo.</p><div class="title-grid">${items}</div>`;
  },

  tab_intel() {
    const s = GC.Game.s;
    const items = GC.DATA.intel.map((txt, i) => i < s.intel
      ? `<li class="intel">${txt}</li>`
      : '<li class="intel locked">Informe clasificado. Pierde más para desbloquearlo.</li>').join('');
    return `<p class="screen-note">Lo que el laboratorio ha averiguado sobre Chansey tras cada derrota.</p><ol class="intel-list">${items}</ol>`;
  },

  tab_history() {
    const s = GC.Game.s;
    const UI = GC.UI;
    if (!s.history.length) return '<p class="muted">Todavía no has subido al ring.</p>';
    const rows = s.history.slice().reverse().map(h => `<tr class="${h.final ? 'final' : ''}">
      <td>${h.final ? '👑' : '#' + h.n}</td><td>Día ${h.day}</td><td>${UI.time(h.survival)}</td>
      <td>${UI.num(h.damage)}</td><td>${UI.num(h.taken)}</td><td>${h.hits}</td><td>${h.dodges}</td></tr>`).join('');
    return `<div class="table-scroll"><table class="history-table">
      <thead><tr><th>Combate</th><th>Día</th><th>Tiempo</th><th>Daño</th><th>Recibido</th><th>Golpes</th><th>Esquivas</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  },

  onAction(act, arg) {
    if (act === 'tab') { this.tab = arg; GC.Game.refresh(); }
    else if (act === 'title') {
      GC.Game.s.currentTitle = arg;
      GC.Game.save();
      GC.Game.refresh();
    }
  },

  back() { GC.Game.goHub(); },
};

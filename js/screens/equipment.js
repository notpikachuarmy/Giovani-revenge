/* Pantalla: EQUIPAMIENTO (tienda + inventario) */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.equipment = {
  hud: true,
  slot: 'guantes',

  render() {
    const s = GC.Game.s;
    const E = GC.Equipment;
    const UI = GC.UI;

    const tabs = GC.DATA.equipmentSlots.map(sl => {
      const eq = s.equipped[sl.id] ? E.get(s.equipped[sl.id]) : null;
      return `<button class="slot-tab ${this.slot === sl.id ? 'on' : ''}" data-act="slot" data-arg="${sl.id}">
        <span class="slot-icon">${sl.icon}</span>
        <span class="slot-name">${sl.name}</span>
        <span class="slot-item">${eq ? eq.name : 'vacío'}</span>
      </button>`;
    }).join('');

    const items = E.bySlot(this.slot).filter(it => E.visible(s, it)).map(it => {
      const owned = E.owns(s, it.id);
      const equipped = E.isEquipped(s, it.id);
      const afford = s.money >= it.price;
      let state;
      if (equipped) state = '<span class="tag tag-on">Equipado · pulsa para quitar</span>';
      else if (owned) state = '<span class="tag">En propiedad · pulsa para equipar</span>';
      else state = `<span class="tag tag-price ${afford ? '' : 'bad'}">${it.price ? UI.money(it.price) : 'Regalo'}</span>`;
      return `<button class="card item-card ${equipped ? 'is-on' : ''} ${!owned && !afford ? 'is-off' : ''}" data-act="item" data-arg="${it.id}">
        <span class="card-head"><span class="card-name">${it.name}</span></span>
        <span class="card-desc">${it.desc}</span>
        <span class="card-gains"><span class="gain">${E.bonusText(it)}</span></span>
        <span class="card-costs">${state}</span>
      </button>`;
    }).join('') || '<p class="muted">Nada disponible en esta categoría… todavía.</p>';

    const eff = GC.Player.effStats(s);
    const rows = GC.STAT_KEYS.map(k => {
      const diff = Math.floor(eff[k]) - Math.floor(s.stats[k]);
      return `<tr><td>${GC.STAT_NAMES[k]}</td><td>${Math.floor(eff[k])}</td>
        <td class="${diff > 0 ? 'good' : diff < 0 ? 'bad' : 'muted'}">${diff > 0 ? '+' + diff : diff < 0 ? diff : '·'}</td></tr>`;
    }).join('');

    return `<section class="list-screen equipment-screen">
      <header class="screen-head">
        <h1>Equipo</h1>
        <button class="btn" data-act="back">Volver a la base</button>
      </header>
      <div class="slot-tabs">${tabs}</div>
      <div class="screen-body">
        <div class="card-grid">${items}</div>
        <aside class="side panel">
          <h2>Con el equipo actual</h2>
          <table class="stat-table"><tbody>${rows}</tbody></table>
          <p>Vida máxima: <b>${GC.Player.maxHp(s)}</b></p>
          <p>Energía máxima: <b>${GC.Player.maxEnergy(s)}</b></p>
          <p class="muted">Dinero gastado: ${UI.money(s.records.spent)}</p>
        </aside>
      </div>
    </section>`;
  },

  onAction(act, arg) {
    const s = GC.Game.s;
    const E = GC.Equipment;
    if (act === 'slot') { this.slot = arg; GC.Game.refresh(); return; }
    if (act !== 'item') return;
    const it = E.get(arg);
    if (!it) return;
    let r;
    if (E.isEquipped(s, arg)) { r = E.unequip(s, it.slot); GC.UI.toast(`Te quitas: ${it.name}`); }
    else if (E.owns(s, arg)) { r = E.equip(s, arg); GC.UI.toast(`Equipado: ${it.name}`); }
    else {
      r = E.buy(s, arg);
      if (r.ok) {
        GC.Audio.play('buy');
        GC.UI.toast(`Comprado: ${it.name}${r.equipped ? ' (equipado)' : ''}`, 'gold');
      }
    }
    if (!r.ok) { GC.UI.toast(r.reason, 'bad'); GC.Audio.play('deny'); return; }
    GC.Game.afterAction();
  },

  back() { GC.Game.goHub(); },
};

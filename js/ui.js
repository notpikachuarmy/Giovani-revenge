/* =========================================================================
   UI — utilidades de interfaz compartidas por todas las pantallas
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const UI = {
    $,

    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

    money(n) { return '₽\u00a0' + Math.round(n).toLocaleString('es-ES'); },
    num(n) { return Math.round(n).toLocaleString('es-ES'); },
    clock(hour) { return String(hour).padStart(2, '0') + ':00'; },
    /** Segundos -> "01:23.4" */
    time(sec) {
      sec = Math.max(0, sec || 0);
      const m = Math.floor(sec / 60);
      const s = sec - m * 60;
      return String(m).padStart(2, '0') + ':' + s.toFixed(1).padStart(4, '0');
    },
    pct(v) { return Math.round(v * 100) + '%'; },

    /** Barra de progreso retro. */
    bar(label, value, max, cls = '', showNums = true) {
      const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
      return `<div class="bar ${cls}">
        <span class="bar-label">${label}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        ${showNums ? `<span class="bar-num">${Math.round(value)}/${Math.round(max)}</span>` : ''}
      </div>`;
    },
    /** Actualiza una barra ya pintada sin regenerar el HTML. */
    setBar(el, value, max) {
      if (!el) return;
      const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
      const fill = el.querySelector('.bar-fill');
      const num = el.querySelector('.bar-num');
      if (fill) fill.style.width = pct + '%';
      if (num) num.textContent = Math.max(0, Math.round(value)) + '/' + Math.round(max);
    },

    /** Sustituye {variables} en los textos de historia. */
    fill(text, extra) {
      const s = GC.Game.s;
      const vars = Object.assign({}, extra || {});
      if (s) {
        Object.assign(vars, {
          day: s.day,
          tons: (s.totals.kg / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 }),
          km: UI.num(s.totals.km),
          punches: UI.num(s.totals.punches),
          losses: s.records.losses,
          fights: s.records.fights,
          best: UI.time(s.records.bestSurvival),
          first: (s.records.firstSurvival || 0).toLocaleString('es-ES', { maximumFractionDigits: 1 }),
        }, extra || {});
      }
      return String(text).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    },

    /** Cabecera persistente con día, hora, dinero y vitales. */
    updateHud() {
      const hud = $('#hud');
      const g = GC.Game;
      const s = g.s;
      const show = !!(s && g.screen && g.screen.hud);
      hud.classList.toggle('hidden', !show);
      if (!show) { hud.innerHTML = ''; return; }
      const P = GC.Player;
      const title = s.currentTitle ? GC.Titles.get(s.currentTitle) : null;
      hud.innerHTML = `
        <div class="hud-block hud-time"><span class="hud-day">Día ${s.day}</span><span class="hud-hour">${UI.clock(s.hour)}</span></div>
        <div class="hud-block hud-money" title="Dinero">${UI.money(s.money)}</div>
        <div class="hud-block hud-bars">
          ${UI.bar('Vida', s.hp, P.maxHp(s), 'hp')}
          ${UI.bar('Energía', s.energy, P.maxEnergy(s), 'energy')}
          ${UI.bar('Cansancio', s.fatigue, 100, 'fatigue')}
        </div>
        <div class="hud-block hud-level">
          <span class="hud-lv">Nivel ${s.level}</span>
          ${UI.bar('XP', s.xp, P.xpToNext(s.level), 'xp', false)}
          <span class="hud-sp ${s.skillPoints ? 'has' : ''}" title="Puntos de habilidad">${s.skillPoints} PH</span>
        </div>
        ${title ? `<div class="hud-block hud-title">«${title.name}»</div>` : ''}`;
    },

    toast(msg, type = '') {
      const root = $('#toast-root');
      const el = document.createElement('div');
      el.className = 'toast ' + type;
      el.innerHTML = msg;
      root.appendChild(el);
      setTimeout(() => el.classList.add('out'), 2800);
      setTimeout(() => el.remove(), 3300);
    },

    /**
     * Ventana modal accesible con teclado/mando.
     * buttons: [{ label, action, cls, cancel }]  (cancel = acción de Escape)
     */
    modal({ title, html, buttons }) {
      const root = $('#modal-root');
      buttons = buttons && buttons.length ? buttons : [{ label: 'Aceptar', cancel: true }];
      root.innerHTML = `<div class="modal-backdrop"><div class="modal panel" role="dialog" aria-modal="true">
        ${title ? `<h2 class="modal-title">${title}</h2>` : ''}
        <div class="modal-body">${html || ''}</div>
        <div class="modal-buttons"></div></div></div>`;
      const wrap = root.querySelector('.modal-buttons');
      buttons.forEach((b, i) => {
        const el = document.createElement('button');
        el.className = 'btn ' + (b.cls || (i === 0 ? 'btn-primary' : ''));
        el.textContent = b.label;
        el.addEventListener('click', () => {
          GC.Audio.play('click');
          UI.closeModal();
          if (b.action) b.action();
        });
        wrap.appendChild(el);
      });
      this._cancel = buttons.find(b => b.cancel) || null;
      const first = wrap.querySelector('button');
      setTimeout(() => first && first.focus(), 0);
    },
    closeModal() { $('#modal-root').innerHTML = ''; this._cancel = null; },
    cancelModal() {
      const c = this._cancel;
      this.closeModal();
      if (c && c.action) c.action();
    },
    isModalOpen() { return !!$('#modal-root').firstElementChild; },

    confirm(text, onYes, onNo) {
      this.modal({
        title: 'Confirmar',
        html: `<p>${text}</p>`,
        buttons: [
          { label: 'Sí', action: onYes, cls: 'btn-primary' },
          { label: 'No', action: onNo, cancel: true },
        ],
      });
    },
  };

  GC.UI = UI;
})();

/* =========================================================================
   INPUT — teclado, mando y navegación por menús
   - Flechas / WASD mueven el foco entre botones (navegación espacial).
   - Enter / Espacio pulsan el botón con foco (comportamiento nativo).
   - Escape vuelve atrás.
   - Las pantallas pueden capturar teclas con screen.onKey(key) -> true.
   El mando se traduce a teclas virtuales (GP_A, GP_B, ArrowUp…).
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const DIRS = {
    ArrowUp: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', s: 'down', S: 'down',
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
  };
  const PAD_MAP = {
    0: 'GP_A', 1: 'GP_B', 2: 'GP_X', 3: 'GP_Y', 4: 'GP_LB', 5: 'GP_RB', 6: 'GP_LT', 7: 'GP_RT',
    8: 'GP_START', 9: 'GP_START', 12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight',
  };

  const Input = {
    pad: { prev: {}, stickDir: null, stickNext: 0 },

    init() {
      document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        GC.Audio.ensure();
        if (this.handle(e.key)) e.preventDefault();
      });
      window.addEventListener('gamepadconnected', () => GC.UI.toast('🎮 Mando conectado'));
      const loop = () => { this.pollPad(); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    },

    handle(key) {
      const UI = GC.UI;
      const isBack = key === 'Escape' || key === 'GP_B' || key === 'GP_START';
      if (UI.isModalOpen()) {
        if (isBack) { UI.cancelModal(); return true; }
        if (DIRS[key]) { this.moveFocus(DIRS[key], document.getElementById('modal-root')); return true; }
        if (key === 'GP_A') { this.activate(); return true; }
        return false;
      }
      const scr = GC.Game.screen;
      if (scr && scr.onKey && scr.onKey(key)) return true;
      if (DIRS[key]) { this.moveFocus(DIRS[key], document.getElementById('screen')); return true; }
      if (isBack) { if (scr && scr.back) scr.back(); return true; }
      if (key === 'GP_A') { this.activate(); return true; }
      return false;
    },

    activate() {
      let el = document.activeElement;
      if (!el || !el.matches || !el.matches('button')) { this.focusFirst(); el = document.activeElement; }
      if (el && el.matches && el.matches('button') && !el.disabled) el.click();
    },

    focusables(root) {
      return [...root.querySelectorAll('button:not([disabled])')].filter(el => el.offsetParent !== null);
    },

    focusFirst(root) {
      root = root || (GC.UI.isModalOpen() ? document.getElementById('modal-root') : document.getElementById('screen'));
      const auto = root.querySelector('[data-autofocus]:not([disabled])');
      const el = auto || this.focusables(root)[0];
      if (el) el.focus({ preventScroll: true });
    },

    /** Mueve el foco al botón más cercano en la dirección indicada. */
    moveFocus(dir, root) {
      const list = this.focusables(root);
      if (!list.length) return;
      const cur = document.activeElement;
      if (!list.includes(cur)) { list[0].focus(); return; }
      const r0 = cur.getBoundingClientRect();
      const x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2;
      let best = null, bestScore = Infinity;
      for (const el of list) {
        if (el === cur) continue;
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - x0, dy = r.top + r.height / 2 - y0;
        let primary, secondary;
        if (dir === 'up') { if (dy >= -4) continue; primary = -dy; secondary = Math.abs(dx); }
        else if (dir === 'down') { if (dy <= 4) continue; primary = dy; secondary = Math.abs(dx); }
        else if (dir === 'left') { if (dx >= -4) continue; primary = -dx; secondary = Math.abs(dy); }
        else { if (dx <= 4) continue; primary = dx; secondary = Math.abs(dy); }
        const score = primary + secondary * 2.5;
        if (score < bestScore) { bestScore = score; best = el; }
      }
      if (best) {
        best.focus({ preventScroll: true });
        best.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        GC.Audio.play('move');
      }
    },

    pollPad() {
      if (!navigator.getGamepads) return;
      const gp = [...navigator.getGamepads()].find(p => p && p.connected);
      if (!gp) return;
      for (const idx in PAD_MAP) {
        const b = gp.buttons[idx];
        const pressed = !!(b && (b.pressed || b.value > 0.5));
        if (pressed && !this.pad.prev[idx]) { GC.Audio.ensure(); this.handle(PAD_MAP[idx]); }
        this.pad.prev[idx] = pressed;
      }
      // Stick izquierdo con auto-repetición
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      let dir = null;
      if (Math.abs(ax) > 0.6 || Math.abs(ay) > 0.6) {
        dir = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'ArrowRight' : 'ArrowLeft') : (ay > 0 ? 'ArrowDown' : 'ArrowUp');
      }
      const now = performance.now();
      if (dir && (dir !== this.pad.stickDir || now > this.pad.stickNext)) {
        this.handle(dir);
        this.pad.stickNext = now + (dir !== this.pad.stickDir ? 350 : 160);
      }
      this.pad.stickDir = dir;
    },
  };

  GC.Input = Input;
})();

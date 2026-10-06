/* =========================================================================
   MAIN — arranque
   Todos los botones usan data-act / data-arg y se gestionan aquí:
   el clic se envía a la pantalla activa (screen.onAction).
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  function boot() {
    GC.Audio.init();
    GC.Input.init();

    document.addEventListener('click', e => {
      const el = e.target.closest('[data-act]');
      if (!el || el.disabled) return;
      if (!document.getElementById('screen').contains(el)) return;
      const scr = GC.Game.screen;
      if (!scr) return;
      GC.Audio.ensure();
      const act = el.dataset.act;
      if (act === 'back') {
        GC.Audio.play('click');
        if (scr.back) scr.back(); else GC.Game.goHub();
        return;
      }
      if (!el.classList.contains('act-btn') && !el.classList.contains('chip')) GC.Audio.play('click');
      if (scr.onAction) scr.onAction(act, el.dataset.arg, el);
    });

    GC.Game.show('menu');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

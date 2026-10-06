/* Pantalla: MENÚ PRINCIPAL */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.menu = {
  hud: false,

  render() {
    const has = GC.Save.exists();
    const muted = GC.Audio.muted;
    return `<section class="menu-screen">
      <div class="menu-poster">
        <p class="poster-kicker">Pabellón de Ciudad Verde presenta</p>
        <h1 class="logo">
          <span class="logo-a">Giovanni</span>
          <span class="logo-vs">contra</span>
          <span class="logo-b">Chansey</span>
        </h1>
        <p class="logo-sub">La revancha imposible</p>
        <div class="menu-fighters">
          <div class="menu-fighter">${GC.Sprites.html('giovanni')}</div>
          <div class="menu-fighter">${GC.Sprites.html('chansey')}</div>
        </div>
      </div>
      <nav class="menu-buttons">
        <button class="btn btn-big btn-primary" data-act="continue" ${has ? '' : 'disabled'}>Continuar</button>
        <button class="btn btn-big" data-act="new">Nueva partida</button>
        <button class="btn" data-act="help">Cómo se juega</button>
        <button class="btn" data-act="sound">Sonido: ${muted ? 'apagado' : 'encendido'}</button>
        <button class="btn btn-danger" data-act="delete" ${has ? '' : 'disabled'}>Borrar partida</button>
      </nav>
      <p class="disclaimer">Fangame paródico, gratuito y sin ánimo de lucro, hecho por fans.
        Pokémon, Giovanni y Chansey pertenecen a Nintendo, Game Freak, Creatures y The Pokémon Company.</p>
    </section>`;
  },

  onAction(act) {
    const G = GC.Game;
    if (act === 'continue') G.continueGame();
    else if (act === 'new') G.newGame();
    else if (act === 'delete') G.deleteSave();
    else if (act === 'sound') { GC.Audio.toggle(); G.refresh(); }
    else if (act === 'help') this.help();
  },

  help() {
    GC.UI.modal({
      title: 'Cómo se juega',
      html: `<p>Entrena a Giovanni, mejora sus estadísticas, aprende técnicas, compra equipo y vuelve al ring contra Chansey cuantas veces haga falta.</p>
        <p>Chansey no puede perder. Tu reto es aguantar más, pegar más fuerte y batir tus propias marcas. Tras suficientes combates llegará la Revancha Definitiva.</p>
        <h3>Menús</h3>
        <p>Ratón, o flechas/WASD para moverte, Enter/Espacio para aceptar y Esc para volver.</p>
        <h3>Combate</h3>
        <table class="keys">
          <tr><td>Golpear</td><td>1 · D · →</td><td>Mando A</td></tr>
          <tr><td>Golpe fuerte</td><td>2 · W · ↑</td><td>Mando X</td></tr>
          <tr><td>Defender</td><td>3 · S · ↓</td><td>Mando RB</td></tr>
          <tr><td>Esquivar</td><td>4 · A · ← · Espacio</td><td>Mando B</td></tr>
          <tr><td>Técnica</td><td>5 · T</td><td>Mando Y</td></tr>
          <tr><td>Recuperarse</td><td>6 · R</td><td>Mando LB</td></tr>
          <tr><td>Cambiar técnica</td><td>Q / E</td><td>LT / RT</td></tr>
          <tr><td>Pausa</td><td>Esc</td><td>Start</td></tr>
        </table>
        <p>Cuando Chansey prepara un ataque aparece un aviso con una barra. Defiende o esquiva justo antes de que se llene.</p>`,
      buttons: [{ label: 'Entendido', cancel: true }],
    });
  },

  back() { /* ya estás en el menú */ },
};

/* Pantalla: EVENTOS / HISTORIA
   params: { lines, title, choices, event, then, cls, vars, scene, cast }

   ESCENARIO: encima del cuadro de diálogo se dibuja un decorado con los
   personajes de la escena. El que habla se ilumina.
     scene: 'ring' | 'gym' | 'office' | 'shop' | 'lab' | 'night'
     cast:  ['giovanni', 'chansey', ...]   (si falta, se deduce de quién habla)
   Cada línea puede cambiarlos sobre la marcha:
     { who, text, scene: 'ring', cast: [...], fx: { giovanni: 'ko' } }
   fx disponibles: 'ko' (tumbado), 'wobble' (tambaleándose), 'hide' (fuera), '' (normal) */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.event = {
  hud: false,

  render(p) {
    return `<section class="event-screen ${p.cls || ''}">
      ${p.title ? `<h1 class="event-title">${p.title}</h1>` : ''}
      <div class="event-stage" id="ev-stage"></div>
      <div class="dialog panel" id="ev-dialog" data-act="next">
        <div class="dialog-portrait" id="ev-portrait"></div>
        <div class="dialog-main">
          <div class="dialog-name" id="ev-name"></div>
          <p class="dialog-text" id="ev-text"></p>
        </div>
      </div>
      <div class="event-choices" id="ev-choices"></div>
      <div class="event-controls" id="ev-controls">
        <button class="btn btn-primary" data-act="next" data-autofocus>Continuar</button>
        <button class="btn btn-ghost" data-act="skip">Saltar escena</button>
      </div>
    </section>`;
  },

  enter(p) {
    this.p = p;
    this.lines = (p.lines || []).slice();
    this.i = -1;
    this.chosen = null;
    this.done = false;
    const ev = p.event || {};
    this.scene = p.scene || ev.scene || 'gym';
    this.cast = (p.cast || ev.cast || this.castFrom(p)).slice();
    this.fx = {};
    this.advance();
  },

  /** Reparto por defecto: quien habla en la escena (Giovanni siempre a la izquierda). */
  castFrom(p) {
    const all = (p.lines || []).concat(...(p.choices || []).map(c => c.lines || []));
    const ids = [];
    all.forEach(l => {
      const sp = GC.DATA.speakers[l.who];
      if (sp && sp.sprite && !ids.includes(sp.sprite)) ids.push(sp.sprite);
    });
    if (!ids.includes('giovanni')) ids.unshift('giovanni');
    return ['giovanni'].concat(ids.filter(id => id !== 'giovanni')).slice(0, 4);
  },

  renderStage(speakerSprite) {
    const stage = document.getElementById('ev-stage');
    const bg = GC.SCENES && GC.SCENES[this.scene];
    stage.className = 'event-stage scene-' + this.scene + (bg ? ' has-bg' : '');
    stage.style.backgroundImage = bg ? `url('${bg}')` : '';
    stage.innerHTML = '<div class="stage-deco"></div><div class="stage-cast">' + this.cast
      .filter(id => this.fx[id] !== 'hide')
      .map(id => {
        const state = !speakerSprite ? '' : id === speakerSprite ? 'talking' : 'quiet';
        return `<div class="actor actor-${id} ${state} ${this.fx[id] ? 'fx-' + this.fx[id] : ''}">${GC.Sprites.html(id)}</div>`;
      }).join('') + '</div>';
  },

  advance() {
    if (this.done) return;
    this.i++;
    if (this.i < this.lines.length) { this.showLine(this.lines[this.i]); return; }
    if (this.p.choices && !this.chosen) { this.showChoices(); return; }
    this.finish();
  },

  showLine(l) {
    const sp = GC.DATA.speakers[l.who] || GC.DATA.speakers.narr;
    if (l.scene) this.scene = l.scene;
    if (l.cast) this.cast = l.cast.slice();
    if (l.fx) Object.assign(this.fx, l.fx);
    if (sp.sprite && !this.cast.includes(sp.sprite)) this.cast.push(sp.sprite);
    this.renderStage(sp.sprite);
    const dialog = document.getElementById('ev-dialog');
    dialog.classList.toggle('is-narr', !sp.sprite);
    document.getElementById('ev-name').textContent = sp.name;
    const text = document.getElementById('ev-text');
    text.textContent = GC.UI.fill(l.text, this.p.vars);
    text.classList.remove('reveal'); void text.offsetWidth; text.classList.add('reveal');
    document.getElementById('ev-portrait').innerHTML = sp.sprite ? GC.Sprites.html(sp.sprite, { cls: 'portrait' }) : '';
  },

  showChoices() {
    this.choosing = true;
    document.getElementById('ev-controls').classList.add('hidden');
    const wrap = document.getElementById('ev-choices');
    wrap.innerHTML = this.p.choices.map((c, i) =>
      `<button class="btn btn-big" data-act="choice" data-arg="${i}">${c.text}</button>`).join('');
    GC.Input.focusFirst(wrap);
  },

  onAction(act, arg) {
    if (act === 'next') {
      if (!this.choosing) this.advance();
    } else if (act === 'choice') {
      const c = this.p.choices[Number(arg)];
      if (!c) return;
      this.chosen = c;
      this.choosing = false;
      document.getElementById('ev-choices').innerHTML = '';
      document.getElementById('ev-controls').classList.remove('hidden');
      this.lines = c.lines || [];
      this.i = -1;
      GC.Input.focusFirst();
      this.advance();
    } else if (act === 'skip') {
      if (this.choosing) return;
      if (this.p.choices && !this.chosen) { this.i = this.lines.length; this.showChoices(); return; }
      this.finish();
    }
  },

  finish() {
    if (this.done) return;
    this.done = true;
    const s = GC.Game.s;
    let out = [];
    const ev = this.p.event;
    if (ev && s) {
      GC.Events.markSeen(s, ev);
      if (ev.hours) GC.Time.advance(s, ev.hours);
      out = out.concat(GC.Events.applyRewards(s, ev.rewards));
    }
    if (this.chosen && this.chosen.rewards && s) out = out.concat(GC.Events.applyRewards(s, this.chosen.rewards));
    if (s) {
      GC.Titles.check(s).forEach(t => out.push(`Nuevo título: ${t.name}`));
      GC.Game.save();
    }
    const then = this.p.then || (() => GC.Game.goHub());
    if (out.length) {
      GC.Audio.play('levelup');
      GC.UI.modal({
        title: 'Recompensas',
        html: `<ul class="reward-list">${out.map(x => `<li>${x}</li>`).join('')}</ul>`,
        buttons: [{ label: 'Continuar', action: then, cancel: true }],
      });
    } else then();
  },

  back() { this.onAction('skip'); },
};

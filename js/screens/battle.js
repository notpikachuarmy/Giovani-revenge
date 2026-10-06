/* Pantalla: COMBATE CONTRA CHANSEY (vista del motor GC.Battle) */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.battle = {
  hud: false,

  ACTIONS: [
    { id: 'jab',     name: 'Golpear',      keys: '1 · D',  cost: () => GC.DATA.balance.combat.jab.energy },
    { id: 'heavy',   name: 'Golpe fuerte', keys: '2 · W',  cost: () => GC.DATA.balance.combat.heavy.energy },
    { id: 'guard',   name: 'Defender',     keys: '3 · S',  cost: () => GC.DATA.balance.combat.guard.energy },
    { id: 'dodge',   name: 'Esquivar',     keys: '4 · A',  cost: () => GC.DATA.balance.combat.dodge.energy },
    { id: 'tech',    name: 'Técnica',      keys: '5 · T',  cost: null },
    { id: 'recover', name: 'Recuperarse',  keys: '6 · R',  cost: () => 0 },
  ],

  KEYMAP: {
    '1': 'jab', d: 'jab', D: 'jab', ArrowRight: 'jab', j: 'jab', J: 'jab', GP_A: 'jab',
    '2': 'heavy', w: 'heavy', W: 'heavy', ArrowUp: 'heavy', k: 'heavy', K: 'heavy', GP_X: 'heavy',
    '3': 'guard', s: 'guard', S: 'guard', ArrowDown: 'guard', l: 'guard', L: 'guard', GP_RB: 'guard',
    '4': 'dodge', a: 'dodge', A: 'dodge', ArrowLeft: 'dodge', ' ': 'dodge', GP_B: 'dodge',
    '5': 'tech', t: 'tech', T: 'tech', u: 'tech', U: 'tech', GP_Y: 'tech',
    '6': 'recover', r: 'recover', R: 'recover', GP_LB: 'recover',
  },

  render(p) {
    const s = GC.Game.s;
    const title = s.currentTitle ? GC.Titles.get(s.currentTitle) : null;
    const actions = this.ACTIONS.map(a => `
      <button class="btn act-btn" data-act="a" data-arg="${a.id}" id="ab-${a.id}">
        <span class="ab-name">${a.name}</span>
        <span class="ab-meta"><span class="ab-key">${a.keys}</span><span class="ab-cost" id="abc-${a.id}">${a.cost ? (a.cost() ? '⚡' + a.cost() : '') : ''}</span></span>
        <span class="ab-cd"></span>
      </button>`).join('');

    return `<section class="battle-screen ${p.mode === 'final' ? 'is-final' : ''}">
      <div class="scoreboard">
        <div class="fpanel fpanel-gio">
          <div class="fp-name">Giovanni ${title ? `<small>«${title.name}»</small>` : ''}</div>
          <div id="b-gio-hp">${GC.UI.bar('Vida', 1, 1, 'hp')}</div>
          <div id="b-gio-en">${GC.UI.bar('Energía', 1, 1, 'energy')}</div>
          <div class="fp-status" id="b-gio-status">&nbsp;</div>
        </div>
        <div class="clock">
          <div class="clock-time" id="b-time">00:00.0</div>
          <div class="clock-phase" id="b-phase">${p.mode === 'final' ? 'Revancha definitiva' : 'Fase 1'}</div>
          <div class="clock-best">Marca: ${GC.UI.time(s.records.bestSurvival)}</div>
        </div>
        <div class="fpanel fpanel-chan">
          <div class="fp-name">Chansey</div>
          <div id="b-chan-hp">${GC.UI.bar('Vida', 1, 1, 'hp chan')}</div>
          <div class="fp-status">Estado: <b id="b-chan-status">FELIZ</b></div>
        </div>
      </div>

      <div class="arena" id="arena">
        <div class="arena-crowd"></div>
        <div class="arena-lights"></div>
        <div class="ring">
          <div class="ring-post left"></div><div class="ring-post right"></div>
          <div class="ring-rope r1"></div><div class="ring-rope r2"></div><div class="ring-rope r3"></div>
          <div class="ring-floor"></div>
        </div>
        <div class="fighter fighter-gio" id="f-gio">${GC.Sprites.html('giovanni')}<div class="stance-tag" id="b-stance"></div></div>
        <div class="fighter fighter-chan" id="f-chan">${GC.Sprites.html('chansey')}</div>
        <div class="telegraph hidden" id="b-tele">
          <div class="tele-name" id="b-tele-name"></div>
          <div class="tele-track"><div class="tele-fill" id="b-tele-fill"></div></div>
          <div class="tele-tags" id="b-tele-tags"></div>
        </div>
        <div class="banner" id="b-banner"></div>
        <div class="speech hidden" id="b-speech"></div>
        <div class="floaters" id="b-floaters"></div>
      </div>

      <div class="battle-bottom">
        <div class="actions">${actions}</div>
        <div class="tech-row" id="b-techs"></div>
        <div class="battle-foot">
          <ul class="battle-log" id="b-log" aria-live="polite"></ul>
          <button class="btn btn-ghost" data-act="pause">Pausa (Esc)</button>
        </div>
      </div>
    </section>`;
  },

  enter(p) {
    const s = GC.Game.s;
    this.bt = GC.Battle.create(s, p.mode || 'normal');
    this.bt.listeners.push((type, d) => this.onEvent(type, d));
    this.ending = false;
    this.lastPhaseClass = '';
    this.el = {
      arena: document.getElementById('arena'),
      gio: document.getElementById('f-gio'),
      chan: document.getElementById('f-chan'),
      gioHp: document.querySelector('#b-gio-hp .bar'),
      gioEn: document.querySelector('#b-gio-en .bar'),
      chanHp: document.querySelector('#b-chan-hp .bar'),
      gioStatus: document.getElementById('b-gio-status'),
      chanStatus: document.getElementById('b-chan-status'),
      time: document.getElementById('b-time'),
      phase: document.getElementById('b-phase'),
      tele: document.getElementById('b-tele'),
      teleName: document.getElementById('b-tele-name'),
      teleFill: document.getElementById('b-tele-fill'),
      teleTags: document.getElementById('b-tele-tags'),
      banner: document.getElementById('b-banner'),
      speech: document.getElementById('b-speech'),
      floaters: document.getElementById('b-floaters'),
      log: document.getElementById('b-log'),
      stance: document.getElementById('b-stance'),
      buttons: {},
    };
    this.ACTIONS.forEach(a => { this.el.buttons[a.id] = document.getElementById('ab-' + a.id); });
    this.renderTechs();

    // Campana y cuenta atrás
    this.bt.freeze = 1.3;
    this.banner(p.mode === 'final' ? '¡ÚLTIMA REVANCHA!' : '¡DING, DING!', 'tech');
    GC.Audio.play('bell');
    this.log(p.mode === 'final' ? 'Giovanni sube al ring por última vez.' : `Combate nº ${s.records.fights + 1}. Chansey saluda.`);

    this.running = true;
    this.last = performance.now();
    const loop = now => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      GC.Battle.update(this.bt, dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);

    this.onVis = () => { if (document.hidden && !this.bt.over) this.pause(); };
    document.addEventListener('visibilitychange', this.onVis);
    this.draw();
  },

  leave() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.endTimer);
    document.removeEventListener('visibilitychange', this.onVis);
  },

  // ------------------------------------------------------------ dibujo
  draw() {
    const bt = this.bt; const p = bt.p; const c = bt.c; const el = this.el;
    const UI = GC.UI;
    UI.setBar(el.gioHp, p.hp, p.maxHp);
    UI.setBar(el.gioEn, p.energy, p.maxEnergy);
    UI.setBar(el.chanHp, c.hp, c.maxHp);
    el.time.textContent = UI.time(bt.t);
    if (bt.mode !== 'final') el.phase.textContent = 'Fase ' + c.phase;
    el.chanStatus.textContent = GC.Chansey.statusText(c);
    el.chanHp.classList.toggle('regen', c.regenFlash > 0);

    const phaseClass = 'phase-' + c.phase;
    if (phaseClass !== this.lastPhaseClass) {
      if (this.lastPhaseClass) el.arena.classList.remove(this.lastPhaseClass);
      el.arena.classList.add(phaseClass);
      this.lastPhaseClass = phaseClass;
    }

    // Estado de Giovanni
    let stance = '', status = '';
    if (p.stun > 0) { stance = 'stun'; status = 'Aturdido'; }
    else if (p.recovering > 0) { stance = 'recover'; status = 'Recuperándose'; }
    else if (p.dodge > 0) { stance = 'dodge'; status = 'Esquivando'; }
    else if (p.guard > 0) { stance = 'guard'; status = 'En guardia'; }
    if (GC.Battle.adrenaline(bt)) status += (status ? ' · ' : '') + 'Adrenalina';
    if (p.chain > 1) status += (status ? ' · ' : '') + `Combo ×${p.chain}`;
    el.gioStatus.textContent = status || '\u00a0';
    el.gio.dataset.stance = stance;
    el.stance.textContent = { stun: '✦ ✦ ✦', guard: 'GUARDIA', dodge: '', recover: '…' }[stance] || '';
    el.chan.classList.toggle('st-counter', c.counter > 0);
    el.chan.classList.toggle('st-stunned', c.stunned > 0);

    // Aviso de ataque
    if (c.move && !bt.cinematic) {
      el.tele.classList.remove('hidden');
      const prog = 1 - Math.max(0, c.windup) / c.windupTotal;
      el.teleFill.style.width = (prog * 100) + '%';
      el.tele.classList.toggle('danger', prog > 0.7);
    } else {
      el.tele.classList.add('hidden');
    }

    // Botones de acción
    const ready = GC.Battle.canAct(bt);
    const cdPct = p.cdTotal > 0 ? Math.max(0, p.cd / p.cdTotal) : 0;
    const techId = bt.s.selectedTech;
    const tech = techId ? GC.DATA.techniques[techId] : null;
    for (const id in el.buttons) {
      const b = el.buttons[id];
      let cost = 0;
      if (id === 'tech') cost = tech ? GC.Battle.energyCost(bt, tech.energy) : Infinity;
      else if (id === 'heavy' || id === 'dodge') cost = GC.Battle.energyCost(bt, GC.DATA.balance.combat[id].energy);
      b.classList.toggle('cooling', !ready);
      b.classList.toggle('no-energy', p.energy < cost);
      b.style.setProperty('--cd', ready ? 0 : (p.stun > 0 ? 1 : cdPct));
    }
  },

  renderTechs() {
    const bt = this.bt;
    const list = GC.Skills.techniques(bt.s);
    const row = document.getElementById('b-techs');
    if (list.length && !list.includes(bt.s.selectedTech)) bt.s.selectedTech = list[list.length - 1];
    const sel = bt.s.selectedTech;
    row.innerHTML = list.length
      ? '<span class="tech-label">Técnica (Q/E):</span>' + list.map(id => {
        const t = GC.DATA.techniques[id];
        return `<button class="chip ${id === sel ? 'on' : ''}" data-act="tech" data-arg="${id}" tabindex="-1">${t.name} ⚡${Math.round(GC.Battle.energyCost(bt, t.energy))}</button>`;
      }).join('')
      : '<span class="tech-label muted">Sin técnicas: desbloquéalas en el árbol de habilidades (rama Boxeo).</span>';
    const cost = document.getElementById('abc-tech');
    const t = sel ? GC.DATA.techniques[sel] : null;
    if (cost) cost.textContent = t ? '⚡' + Math.round(GC.Battle.energyCost(bt, t.energy)) : '—';
    const name = this.el.buttons.tech.querySelector('.ab-name');
    name.textContent = t ? t.name : 'Técnica';
  },

  cycleTech(dir) {
    const list = GC.Skills.techniques(this.bt.s);
    if (!list.length) return;
    const i = list.indexOf(this.bt.s.selectedTech);
    this.bt.s.selectedTech = list[(i + dir + list.length) % list.length];
    GC.Audio.play('move');
    this.renderTechs();
  },

  // ------------------------------------------------------------ efectos
  log(text, cls = '') {
    const li = document.createElement('li');
    li.className = cls;
    li.textContent = text;
    this.el.log.prepend(li);
    while (this.el.log.children.length > 5) this.el.log.lastChild.remove();
  },

  banner(text, cls = '') {
    const b = this.el.banner;
    b.textContent = text;
    b.className = 'banner show ' + cls;
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => { b.className = 'banner'; }, 1500);
  },

  speech(who, text) {
    const sp = this.el.speech;
    sp.textContent = text;
    sp.className = 'speech show from-' + who;
    clearTimeout(this.speechTimer);
    this.speechTimer = setTimeout(() => { sp.className = 'speech hidden'; }, 2200);
  },

  float(target, text, cls = '', delay = 0) {
    const go = () => {
      if (!this.running) return;
      const f = document.createElement('div');
      f.className = 'floater ' + cls + ' on-' + target;
      f.textContent = text;
      f.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
      this.el.floaters.appendChild(f);
      setTimeout(() => f.remove(), 1100);
    };
    if (delay) setTimeout(go, delay * 1000); else go();
  },

  anim(target, cls) {
    const el = target === 'chansey' ? this.el.chan : this.el.gio;
    const k = 'a-' + cls;
    el.classList.remove(k);
    void el.offsetWidth;
    el.classList.add(k);
    clearTimeout(el['_t' + cls]);
    el['_t' + cls] = setTimeout(() => el.classList.remove(k), cls === 'wobble' ? 2400 : cls === 'ko' ? 99999 : 450);
  },

  onEvent(type, d) {
    const D = GC.DATA.story;
    switch (type) {
      case 'log': this.log(d.text, d.cls); break;
      case 'float': this.float(d.target, d.text, d.cls, d.delay); break;
      case 'anim': this.anim(d.target, d.cls); break;
      case 'sfx': GC.Audio.play(d); break;
      case 'banner': this.banner(d.text, d.cls); break;
      case 'speech': this.speech(d.who, d.text); break;
      case 'deny': this.float('giovanni', d.text, 'deny'); GC.Audio.play('deny'); break;
      case 'shake':
        this.el.arena.classList.remove('shake'); void this.el.arena.offsetWidth; this.el.arena.classList.add('shake');
        break;
      case 'telegraph': {
        const m = d.move;
        const tags = [];
        if (m.kind === 'attack') {
          tags.push(m.blockable === false ? '<span class="bad">no bloqueable</span>' : '<span>bloqueable</span>');
          tags.push(m.dodgeable === false ? '<span class="bad">no esquivable</span>' : '<span>esquivable</span>');
          if (m.hits > 1) tags.push(`<span>${m.hits} golpes</span>`);
        }
        this.el.teleName.textContent = m.name;
        this.el.teleTags.innerHTML = tags.join('');
        this.el.tele.classList.toggle('is-attack', m.kind === 'attack');
        if (m.kind === 'attack') GC.Audio.play('warn');
        break;
      }
      case 'telegraphEnd': this.el.tele.classList.add('hidden'); break;
      case 'phase':
        this.banner('FASE ' + d.phase, 'phase');
        this.log(D.phaseIntros[d.phase - 1], 'phase');
        GC.Audio.play('phase');
        break;
      case 'nurse':
        this.banner('INSTINTO DE ENFERMERA', 'heal');
        this.log('Chansey se cura sola. Nadie la ha visto hacer nada.', 'chansey');
        this.float('chansey', '+60%', 'heal');
        GC.Audio.play('regen');
        break;
      case 'regen':
        this.banner('CHANSEY SE HA RECUPERADO.', 'regen');
        this.log(d.reason === 'absurd' ? GC.UI.pick(D.absurdLines) : GC.UI.pick(D.regenLines), 'chansey');
        this.anim('chansey', 'regen');
        this.el.arena.classList.remove('flash'); void this.el.arena.offsetWidth; this.el.arena.classList.add('flash');
        GC.Audio.play('regen');
        break;
      case 'gag': {
        d.lines.forEach((l, i) => setTimeout(() => { if (this.running) this.banner(l, i === 0 ? 'zero' : 'quiet'); }, i * 1000));
        this.log('El golpe definitivo. 0 de daño. Giovanni se queda mirando su puño.', 'bad');
        break;
      }
      case 'end': this.onEnd(d.reason); break;
      default: break;
    }
  },

  onEnd(reason) {
    if (this.ending) return;
    this.ending = true;
    this.el.tele.classList.add('hidden');
    let wait = 2300;
    if (reason === 'towel') { this.banner('TOALLA', 'quiet'); wait = 1000; }
    else {
      this.banner('K.O.', 'bad');
      this.anim('giovanni', 'ko');
      GC.Audio.play('ko');
      if (reason === 'final') wait = 3000;
    }
    this.log(reason === 'towel' ? 'Giovanni tira la toalla. Chansey la recoge y la dobla con cuidado.' : 'Giovanni cae a la lona. Chansey saluda al público.', 'bad');
    this.endTimer = setTimeout(() => GC.Game.onBattleEnd(this.bt), wait);
  },

  // ------------------------------------------------------------ control
  act(action, arg) {
    if (this.ending) return;
    GC.Battle.input(this.bt, action, arg);
  },

  pause() {
    const bt = this.bt;
    if (bt.over || bt.paused || GC.UI.isModalOpen()) return;
    bt.paused = true;
    const resume = () => { bt.paused = false; this.last = performance.now(); };
    GC.UI.modal({
      title: 'Pausa',
      html: `<p>Tiempo: <b>${GC.UI.time(bt.t)}</b> · Marca: <b>${GC.UI.time(GC.Game.s.records.bestSurvival)}</b></p>
        <p class="muted">Tirar la toalla cuenta como derrota (como todas).</p>`,
      buttons: [
        { label: 'Seguir peleando', action: resume, cancel: true },
        { label: 'Tirar la toalla', action: () => { resume(); if (!bt.cinematic) GC.Battle.end(bt, 'towel'); }, cls: 'btn-danger' },
      ],
    });
  },

  onAction(act, arg) {
    if (act === 'a') this.act(arg);
    else if (act === 'tech') {
      this.bt.s.selectedTech = arg;
      this.renderTechs();
      this.act('tech', arg);
    } else if (act === 'pause') this.pause();
  },

  onKey(key) {
    if (key === 'Escape' || key === 'GP_START') { this.pause(); return true; }
    if (key === 'q' || key === 'Q' || key === 'GP_LT') { this.cycleTech(-1); return true; }
    if (key === 'e' || key === 'E' || key === 'GP_RT') { this.cycleTech(1); return true; }
    const a = this.KEYMAP[key];
    if (a) { this.act(a); return true; }
    return false;
  },

  back() { this.pause(); },
};

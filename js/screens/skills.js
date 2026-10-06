/* Pantalla: ÁRBOL DE HABILIDADES */
window.GC = window.GC || {};
GC.Screens = GC.Screens || {};

GC.Screens.skills = {
  hud: true,
  selected: 'jab',

  render() {
    const s = GC.Game.s;
    const S = GC.Skills;
    const sel = S.get(this.selected) || GC.DATA.skills[0];
    const STATUS = { max: 'Completa', locked: 'Bloqueada', nopoints: 'Faltan PH', available: 'Disponible' };

    const columns = GC.DATA.skillBranches.map(br => {
      const nodes = S.byBranch(br.id).map(sk => {
        const st = S.status(s, sk);
        const lvl = S.level(s, sk.id);
        return `<button class="skill-node st-${st} ${lvl ? 'learned' : ''} ${sel.id === sk.id ? 'selected' : ''}"
            data-act="select" data-arg="${sk.id}">
          <span class="sn-name">${sk.name}</span>
          <span class="sn-meta"><span class="sn-pips">${'■'.repeat(lvl)}${'□'.repeat(sk.maxLevel - lvl)}</span>
          <span class="sn-cost">${st === 'max' ? '✓' : sk.cost + ' PH'}</span></span>
          ${sk.technique ? '<span class="sn-tech">técnica</span>' : ''}
        </button>`;
      }).join('');
      return `<div class="branch branch-${br.id}"><h2>${br.icon} ${br.name}</h2>${nodes}</div>`;
    }).join('');

    const st = S.status(s, sel);
    const lvl = S.level(s, sel.id);
    const reqs = S.reqList(s, sel);
    const branch = GC.DATA.skillBranches.find(b => b.id === sel.branch);
    const tech = sel.technique ? GC.DATA.techniques[sel.technique] : null;

    const detail = `<div class="skill-detail panel">
      <p class="sd-branch">${branch.icon} ${branch.name}</p>
      <h2>${sel.name}</h2>
      <p class="sd-level">Nivel ${lvl} de ${sel.maxLevel} · ${STATUS[st]}</p>
      <p class="sd-desc">${sel.desc}</p>
      <p class="sd-effect">${sel.effectText}</p>
      ${tech ? `<p class="sd-tech">Coste en combate: ${tech.energy} de energía${tech.hits > 1 ? `, ${tech.hits} golpes` : ''}.</p>` : ''}
      <h3>Requisitos</h3>
      <ul class="req-list">${reqs.length ? reqs.map(r => `<li class="${r.ok ? 'ok' : 'no'}">${r.ok ? '✓' : '✗'} ${r.text}</li>`).join('') : '<li class="ok">Ninguno</li>'}</ul>
      <p class="sd-cost">Coste: <b>${sel.cost} PH</b> por nivel · Tienes <b>${s.skillPoints} PH</b></p>
      <button class="btn btn-big btn-primary" data-act="learn" data-arg="${sel.id}" ${st === 'available' ? '' : 'disabled'}>
        ${st === 'max' ? 'Nivel máximo' : lvl ? 'Mejorar' : 'Aprender'}
      </button>
    </div>`;

    return `<section class="list-screen skills-screen">
      <header class="screen-head">
        <h1>Habilidades</h1>
        <span class="sp-pill">${s.skillPoints} PH disponibles</span>
        <button class="btn" data-act="back">Volver a la base</button>
      </header>
      <p class="screen-note">Los puntos de habilidad (PH) se ganan al subir de nivel, al combatir y en algunos eventos.</p>
      <div class="screen-body">
        <div class="skill-tree">${columns}</div>
        ${detail}
      </div>
    </section>`;
  },

  onAction(act, arg) {
    if (act === 'select') {
      this.selected = arg;
      GC.Game.refresh();
    } else if (act === 'learn') {
      const r = GC.Skills.learn(GC.Game.s, arg);
      if (!r.ok) { GC.UI.toast(r.reason, 'bad'); GC.Audio.play('deny'); return; }
      GC.Audio.play('levelup');
      GC.UI.toast(`${r.skill.name} — nivel ${r.level}`, 'gold');
      GC.Game.afterAction();
    }
  },

  back() { GC.Game.goHub(); },
};

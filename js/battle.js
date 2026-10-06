/* =========================================================================
   BATTLE — motor de combate en tiempo real (no toca el DOM).
   La vista (battle-view.js) se suscribe a los eventos con bt.listeners.

   Acciones de Giovanni: jab, heavy, guard, dodge, tech, recover.
   El combate SOLO termina cuando Giovanni cae o tira la toalla.
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const B = () => GC.DATA.balance.combat;
  const rand = (a, b) => a + Math.random() * (b - a);

  const Battle = {
    create(s, mode = 'normal') {
      const P = GC.Player;
      const b = B();
      const maxHp = P.maxHp(s);
      const maxEnergy = P.maxEnergy(s);
      const fatiguePenalty = 1 - (s.fatigue / 100) * b.startEnergyFatiguePenalty;
      const isFinal = mode === 'final';
      const bt = {
        mode, s,
        eff: P.effStats(s),
        mods: P.mods(s),
        t: 0, over: false, reason: null, paused: false, freeze: 0, cinematic: null,
        p: {
          maxHp, hp: isFinal ? maxHp : Math.max(1, s.hp),
          maxEnergy, energy: isFinal ? maxEnergy : Math.max(0, Math.min(maxEnergy, s.energy * fatiguePenalty)),
          cd: 0, cdTotal: 1, guard: 0, guardStart: -9, dodge: 0, stun: 0, recovering: 0,
          chain: 0, lastHitAt: -9, secondWindUsed: false, queued: null,
        },
        c: GC.Chansey.create(mode),
        stats: { damage: 0, taken: 0, hits: 0, dodges: 0, blocks: 0, perfect: 0, maxHit: 0, techs: 0, regens: 0, interrupts: 0 },
        listeners: [],
      };
      bt.emit = (type, data) => bt.listeners.forEach(fn => fn(type, data || {}));
      return bt;
    },

    // ----------------------------------------------------------- helpers
    adrenaline(bt) { return !!bt.mods.adrenaline && bt.p.hp < bt.p.maxHp * B().adrenalineHpPct; },

    cdFactor(bt) {
      let f = 1 / (1 + bt.eff.spd * B().speedCdFactor);
      if (this.adrenaline(bt)) f /= 1 + B().adrenalineSpeed;
      return f;
    },

    energyCost(bt, base) { return base * (1 - Math.min(0.6, bt.mods.energyCostReduce || 0)); },

    canAct(bt) {
      const p = bt.p;
      return !bt.over && !bt.paused && bt.freeze <= 0 && !bt.cinematic && p.stun <= 0 && p.cd <= 0 && p.recovering <= 0;
    },

    /** Daño bruto (antes de las defensas de Chansey). kind: jab | heavy | tech */
    baseDamage(bt, kind) {
      const c = B(); const e = bt.eff; const m = bt.mods;
      let d;
      if (kind === 'jab') d = (c.jab.base + e.str * c.jab.strMult) * (1 + (m.jabDmg || 0));
      else if (kind === 'heavy') d = (c.heavy.base + e.str * c.heavy.strMult) * (1 + (m.heavyDmg || 0));
      else d = c.heavy.base + e.str * c.heavy.strMult;
      d *= (1 + (m.allDmg || 0));
      if (this.adrenaline(bt)) d *= 1 + c.adrenalineDmg;
      if (bt.mode === 'final') d *= c.finalDamageMult;
      return d;
    },

    techDamage(bt, id) {
      const t = GC.DATA.techniques[id];
      const lvl = Math.max(1, GC.Skills.level(bt.s, t.skill));
      return this.baseDamage(bt, 'tech') * t.mult * (1 + (lvl - 1) * t.perLevel)
        * (1 + bt.eff.tec * B().techTecBonus) * (1 + (bt.mods.techDmg || 0));
    },

    // ----------------------------------------------------------- entrada
    input(bt, action, arg) {
      if (bt.over || bt.cinematic || bt.paused) return;
      const p = bt.p;
      if (p.stun > 0) { bt.emit('deny', { text: '¡Aturdido!' }); return; }
      if (!this.canAct(bt)) {
        if (p.cd > 0 && p.cd <= B().queueWindow && p.recovering <= 0) p.queued = { action, arg };
        return;
      }
      this.doAction(bt, action, arg);
    },

    doAction(bt, action, arg) {
      const c = B(); const p = bt.p; const f = this.cdFactor(bt);
      switch (action) {
        case 'jab': {
          const cost = this.energyCost(bt, c.jab.energy);
          let mult = 1;
          if (p.energy < cost) {
            mult = 0.5;
            bt.emit('float', { target: 'giovanni', text: 'sin energía', cls: 'deny' });
          } else p.energy -= cost;
          this.strike(bt, this.baseDamage(bt, 'jab') * mult, { kind: 'jab' });
          p.cd = p.cdTotal = c.jab.cd * f;
          break;
        }
        case 'heavy': {
          const cost = this.energyCost(bt, c.heavy.energy);
          if (p.energy < cost) return bt.emit('deny', { text: 'Sin energía' });
          p.energy -= cost;
          this.strike(bt, this.baseDamage(bt, 'heavy'), { kind: 'heavy' });
          p.cd = p.cdTotal = c.heavy.cd * f;
          break;
        }
        case 'guard': {
          p.energy = Math.max(0, p.energy - this.energyCost(bt, c.guard.energy));
          p.guard = c.guard.duration + (bt.mods.guardDuration || 0);
          p.guardStart = bt.t;
          p.cd = p.cdTotal = c.guard.cd;
          bt.emit('anim', { target: 'giovanni', cls: 'guard' });
          break;
        }
        case 'dodge': {
          const cost = this.energyCost(bt, c.dodge.energy);
          if (p.energy < cost) return bt.emit('deny', { text: 'Sin energía' });
          p.energy -= cost;
          p.dodge = c.dodge.window + (bt.mods.dodgeWindow || 0);
          p.cd = p.cdTotal = c.dodge.cd * f;
          bt.emit('anim', { target: 'giovanni', cls: 'dodge' });
          break;
        }
        case 'recover': {
          p.recovering = c.recover.duration;
          p.cd = p.cdTotal = c.recover.duration;
          p.guard = 0;
          bt.emit('log', { text: 'Giovanni respira hondo y se recompone…', cls: '' });
          break;
        }
        case 'tech': {
          const id = arg || bt.s.selectedTech;
          const t = GC.DATA.techniques[id];
          if (!t || !GC.Skills.techniques(bt.s).includes(id)) return bt.emit('deny', { text: 'Sin técnicas' });
          const cost = this.energyCost(bt, t.energy);
          if (p.energy < cost) return bt.emit('deny', { text: 'Sin energía' });
          p.energy -= cost;
          bt.s.selectedTech = id;
          this.useTech(bt, id, t);
          p.cd = p.cdTotal = t.cd * f;
          break;
        }
        default: break;
      }
    },

    useTech(bt, id, t) {
      bt.stats.techs++;
      bt.emit('banner', { text: t.name.toUpperCase(), cls: 'tech' });

      // GAG: la primera vez de la historia que se usa el golpe definitivo.
      if (t.ultimate && !bt.s.flags.ultimateGag && bt.mode !== 'final') {
        bt.s.flags.ultimateGag = true;
        bt.freeze = 3.2;
        bt.stats.hits++;
        bt.emit('anim', { target: 'giovanni', cls: 'punch' });
        bt.emit('anim', { target: 'chansey', cls: 'hit' });
        bt.emit('sfx', 'heavy');
        bt.emit('float', { target: 'chansey', text: '0', cls: 'zero big' });
        bt.emit('gag', { lines: ['0 DE DAÑO', 'Giovanni: «…»', 'Chansey: «¿Chansey?»'] });
        return;
      }

      if (t.interrupt && bt.c.move) {
        if (Math.random() < t.interrupt && GC.Chansey.interrupt(bt.c, bt)) bt.stats.interrupts++;
        else if (bt.c.move) bt.emit('log', { text: 'Chansey ignora el uppercut y sigue concentrada.', cls: 'chansey' });
      }
      const dmg = this.techDamage(bt, id);
      const hits = t.hits || 1;
      for (let i = 0; i < hits; i++) {
        if (bt.over) break;
        this.strike(bt, dmg, { kind: 'tech', noCounter: i > 0, delay: i * 0.12 });
      }
    },

    /** Golpe de Giovanni a Chansey. */
    strike(bt, raw, opts = {}) {
      const c = B(); const p = bt.p; const ch = bt.c; const m = bt.mods;

      // Encadenar golpes rápidos
      if (opts.kind === 'jab' || opts.kind === 'heavy' || opts.kind === 'counter') {
        p.chain = (bt.t - p.lastHitAt <= c.chainWindow) ? Math.min(c.chainMax, p.chain + 1) : 0;
        p.lastHitAt = bt.t;
        raw *= 1 + p.chain * (m.chainBonus || 0);
      }
      const crit = Math.random() < c.critBase + bt.eff.tec * c.critPerTec + (m.critChance || 0);
      if (crit) raw *= c.critMult;
      raw *= rand(0.9, 1.1);

      // ¿Chansey estaba en postura de contraataque?
      if (ch.counter > 0 && !opts.noCounter && bt.mode !== 'final') {
        ch.counter = 0;
        bt.emit('banner', { text: '¡CONTRAATAQUE!', cls: 'bad' });
        bt.emit('anim', { target: 'chansey', cls: 'attack' });
        this.hurtPlayer(bt, { name: 'Contraataque', isCounter: true }, raw * 0.8);
        raw *= 0.3;
        if (bt.over) return 0;
      }

      const dealt = GC.Chansey.takeDamage(ch, raw, bt);
      bt.stats.hits++;
      bt.stats.damage += dealt;
      bt.stats.maxHit = Math.max(bt.stats.maxHit, dealt);
      bt.emit('float', { target: 'chansey', text: String(dealt), cls: (crit ? 'crit ' : '') + (dealt === 0 ? 'zero' : ''), delay: opts.delay || 0 });
      bt.emit('anim', { target: 'giovanni', cls: opts.kind === 'jab' ? 'jab' : 'punch' });
      bt.emit('anim', { target: 'chansey', cls: 'hit' });
      bt.emit('sfx', opts.kind === 'jab' ? 'hit' : 'heavy');
      if (crit) bt.emit('log', { text: '¡Golpe crítico!', cls: 'good' });
      return dealt;
    },

    /** Golpe de Chansey a Giovanni (con esquivas, bloqueos y defensas). */
    hurtPlayer(bt, move, raw) {
      if (bt.over) return;
      if (bt.cinematic && !move.scripted) return;
      const c = B(); const p = bt.p; const m = bt.mods;

      // Esquiva activa
      if (p.dodge > 0 && move.dodgeable !== false) {
        bt.stats.dodges++;
        bt.emit('float', { target: 'giovanni', text: '¡ESQUIVA!', cls: 'dodge' });
        bt.emit('sfx', 'dodge');
        if (m.counter && !move.isCounter) {
          this.strike(bt, this.baseDamage(bt, 'heavy') * (0.5 + 0.5 * m.counter), { kind: 'counter', noCounter: true });
          bt.emit('log', { text: '¡Contraataque de Giovanni!', cls: 'good' });
        }
        return;
      }
      // Evasión pasiva por Velocidad
      const passive = Math.min(c.passiveEvadeCap, bt.eff.spd * c.passiveEvadePerSpd);
      if (move.dodgeable !== false && p.recovering <= 0 && Math.random() < passive) {
        bt.stats.dodges++;
        bt.emit('float', { target: 'giovanni', text: 'esquivado', cls: 'dodge' });
        bt.emit('sfx', 'dodge');
        return;
      }

      let dmg = raw;
      if (p.guard > 0 && move.blockable !== false) {
        if (m.perfectGuard && bt.t - p.guardStart <= c.guard.perfectWindow) {
          bt.stats.perfect++;
          bt.stats.blocks++;
          p.energy = Math.min(p.maxEnergy, p.energy + 10);
          bt.emit('float', { target: 'giovanni', text: '¡PERFECTA!', cls: 'perfect' });
          bt.emit('sfx', 'perfect');
          return;
        }
        dmg *= 1 - Math.min(0.85, c.guard.reduction + (m.guardBonus || 0));
        bt.stats.blocks++;
        bt.emit('sfx', 'block');
        bt.emit('anim', { target: 'giovanni', cls: 'block' });
      }
      dmg *= 1 - Math.min(c.endReductionCap, bt.eff.end * c.endReductionPerPoint);
      if (p.recovering > 0) dmg *= c.recover.vulnerability;
      if (bt.mode === 'final') dmg *= c.finalTakenMult;
      dmg = Math.max(1, Math.round(dmg));

      p.hp -= dmg;
      bt.stats.taken += dmg;
      bt.emit('float', { target: 'giovanni', text: '-' + dmg, cls: 'hurt' });
      bt.emit('anim', { target: 'giovanni', cls: 'hurt' });
      bt.emit('sfx', 'hurt');
      if (dmg >= p.maxHp * 0.18) bt.emit('shake', {});

      const resist = Math.min(c.mentalResistCap, bt.eff.men * c.mentalResistPerPoint);
      if (move.stun) {
        p.stun = move.stun * (1 - resist);
        p.guard = 0; p.dodge = 0; p.queued = null;
      }
      if (move.energyDrain) p.energy = Math.max(0, p.energy - move.energyDrain * (1 - resist));

      if (p.hp <= 0) {
        if (bt.mode === 'final') { p.hp = 1; return; }
        if (m.secondWind && !p.secondWindUsed) {
          p.secondWindUsed = true;
          p.hp = Math.round(p.maxHp * 0.25);
          bt.emit('banner', { text: '¡SEGUNDO AIRE!', cls: 'good' });
          bt.emit('log', { text: 'Giovanni se niega a caer. Todavía.', cls: 'good' });
          return;
        }
        p.hp = 0;
        this.end(bt, 'ko');
      }
    },

    // ----------------------------------------------------------- bucle
    update(bt, dt) {
      if (bt.over || bt.paused) return;
      if (bt.freeze > 0) { bt.freeze -= dt; return; }
      if (bt.cinematic) { this.updateCinematic(bt, dt); return; }

      bt.t += dt;
      const c = B(); const p = bt.p;
      p.cd = Math.max(0, p.cd - dt);
      p.guard = Math.max(0, p.guard - dt);
      p.dodge = Math.max(0, p.dodge - dt);
      p.stun = Math.max(0, p.stun - dt);

      if (p.recovering > 0) {
        p.recovering -= dt;
        if (p.recovering <= 0) {
          p.recovering = 0;
          const bonus = 1 + (bt.mods.recoverBonus || 0);
          p.energy = Math.min(p.maxEnergy, p.energy + c.recover.energy * bonus);
          const hpGain = Math.round(p.maxHp * c.recover.hpPct * bonus);
          p.hp = Math.min(p.maxHp, p.hp + hpGain);
          bt.emit('float', { target: 'giovanni', text: '+' + hpGain, cls: 'heal' });
        }
      }
      p.energy = Math.min(p.maxEnergy, p.energy + (c.energyRegenPerSec + (bt.mods.energyRegen || 0)) * dt);

      if (p.queued && this.canAct(bt)) {
        const q = p.queued;
        p.queued = null;
        this.doAction(bt, q.action, q.arg);
      }

      GC.Chansey.tick(bt.c, dt, bt);

      // Revancha Definitiva: pase lo que pase, el clímax llega.
      const C = GC.DATA.balance.chansey;
      if (bt.mode === 'final' && !bt.cinematic && !bt.over) {
        if (bt.t >= C.finalDrainFrom) bt.c.hp -= bt.c.maxHp * C.finalDrainPerSec * dt;
        if (bt.t >= C.finalCinematicAt) bt.c.hp = 1;
        GC.Chansey.enforce(bt.c, bt);
      }
    },

    end(bt, reason) {
      if (bt.over) return;
      bt.over = true;
      bt.reason = reason;
      bt.emit('end', { reason });
    },

    // ----------------------------------------------------------- final guionizado
    finalStagger(bt) {
      if (bt.cinematic || bt.over) return;
      bt.cinematic = { step: -1, timer: 0 };
      bt.c.move = null;
      bt.emit('telegraphEnd', {});
      this.nextCinematicStep(bt);
    },

    CINEMATIC: [
      { d: 2.4, run(bt) {
        bt.emit('banner', { text: '¡CHANSEY SE TAMBALEA!', cls: 'good' });
        bt.emit('anim', { target: 'chansey', cls: 'wobble' });
        bt.emit('log', { text: 'Chansey se tambalea. El pabellón entero contiene la respiración.', cls: 'good' });
      } },
      { d: 2.6, run(bt) { bt.emit('speech', { who: 'giovanni', text: 'Esta vez… ¡ESTA VEZ SÍ!' }); } },
      { d: 2.0, run(bt) { bt.emit('banner', { text: 'Silencio.', cls: 'quiet' }); } },
      { d: 1.8, run(bt) { bt.emit('speech', { who: 'chansey', text: 'Chansey.' }); } },
      { d: 2.6, run(bt) { GC.Chansey.absurdRegen(bt.c, bt, 'final'); } },
      { d: 2.0, run(bt) {
        bt.emit('banner', { text: 'NO PUEDES GANAR', cls: 'bad' });
        bt.emit('anim', { target: 'chansey', cls: 'attack' });
        bt.emit('sfx', 'heavy');
      } },
      { d: 1.2, run(bt) {
        const dmg = bt.p.hp;
        bt.p.hp = 0;
        bt.stats.taken += dmg;
        bt.emit('float', { target: 'giovanni', text: '-' + dmg, cls: 'hurt big' });
        bt.emit('anim', { target: 'giovanni', cls: 'hurt' });
        bt.emit('shake', {});
      } },
      { d: 0, run(bt) { Battle.end(bt, 'final'); } },
    ],

    updateCinematic(bt, dt) {
      const cm = bt.cinematic;
      cm.timer -= dt;
      if (cm.timer <= 0) this.nextCinematicStep(bt);
    },
    nextCinematicStep(bt) {
      const cm = bt.cinematic;
      cm.step++;
      const st = this.CINEMATIC[cm.step];
      if (!st) return;
      cm.timer = st.d;
      st.run(bt);
    },
  };

  GC.Battle = Battle;
})();

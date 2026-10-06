/* =========================================================================
   CHANSEY
   ---------------------------------------------------------------------------
   Chansey NO PUEDE PERDER. No es un número de vida absurdo: son capas.

     Capa 1  Mucha vida (4000 PV).
     Capa 2  Regeneración constante, que crece con cada fase.
     Capa 3  «El colchón»: reducción de daño porcentual + armadura plana.
     Capa 4  Huevo Reparador: la IA lo prioriza cuando va baja de vida.
     Capa 5  Instinto de Enfermera: una vez por combate, al bajar del 10%,
             vuelve al 60% sin gastar turno.
     Capa 6  Golpe absurdo: si un solo golpe quita más del 60% de su vida,
             «no cuenta» y se regenera entera.
     Capa 7  NÚCLEO — enforce(): se llama tras CADA daño y CADA tick.
             Si la vida llega a 1 o menos, o deja de ser un número válido
             (NaN, Infinity…), se restaura al máximo. No hay otra salida.

   Además, el combate solo termina por K.O. de Giovanni (ver battle.js):
   Chansey no tiene estado de «derrotada» en ninguna parte del código.

   La única excepción controlada es la Revancha Definitiva (mode 'final'):
   Chansey se queda en 1 PV, se dispara una escena guionizada y,
   al final de la escena, se regenera igualmente.
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  const cfg = () => GC.DATA.balance.chansey;

  const Chansey = {
    create(mode) {
      const C = cfg();
      const hp = mode === 'final' ? C.maxHp * C.finalHpMult : C.maxHp;
      return {
        mode,
        maxHp: hp,
        hp,
        phase: mode === 'final' ? 5 : 1,
        buffs: [],
        move: null,
        windup: 0,
        windupTotal: 0,
        nextIn: C.firstAction,
        counter: 0,
        stunned: 0,
        nurseUsed: false,
        regens: 0,
        regenFlash: 0,
        lastMoveId: null,
      };
    },

    phaseAt(t) {
      const ps = cfg().phaseStarts;
      let p = 1;
      for (let i = 0; i < ps.length; i++) if (t >= ps[i]) p = i + 1;
      return p;
    },

    /** Multiplicador de daño: crece con el tiempo. Así todo combate termina. */
    power(c, t) {
      if (c.mode === 'final') return cfg().finalPower;
      return 1 + Math.pow(t / cfg().powerGrowth, 2);
    },

    buffValue(c, type) {
      return c.buffs.filter(b => b.type === type).reduce((a, b) => a + b.value, 0);
    },

    reduction(c) {
      const C = cfg();
      return Math.min(0.85, C.baseReduction + C.reductionPerPhase * (c.phase - 1) + this.buffValue(c, 'def'));
    },

    statusText(c) {
      if (c.regenFlash > 0) return 'INMORTAL';
      if (c.stunned > 0) return 'DESCOLOCADA';
      if (c.counter > 0) return 'SOSPECHOSA';
      return cfg().phaseNames[c.phase - 1];
    },

    /** Recibe daño bruto. Devuelve el daño aplicado (antes de regenerarse). */
    takeDamage(c, raw, bt) {
      const C = cfg();
      if (!(raw > 0) || !Number.isFinite(raw)) return 0;
      const final = c.mode === 'final';

      // Capa 3: el colchón
      let dmg = raw * (1 - this.reduction(c)) - (final ? 0 : C.armorFlat);
      dmg = Math.max(0, Math.round(dmg));

      // Capa 6: un golpe demasiado bueno para ser verdad
      if (!final && dmg >= c.maxHp * C.absurdHitPct) {
        this.absurdRegen(c, bt, 'absurd');
        return dmg;
      }

      c.hp -= dmg;

      // Capa 5: instinto de enfermera
      if (!final && !c.nurseUsed && c.hp > 1 && c.hp <= c.maxHp * C.nurseThreshold) {
        c.nurseUsed = true;
        c.hp = Math.round(c.maxHp * C.nurseHealTo);
        bt.emit('nurse', {});
      }

      this.enforce(c, bt);
      return dmg;
    },

    /** Capa 7: el núcleo. Nada por debajo de 1 PV sobrevive a esta función. */
    enforce(c, bt) {
      if (!Number.isFinite(c.hp)) c.hp = c.maxHp;
      if (c.hp > c.maxHp) c.hp = c.maxHp;
      if (c.hp <= 1) {
        if (c.mode === 'final') {
          c.hp = 1;
          GC.Battle.finalStagger(bt);
        } else {
          this.absurdRegen(c, bt, 'floor');
        }
      }
    },

    absurdRegen(c, bt, reason) {
      c.hp = c.maxHp;
      c.regens++;
      c.regenFlash = 2.2;
      c.move = null;
      c.nextIn = 1.0;
      bt.stats.regens++;
      bt.emit('regen', { reason });
    },

    tick(c, dt, bt) {
      const C = cfg();
      if (c.mode !== 'final') {
        const p = this.phaseAt(bt.t);
        if (p > c.phase) { c.phase = p; bt.emit('phase', { phase: p }); }
        // Capa 2: regeneración constante
        c.hp += C.regenPerSec * (1 + C.regenPerPhase * (c.phase - 1)) * dt;
      }
      c.regenFlash = Math.max(0, c.regenFlash - dt);
      c.counter = Math.max(0, c.counter - dt);
      c.buffs.forEach(b => { b.time -= dt; });
      c.buffs = c.buffs.filter(b => b.time > 0);

      if (c.stunned > 0) {
        c.stunned -= dt;
      } else if (c.move) {
        c.windup -= dt;
        if (c.windup <= 0) this.resolveMove(c, bt);
      } else {
        c.nextIn -= dt;
        if (c.nextIn <= 0) this.startMove(c, this.chooseMove(c), bt);
      }
      this.enforce(c, bt);
    },

    chooseMove(c) {
      const C = cfg();
      const ratio = c.hp / c.maxHp;
      const pool = GC.DATA.chanseyMoves.filter(m =>
        m.phases.includes(c.phase) && !(m.kind === 'flavor' && m.id === c.lastMoveId));
      let total = 0;
      const weights = pool.map(m => {
        let w = m.weight;
        if (m.kind === 'heal') {
          // Capa 4: cuanto peor va, más huevos se come
          if (c.mode === 'final' || ratio > 0.9) w = 0;
          else if (ratio < 0.3) w *= C.lowHpHealBoost;
        }
        total += w;
        return w;
      });
      let r = Math.random() * total;
      for (let i = 0; i < pool.length; i++) {
        r -= weights[i];
        if (r <= 0 && weights[i] > 0) return pool[i];
      }
      return pool.find((m, i) => weights[i] > 0) || pool[0];
    },

    startMove(c, m, bt) {
      c.move = m;
      c.lastMoveId = m.id;
      let w = m.windup * (1 + (bt.mods.telegraphSlow || 0));
      if (c.phase >= 5 && c.mode !== 'final') w *= 0.85;
      c.windup = c.windupTotal = w;
      bt.emit('telegraph', { move: m, time: w });
    },

    resolveMove(c, bt) {
      const m = c.move;
      c.move = null;
      const C = cfg();
      c.nextIn = C.actionInterval[c.phase - 1] * (0.75 + Math.random() * 0.5);
      bt.emit('telegraphEnd', { move: m });

      switch (m.kind) {
        case 'flavor':
          bt.emit('log', { text: m.text, cls: 'chansey' });
          break;
        case 'buff':
          c.buffs.push({ type: m.buff.type, value: m.buff.value, time: m.buff.time });
          bt.emit('log', { text: m.text, cls: 'chansey' });
          bt.emit('anim', { target: 'chansey', cls: 'buff' });
          break;
        case 'heal': {
          if (c.mode === 'final') break;
          const h = Math.round(c.maxHp * m.heal);
          c.hp += h;
          bt.emit('float', { target: 'chansey', text: '+' + h, cls: 'heal' });
          bt.emit('log', { text: m.text, cls: 'chansey' });
          bt.emit('anim', { target: 'chansey', cls: 'buff' });
          break;
        }
        case 'counter':
          c.counter = m.duration;
          bt.emit('log', { text: m.text, cls: 'chansey' });
          break;
        case 'attack': {
          const pow = this.power(c, bt.t) * (1 + this.buffValue(c, 'dmg'));
          bt.emit('anim', { target: 'chansey', cls: 'attack' });
          bt.emit('log', { text: `Chansey usa ${m.name}.` + (m.text ? ' ' + m.text : ''), cls: 'chansey' });
          const hits = m.hits || 1;
          for (let i = 0; i < hits; i++) GC.Battle.hurtPlayer(bt, m, m.dmg * pow);
          break;
        }
        default: break;
      }
    },

    /** El Uppercut puede cancelar la preparación de un ataque. */
    interrupt(c, bt) {
      if (!c.move || c.move.interruptible === false) return false;
      bt.emit('log', { text: `¡Giovanni interrumpe ${c.move.name}!`, cls: 'good' });
      bt.emit('telegraphEnd', { move: c.move });
      c.move = null;
      c.stunned = 0.8;
      c.nextIn = 1.2;
      return true;
    },
  };

  GC.Chansey = Chansey;
})();

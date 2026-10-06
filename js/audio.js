/* =========================================================================
   AUDIO — efectos sintetizados con WebAudio (sin archivos externos).
   Para usar sonidos reales: coloca archivos en /assets/audio y amplía
   GC.Audio.files = { hit: 'assets/audio/hit.wav', ... }.
   ========================================================================= */
window.GC = window.GC || {};

(function () {
  let ctx = null;
  const KEY = 'gvc_muted';

  const Audio = {
    muted: false,
    files: {},          // nombre -> ruta de archivo (opcional, sustituye al sintetizado)
    _cache: {},

    init() {
      try { this.muted = localStorage.getItem(KEY) === '1'; } catch (e) { /* sin localStorage */ }
    },
    ensure() {
      if (!ctx) {
        try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
      }
      if (ctx && ctx.state === 'suspended') ctx.resume();
      return ctx;
    },
    toggle() {
      this.muted = !this.muted;
      try { localStorage.setItem(KEY, this.muted ? '1' : '0'); } catch (e) { /* nada */ }
      return this.muted;
    },

    tone(freq, dur, type = 'square', vol = 0.05, slideTo = null, delay = 0) {
      const c = ctx;
      const t0 = c.currentTime + delay;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(c.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    },

    play(name) {
      if (this.muted) return;
      if (this.files[name]) {
        try {
          const a = this._cache[name] || (this._cache[name] = new window.Audio(this.files[name]));
          a.currentTime = 0; a.play();
        } catch (e) { /* nada */ }
        return;
      }
      const c = this.ensure();
      if (!c) return;
      switch (name) {
        case 'click':   this.tone(660, 0.05, 'square', 0.03); break;
        case 'move':    this.tone(440, 0.03, 'square', 0.02); break;
        case 'deny':    this.tone(160, 0.12, 'square', 0.04); break;
        case 'hit':     this.tone(260, 0.08, 'square', 0.05, 120); break;
        case 'heavy':   this.tone(140, 0.16, 'sawtooth', 0.06, 50); break;
        case 'block':   this.tone(520, 0.07, 'triangle', 0.06); break;
        case 'dodge':   this.tone(900, 0.12, 'sine', 0.04, 300); break;
        case 'perfect': this.tone(1200, 0.08, 'square', 0.04); this.tone(1600, 0.1, 'square', 0.04, null, 0.07); break;
        case 'hurt':    this.tone(110, 0.18, 'sawtooth', 0.06, 60); break;
        case 'warn':    this.tone(700, 0.06, 'square', 0.03); this.tone(700, 0.06, 'square', 0.03, null, 0.1); break;
        case 'phase':   [330, 262, 196].forEach((f, i) => this.tone(f, 0.18, 'square', 0.05, null, i * 0.14)); break;
        case 'regen':   [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.06, null, i * 0.07)); break;
        case 'levelup': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.1, 'square', 0.04, null, i * 0.08)); break;
        case 'train':   this.tone(330, 0.06, 'square', 0.03); this.tone(495, 0.08, 'square', 0.03, null, 0.06); break;
        case 'buy':     this.tone(988, 0.06, 'square', 0.03); this.tone(1319, 0.12, 'square', 0.03, null, 0.06); break;
        case 'bell':    this.tone(1400, 0.6, 'triangle', 0.06, 1350); this.tone(1400, 0.6, 'triangle', 0.05, 1350, 0.25); break;
        case 'ko':      [392, 330, 262, 196, 131].forEach((f, i) => this.tone(f, 0.22, 'sawtooth', 0.05, null, i * 0.16)); break;
        default: break;
      }
    },
  };

  GC.Audio = Audio;
})();

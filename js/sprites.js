/* =========================================================================
   SPRITES — registro central de gráficos.
   Ahora mismo todo son PLACEHOLDERS (cajas etiquetadas).
   Para usar sprites reales:
     1. Copia la imagen en /assets/characters/ (p. ej. giovanni.png)
     2. Pon la ruta en src:  giovanni: { ..., src: 'assets/characters/giovanni.png' }
     3. (Opcional) poses: { idle: '...', punch: '...', hurt: '...', ko: '...' }
   Las animaciones del combate se aplican al contenedor, así que funcionan
   igual con <img> que con placeholders.
   ========================================================================= */
window.GC = window.GC || {};

GC.SPRITES = {
giovanni:    { label: 'GIOVANNI',       tone: 'gio',     src: 'assets/characters/giovanni.png',    poses: {} },
chansey:     { label: 'CHANSEY',        tone: 'chan',    src: 'assets/characters/chansey.png',     poses: {} },
arbitro:     { label: 'ÁRBITRO',        tone: 'neutral', src: 'assets/characters/arbitro.png',     poses: {} },
agente:      { label: 'AGENTE ROCKET',  tone: 'rocket',  src: 'assets/characters/agente.png',      poses: {} },
coach:       { label: 'MAESTRO DOBLÓN', tone: 'neutral', src: 'assets/characters/coach.png',       poses: {} },
cientifico:  { label: 'DR. PROBETA',    tone: 'neutral', src: 'assets/characters/cientifico.png',  poses: {} },
dependiente: { label: 'DEPENDIENTE',    tone: 'neutral', src: 'assets/characters/dependiente.png', poses: {} },
persian:     { label: 'PERSIAN',        tone: 'neutral', src: 'assets/characters/persian.png',     poses: {} },
};

GC.Sprites = {
  /** Devuelve el HTML del sprite (imagen real o placeholder). */
  html(id, opts = {}) {
    const def = GC.SPRITES[id];
    if (!def) return '';
    const pose = opts.pose || 'idle';
    const src = (def.poses && def.poses[pose]) || def.src;
    const cls = `sprite sprite-${id} ${opts.cls || ''}`;
    if (src) return `<img class="${cls}" src="${src}" alt="${def.label}" draggable="false">`;
    return `<div class="${cls} placeholder ph-${def.tone || 'neutral'}" title="Placeholder: sustituir por sprite real">
      <span class="ph-tag">placeholder</span><span class="ph-name">${def.label}</span></div>`;
  },
};

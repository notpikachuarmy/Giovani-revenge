/* =========================================================================
   HABILIDADES
   Cada habilidad:
     id, branch, name, desc, effectText, maxLevel, cost (PH por nivel)
     req: { skills: {id: nivel}, level: n, stats: {str: n} }
     effects: { clave: valor por nivel }   -> se suman en GC.Player.mods()
     technique: id de técnica que desbloquea (opcional)

   Claves de efecto disponibles:
     jabDmg, heavyDmg, techDmg, allDmg, guardBonus, guardDuration,
     dodgeWindow, counter, perfectGuard, telegraphSlow, maxHpPct,
     adrenaline, secondWind, trainGain, energyCostReduce, recoverBonus,
     energyRegen, chainBonus, critChance, maxHp, maxEnergy
   ========================================================================= */
window.GC = window.GC || {};
GC.DATA = GC.DATA || {};

GC.DATA.skillBranches = [
  { id: 'boxeo',   name: 'Boxeo',   icon: '🥊' },
  { id: 'defensa', name: 'Defensa', icon: '🛡️' },
  { id: 'fisica',  name: 'Física',  icon: '💪' },
  { id: 'tecnica', name: 'Técnica', icon: '🧠' },
];

GC.DATA.skills = [
  // ------------------------------------------------------------- BOXEO
  { id: 'jab', branch: 'boxeo', name: 'Jab Imperial', maxLevel: 3, cost: 1, req: {},
    desc: 'Un jab rápido, preciso y con sello corporativo.',
    effectText: '+15% de daño de Golpear por nivel.', effects: { jabDmg: 0.15 } },
  { id: 'cross', branch: 'boxeo', name: 'Directo de Ciudad Verde', maxLevel: 3, cost: 1, req: { skills: { jab: 1 } },
    desc: 'El directo que Giovanni practicaba frente al espejo de su despacho.',
    effectText: '+15% de daño de Golpe fuerte por nivel.', effects: { heavyDmg: 0.15 } },
  { id: 'gancho', branch: 'boxeo', name: 'Gancho del Jefe', maxLevel: 3, cost: 2, req: { skills: { cross: 1 } },
    technique: 'gancho',
    desc: 'Un gancho lateral pensado para derribar competidores. Y mercados.',
    effectText: 'Desbloquea la técnica GANCHO. +20% de daño de la técnica por nivel extra.' },
  { id: 'uppercut', branch: 'boxeo', name: 'Uppercut Ejecutivo', maxLevel: 3, cost: 2, req: { skills: { gancho: 1 }, stats: { str: 20 } },
    technique: 'uppercut',
    desc: 'Golpe ascendente. Como su carrera. Como sus beneficios.',
    effectText: 'Técnica UPPERCUT: puede interrumpir el ataque que Chansey está preparando.' },
  { id: 'combo', branch: 'boxeo', name: 'Combo Fiscal', maxLevel: 3, cost: 3, req: { skills: { uppercut: 1 }, stats: { tec: 25 } },
    technique: 'combo',
    desc: 'Cuatro golpes seguidos, cada uno desgravable.',
    effectText: 'Técnica COMBO: 4 golpes en ráfaga. +12% de daño por nivel extra.' },
  { id: 'puno', branch: 'boxeo', name: 'Puño de la Organización', maxLevel: 1, cost: 4, req: { skills: { combo: 1 }, level: 8 },
    technique: 'puno',
    desc: 'Años de crimen organizado condensados en un único puñetazo.',
    effectText: 'Técnica definitiva. El golpe más fuerte jamás lanzado por un magnate.' },

  // ------------------------------------------------------------- DEFENSA
  { id: 'bloqueo', branch: 'defensa', name: 'Guardia Alta', maxLevel: 3, cost: 1, req: {},
    desc: 'Codos dentro, barbilla abajo, dignidad arriba.',
    effectText: 'Defender bloquea +10% más de daño y dura +0,15 s por nivel.', effects: { guardBonus: 0.1, guardDuration: 0.15 } },
  { id: 'esquiva', branch: 'defensa', name: 'Paso Lateral', maxLevel: 3, cost: 1, req: {},
    desc: 'Lo mejor contra un abrazo es no estar ahí.',
    effectText: '+0,1 s de ventana de esquiva por nivel.', effects: { dodgeWindow: 0.1 } },
  { id: 'contra', branch: 'defensa', name: 'Contraataque', maxLevel: 2, cost: 2, req: { skills: { esquiva: 1 } },
    desc: 'Esquivar y responder. Como en las reuniones del consejo.',
    effectText: 'Tras esquivar con éxito, contraatacas solo (+50% de daño por nivel).', effects: { counter: 1 } },
  { id: 'perfecta', branch: 'defensa', name: 'Guardia Perfecta', maxLevel: 1, cost: 3, req: { skills: { bloqueo: 2 } },
    desc: 'Leer el golpe en el último instante.',
    effectText: 'Si el golpe llega justo al levantar la guardia (0,25 s), no recibes daño y recuperas 10 de energía.', effects: { perfectGuard: 1 } },
  { id: 'lectura', branch: 'defensa', name: 'Lectura de Chansey', maxLevel: 2, cost: 2, req: { skills: { bloqueo: 1, esquiva: 1 }, stats: { men: 20 } },
    desc: 'Tras horas de vídeo, Giovanni intuye sus intenciones. A veces.',
    effectText: 'Los ataques de Chansey tardan un 15% más en llegar por nivel.', effects: { telegraphSlow: 0.15 } },

  // ------------------------------------------------------------- FÍSICA
  { id: 'bruta', branch: 'fisica', name: 'Fuerza Bruta', maxLevel: 3, cost: 1, req: {},
    desc: 'No hay técnica que sustituya a pegar muy fuerte.',
    effectText: '+8% de todo el daño por nivel.', effects: { allDmg: 0.08 } },
  { id: 'aguante', branch: 'fisica', name: 'Aguante de Acero', maxLevel: 3, cost: 1, req: {},
    desc: 'Un cuerpo forjado a base de sentadillas y rencor.',
    effectText: '+10% de vida máxima por nivel.', effects: { maxHpPct: 0.1 } },
  { id: 'disciplina', branch: 'fisica', name: 'Disciplina Rocket', maxLevel: 3, cost: 2, req: {},
    desc: 'Entrenar como se dirige una organización: sin descanso y sin quejas.',
    effectText: '+10% de ganancias de entrenamiento por nivel.', effects: { trainGain: 0.1 } },
  { id: 'adrenalina', branch: 'fisica', name: 'Adrenalina', maxLevel: 1, cost: 2, req: { skills: { bruta: 1 } },
    desc: 'Cuanto peor va, mejor pega.',
    effectText: 'Con menos del 30% de vida: +25% de daño y +20% de velocidad de acción.', effects: { adrenaline: 1 } },
  { id: 'segundo', branch: 'fisica', name: 'Segundo Aire', maxLevel: 1, cost: 3, req: { skills: { aguante: 2 } },
    desc: 'Giovanni se ha caído muchas veces. Se ha levantado casi todas.',
    effectText: 'Una vez por combate, al caer a 0 PV te levantas con un 25% de vida.', effects: { secondWind: 1 } },

  // ------------------------------------------------------------- TÉCNICA
  { id: 'eficiencia', branch: 'tecnica', name: 'Golpes Eficientes', maxLevel: 3, cost: 1, req: {},
    desc: 'Optimizar recursos. Lo hace con empresas; puede hacerlo con puñetazos.',
    effectText: '-10% de coste de energía por nivel.', effects: { energyCostReduce: 0.1 } },
  { id: 'respiracion', branch: 'tecnica', name: 'Respiración Táctica', maxLevel: 2, cost: 1, req: {},
    desc: 'Inspirar ambición. Espirar fracaso.',
    effectText: 'Recuperarse rinde +30% y regeneras +0,5 de energía/s por nivel.', effects: { recoverBonus: 0.3, energyRegen: 0.5 } },
  { id: 'cadena', branch: 'tecnica', name: 'Combos Avanzados', maxLevel: 3, cost: 2, req: { skills: { eficiencia: 1 } },
    desc: 'Un golpe lleva a otro. Y a otro. Y a otro.',
    effectText: 'Golpes encadenados en menos de 1,2 s suman +6% de daño acumulable por nivel.', effects: { chainBonus: 0.06 } },
  { id: 'ojo', branch: 'tecnica', name: 'Ojo del Jefe', maxLevel: 3, cost: 2, req: { skills: { eficiencia: 1 } },
    desc: 'Ver el punto débil. Aunque no exista.',
    effectText: '+5% de probabilidad de golpe crítico por nivel.', effects: { critChance: 0.05 } },
  { id: 'maestro', branch: 'tecnica', name: 'Estilo del Gimnasio Verde', maxLevel: 1, cost: 3, req: { skills: { eficiencia: 2, ojo: 1 }, stats: { tec: 40 } },
    desc: 'La técnica secreta del líder de gimnasio. Muy secreta. Se la acaba de inventar.',
    effectText: '+25% de daño de todas las técnicas.', effects: { techDmg: 0.25 } },
];

/* -------------------------------------------------------------------------
   TÉCNICAS (se usan en combate con el botón «Técnica»)
   mult: multiplicador sobre el daño base de golpe fuerte
   perLevel: bonus por cada nivel extra de la habilidad que la desbloquea
   ------------------------------------------------------------------------- */
GC.DATA.techniques = {
  gancho:   { name: 'Gancho',   skill: 'gancho',   energy: 14, cd: 1.3, hits: 1, mult: 1.8,  perLevel: 0.2 },
  uppercut: { name: 'Uppercut', skill: 'uppercut', energy: 20, cd: 1.7, hits: 1, mult: 2.2,  perLevel: 0.2, interrupt: 0.75 },
  combo:    { name: 'Combo',    skill: 'combo',    energy: 26, cd: 2.0, hits: 4, mult: 0.75, perLevel: 0.12 },
  puno:     { name: 'Puño de la Organización', skill: 'puno', energy: 50, cd: 3.0, hits: 1, mult: 5, perLevel: 0, ultimate: true },
};

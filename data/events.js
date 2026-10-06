/* =========================================================================
   EVENTOS
   Cada evento:
     id, title, context ('hub' | 'shop' | 'sleep')
     when: { minDay, minFights, minLevel, flag, notFlag, skill: {id: nv}, final: true, chance }
     lines: [{ who, text }]   (who = clave de GC.DATA.speakers)
     choices (opcional): [{ text, lines, rewards }]
     rewards: { sp, money, xp, stats: {men: 2}, item, flag, intel, unlockText }
     hours: horas que consume (opcional)
   En los textos puedes usar: {day} {tons} {km} {punches} {losses} {fights} {best}
   ========================================================================= */
window.GC = window.GC || {};
GC.DATA = GC.DATA || {};

GC.DATA.speakers = {
  narr:        { name: '',                sprite: null },
  giovanni:    { name: 'Giovanni',        sprite: 'giovanni' },
  chansey:     { name: 'Chansey',         sprite: 'chansey' },
  agente:      { name: 'Agente Rocket',   sprite: 'agente' },
  coach:       { name: 'Maestro Doblón',  sprite: 'coach' },
  cientifico:  { name: 'Dr. Probeta',     sprite: 'cientifico' },
  dependiente: { name: 'Dependiente',     sprite: 'dependiente' },
  persian:     { name: 'Persian',         sprite: 'persian' },
  arbitro:     { name: 'Árbitro',         sprite: 'arbitro' },
};

GC.DATA.events = [
  { id: 'tienda', scene: 'shop', context: 'shop', title: 'La tienda de material',
    lines: [
      { who: 'narr', text: 'Una tienda de material deportivo de lujo. Giovanni la compró ayer para no tener que hacer cola.' },
      { who: 'giovanni', text: '¿Cuánto cuesta todo esto?' },
      { who: 'dependiente', text: 'Lo que sea, señor.' },
      { who: 'giovanni', text: '¿Y la comida del gimnasio? ¿Y la cama?' },
      { who: 'dependiente', text: 'Señor… usted es Giovanni.' },
      { who: 'giovanni', text: 'Ah. Cierto.' },
      { who: 'narr', text: 'Comer y dormir no cuestan nada. El dinero es para equipo, entrenamientos especiales y caprichos absurdos.' },
    ] },

  { id: 'primer_video', scene: 'office', context: 'hub', title: 'Análisis de vídeo', when: { minFights: 1 },
    lines: [
      { who: 'narr', text: 'Giovanni revisa la grabación de su combate. En bucle. A cámara lenta.' },
      { who: 'giovanni', text: 'Ahí. ¿Lo ves? En el segundo tres bajé la guardia.' },
      { who: 'agente', text: 'Señor, en el segundo tres ya estaba usted en el suelo.' },
      { who: 'giovanni', text: 'Exacto. Un error táctico. No volverá a pasar.' },
      { who: 'narr', text: 'Volvió a pasar en el segundo cuatro. Giovanni detiene el vídeo y toma notas.' },
    ],
    rewards: { sp: 1, intel: true } },

  { id: 'maestro', scene: 'gym', context: 'hub', title: 'Un viejo maestro', when: { minDay: 3 },
    lines: [
      { who: 'narr', text: 'Un anciano con una toalla al cuello aparece en la puerta del gimnasio.' },
      { who: 'coach', text: 'Me han dicho que buscas entrenador. Cobro mucho.' },
      { who: 'giovanni', text: 'No le he preguntado el precio.' },
      { who: 'coach', text: 'Lección uno: el que golpea primero no siempre gana. Lección dos: no le pegues a una Chansey.' },
      { who: 'giovanni', text: 'La lección dos no la necesito.' },
      { who: 'coach', text: 'Eso decían todos. ¿Qué quieres aprender?' },
    ],
    choices: [
      { text: '«Enséñame a pegar.»',
        lines: [{ who: 'coach', text: 'Hombros sueltos. Cadera. Y rabia, que de eso vas sobrado.' }],
        rewards: { stats: { str: 2, tec: 1 }, sp: 1 } },
      { text: '«Enséñame a no caer.»',
        lines: [{ who: 'coach', text: 'Pies firmes. Respira. Y cuando veas venir el abrazo… muévete.' }],
        rewards: { stats: { end: 2, spd: 1 }, sp: 1 } },
    ] },

  { id: 'rocket_guantes', scene: 'office', context: 'hub', title: 'Entrega especial', when: { minFights: 2 },
    lines: [
      { who: 'agente', text: '¡Señor! El departamento de I+D le envía esto.' },
      { who: 'narr', text: 'Una caja negra. Dentro, unos guantes con una enorme R bordada.' },
      { who: 'giovanni', text: 'Por fin, un equipo a la altura de mi apellido.' },
      { who: 'agente', text: 'Señor, «Rocket» no es su apellido.' },
      { who: 'giovanni', text: 'Hoy sí.' },
    ],
    rewards: { item: 'guantes_rocket' } },

  { id: 'intimidar', scene: 'office', cast: ['giovanni'], context: 'hub', title: 'Guerra psicológica', when: { minFights: 3 }, hours: 3,
    lines: [
      { who: 'narr', text: 'Giovanni coloca una foto de Chansey frente a su escritorio. Planea intimidarla con la mirada.' },
      { who: 'giovanni', text: 'Mírame bien. Soy tu peor pesadilla.' },
      { who: 'narr', text: 'Han pasado tres horas.' },
      { who: 'narr', text: 'La Chansey de la foto sigue sonriendo.' },
      { who: 'giovanni', text: '…Has ganado este asalto.' },
    ],
    rewards: { stats: { men: 3 }, sp: 1 } },

  { id: 'cientifico', scene: 'lab', context: 'hub', title: 'El Proyecto Huevo', when: { minFights: 4 },
    lines: [
      { who: 'giovanni', text: 'Quiero saberlo todo sobre ella. Su biología. Sus debilidades. Su horario.' },
      { who: 'cientifico', text: 'Hemos realizado cuatrocientas doce pruebas, señor.' },
      { who: 'giovanni', text: '¿Y?' },
      { who: 'cientifico', text: 'Es una Chansey.' },
      { who: 'giovanni', text: '¿Eso es todo?' },
      { who: 'cientifico', text: 'Es MUY Chansey, señor. Como compensación hemos construido una cámara de gravedad. Y un globo hinchable para practicar.' },
    ],
    rewards: { flag: ['gravityRoom', 'chanseyBalloon'], intel: true, unlockText: 'Nuevos entrenamientos: Cámara de gravedad y Simulador de Chansey' } },

  { id: 'persian', scene: 'gym', context: 'hub', title: 'Un espectador exigente', when: { minDay: 6 },
    lines: [
      { who: 'narr', text: 'Persian observa a Giovanni hacer flexiones. Bosteza.' },
      { who: 'giovanni', text: '¿Tú también dudas de mí?' },
      { who: 'persian', text: 'Miau.' },
      { who: 'giovanni', text: 'Lo tomaré como un sí. Entonces entrenaré el doble.' },
    ],
    rewards: { stats: { men: 2, end: 1 } } },

  { id: 'chandal', scene: 'office', context: 'hub', title: 'Votación interna', when: { minFights: 5 },
    lines: [
      { who: 'agente', text: 'Señor, la organización ha votado por unanimidad regalarle esto.' },
      { who: 'narr', text: 'Un chándal negro con una R dorada. Talla «Jefe».' },
      { who: 'giovanni', text: '¿Unanimidad? ¿Nadie votó en contra?' },
      { who: 'agente', text: 'Los que iban a votar en contra están entrenando con usted, señor. En la camilla.' },
    ],
    rewards: { item: 'chandal_rocket' } },

  { id: 'periodico', scene: 'office', context: 'hub', title: 'Prensa', when: { minFights: 6 },
    lines: [
      { who: 'narr', text: 'Titular del día: «MAGNATE MISTERIOSO PIERDE OTRA VEZ CONTRA POKÉMON ENFERMERA».' },
      { who: 'giovanni', text: '¿Quién ha filtrado esto?' },
      { who: 'agente', text: 'Nadie, señor. El periódico es suyo. Lo escribió usted para motivarse.' },
      { who: 'giovanni', text: '…Y funciona. A entrenar.' },
    ],
    rewards: { sp: 1, xp: 40 } },

  { id: 'sigue_chansey', scene: 'gym', cast: ['giovanni'], context: 'hub', title: 'Una revelación', when: { minDay: 10 },
    lines: [
      { who: 'narr', text: 'Han pasado {day} días.' },
      { who: 'narr', text: 'Giovanni ha levantado {tons} toneladas, recorrido {km} km y lanzado {punches} puñetazos.' },
      { who: 'narr', text: 'Mientras tanto, en el pabellón…', scene: 'ring', cast: ['chansey'] },
      { who: 'narr', text: 'Chansey sigue siendo Chansey.' },
      { who: 'giovanni', text: 'Lo noto. Desde aquí. Noto que sigue siendo Chansey.', scene: 'gym', cast: ['giovanni'] },
    ],
    rewards: { stats: { men: 2 } } },

  { id: 'pesadilla', scene: 'night', cast: ['giovanni', 'chansey'], context: 'sleep', title: 'Pesadilla', when: { minFights: 2, chance: 0.35 },
    lines: [
      { who: 'narr', text: 'Giovanni sueña que es un huevo. Un huevo en el bolsillo de una Chansey gigante.' },
      { who: 'giovanni', text: '¡NO!' },
      { who: 'narr', text: 'Se despierta empapado en sudor. Y extrañamente motivado.', scene: 'gym', cast: ['giovanni'] },
    ],
    rewards: { stats: { men: 1 }, sp: 1 } },

  { id: 'puno_aprendido', scene: 'gym', context: 'hub', title: 'El golpe definitivo', when: { skill: { puno: 1 } },
    lines: [
      { who: 'giovanni', text: '¡Finalmente!' },
      { who: 'giovanni', text: '¡El golpe definitivo! ¡El Puño de la Organización!' },
      { who: 'giovanni', text: 'Ningún ser vivo puede resistir esto. Ni siquiera… ella.' },
      { who: 'narr', text: 'Giovanni está listo. Esta vez sí.' },
    ] },

  { id: 'final_unlock', scene: 'office', context: 'hub', title: 'Ha llegado la hora', when: { final: true },
    lines: [
      { who: 'narr', text: 'Han pasado {day} días.' },
      { who: 'narr', text: 'Giovanni ha lanzado {punches} puñetazos y levantado {tons} toneladas.' },
      { who: 'narr', text: 'Ha perdido {losses} veces.' },
      { who: 'giovanni', text: 'Basta de medir tiempos.' },
      { who: 'giovanni', text: 'Esta vez no subo al ring para aguantar. Subo para terminar lo que empecé.' },
      { who: 'agente', text: 'Señor… ¿está seguro?' },
      { who: 'giovanni', text: 'Nunca he estado tan seguro. Prepara el ring. La Revancha Definitiva.' },
    ],
    rewards: { flag: 'finalUnlocked', unlockText: 'Desbloqueado: LA REVANCHA DEFINITIVA (en la base)' } },
];

/* -------------------------------------------------------------------------
   TÍTULOS (se desbloquean solos; se pueden elegir en Estadísticas)
   ------------------------------------------------------------------------- */
GC.DATA.titles = [
  { id: 'aspirante', name: 'ASPIRANTE', desc: 'Empezar el entrenamiento.', check: s => true },
  { id: 'primera', name: 'PRIMERA DERROTA', desc: 'Perder contra Chansey.', check: s => s.records.losses >= 1 },
  { id: 'segunda', name: 'SEGUNDA DERROTA', desc: 'Perder contra Chansey dos veces.', check: s => s.records.losses >= 2 },
  { id: 'casi', name: 'CASI', desc: 'Aguantar 60 segundos en el ring.', check: s => s.records.bestSurvival >= 60 },
  { id: 'no', name: 'NO', desc: 'Perder cinco veces.', check: s => s.records.losses >= 5 },
  { id: 'muycasi', name: 'MUY CASI', desc: 'Dejar a Chansey al borde del abismo.', check: s => s.records.totalRegens >= 1 },
  { id: 'puntos', name: '…', desc: 'Estrenar el golpe definitivo.', check: s => !!s.flags.ultimateGag },
  { id: 'intocable', name: 'EL INTOCABLE (CASI)', desc: 'Esquivar 15 golpes en un combate.', check: s => s.records.maxDodges >= 15 },
  { id: 'sigue', name: 'SIGUE INTENTÁNDOLO', desc: 'Perder diez veces.', check: s => s.records.losses >= 10 },
  { id: 'superviviente', name: 'SUPERVIVIENTE', desc: 'Aguantar dos minutos en el ring.', check: s => s.records.bestSurvival >= 120 },
  { id: 'inversor', name: 'INVERSOR DEPORTIVO', desc: 'Gastar 5.000.000 ₽.', check: s => s.records.spent >= 5000000 },
  { id: 'otravez', name: 'CHANSEY HA VUELTO A GANAR', desc: 'Perder quince veces.', check: s => s.records.losses >= 15 },
  { id: 'definitivo', name: 'EL GIOVANNI DEFINITIVO', desc: 'Completar la Revancha Definitiva.', check: s => !!s.finalDone },
];

/* -------------------------------------------------------------------------
   EXPEDIENTE CHANSEY (se desbloquea un informe por combate y en algunos eventos)
   Explican, con humor, las capas de inmortalidad.
   ------------------------------------------------------------------------- */
GC.DATA.intel = [
  'Informe 001. Chansey tiene muchísima vida. Mucha. Más que eso.',
  'Informe 002. Chansey recupera vida constantemente. Nadie sabe de dónde la saca.',
  'Informe 003. Su complexión reduce gran parte del daño recibido. El laboratorio lo llama «el colchón».',
  'Informe 004. Cuanto más dura el combate, más fuerte golpea. Se cree que se está divirtiendo.',
  'Informe 005. El Uppercut puede interrumpir sus ataques. A veces. Si ella lo permite.',
  'Informe 006. Cuando está muy débil, algo llamado «Instinto de Enfermera» la cura. Una vez por combate. Que se sepa.',
  'Informe 007. Si llega a quedarse sin vida, la recupera entera. Los informes posteriores fueron destruidos por el científico, entre lágrimas.',
  'Informe 008. Chansey es Chansey.',
  'Informe 009. Conclusión del departamento científico: dimitimos.',
];

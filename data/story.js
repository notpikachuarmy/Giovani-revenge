/* =========================================================================
   HISTORIA Y TEXTOS
   ========================================================================= */
window.GC = window.GC || {};
GC.DATA = GC.DATA || {};

GC.DATA.story = {
  intro: [
    { who: 'narr', text: 'Hace tres semanas. Un ring. Un foco. Un hombre.', scene: 'ring', cast: ['giovanni'] },
    { who: 'narr', text: 'Giovanni, líder de la mayor organización criminal de la región, subió al cuadrilátero convencido de su victoria.' },
    { who: 'narr', text: 'Enfrente: una Chansey.', cast: ['giovanni', 'arbitro', 'chansey'] },
    { who: 'narr', text: 'El combate duró menos que un anuncio.', fx: { giovanni: 'ko' } },
    { who: 'giovanni', scene: 'office', cast: ['giovanni'], fx: { giovanni: '' }, text: '¡He construido imperios enteros! ¡He doblegado a gobiernos! ¡He capturado Pokémon que los libros llaman leyenda!' },
    { who: 'giovanni', text: '¡Y una bola rosa y sonriente me mandó a dormir sobre la lona!' },
    { who: 'giovanni', text: 'Inaceptable.' },
    { who: 'agente', text: 'Señor, quizá deberíamos centrarnos en… ¿el crimen?' },
    { who: 'giovanni', text: 'El crimen puede esperar. La revancha, no.' },
    { who: 'narr', text: 'Así comenzó el entrenamiento más caro, más serio y más inútil de la historia.' },
  ],

  day1: [
    { who: 'narr', text: 'DÍA 1.', scene: 'gym', cast: ['giovanni', 'agente'] },
    { who: 'agente', text: 'Señor, el gimnasio privado está listo. Sacos, pesas, cinta, sala de meditación… y un chef.' },
    { who: 'giovanni', text: '¿Cuánto ha costado?' },
    { who: 'agente', text: '¿Importa, señor?' },
    { who: 'giovanni', text: 'No. Continúa.' },
    { who: 'agente', text: 'El pabellón del ring abre de 8:00 a 22:00. Ella… sigue allí. Esperando.' },
    { who: 'giovanni', text: 'Que espere. Cuando vuelva a ese ring, seré otro hombre.' },
    { who: 'narr', text: 'Entrena, come, duerme y sube al ring para medir tu progreso. Cada derrota da experiencia, puntos de habilidad e información.' },
  ],

  finalIntro: [
    { who: 'narr', text: 'El pabellón está lleno. Nadie sabe cómo se ha corrido la voz.', scene: 'ring', cast: ['giovanni', 'arbitro', 'chansey'] },
    { who: 'narr', text: 'Giovanni se venda las manos en silencio.' },
    { who: 'giovanni', text: '{fights} combates. {day} días. {punches} puñetazos.' },
    { who: 'giovanni', text: 'Todo para este momento.' },
    { who: 'arbitro', text: '¿Preparados?' },
    { who: 'chansey', text: '¡Chansey!' },
    { who: 'narr', text: 'Esta vez, Giovanni lo da todo.' },
  ],

  ending: [
    { who: 'narr', text: 'Silencio.', scene: 'ring', cast: ['giovanni', 'arbitro', 'chansey'], fx: { giovanni: 'ko' } },
    { who: 'narr', text: 'Giovanni yace sobre la lona. Otra vez.' },
    { who: 'narr', text: 'Pero esta vez es distinto.' },
    { who: 'giovanni', text: '…' },
    { who: 'giovanni', text: 'El primer día no aguanté ni {first} segundos.' },
    { who: 'giovanni', text: 'Hoy la he hecho tambalearse.' },
    { who: 'giovanni', text: 'No necesitaba derrotar a Chansey.', fx: { giovanni: '' } },
    { who: 'giovanni', text: 'Necesitaba derrotar al Giovanni que cayó la primera vez.' },
    { who: 'giovanni', text: 'Y a ese… lo he dejado K.O.' },
    { who: 'chansey', text: '¡Chansey!' },
    { who: 'narr', text: 'Chansey le tiende un huevo.' },
    { who: 'giovanni', text: '…Gracias.' },
    { who: 'narr', text: 'Dicen que esa noche, en la sede de la organización, alguien lloró un poquito.' },
    { who: 'narr', text: 'Nunca se confirmó quién.' },
    { who: 'narr', text: 'Chansey sigue siendo Chansey.' },
  ],

  // Frases de Giovanni en la base (al azar)
  quotes: [
    'Cada gota de sudor es una inversión.',
    'Hoy entreno. Mañana entreno. Pasado mañana, revancha.',
    'La organización puede esperar. Chansey, no.',
    'He visto el vídeo trescientas veces. En la trescientas uno lo entenderé.',
    'Mis abogados dicen que no puedo demandar a una Chansey. Todavía.',
    'El rosa es el color de la derrota. Por ahora.',
    'Un hombre que ha dirigido un imperio puede aprender a esquivar un abrazo.',
    'Esta vez sí.',
    'No es obsesión. Es planificación estratégica a largo plazo.',
    'Chansey no sabe lo que se le viene encima. Yo tampoco, pero suena bien.',
  ],

  // Título grande de la pantalla de resultados
  resultHeadlines: [
    'CHANSEY GANA. COMO SIEMPRE.',
    'CHANSEY SIGUE SIENDO CHANSEY.',
    'EL ÁRBITRO NI SE SORPRENDE.',
    'OTRA LECCIÓN DE HUMILDAD.',
    'EL PÚBLICO APLAUDE… A CHANSEY.',
  ],

  // Reacción de Chansey tras el combate
  chanseyAfter: [
    'Chansey saluda al público.',
    'Chansey ofrece un huevo al árbitro.',
    'Chansey ni siquiera está despeinada.',
    'Chansey bosteza.',
    'Chansey firma autógrafos.',
  ],

  // Reacción de Giovanni tras el combate
  giovanniRecord: [
    '¡¿Lo habéis visto?! ¡Estoy cada vez más cerca!',
    'Un récord. La próxima vez, la victoria.',
    'Lo noto. Está empezando a temerme.',
  ],
  giovanniNoRecord: [
    'Ha sido… un calentamiento.',
    'Hoy no contaba. Me he dejado ganar.',
    'Apuntad: la próxima vez, la guardia más alta.',
  ],

  // Al empezar cada fase de Chansey
  phaseIntros: [
    'Chansey sonríe. Está relajadísima.',
    'FASE 2: Chansey empieza a repartir.',
    'FASE 3: Chansey frunce el ceño. Se ha enfadado.',
    'FASE 4: Chansey usa movimientos que no deberían existir.',
    'FASE 5: MODO JEFE FINAL. Suena una música épica que nadie ha puesto.',
  ],

  // Cuando Chansey se regenera por completo
  regenLines: [
    'Chansey parece incapaz de caer.',
    'Chansey se sacude el polvo. Y con el polvo, todo el daño.',
    'El árbitro revisa el reglamento. No hay nada sobre esto.',
    'Giovanni jura que estaba a punto. El marcador dice otra cosa.',
  ],
  absurdLines: [
    'Ese golpe ha sido demasiado fuerte. Chansey ha decidido que no cuenta.',
  ],
};

/* =========================================================================
   MOVIMIENTOS DE CHANSEY
   kind: 'attack' | 'heal' | 'buff' | 'counter' | 'flavor'
   phases: fases en las que puede usarlo (1-5)
   windup: segundos de preparación (aviso visible para el jugador)
   dmg: daño base por golpe (se multiplica por la potencia, que crece con el tiempo)
   hits: nº de golpes · stun: aturdimiento (s) · energyDrain: energía que roba
   blockable / dodgeable: false si no se puede bloquear / esquivar
   interruptible: false si el Uppercut no puede interrumpirlo
   ========================================================================= */
window.GC = window.GC || {};
GC.DATA = GC.DATA || {};

GC.DATA.chanseyMoves = [
  { id: 'saludo', name: 'Saludo al público', phases: [1, 2], weight: 3, kind: 'flavor', windup: 0.6,
    text: 'Chansey saluda al público. El público la adora.' },
  { id: 'bostezo', name: 'Bostezo', phases: [1], weight: 2, kind: 'flavor', windup: 0.6,
    text: 'Chansey bosteza. Giovanni se siente profundamente insultado.' },
  { id: 'palmadita', name: 'Palmadita', phases: [1, 2], weight: 4, kind: 'attack', windup: 0.9, dmg: 4 },
  { id: 'ovacion', name: 'Ovación', phases: [1, 2, 3], weight: 2, kind: 'buff', windup: 0.7,
    buff: { type: 'dmg', value: 0.25, time: 8 }, text: '¡Chansey se anima! Su daño aumenta.' },
  { id: 'destructor', name: 'Destructor Cariñoso', phases: [2, 3, 4], weight: 5, kind: 'attack', windup: 0.85, dmg: 8 },
  { id: 'bofeton', name: 'Doble Bofetón', phases: [2, 3, 4], weight: 3, kind: 'attack', windup: 1.0, dmg: 5, hits: 2 },
  { id: 'huevo', name: 'Huevo Reparador', phases: [2, 3, 4, 5], weight: 1, kind: 'heal', windup: 1.0, heal: 0.25,
    text: 'Chansey se come un huevo. Recupera vida.' },
  { id: 'megaabrazo', name: 'MEGAABRAZO', phases: [3, 4, 5], weight: 4, kind: 'attack', windup: 1.4, dmg: 22 },
  { id: 'beso', name: 'Beso Dulce', phases: [3, 4, 5], weight: 2, kind: 'attack', windup: 1.1, dmg: 3, stun: 1.6, blockable: false,
    text: 'Un beso. Giovanni no sabe qué sentir. Está aturdido.' },
  { id: 'contra', name: 'Postura sospechosa', phases: [3, 4, 5], weight: 2, kind: 'counter', windup: 0.5, duration: 1.8,
    text: 'Chansey adopta una postura sospechosa… (si la golpeas, contraataca)' },
  { id: 'sonrisa', name: 'Sonrisa Inquietante', phases: [4, 5], weight: 2, kind: 'attack', windup: 1.0, dmg: 2, energyDrain: 25,
    blockable: false, dodgeable: false, text: 'La sonrisa de Chansey drena la voluntad de Giovanni.' },
  { id: 'lluvia', name: 'Lluvia de Huevos', phases: [4, 5], weight: 3, kind: 'attack', windup: 1.3, dmg: 7, hits: 4 },
  { id: 'rodar', name: 'Rodar Infinito', phases: [4, 5], weight: 2, kind: 'attack', windup: 1.6, dmg: 34, blockable: false },
  { id: 'pantalla', name: 'Pantalla Rosa', phases: [4, 5], weight: 1, kind: 'buff', windup: 0.6,
    buff: { type: 'def', value: 0.3, time: 6 }, text: 'Chansey se rodea de un brillo rosa. Recibe menos daño.' },
  { id: 'abrazo_final', name: 'ABRAZO DEFINITIVO', phases: [5], weight: 3, kind: 'attack', windup: 1.6, dmg: 45 },
  { id: 'nopuedes', name: 'NO PUEDES GANAR', phases: [5], weight: 2, kind: 'attack', windup: 2.4, dmg: 80,
    blockable: false, interruptible: false, text: 'Chansey concentra todo su poder. Solo queda esquivar.' },
];

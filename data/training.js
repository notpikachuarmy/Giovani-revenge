/* =========================================================================
   ENTRENAMIENTOS Y COMIDA
   gains: ganancia base por sesión (se aplica rendimiento decreciente)
   total: contadores cómicos que se acumulan (puñetazos, km, kg...)
   price: coste en ₽ (opcional) · unlockFlag: requiere bandera de evento
   ========================================================================= */
window.GC = window.GC || {};
GC.DATA = GC.DATA || {};

GC.DATA.training = [
  { id: 'saco', name: 'Saco de boxeo', icon: '🥊', hours: 2, energy: 12, fatigue: 9, gains: { str: 2.0 }, xp: 12,
    total: { punches: 800 },
    desc: 'Un saco que, a diferencia de Chansey, se mueve cuando le pegas.',
    flavor: ['Giovanni le ha puesto nombre al saco. No es un nombre bonito.', 'El saco ha pedido el traslado.', 'Se oye un «Chansey» lejano. Giovanni golpea más fuerte.', 'Ochocientos puñetazos. Cada uno con nombre y apellido.'] },
  { id: 'cinta', name: 'Cinta de correr', icon: '🏃', hours: 2, energy: 12, fatigue: 9, gains: { spd: 2.0 }, xp: 12,
    total: { km: 12 },
    desc: 'Correr mucho sin ir a ningún sitio. Muy de villano.',
    flavor: ['Doce kilómetros. La cinta echa humo.', 'Giovanni corre como si Chansey le persiguiera. En su mente, lo hace.', 'Un agente Rocket intenta seguirle el ritmo. Lo recogen con camilla.'] },
  { id: 'pesas', name: 'Levantamiento de pesas', icon: '🏋️', hours: 2, energy: 16, fatigue: 12, gains: { str: 1.2, end: 1.4 }, xp: 14,
    total: { kg: 3500 },
    desc: 'Hierro, sudor y frases motivadoras en la pared.',
    flavor: ['Tres toneladas y media. La barra se dobla un poco.', 'Giovanni gruñe. El edificio entero lo oye.', '«Peso ligero», dice. Mientras tiembla.'] },
  { id: 'neumatico', name: 'Arrastrar neumático gigante', icon: '🛞', hours: 2, energy: 14, fatigue: 11, gains: { end: 2.0 }, xp: 12,
    total: { kg: 1500, km: 2 },
    desc: 'Un neumático de camión atado a la cintura. Clásico.',
    flavor: ['El neumático pierde. Por fin algo pierde contra Giovanni.', 'Dos kilómetros arrastrando goma. El asfalto también sufre.'] },
  { id: 'sparring', name: 'Sparring', icon: '🤼', hours: 2, energy: 15, fatigue: 13, hpCostPct: 0.12, gains: { tec: 2.0, spd: 0.5 }, xp: 15,
    total: { sparring: 1 },
    risk: { chance: 0.25, fatigue: 10, text: 'El compañero de sparring se ha venido arriba. +10 de cansancio.' },
    desc: 'Contra un profesional. Cuesta vida y puede cansar de más.',
    flavor: ['El sparring pide no volver a pelear contra «el señor».', 'Técnica pulida. Nariz algo menos.', 'Giovanni aprende algo nuevo. El sparring también: a cubrirse.'] },
  { id: 'meditacion', name: 'Meditación', icon: '🧘', hours: 2, energy: 4, fatigue: -6, gains: { men: 2.0 }, xp: 10,
    total: { meditation: 120 },
    desc: 'Vaciar la mente. Excepto de Chansey. Eso no se va.',
    flavor: ['Paz interior alcanzada durante cuatro segundos.', 'Giovanni visualiza su victoria. La visualización también pierde.', 'Inspira. Espira. Piensa en Chansey. Vuelve a empezar.'] },
  { id: 'extremo', name: 'Entrenamiento extremo', icon: '🔥', hours: 4, energy: 35, fatigue: 30, gains: { str: 1.6, end: 1.6, spd: 1.6 }, xp: 32, minLevel: 3,
    total: { punches: 1500, kg: 5000, km: 10 },
    desc: 'Cuatro horas de todo a la vez. Ganancia enorme, cansancio enorme.',
    flavor: ['Montaje de entrenamiento completo. Falta la música, pero Giovanni la tararea.', 'Sube escaleras. Muchas. Al llegar arriba levanta los brazos.'] },

  // ---- Entrenamientos especiales (cuestan dinero, que es para lo que sirve el dinero)
  { id: 'privado', name: 'Entrenador privado de élite', icon: '🎓', hours: 3, energy: 10, fatigue: 8, price: 200000, gains: { tec: 2.5, men: 1.2 }, xp: 22,
    desc: 'Un campeón retirado que cobra por segundo y lo vale.',
    flavor: ['«Más cadera», dice el entrenador. Giovanni le paga el doble por decirlo.', 'Lección del día: no subestimes a nadie rosa.'] },
  { id: 'globo', name: 'Simulador de Chansey (hinchable)', icon: '🎈', hours: 2, energy: 10, fatigue: 8, price: 50000, unlockFlag: 'chanseyBalloon',
    gains: { tec: 1.6, men: 1.6 }, xp: 24,
    desc: 'Un globo rosa del tamaño de Chansey. Rebota. Mucho.',
    flavor: ['El globo gana. Siempre.', 'Giovanni le grita al globo. El globo no responde. Muy realista.'] },
  { id: 'gravedad', name: 'Cámara de gravedad ×10', icon: '🌀', hours: 3, energy: 30, fatigue: 24, price: 500000, unlockFlag: 'gravityRoom',
    gains: { str: 2.2, end: 2.2, spd: 2.2 }, xp: 38, total: { kg: 10000 },
    desc: 'Tecnología punta del laboratorio Rocket. Nadie sabe cómo funciona.',
    flavor: ['Gravedad ×10. Giovanni ×10 de enfadado.', 'Al salir, Giovanni flota un poco. Psicológicamente.'] },
];

GC.DATA.food = [
  { id: 'batido', name: 'Batido proteico', icon: '🥤', energy: 25, fatigue: 4, hpPct: 0, buff: { stat: 'str', amount: 3, hours: 6 },
    desc: 'Sabor «vainilla ejecutiva».' },
  { id: 'chef', name: 'Menú del chef con estrella', icon: '🍽️', energy: 45, fatigue: 10, hpPct: 0.1, buff: { stat: 'end', amount: 4, hours: 6 },
    desc: 'Siete platos. Giovanni se come cuatro.' },
  { id: 'bayas', name: 'Bayas Zidra en bandeja de plata', icon: '🍒', energy: 30, fatigue: 6, hpPct: 0.3, buff: { stat: 'men', amount: 4, hours: 6 },
    desc: 'Recuperan vida. La bandeja cuesta más que un gimnasio.' },
  { id: 'cafe', name: 'Café negro como el alma de un villano', icon: '☕', energy: 20, fatigue: 14, hpPct: 0, buff: { stat: 'spd', amount: 3, hours: 4 },
    desc: 'Quita el cansancio. Aumenta la intensidad de la mirada.' },
  { id: 'curry', name: 'Curry picantísimo', icon: '🍛', energy: 40, fatigue: 6, hpPct: 0.1, buff: { stat: 'tec', amount: 4, hours: 6 },
    desc: 'Giovanni no llora. Le sudan los ojos.' },
  { id: 'tarta', name: 'Tarta de la victoria (preventiva)', icon: '🎂', energy: 35, fatigue: 8, hpPct: 0, buff: { stat: 'trainGain', amount: 0.15, hours: 6 },
    desc: 'Encargada para celebrar la victoria. Se la come antes, por si acaso.' },
];

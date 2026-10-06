/* =========================================================================
   EQUIPAMIENTO
   bonus admite estadísticas (str, end, spd, tec, men) y modificadores
   (critChance, dodgeWindow, trainGain, maxHp, maxEnergy, allDmg...).
   unlockFlag: el objeto solo aparece cuando un evento activa esa bandera.
   ========================================================================= */
window.GC = window.GC || {};
GC.DATA = GC.DATA || {};

GC.DATA.equipmentSlots = [
  { id: 'guantes',   name: 'Guantes',   icon: '🥊' },
  { id: 'vendas',    name: 'Vendajes',  icon: '🩹' },
  { id: 'botas',     name: 'Botas',     icon: '👟' },
  { id: 'ropa',      name: 'Ropa',      icon: '👕' },
  { id: 'cinturon',  name: 'Cinturón',  icon: '🎗️' },
  { id: 'boca',      name: 'Protector', icon: '😬' },
  { id: 'accesorio', name: 'Accesorio', icon: '✨' },
];

GC.DATA.equipment = [
  // Guantes
  { id: 'guantes_basicos', slot: 'guantes', name: 'Guantes básicos', price: 5000, bonus: { str: 2 },
    desc: 'Rojos. Clásicos. Insuficientes.' },
  { id: 'guantes_pro', slot: 'guantes', name: 'Guantes profesionales', price: 60000, bonus: { str: 6, tec: 2 },
    desc: 'Usados por campeones de verdad contra rivales de verdad.' },
  { id: 'guantes_alto', slot: 'guantes', name: 'Guantes de alto rendimiento', price: 250000, bonus: { str: 10, spd: 3, critChance: 0.03 },
    desc: 'Fibra de carbono y una garantía que no cubre a Chansey.' },
  { id: 'guantes_rocket', slot: 'guantes', name: 'Guantes del Team Rocket', price: 0, unlockFlag: 'rocketGloves', bonus: { str: 14, men: 3, critChance: 0.05 },
    desc: 'Llevan una R bordada. Intimidan a todo el mundo. A casi todo el mundo.' },
  { id: 'guantes_oro', slot: 'guantes', name: 'Guantes de oro macizo', price: 5000000, bonus: { str: 18, spd: -5, men: 6 },
    desc: 'Pesan como una roca. Brillan como un ego.' },

  // Vendajes
  { id: 'vendas_basicas', slot: 'vendas', name: 'Vendajes', price: 2000, bonus: { end: 2 },
    desc: 'Protegen las muñecas. El orgullo, no.' },
  { id: 'vendas_pro', slot: 'vendas', name: 'Vendajes de competición', price: 40000, bonus: { end: 4, tec: 3 },
    desc: 'Los enrolla un profesional que cobra por minuto.' },

  // Botas
  { id: 'botas_entreno', slot: 'botas', name: 'Botas de entrenamiento', price: 10000, bonus: { spd: 3 },
    desc: 'Rápidas, cómodas y con olor a nuevo.' },
  { id: 'botas_pro', slot: 'botas', name: 'Botas de boxeo profesionales', price: 120000, bonus: { spd: 7, dodgeWindow: 0.05 },
    desc: 'Para esquivar mejor lo inesquivable.' },

  // Ropa
  { id: 'chandal', slot: 'ropa', name: 'Chándal de entrenamiento', price: 15000, bonus: { end: 3, maxEnergy: 10 },
    desc: 'Gris marengo. Muy de montaje de película de boxeo.' },
  { id: 'chandal_rocket', slot: 'ropa', name: 'Chándal oficial del Team Rocket', price: 0, unlockFlag: 'rocketSuit', bonus: { end: 6, men: 4, maxEnergy: 15 },
    desc: 'Edición limitada. Talla «Jefe».' },
  { id: 'traje', slot: 'ropa', name: 'Traje de tres piezas', price: 900000, bonus: { men: 10, spd: -3 },
    desc: 'No sirve para boxear. Pero Giovanni se siente invencible.' },

  // Cinturón
  { id: 'cinturon_pesas', slot: 'cinturon', name: 'Cinturón de pesas', price: 20000, bonus: { str: 2, end: 4 },
    desc: 'Sujeta la espalda y las ambiciones.' },
  { id: 'cinturon_campeon', slot: 'cinturon', name: 'Cinturón de campeón (comprado)', price: 999999, bonus: { str: 3, men: 8 },
    desc: 'Comprado, no ganado. Nadie tiene por qué saberlo.' },

  // Protector
  { id: 'protector', slot: 'boca', name: 'Protector dental', price: 3000, bonus: { end: 1, men: 2 },
    desc: 'Ahora puede apretar los dientes con seguridad.' },
  { id: 'protector_diamante', slot: 'boca', name: 'Protector dental de diamante', price: 750000, bonus: { end: 4, men: 4 },
    desc: 'Brilla cuando sonríe. No sonríe nunca.' },

  // Accesorios
  { id: 'pato', slot: 'accesorio', name: 'Pato de goma motivacional', price: 500, bonus: { men: 3 },
    desc: 'Lo mira antes de cada combate. El pato también le mira.' },
  { id: 'foto_persian', slot: 'accesorio', name: 'Foto enmarcada de Persian', price: 1, bonus: { men: 6 },
    desc: 'Persian no quiso firmarla.' },
  { id: 'gafas', slot: 'accesorio', name: 'Gafas de sol de entrenador', price: 80000, bonus: { tec: 4, men: 2 },
    desc: 'Para ocultar las lágrimas tras cada derrota.' },
  { id: 'tobilleras', slot: 'accesorio', name: 'Tobilleras de plomo', price: 30000, bonus: { trainGain: 0.15, spd: -3 },
    desc: 'Entrenar con peso extra rinde más. Pelear con él, no tanto.' },
  { id: 'amuleto', slot: 'accesorio', name: 'Amuleto «Esta vez sí»', price: 3000000, bonus: { str: 3, end: 3, spd: 3, tec: 3, men: 3 },
    desc: 'Bendecido por un vidente. El vidente ha huido del país.' },
];

# Recursos gráficos y de audio

Ahora mismo el juego usa **placeholders** (cajas etiquetadas) y sonidos sintetizados.

## Sustituir sprites
1. Copia tus imágenes en `assets/characters/` (PNG con fondo transparente).
2. Abre `js/sprites.js` y rellena `src` (y opcionalmente `poses`):

```js
giovanni: { label: 'GIOVANNI', tone: 'gio', src: 'assets/characters/giovanni.png',
            poses: { punch: 'assets/characters/giovanni_punch.png' } },
chansey:  { label: 'CHANSEY',  tone: 'chan', src: 'assets/characters/chansey.png', poses: {} },
```

Tamaños recomendados: Giovanni 110×190 px, Chansey 170×170 px (se escalan solos).

## Fondos y UI
`assets/backgrounds/` y `assets/ui/` están preparados. El ring y la habitación se dibujan con CSS
(`css/battle.css` → `.arena`, `css/training.css` → `.room-scene`): puedes cambiar su `background` por una imagen.

## Audio
Copia archivos en `assets/audio/` y regístralos en `js/audio.js`:

```js
GC.Audio.files = { hit: 'assets/audio/hit.wav', bell: 'assets/audio/bell.wav' };
```
Nombres: click, move, deny, hit, heavy, block, dodge, perfect, hurt, warn, phase, regen, levelup, train, buy, bell, ko.

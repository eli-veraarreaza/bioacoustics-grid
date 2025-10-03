// grid/vis/engine.js
import * as vargs from './url_args.js';
import { setArg } from './url_args.js';
import { AudioController } from './audio/controller.js';

export async function renderSpectrogramFromBlob(blob, options = {}) {
  // Ajustes rápidos (puedes cambiarlos desde la grilla)
  if (options.imageSize) setArg('IMAGE_SIZE', options.imageSize);
  if (options.fftSize)   setArg('FFT_SIZE', options.fftSize);

  // Prepara un canvas oculto donde dibujar
  const size = vargs.vconf.IMAGE_SIZE || 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  canvas.style.position = 'fixed';
  canvas.style.left = '-9999px';
  document.body.appendChild(canvas);

  // Inicializa el motor con el mismo controller que usa tu app
  const ctrl = new AudioController(canvas, {
    fftSize: vargs.vconf.FFT_SIZE || 2048,
    stats: null,
  });

  ctrl.init();
  // Tu visualizador acepta File/Blob (en tu app se usa file del <input>):contentReference[oaicite:3]{index=3}
  await ctrl.start(blob);
  // Fuerza un render inmediato por si hace falta
  ctrl.drawFrame?.();

  // Extrae el PNG
  const dataUrl = canvas.toDataURL('image/png');

  // Limpieza
  canvas.remove();

  return dataUrl;
}

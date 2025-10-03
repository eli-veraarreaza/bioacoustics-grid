// grid/vis/engine.js
import * as vargs from './url_args.js';
import { setArg } from './url_args.js';
import { AudioController } from './audio/controller.js';

export async function renderSpectrogramFromBlob(blob, options = {}) {
  // Valores por defecto sólidos
  const imgSize = Number(options.imageSize) || 1024;
  const fftSize = Number(options.fftSize)   || 2048;

  // Config global del visualizador
  setArg('IMAGE_SIZE', imgSize);
  setArg('FFT_SIZE', fftSize);

  // Prepara un canvas oculto donde dibujar
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = imgSize;
  canvas.style.position = 'fixed';
  canvas.style.left = '-9999px';
  document.body.appendChild(canvas);

  // Inicializa el motor
  const ctrl = new AudioController(canvas, {
    fftSize: fftSize,
    stats: null,
  });

  ctrl.init();

  // Convierte Blob -> File (como en tu visualizador original)
  const file = new File([blob], "remote-audio.mp3", {
    type: blob.type || "audio/mpeg",
  });

  try {
    await ctrl.start(file);

    // Si existe método explícito de render, lo llamamos
    if (typeof ctrl.drawFrame === "function") {
      ctrl.drawFrame();
    }

    // Extrae el PNG del canvas
    const dataUrl = canvas.toDataURL("image/png");

    // Limpieza
    canvas.remove();

    return dataUrl;
  } catch (err) {
    console.error("Error en renderSpectrogramFromBlob:", err);
    canvas.remove();
    throw err;
  }
}

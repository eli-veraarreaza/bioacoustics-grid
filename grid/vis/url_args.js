// url_args.js — versión adaptada para la grilla

// ---- DUMMY dat.GUI (solo para la grilla) ----
// Si dat.GUI no está cargado, simulamos lo básico
if (typeof dat === "undefined") {
  window.dat = {
    GUI: function() {
      this.add = function(obj, prop, ...rest) {
        // Retorna un "control" mínimo con name/onChange/listen
        return {
          name: prop,
          onChange: () => this,
          listen: () => this,
        };
      };
    }
  };
}

// ------------------------------------------------
// Original url_args.js de tu visualizador (con mínimos cambios)
// ------------------------------------------------

export let vconf = {};
export let gui = null;

function define_arg(obj, arg, def, doc) {
  if (!(arg in obj)) {
    obj[arg] = def;
  }
  // En el visualizador original se agregaba a dat.GUI
  if (gui) {
    try {
      const ctrl = gui.add(obj, arg);
      ctrl.name = arg;
    } catch (e) {
      // En la grilla no hay GUI real, ignoramos
    }
  }
}

export function setArg(arg, val) {
  vconf[arg] = val;
}

// Aquí defines todos los parámetros igual que en tu visualizador
function init_args() {
  gui = new dat.GUI(); // aunque sea dummy

  define_arg(vconf, 'IMAGE_SIZE', 1024, 'Tamaño de la imagen PNG');
  define_arg(vconf, 'FFT_SIZE', 2048, 'Tamaño de la FFT');
  define_arg(vconf, 'COLOR_MAP', 'viridis', 'Mapa de color');
  define_arg(vconf, 'GAIN', 1.0, 'Ganancia de señal');
  define_arg(vconf, 'BRIGHTNESS', 1.0, 'Brillo');
  define_arg(vconf, 'CONTRAST', 1.0, 'Contraste');
  define_arg(vconf, 'SATURATION', 1.0, 'Saturación');
  // … agrega aquí todos los args que ya tenía tu url_args.js original
}

// inicializa al cargar
init_args();

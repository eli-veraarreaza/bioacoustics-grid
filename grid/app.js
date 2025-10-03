// grid/app.js
import { renderSpectrogramFromBlob } from './vis/engine.js';

const API_BASE = 'https://xeno-canto.org/api/2/recordings';
const USE_PROXY = true; // usa tu función Netlify para evitar CORS
const proxy = (url) => `/.netlify/functions/proxy?url=${encodeURIComponent(url)}`;

const $ = (s) => document.querySelector(s);
const grid = $('#grid');
const statusEl = $('#status');
$('#run').addEventListener('click', run);

async function run() {
  grid.innerHTML = '';
  const species = $('#species').value.trim();             // "Scelorchilus rubecula"
  const count = Math.max(1, Math.min(20, +$('#count').value || 6));
  const imgSize = Math.max(256, Math.min(4096, +$('#imgsize').value || 1024));

  statusEl.textContent = 'Buscando grabaciones…';

  const query = buildXenoQuery(species);  // gen:... sp:...
  const recs = await fetchRecordings(query, count);
  statusEl.textContent = `Procesando 0/${recs.length}`;

  let done = 0;
  for (const rec of recs) {
    try {
      const audioUrl = USE_PROXY ? proxy(rec.file) : rec.file;

      // Descarga como Blob para pasarlo a tu motor (AudioController.start)
      const blob = await (await fetch(audioUrl)).blob();

      // Tu motor genera el PNG desde el blob
      const png = await renderSpectrogramFromBlob(blob, { imageSize: imgSize });

      // Renderiza la tarjeta
      addCard({ rec, png, audioUrl });

      statusEl.textContent = `Procesando ${++done}/${recs.length}`;
    } catch (e) {
      console.error('Fallo con una grabación:', e);
      addCard({ rec, png: null, audioUrl: null, error: true });
      statusEl.textContent = `Procesando ${++done}/${recs.length}`;
    }
  }

  statusEl.textContent = 'Listo ✅';
}

function buildXenoQuery(scientificName) {
  // Si viene "Genus species", separa. Si no, usa tal cual como búsqueda libre.
  const [gen, sp] = scientificName.split(/\s+/);
  if (gen && sp) return `gen:${gen} sp:${sp}`;
  return scientificName; // fallback
}

async function fetchRecordings(query, limit) {
  const out = [];
  let page = 1, numPages = 1;
  while (out.length < limit && page <= numPages) {
    const res = await fetch(`${API_BASE}?query=${encodeURIComponent(query)}&page=${page}`);
    const data = await res.json();
    numPages = parseInt(data.numPages || 1, 10);
    for (const r of (data.recordings || [])) {
      if (r.file) out.push(r);
      if (out.length >= limit) break;
    }
    page++;
  }
  // Baraja para aleatorizar
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, limit);
}

function addCard({ rec, png, audioUrl, error }) {
  const div = document.createElement('div');
  div.className = 'card';
  const title = `${rec.en || ''} (${rec.gen || ''} ${rec.sp || ''})`.trim();
  const who   = rec.rec ? `• Rec: ${rec.rec}` : '';
  const where = rec.loc ? `• ${rec.loc}` : '';
  const when  = rec.date ? `• ${rec.date}` : '';
  const qual  = rec.q    ? `• q:${rec.q}`   : '';
  const lic   = rec.lic  ? `<a href="${rec.lic}" target="_blank" rel="noopener">Licencia</a>` : '';
  const link  = rec.url  ? `<a href="${rec.url}" target="_blank" rel="noopener">XC ${rec.id || ''}</a>` : '';

  div.innerHTML = `
    <div class="meta"><strong>${title}</strong><br>${[who, where, when, qual, link, lic].filter(Boolean).join(' • ')}</div>
    ${png ? `<img class="img" alt="Espectrograma" src="${png}">` 
          : `<div class="img" style="display:grid;place-items:center;color:#b00;min-height:160px">Error</div>`}
    <div class="controls">
      ${audioUrl ? `<audio controls src="${audioUrl}" preload="none"></audio>` : ''}
    </div>
  `;
  grid.appendChild(div);
}

/* ============================================================
   LeafClass — app.js
   ============================================================ */

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/ZmbUgMIHG/";

let model   = null;
let webcam  = null;
let hasImg  = false;

/* ── ICONS ───────────────────────────────────────────────── */
const ICONS = {
  disease: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`,

  healthy: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>`,
};

const BAR_ICON_DISEASE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
  <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>`;

const BAR_ICON_HEALTHY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="20 6 9 17 4 12"/>
</svg>`;

/* ── CLASS DATA ──────────────────────────────────────────── */
const classData = {
  hama:         { type: 'disease', char: 'Jaringan daun menjadi terdistorsi dan atau berlubang, ditemukan bintik perak/klorotik, serta adanya jalur berlubang pada daun.', tags: ['Daun berlubang', 'Jaringan terdistorsi', 'Bintik perak/klorotik', 'Jalur pada daun'] },
  pest:         { type: 'disease', char: 'Jaringan daun menjadi terdistorsi dan atau berlubang, ditemukan bintik perak/klorotik, serta adanya jalur berlubang pada daun.', tags: ['Daun berlubang', 'Jaringan terdistorsi', 'Bintik perak/klorotik', 'Jalur pada daun'] },
  virus:        { type: 'disease', char: 'Pola mosaik atau mottle pada daun dengan warna tidak merata. Daun mengkerut, menggulung, atau mengecil. Menyebar melalui serangga vektor seperti kutu daun.', tags: ['Pola mosaik', 'Daun menggulung', 'Warna tidak merata', 'Keriting'] },
  phytophthora: { type: 'disease', char: 'Busuk daun dengan bercak coklat gelap berbatas tidak jelas. Pada kondisi lembab muncul lapisan putih di bawah daun. Sangat agresif saat hujan.', tags: ['Bercak coklat gelap', 'Busuk daun', 'Lapisan putih', 'Penyebaran cepat'] },
  jamur:        { type: 'disease', char: 'Bercak coklat atau hitam pada permukaan daun, kadang disertai tepung putih atau spora. Berkembang pesat dalam kondisi lembab dan hangat.', tags: ['Bercak coklat', 'Spora', 'Kondisi lembab', 'Tepung putih'] },
  fungus:       { type: 'disease', char: 'Bercak coklat atau hitam pada permukaan daun, kadang disertai tepung putih atau spora. Berkembang pesat dalam kondisi lembab dan hangat.', tags: ['Bercak coklat', 'Spora', 'Kondisi lembab', 'Tepung putih'] },
  bakteri:      { type: 'disease', char: 'Bercak berair pada daun yang kemudian menguning dan mengering. Tepi bercak sering dikelilingi halo kuning. Menyebar melalui air dan luka.', tags: ['Bercak berair', 'Halo kuning', 'Daun mengering', 'Layu'] },
  bacterial:    { type: 'disease', char: 'Bercak berair pada daun yang kemudian menguning dan mengering. Tepi bercak sering dikelilingi halo kuning. Menyebar melalui air dan luka.', tags: ['Bercak berair', 'Halo kuning', 'Daun mengering', 'Layu'] },
  nematoda:     { type: 'disease', char: 'Akar membengkak membentuk bisul atau gall. Tanaman kerdil dan daun menguning meski kondisi lahan cukup air. Kerusakan terjadi di bawah tanah.', tags: ['Akar membengkak', 'Tanaman kerdil', 'Daun menguning', 'Gall pada akar'] },
  nematode:     { type: 'disease', char: 'Akar membengkak membentuk bisul atau gall. Tanaman kerdil dan daun menguning meski kondisi lahan cukup air. Kerusakan terjadi di bawah tanah.', tags: ['Akar membengkak', 'Tanaman kerdil', 'Daun menguning', 'Gall pada akar'] },
  sehat:        { type: 'healthy', char: 'Daun tampak segar dengan warna hijau merata, tidak ada bercak, tidak menggulung, dan tidak ada tanda kerusakan fisik maupun infeksi.', tags: ['Hijau merata', 'Tidak ada bercak', 'Pertumbuhan normal', 'Daun segar'] },
  healthy:      { type: 'healthy', char: 'Daun tampak segar dengan warna hijau merata, tidak ada bercak, tidak menggulung, dan tidak ada tanda kerusakan fisik maupun infeksi.', tags: ['Hijau merata', 'Tidak ada bercak', 'Pertumbuhan normal', 'Daun segar'] },
};

/* ── HELPERS ─────────────────────────────────────────────── */
function getInfo(name) {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(classData)) {
    if (key.includes(k)) return v;
  }
  return {
    type: 'disease',
    char: 'Hasil klasifikasi dari model berdasarkan pola visual daun kentang.',
    tags: ['Analisis selesai'],
  };
}

function el(id) {
  return document.getElementById(id);
}

/* ── MODEL INIT ──────────────────────────────────────────── */
(async () => {
  try {
    model = await tmImage.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json');
    el('sdot').className  = 'sdot ready';
    el('stext').textContent = 'Model siap digunakan';
  } catch (e) {
    el('stext').textContent = 'Gagal memuat model';
  }
})();

/* ── FILE UPLOAD ─────────────────────────────────────────── */
function handleFile(e) {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 10 * 1024 * 1024) { alert('File terlalu besar! Maks. 10MB.'); return; }

  const reader = new FileReader();
  reader.onload = ev => setPreview(ev.target.result);
  reader.readAsDataURL(f);
  e.target.value = '';
}

function setPreview(src) {
  el('preview-img').src = src;
  el('upload-zone').style.display = 'none';
  el('preview-wrap').classList.add('vis');
  el('analyze-btn').disabled = false;
  hasImg = true;
  showEmpty();
}

function clearImg() {
  el('preview-img').src = '';
  el('preview-wrap').classList.remove('vis');
  el('upload-zone').style.display = '';
  el('analyze-btn').disabled = true;
  hasImg = false;
  showEmpty();
}

/* ── DRAG & DROP ─────────────────────────────────────────── */
const zone = el('upload-zone');

zone.addEventListener('dragover', e => {
  e.preventDefault();
  zone.classList.add('dragover');
});

zone.addEventListener('dragleave', () => {
  zone.classList.remove('dragover');
});

zone.addEventListener('drop', e => {
  e.preventDefault();
  zone.classList.remove('dragover');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  }
});

/* ── ANALYZE ─────────────────────────────────────────────── */
async function doAnalyze() {
  if (!hasImg || !model) {
    if (!model) alert('Model belum siap.');
    return;
  }
  showLoading();

  const img    = el('preview-img');
  const canvas = document.createElement('canvas');
  canvas.width  = img.naturalWidth  || 300;
  canvas.height = img.naturalHeight || 300;
  canvas.getContext('2d').drawImage(img, 0, 0);

  const predictions = await model.predict(canvas);
  const sorted      = [...predictions].sort((a, b) => b.probability - a.probability);
  showResults(sorted);
}

/* ── CAMERA ──────────────────────────────────────────────── */
async function openCam() {
  el('cam-modal').classList.add('open');
  try {
    webcam = new tmImage.Webcam(500, 375, true);
    await webcam.setup();
    await webcam.play();
    const container = el('webcam-container');
    container.innerHTML = '';
    container.appendChild(webcam.canvas);
  } catch (e) {
    el('webcam-container').innerHTML =
      `<div style="color:#ef4444;font-size:13px;padding:24px">Gagal akses kamera: ${e.message}</div>`;
  }
}

function closeCam() {
  el('cam-modal').classList.remove('open');
  if (webcam) { webcam.stop(); webcam = null; }
  el('webcam-container').innerHTML =
    '<div style="color:#94a3b8;font-size:13px;padding:24px">Memuat kamera…</div>';
}

function capturePhoto() {
  if (!webcam) return;
  const canvas = document.createElement('canvas');
  canvas.width  = webcam.canvas.width;
  canvas.height = webcam.canvas.height;
  canvas.getContext('2d').drawImage(webcam.canvas, 0, 0);
  closeCam();
  setPreview(canvas.toDataURL('image/png'));
}

/* ── UI STATES ───────────────────────────────────────────── */
function showEmpty() {
  el('r-empty').style.display  = 'flex';
  el('r-load').classList.remove('vis');
  el('r-result').style.display = 'none';
}

function showLoading() {
  el('r-empty').style.display  = 'none';
  el('r-load').classList.add('vis');
  el('r-result').style.display = 'none';
}

function showResults(sorted) {
  el('r-empty').style.display  = 'none';
  el('r-load').classList.remove('vis');
  el('r-result').style.display = 'block';

  const top  = sorted[0];
  const pct  = (top.probability * 100).toFixed(1);
  const info = getInfo(top.className);

  // Badge
  el('b-icon').innerHTML       = ICONS[info.type] || ICONS.disease;
  el('b-name').textContent     = top.className;
  el('b-conf').textContent     = `confidence: ${pct}%`;
  el('top-badge').className    = 'top-badge ' + info.type;

  // Confidence pill
  const lv = el('b-level');
  const p  = parseFloat(pct);
  if      (p >= 75) { lv.className = 'level-pill high';   lv.textContent = 'Sangat Yakin'; }
  else if (p >= 50) { lv.className = 'level-pill medium'; lv.textContent = 'Cukup Yakin'; }
  else              { lv.className = 'level-pill low';    lv.textContent = 'Kurang Yakin'; }

  // Confidence bars (top-3)
  const barsEl = el('bars');
  barsEl.innerHTML = '';

  sorted.slice(0, 3).forEach((prediction, index) => {
    const pc      = (prediction.probability * 100).toFixed(1);
    const inf     = getInfo(prediction.className);
    const iconSvg = inf.type === 'healthy' ? BAR_ICON_HEALTHY : BAR_ICON_DISEASE;

    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-meta">
        <span class="bar-cls">
          <span class="bar-cls-icon">${iconSvg}</span>
          ${prediction.className}
        </span>
        <span class="bar-pct${index === 0 ? ' hi' : ''}">${pc}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill r${index + 1}" data-w="${pc}" style="width:0%"></div>
      </div>`;
    barsEl.appendChild(row);
  });

  // Animate bars after render
  requestAnimationFrame(() => {
    document.querySelectorAll('.bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.w + '%';
    });
  });

  // Karakteristik
  el('char-box').textContent = info.char;

  const tagsEl = el('char-tags');
  tagsEl.innerHTML = '';
  info.tags.forEach(tag => {
    const span = document.createElement('span');
    span.className   = 'tag-pill';
    span.textContent = tag;
    tagsEl.appendChild(span);
  });
}

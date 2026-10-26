/* KosSapa — penyimpanan lokal browser, tanpa PHP atau API server. */
(() => {
  'use strict';
  const KEY = 'PWUTS_B08_25091397066_KOSSAPA_v1';
  const seed = window.KOSSAPA_SEED;
  const clone = value => JSON.parse(JSON.stringify(value));
  const actions = ['kos', 'ulasan', 'laporan'];

  function readData() {
    let source;
    try { source = window.localStorage.getItem(KEY); }
    catch { throw new Error('Browser memblokir localStorage. Izinkan penyimpanan situs agar data tersimpan.'); }
    if (source === null) {
      const initial = clone(seed);
      writeData(initial);
      return initial;
    }
    let parsed;
    try { parsed = JSON.parse(source); }
    catch { throw new Error('Data demo pada browser rusak. Hapus data situs untuk mengulang demo.'); }
    if (!parsed || typeof parsed !== 'object' || !actions.every(x => Array.isArray(parsed[x]))) {
      throw new Error('Format data demo pada browser tidak valid.');
    }
    return parsed;
  }

  function writeData(data) {
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); }
    catch { throw new Error('Data tidak dapat disimpan. Periksa izin atau kapasitas penyimpanan browser.'); }
  }

  function validateKos(db, id) {
    const number = Number(id);
    if (!Number.isSafeInteger(number) || !db.kos.some(k => Number(k.id_kos) === number)) {
      throw new Error('Pilih nama kos yang tersedia.');
    }
    return number;
  }
  function validateText(input, min, max, label) {
    if (typeof input !== 'string') throw new Error(`${label} harus berupa teks.`);
    const result = input.trim().replace(/\s+/g, ' ');
    const length = Array.from(result).length;
    if (length < min || length > max) throw new Error(`${label} harus ${min}–${max} karakter.`);
    return result;
  }
  function todayJakarta() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Jakarta'
    }).formatToParts(new Date());
    const fields = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
    return `${fields.year}-${fields.month}-${fields.day}`;
  }

  function perform(action, payload) {
    if (!actions.includes(action)) throw new Error('Jenis data tidak dikenal.');
    const db = readData();
    if (payload == null) return clone(action === 'kos' ? db.kos : db[action].slice().reverse());
    if (!payload || typeof payload !== 'object' || action === 'kos') throw new Error('Permintaan tidak didukung.');
    const idKos = validateKos(db, payload.id_kos);
    let entry;
    if (action === 'ulasan') {
      const rating = Number(payload.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Rating harus 1–5 bintang.');
      entry = {
        id_kos: idKos,
        nama_penulis: validateText(payload.nama_penulis, 2, 50, 'Nama tampilan'),
        rating,
        isi_ulasan: validateText(payload.isi_ulasan, 20, 700, 'Isi ulasan'),
        tanggal: todayJakarta()
      };
    } else {
      const accepted = ['dugaan_penipuan', 'ketidaksesuaian', 'keamanan', 'pelayanan', 'lainnya'];
      if (!accepted.includes(payload.kategori)) throw new Error('Pilih kategori laporan yang tersedia.');
      entry = {
        id_kos: idKos,
        kategori: payload.kategori,
        judul: validateText(payload.judul, 8, 100, 'Judul laporan'),
        kronologi: validateText(payload.kronologi, 30, 1500, 'Kronologi'),
        tanggal: todayJakarta(),
        status: 'menunggu_verifikasi'
      };
    }
    const key = action === 'ulasan' ? 'id_ulasan' : 'id_laporan';
    entry[key] = Math.max(0, ...db[action].map(x => Number(x[key]) || 0)) + 1;
    db[action].push(entry);
    writeData(db);
    return clone(entry);
  }
  window.KosSapaStore = Object.freeze({ perform });
})();

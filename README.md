# KosSapa — UTS Pemrograman Web (Gerald Bimo)

- **Mahasiswa:** Gerald Bimo — 25091397066, Kelas 2025B, Kelompok 8
- **Proposal:** Sistem Informasi Manajemen Kos Berbasis Web
- **Modul individu:** Ulasan Kos dan Laporan Dugaan Masalah Kos
- **Teknologi:** HTML5, CSS3 murni, JavaScript murni (**tanpa Bootstrap, tanpa jQuery, tanpa PHP, tanpa folder API, tanpa MySQL**).

## Menjalankan website

1. Extract ZIP, kemudian salin folder `PWUTS_B08_25091397066` ke `C:\xampp\htdocs\`.
2. Di XAMPP jalankan **Apache** saja; MySQL tidak perlu.
3. Buka `http://localhost/PWUTS_B08_25091397066/` di Chrome atau Edge.
4. Jika versi lama tersimpan di cache browser, tekan **Ctrl + Shift + R**.

**Penting:** Buka lewat alamat `http://localhost`, bukan `file:///`, karena navigasi halaman memakai JavaScript Fetch API (Ajax) untuk membaca HTML di folder `pages`.

## Fitur UTS

- **2.a Homepage:** `index.html` merupakan layout responsif dengan sidebar dan navigasi Ajax `fetch()`.
- **2.b Konten interaktif:** halaman Ulasan Kos berisi pencarian, filter nama kos, filter rating, urutan terbaru/tertinggi/terendah, serta rata-rata rating masing-masing kos.
- **2.c Form:** Tulis Ulasan (kos, rating 1–5, nama, cerita pengalaman) dan Laporkan Kos (kos, kategori dugaan, judul, kronologi). Validasi dilakukan dengan JavaScript sebelum penyimpanan lokal.
- **2.d:** Modul Gerald berbeda dari Farhan (Manajemen Kamar) dan Dava (Manajemen Kos).
- **2.e:** Dokumentasi ini disimpan sebagai `README.md`.

**Batasan kesesuaian soal:** Form disimpan ke `localStorage` browser, **tidak dikirim dengan HTTP POST ke server**. Jadi syarat soal 2.c terkait submit ke server HTTP **belum terpenuhi** pada versi tanpa backend ini. Untuk memenuhi keseluruhan syarat 2.c, butuh backend penerima form (misalnya Node.js) atau layanan HTTP yang tersedia.

## Struktur project

```text
PWUTS_B08_25091397066/
├── index.html
├── pages/
│   ├── beranda.html
│   ├── ulasan.html
│   ├── tulis.html
│   ├── lapor.html
│   └── riwayat.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── seed-data.js    # Data contoh fiktif (empat kos, ulasan, laporan)
│       ├── storage.js      # Logika localStorage dan validasi
│       └── app.js          # Navigasi Ajax dan interaksi halaman
├── README.md
└── PANDUAN_SINGKAT.txt
```

## Penyimpanan dan data contoh

- Nama kos contoh: **Kos Cendana, Kos Lentera, Kos Purnama, Kos Teratai**, berbeda dengan contoh milik Farhan.
- Saat pertama membuka website, JavaScript mengisi `localStorage` menggunakan data fiktif dari `assets/js/seed-data.js`.
- Ulasan yang dikirim langsung muncul di Ulasan Kos dan statistik Beranda.
- Laporan yang dikirim muncul di Riwayat Laporan dengan status awal **Menunggu Verifikasi**, bukan sebagai tuduhan publik.
- **Refresh tidak menghapus data.** Namun data hanya ada di browser/profil pengguna dan alamat website (origin) yang sama. Menghapus data situs/localStorage atau memakai browser lain membuat data tersimpan tidak terlihat; data contoh akan dimulai ulang setelah penyimpanan dihapus.
- Jika ingin mengubah nama kos contoh, edit `assets/js/seed-data.js`. Perubahan baru akan terlihat setelah menghapus data situs pada browser karena data contoh hanya dimasukkan saat pertama kali digunakan.

## Catatan etika dan keamanan

Seluruh data contoh bersifat **fiktif** dan untuk demonstrasi tugas. **Ini bukan sistem pengaduan sungguhan**: tidak ada autentikasi, moderasi, enkripsi laporan, atau verifikasi tuduhan. Laporan tersimpan di penyimpanan browser setempat, yang dapat diakses oleh pengguna lain pada profil browser yang sama. Jangan masukkan data sensitif, informasi rekening, atau tuduhan terhadap orang/kos nyata. Berkas yang diunggah ke GitHub sebaiknya hanya berisi data contoh.

## Pengumpulan GitHub

Nama folder dan repository yang disarankan (periksa kembali kode kelompok menurut ketentuan dosen): `PWUTS_B08_25091397066`. Unggah folder bersama seluruh file HTML, CSS, JavaScript, dan dokumentasi; tidak ada PHP maupun database untuk diunggah.

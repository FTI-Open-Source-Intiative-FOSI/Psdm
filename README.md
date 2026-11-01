# 🌟 Bintang Aktivis Kampus (BAK) Fakultas — BEM KM FTI UNAND

> **Sistem Informasi Pendaftaran dan Verifikasi Bintang Aktivis Kampus Khusus Tingkat Fakultas (FTI UNAND)**  
> Bagian dari program kerja **FOSI (FTI Open Source Initiative)** Dinas Riset dan Teknologi yang diintegrasikan untuk mendukung operasional **Dinas Pengembangan Sumber Daya Mahasiswa (PSDM)**  
> **Badan Eksekutif Mahasiswa Keluarga Mahasiswa Fakultas Teknologi Informasi (BEM KM FTI)**  
> **Universitas Andalas — Kabinet Vismayakriya**

---

## 📌 1. Latar Belakang & Konteks Program

**Bintang Aktivis Kampus (BAK)** diselenggarakan di tingkat Universitas Andalas (se-UNAND), dan sistem ini dibangun **khusus untuk BAK Tingkat Fakultas Teknologi Informasi (FTI UNAND)**. Program ini adalah bentuk apresiasi dan penghargaan dari BEM KM FTI Universitas Andalas kepada wisudawan dan wisudawati yang telah mendedikasikan waktu, tenaga, dan gagasannya untuk aktif berorganisasi serta berprestasi mengharumkan nama Fakultas Teknologi Informasi (mencakup 3 Program Studi: **Teknik Komputer**, **Sistem Informasi**, dan **Informatika**).

Sistem web interaktif ini dibangun untuk menggantikan proses pendataan manual/Google Forms yang rentan tercecer, menyediakan transparansi status kelulusan aktivis secara *real-time*, dan memudahkan tim verifikator Dinas PSDM dalam merekapitulasi data pendaftar hingga mengekspornya langsung ke format spreadsheet (CSV/Excel) untuk publikasi media sosial dan arsip fakultas.

---

## 🚀 2. Fitur Utama Aplikasi

### A. Halaman Utama / Landing Page
- **Identitas Resmi**: Menampilkan identitas Kabinet Vismayakriya, BEM KM FTI UNAND, dan kolaborasi sinergi FOSI Dinas Ristek × Dinas PSDM.
- **Edukasi & Sosialisasi**: Penjelasan program BAK Fakultas, kategori keaktifan di FTI (BEM KM FTI, HIMA HIMATEKOM/HMSI/HMIF, UKMF di FTI, DPM KM FTI, Prestasi Lomba).
- **Aksi Cepat**: Tombol navigasi langsung ke formulir pendaftaran dan pelacakan status.
- **Counter Metrik Live**: Menampilkan jumlah pendaftar, jumlah mahasiswa lolos BAK, dan status berkas yang sedang diverifikasi secara *real-time*.

### B. Form Pendaftaran BAK (Sisi Mahasiswa — Tanpa Login)
- **Input Data Valid**: Nama Lengkap, NIM (kunci pelacakan), Program Studi (Teknik Komputer, Sistem Informasi, Informatika), Periode Wisuda (Wisuda I, II, III, IV), No. WhatsApp aktif.
- **Kategori Keaktifan**: Pilihan kategori organisasi/prestasi beserta deskripsi jabatan.
- **Upload Berkas Bukti**: Dukungan upload file SK Kepengurusan / Sertifikat / Bukti Pendukung (format PDF, JPG, JPEG, PNG, maks. 5 MB) dengan validasi ukuran dan preview nama berkas.
- **Modal Konfirmasi Berhasil**: Notifikasi sukses instan dengan tombol langsung memantau status menggunakan NIM yang didaftarkan.

### C. Fitur Cek Status (Publik Tanpa Perlu Akun/Login)
- Cukup masukkan **NIM** mahasiswa di kolom pencarian.
- Menampilkan kartu status pendaftaran secara interaktif:
  - 🟡 **"Menunggu Verifikasi Dinas PSDM"**: Berkas tersimpan dan dalam antrean peninjauan oleh verifikator.
  - 🟢 **"Disetujui (Lolos Bintang Aktivis)"**: Tampilan piagam apresiasi digital resmi dengan stempel Kabinet Vismayakriya, badge bintang keemasan, dan rincian verifikasi.
  - 🔴 **"Perlu Revisi Berkas"**: Menampilkan **catatan revisi spesifik dari verifikator PSDM** dan dilengkapi **Form Unggah Berkas Perbaikan langsung** di tempat tanpa mahasiswa harus mengulang pendaftaran dari awal!

### D. Dashboard Admin (Verifikator Dinas PSDM)
- **Keamanan Akses**: Proteksi portal menggunakan kunci verifikator dinas (default: `psdm-fti-2026`).
- **Tabel Rekapitulasi Data Lengkap**: Daftar pendaftar terstruktur per periode wisuda.
- **Filter Cepat**: Filter berdasarkan status (Semua, Menunggu, Disetujui, Revisi), jurusan, periode wisuda, dan kolom pencarian live (Nama/NIM).
- **Preview Berkas Terintegrasi**: Modal peninjauan dokumen PDF/gambar secara langsung tanpa perlu download manual satu per satu.
- **Aksi Verifikasi Cepat**:
  - Tombol **Setujui (Approve)**: Mengubah status menjadi lolos Bintang Aktivis.
  - Tombol **Minta Revisi (Reject/Revision)**: Menampilkan modal input catatan revisi yang akan terbaca langsung oleh mahasiswa di halaman Cek Status.
- **Fitur Ekspor Data (CSV/Excel)**:
  - Unduhan satu klik berformat CSV UTF-8 BOM yang rapi dan kompatibel penuh dengan Microsoft Excel, Google Sheets, dan LibreOffice.
  - Sangat mudah di-*copy-paste* untuk keperluan caption feeds Instagram BAK (@bemkmftiunand) dan laporan ke pimpinan Fakultas FTI.

---

## 🎨 3. Desain & Tampilan (UI/UX)

- **Warna Khas FTI UNAND**:
  - *Deep Navy Blue* (`#0B192C`, `#0B1325`) sebagai warna primer wibawa teknologi.
  - *Electric Cyan* (`#00B4D8`, `#38BDF8`) sebagai aksen modern dan inovatif.
  - *Golden Amber* (`#F59E0B`, `#FBBF24`) sebagai simbol kehormatan Bintang Aktivis Kampus.
- **Glassmorphism & Micro-animations**: Tampilan modern, kartu transparan dengan latar blur halus (*backdrop-filter*), dan animasi transisi responsif.
- **Mobile Responsive**: Tata letak grid adaptif yang nyaman digunakan di smartphone maupun layar monitor desktop.

---

## 📂 4. Struktur Direktori (Clean & Modular Code)

Struktur kode dirancang terpisah berdasarkan tanggung jawab (*separation of concerns*):

```text
Psdm/
├── data/
│   └── bak.db                    # Database SQLite (otomatis dibuat & dimigrasi)
├── uploads/                      # Penyimpanan berkas bukti SK/Sertifikat yang diunggah
│   └── .gitkeep
├── src/
│   ├── config/
│   │   └── database.js           # Koneksi SQLite (better-sqlite3) & inisialisasi tabel
│   ├── controllers/
│   │   ├── registrationController.js  # Logika submit formulir, cek status NIM, re-upload revisi
│   │   └── adminController.js         # Logika verifikasi, filter pendaftar, ekspor CSV
│   ├── middlewares/
│   │   ├── upload.js             # Konfigurasi multer (filter MIME & limit 5MB)
│   │   └── auth.js               # Validasi kunci rahasia admin verifikator PSDM
│   ├── routes/
│   │   ├── registrationRoutes.js # REST API pendaftaran mahasiswa & status
│   │   └── adminRoutes.js        # REST API portal verifikator PSDM
├── public/                       # Antarmuka web frontend
│   ├── css/
│   │   └── styles.css            # Styling kustom, palet warna FTI, & efek animasi
│   ├── js/
│   │   ├── api.js                # Modul client fetch API terpusat
│   │   ├── app.js                # Inisialisasi aplikasi, navigasi tab & routing
│   │   ├── registration.js       # Validasi form mahasiswa & drag-drop file
│   │   ├── status.js             # Render kartu status (Pending, Lolos, Revisi)
│   │   └── admin.js              # Dashboard admin, tabel pendaftar & ekspor CSV
│   └── index.html                # Single-page interface utama
├── test/
│   └── api.test.js               # Skrip health-check pengujian API otomatis
├── .env.example                  # Template variabel lingkungan
├── .gitignore                    # Mengabaikan file database lokal & uploads
├── package.json                  # Dependensi dan script start
├── server.js                     # Server Express & entry point
└── README.md                     # Dokumentasi panduan operasional & pewarisan
```

---

## ⚙️ 5. Cara Instalasi & Menjalankan Lokal

### Prasyarat
- **Node.js** versi 18 ke atas (Direkomendasikan Node.js v20+)
- **npm** (bawaan dari instalasi Node.js)

### Langkah-langkah
1. **Clone repository dari GitHub**:
   ```bash
   git clone https://github.com/FTI-Open-Source-Intiative-FOSI/Psdm.git
   cd Psdm
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Di Windows Command Prompt / PowerShell, Anda juga dapat menduplikasi file tersebut secara langsung).*

   Isi file `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   ADMIN_ACCESS_KEY=psdm-fti-2026
   MAX_FILE_SIZE_MB=5
   ```

4. **Jalankan Aplikasi**:
   - Untuk mode produksi:
     ```bash
     npm start
     ```
   - Untuk mode pengembangan (auto-reload saat kode diedit):
     ```bash
     npm run dev
     ```

5. **Buka di Browser**:
   Akses alamat [http://localhost:3000](http://localhost:3000)

---

## 🔑 6. Kredensial Akses Verifikator Dinas PSDM

- **Kunci Akses Default**: `psdm-fti-2026`
- **Lokasi Penggantian Kunci**: Variabel `ADMIN_ACCESS_KEY` pada file `.env`.
- Pengurus dinas PSDM cukup memasukkan kunci ini pada tab **"Portal Verifikator PSDM"** untuk membuka tabel dan memverifikasi berkas mahasiswa.

---

## 📋 7. Panduan Pewarisan Kepengurusan (Handover Guide)

Bagi pengurus Dinas PSDM & Dinas Ristek BEM KM FTI UNAND pada periode kepengurusan berikutnya:

1. **Memulai Periode Wisuda Baru**:
   - Anda dapat menambahkan opsi periode wisuda baru di file `public/index.html` pada bagian `<select id="regPeriode">` dan `<select id="adminPeriodeFilter">` (misal: "Wisuda I 2027", dst).
   - Data lama tetap tersimpan rapi dan dapat difilter per periode tanpa saling tumpang tindih.

2. **Cadangan / Backup Data**:
   - Seluruh data pendaftaran tersimpan dalam 1 file tunggal: `data/bak.db` (SQLite).
   - Untuk melakukan *backup*, cukup salin file `data/bak.db` dan folder `uploads/` ke Google Drive dinas PSDM.

3. **Mereset Kunci Verifikator**:
   - Cukup ubah nilai `ADMIN_ACCESS_KEY` di file `.env` setiap pergantian ketua/kepengurusan dinas agar akses tetap privat.

4. **Ekspor Data untuk Publikasi Instagram**:
   - Masuk ke portal verifikator, filter status menjadi **"🟢 Disetujui (Lolos)"** dan pilih periode wisuda yang diinginkan.
   - Klik tombol **"Ekspor Rekap (CSV/Excel)"**. File spreadsheet yang diunduh langsung dapat diserahkan ke Dinas Media, Komunikasi, dan Informasi (Medinfo) untuk pembuatan feeds Instagram apresiasi BAK.

---

## 🤝 Kontributor & Ucapan Terima Kasih

- **FOSI (FTI Open Source Initiative)** — Dinas Riset dan Teknologi BEM KM FTI UNAND
- **Dinas Pengembangan Sumber Daya Mahasiswa (PSDM)** — BEM KM FTI UNAND
- **Keluarga Mahasiswa Fakultas Teknologi Informasi (KM FTI)** Universitas Andalas
- Seluruh wisudawan pejuang dan aktivis kampus FTI UNAND

---
*Hidup Mahasiswa! Hidup Rakyat Indonesia! Salam Teknologi Informasi!*

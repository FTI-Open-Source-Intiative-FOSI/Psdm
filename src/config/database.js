const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bak.db');
const db = new Database(dbPath);

// Enable WAL mode untuk performa baca/tulis tinggi dan proteksi concurrency
db.pragma('journal_mode = WAL');

// Buat skema tabel pendaftaran Bintang Aktivis Kampus jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    nim TEXT NOT NULL,
    jurusan TEXT NOT NULL,
    periode_wisuda TEXT NOT NULL,
    no_wa TEXT NOT NULL,
    kategori TEXT DEFAULT 'Keaktifan Mahasiswa',
    detail_kegiatan TEXT,
    total_poin INTEGER DEFAULT 0,
    berkas_url TEXT NOT NULL,
    berkas_original_name TEXT NOT NULL,
    berkas_mime_type TEXT,
    berkas_size INTEGER,
    status TEXT NOT NULL DEFAULT 'PENDING',
    catatan_revisi TEXT,
    tanggal_revisi TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_registrations_nim ON registrations(nim);
  CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
  CREATE INDEX IF NOT EXISTS idx_registrations_periode ON registrations(periode_wisuda);
`);

module.exports = db;

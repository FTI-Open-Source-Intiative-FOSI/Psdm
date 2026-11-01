const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

exports.createRegistration = (req, res) => {
  try {
    const { nama, nim, jurusan, periode_wisuda, no_wa, kategori, detail_kegiatan } = req.body;

    if (!nama || !nim || !jurusan || !periode_wisuda || !no_wa) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi semua kolom formulir yang wajib diisi.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Mohon unggah berkas bukti pendukung (SK / Sertifikat / Portofolio Keaktifan).'
      });
    }

    const cleanNim = nim.trim().toUpperCase();
    const cleanNama = nama.trim();
    const cleanKategori = (kategori && kategori.trim()) ? kategori.trim() : 'Keaktifan Perkuliahan';

    // Cek apakah mahasiswa sudah mendaftar di periode wisuda yang sama
    const existing = db.prepare(
      'SELECT * FROM registrations WHERE nim = ? AND periode_wisuda = ?'
    ).get(cleanNim, periode_wisuda);

    if (existing) {
      // Hapus file yang baru diupload karena duplikat
      fs.unlinkSync(req.file.path);

      if (existing.status === 'APPROVED') {
        return res.status(409).json({
          success: false,
          message: `NIM ${cleanNim} telah terdaftar dan DISIKAPI LOLOS sebagai Bintang Aktivis Kampus untuk ${periode_wisuda}.`
        });
      } else if (existing.status === 'PENDING') {
        return res.status(409).json({
          success: false,
          message: `NIM ${cleanNim} sudah memiliki berkas yang sedang dalam proses verifikasi Dinas PSDM. Silakan pantau di menu Cek Status.`
        });
      } else if (existing.status === 'REVISION') {
        return res.status(409).json({
          success: false,
          message: `Pendaftaran Anda sebelumnya memerlukan revisi. Silakan gunakan menu Cek Status untuk memperbarui berkas tanpa perlu mengisi form ulang.`
        });
      }
    }

    const newUuid = uuidv4();
    const nowIso = new Date().toISOString();
    const berkasUrl = `/uploads/${req.file.filename}`;

    const stmt = db.prepare(`
      INSERT INTO registrations (
        uuid, nama, nim, jurusan, periode_wisuda, no_wa,
        kategori, detail_kegiatan, total_poin, berkas_url, berkas_original_name,
        berkas_mime_type, berkas_size, status, catatan_revisi,
        tanggal_revisi, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'PENDING', NULL, NULL, ?, ?)
    `);

    const result = stmt.run(
      newUuid,
      cleanNama,
      cleanNim,
      jurusan,
      periode_wisuda,
      no_wa.trim(),
      cleanKategori,
      detail_kegiatan ? detail_kegiatan.trim() : '',
      berkasUrl,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      nowIso,
      nowIso
    );

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran Bintang Aktivis Kampus berhasil dikirim! Tim verifikator Dinas PSDM akan segera memvalidasi berkas Anda.',
      data: {
        id: result.lastInsertRowid,
        uuid: newUuid,
        nama: cleanNama,
        nim: cleanNim,
        jurusan,
        periode_wisuda,
        kategori,
        status: 'PENDING',
        created_at: nowIso
      }
    });
  } catch (error) {
    console.error('Error saat submit pendaftaran:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memproses pendaftaran. Silakan coba beberapa saat lagi.'
    });
  }
};

exports.checkStatusByNim = (req, res) => {
  try {
    const rawNim = req.params.nim;
    if (!rawNim) {
      return res.status(400).json({
        success: false,
        message: 'NIM harus disertakan.'
      });
    }

    const cleanNim = rawNim.trim().toUpperCase();

    // Ambil semua pendaftaran mahasiswa berdasarkan NIM, diurutkan dari yang terbaru
    const records = db.prepare(
      'SELECT * FROM registrations WHERE nim = ? ORDER BY id DESC'
    ).all(cleanNim);

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data pendaftaran dengan NIM "${cleanNim}" tidak ditemukan. Pastikan NIM yang dimasukkan sudah benar atau silakan lakukan pendaftaran baru.`
      });
    }

    return res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error saat cek status by NIM:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat status pendaftaran.'
    });
  }
};

exports.reuploadRevision = (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Mohon unggah berkas perbaikan baru.'
      });
    }

    const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);

    if (!registration) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Data pendaftaran tidak ditemukan.'
      });
    }

    const nowIso = new Date().toISOString();
    const berkasUrl = `/uploads/${req.file.filename}`;

    // Hapus file lama jika ada
    if (registration.berkas_url) {
      const oldPath = path.join(__dirname, '../../', registration.berkas_url);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }

    db.prepare(`
      UPDATE registrations
      SET berkas_url = ?,
          berkas_original_name = ?,
          berkas_mime_type = ?,
          berkas_size = ?,
          status = 'PENDING',
          catatan_revisi = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      berkasUrl,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      `[Berkas telah diperbaiki pada ${new Date().toLocaleDateString('id-ID')}] Catatan sebelumnya: ${registration.catatan_revisi || '-'}`,
      nowIso,
      id
    );

    return res.json({
      success: true,
      message: 'Berkas perbaikan berhasil diunggah! Status pendaftaran kini kembali "Menunggu Verifikasi Dinas PSDM".',
      data: {
        id,
        status: 'PENDING',
        berkas_url: berkasUrl
      }
    });
  } catch (error) {
    console.error('Error saat reupload revisi:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({
      success: false,
      message: 'Gagal mengunggah berkas perbaikan.'
    });
  }
};

exports.getStatistics = (req, res) => {
  try {
    const totalPendaftar = db.prepare('SELECT COUNT(*) as count FROM registrations').get().count;
    const totalApproved = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'APPROVED'").get().count;
    const totalPending = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'PENDING'").get().count;
    const totalRevision = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'REVISION'").get().count;

    const perJurusan = db.prepare(`
      SELECT jurusan, COUNT(*) as count,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved
      FROM registrations
      GROUP BY jurusan
    `).all();

    const perKategori = db.prepare(`
      SELECT kategori, COUNT(*) as count
      FROM registrations
      GROUP BY kategori
    `).all();

    return res.json({
      success: true,
      data: {
        total: totalPendaftar,
        approved: totalApproved,
        pending: totalPending,
        revision: totalRevision,
        jurusan: perJurusan,
        kategori: perKategori
      }
    });
  } catch (error) {
    console.error('Error saat mengambil statistik:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data statistik.'
    });
  }
};


const db = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.verifyAuth = (req, res) => {
  return res.json({
    success: true,
    message: 'Otentikasi Kunci Verifikator PSDM Berhasil.',
    role: 'ADMIN_PSDM'
  });
};

exports.getRegistrations = (req, res) => {
  try {
    const { search, status, periode, jurusan, kategori } = req.query;

    let query = 'SELECT * FROM registrations WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      query += ' AND (nama LIKE ? OR nim LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (periode && periode !== 'ALL') {
      query += ' AND periode_wisuda = ?';
      params.push(periode);
    }

    if (jurusan && jurusan !== 'ALL') {
      query += ' AND jurusan = ?';
      params.push(jurusan);
    }

    if (kategori && kategori !== 'ALL') {
      query += ' AND kategori = ?';
      params.push(kategori);
    }

    query += ' ORDER BY id DESC';

    const rows = db.prepare(query).all(...params);

    // Ambil juga list unik periode wisuda untuk dropdown filter
    const distinctPeriodes = db.prepare('SELECT DISTINCT periode_wisuda FROM registrations ORDER BY periode_wisuda DESC').all();

    return res.json({
      success: true,
      data: rows,
      meta: {
        total: rows.length,
        periodes: distinctPeriodes.map(p => p.periode_wisuda)
      }
    });
  } catch (error) {
    console.error('Error saat mengambil daftar pendaftar admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat data pendaftaran.'
    });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_revisi, total_poin } = req.body;

    if (!['APPROVED', 'REVISION', 'PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status verifikasi tidak valid. Pilih antara APPROVED, REVISION, atau PENDING.'
      });
    }

    if (status === 'REVISION' && (!catatan_revisi || catatan_revisi.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Untuk status revisi, wajib menyertakan catatan penjelasan bagi mahasiswa.'
      });
    }

    const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftar tidak ditemukan.'
      });
    }

    const nowIso = new Date().toISOString();
    const catatan = status === 'REVISION' ? catatan_revisi.trim() : (status === 'APPROVED' ? (catatan_revisi && catatan_revisi.trim() ? catatan_revisi.trim() : 'Memenuhi syarat kelulusan Bintang Aktivis Kampus FTI UNAND') : null);
    const poin = total_poin !== undefined && total_poin !== null ? parseInt(total_poin, 10) || 0 : (registration.total_poin || 0);

    db.prepare(`
      UPDATE registrations
      SET status = ?,
          catatan_revisi = ?,
          total_poin = ?,
          tanggal_revisi = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      status,
      catatan,
      poin,
      nowIso,
      nowIso,
      id
    );

    return res.json({
      success: true,
      message: `Status pendaftaran atas nama "${registration.nama}" berhasil diperbarui menjadi ${status} (Total Poin: ${poin}).`,
      data: {
        id,
        status,
        catatan_revisi: catatan,
        total_poin: poin,
        updated_at: nowIso
      }
    });
  } catch (error) {
    console.error('Error saat memperbarui status pendaftar:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status pendaftaran.'
    });
  }
};

exports.exportCsv = (req, res) => {
  try {
    const { status, periode, jurusan } = req.query;

    let query = 'SELECT * FROM registrations WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (periode && periode !== 'ALL') {
      query += ' AND periode_wisuda = ?';
      params.push(periode);
    }
    if (jurusan && jurusan !== 'ALL') {
      query += ' AND jurusan = ?';
      params.push(jurusan);
    }

    query += ' ORDER BY periode_wisuda ASC, jurusan ASC, nama ASC';

    const rows = db.prepare(query).all(...params);

    // Escape CSV cell helper
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'No',
      'Nama Lengkap',
      'NIM',
      'Jurusan',
      'Periode Wisuda',
      'No WhatsApp',
      'Rekam Jejak Keaktifan',
      'Total Poin Penilaian BAK',
      'Status Verifikasi',
      'Catatan Verifikator',
      'Nama Berkas Bukti',
      'Tanggal Pendaftaran'
    ];

    let csvContent = '\uFEFF'; // UTF-8 BOM untuk Microsoft Excel & Windows compatibility
    csvContent += headers.join(',') + '\r\n';

    rows.forEach((row, index) => {
      let statusLabel = 'Menunggu Verifikasi';
      if (row.status === 'APPROVED') statusLabel = 'Disetujui (Lolos Bintang Aktivis)';
      if (row.status === 'REVISION') statusLabel = 'Perlu Revisi';

      const rowData = [
        index + 1,
        escapeCsv(row.nama),
        escapeCsv(`'${row.nim}`), // Tambahkan prefix ' agar Excel tidak memotong leading zero
        escapeCsv(row.jurusan),
        escapeCsv(row.periode_wisuda),
        escapeCsv(`'${row.no_wa}`),
        escapeCsv(row.detail_kegiatan || row.kategori || '-'),
        escapeCsv(row.total_poin || 0),
        escapeCsv(statusLabel),
        escapeCsv(row.catatan_revisi || '-'),
        escapeCsv(row.berkas_original_name || '-'),
        escapeCsv(row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-')
      ];
      csvContent += rowData.join(',') + '\r\n';
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Rekap_Bintang_Aktivis_FTI_UNAND_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error saat ekspor CSV:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengekspor data pendaftaran.'
    });
  }
};

exports.deleteRegistration = (req, res) => {
  try {
    const { id } = req.params;
    const item = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan.'
      });
    }

    if (item.berkas_url) {
      const filePath = path.join(__dirname, '../../', item.berkas_url);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    db.prepare('DELETE FROM registrations WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: `Data pendaftaran ${item.nama} (${item.nim}) berhasil dihapus.`
    });
  } catch (error) {
    console.error('Error saat menghapus data:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data pendaftaran.'
    });
  }
};


function adminAuth(req, res, next) {
  const masterKey = process.env.ADMIN_ACCESS_KEY || 'psdm-fti-2026';
  const providedKey = req.headers['x-admin-key'] || req.query.adminKey || (req.body && req.body.adminKey);

  if (!providedKey || providedKey !== masterKey) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Kunci Verifikator PSDM tidak valid atau belum dimasukkan.'
    });
  }

  next();
}

module.exports = adminAuth;


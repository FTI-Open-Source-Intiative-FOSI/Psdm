const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

// Proteksi seluruh route admin dengan kunci verifikator
router.use(adminAuth);

// Verifikasi kunci login admin
router.post('/login', adminController.verifyAuth);

// Ambil semua data pendaftaran dengan filter & search
router.get('/registrations', adminController.getRegistrations);

// Update status verifikasi (APPROVE / REVISION)
router.patch('/registrations/:id/status', adminController.updateStatus);

// Ekspor data ke CSV/Excel untuk Instagram Feeds & Dekanat
router.get('/export/csv', adminController.exportCsv);

// Hapus pendaftaran (maintenance)
router.delete('/registrations/:id', adminController.deleteRegistration);

module.exports = router;


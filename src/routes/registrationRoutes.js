const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const registrationController = require('../controllers/registrationController');

// Submit pendaftaran baru oleh mahasiswa (publik)
router.post('/', upload.single('berkas'), registrationController.createRegistration);

// Cek status pendaftaran berdasarkan NIM (publik tanpa login)
router.get('/status/:nim', registrationController.checkStatusByNim);

// Upload berkas perbaikan untuk status REVISION (publik tanpa login)
router.post('/:id/revision', upload.single('berkas'), registrationController.reuploadRevision);

// Statistik umum (publik untuk landing page & dashboard)
router.get('/stats', registrationController.getStatistics);

module.exports = router;


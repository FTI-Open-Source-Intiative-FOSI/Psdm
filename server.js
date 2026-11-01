require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const registrationRoutes = require('./src/routes/registrationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Pastikan direktori uploads tersedia
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan file static untuk antarmuka web
app.use(express.static(path.join(__dirname, 'public')));

// Sajikan file berkas uploads (read-only)
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// SPA fallback handler yang aman dan kompatibel
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Ukuran berkas melebihi batas maksimal (Maksimal 5MB).'
    });
  }
  return res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server.'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 BINTANG AKTIVIS KAMPUS (BAK) BEM KM FTI UNAND`);
  console.log(`🏛️ Kabinet Vismayakriya | Dinas PSDM x FOSI Dinas Ristek`);
  console.log(`🌐 Server aktif di: http://localhost:${PORT}`);
  console.log(`🔑 Kunci Admin PSDM: ${process.env.ADMIN_ACCESS_KEY || 'psdm-fti-2026'}`);
  console.log(`=======================================================`);
});

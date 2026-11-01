// Script test cepat saat server berjalan
// Jalankan dengan: node test/api.test.js saat server aktif di port 3000

async function runHealthCheck() {
  const baseUrl = 'http://localhost:3000/api';
  console.log('--- HEALTH CHECK API BINTANG AKTIVIS KAMPUS ---');
  try {
    const res = await fetch(`${baseUrl}/registrations/stats`);
    const data = await res.json();
    console.log('✓ API Server Aktif:', data.success ? 'OK' : 'FAIL');
    console.log('✓ Total Pendaftar:', data.data.total);
    console.log('✓ Status Verifikasi:', {
      Lolos: data.data.approved,
      Menunggu: data.data.pending,
      Revisi: data.data.revision
    });
  } catch (err) {
    console.error('Koneksi gagal. Pastikan server sudah dijalankan (npm start).', err.message);
  }
}

runHealthCheck();

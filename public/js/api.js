/**
 * Modul Client API REST - Bintang Aktivis Kampus FTI UNAND
 */
const API = {
  baseUrl: '/api',

  // Ambil token admin dari sessionStorage jika ada
  getAdminKey() {
    return sessionStorage.getItem('psdm_admin_key') || '';
  },

  setAdminKey(key) {
    sessionStorage.setItem('psdm_admin_key', key);
  },

  clearAdminKey() {
    sessionStorage.removeItem('psdm_admin_key');
  },

  // 1. Submit Pendaftaran Baru (Multipart FormData)
  async submitRegistration(formData) {
    const res = await fetch(`${this.baseUrl}/registrations`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // 2. Cek Status Pendaftaran Berdasarkan NIM
  async checkStatus(nim) {
    const cleanNim = encodeURIComponent(nim.trim());
    const res = await fetch(`${this.baseUrl}/registrations/status/${cleanNim}`);
    return res.json();
  },

  // 3. Upload Berkas Perbaikan Revisi
  async submitRevision(id, formData) {
    const res = await fetch(`${this.baseUrl}/registrations/${id}/revision`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // 4. Ambil Data Statistik Publik
  async getStatistics() {
    const res = await fetch(`${this.baseUrl}/registrations/stats`);
    return res.json();
  },

  // 5. Verifikasi Kunci Admin PSDM
  async adminLogin(key) {
    const res = await fetch(`${this.baseUrl}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': key
      }
    });
    return res.json();
  },

  // 6. Ambil Daftar Rekap Pendaftar untuk Admin
  async getAdminRegistrations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.periode) params.append('periode', filters.periode);
    if (filters.jurusan) params.append('jurusan', filters.jurusan);
    if (filters.kategori) params.append('kategori', filters.kategori);

    const res = await fetch(`${this.baseUrl}/admin/registrations?${params.toString()}`, {
      headers: {
        'x-admin-key': this.getAdminKey()
      }
    });
    return res.json();
  },

  // 7. Update Status Verifikasi (Approve / Revisi)
  async updateRegistrationStatus(id, status, catatan_revisi = '', total_poin = 0) {
    const res = await fetch(`${this.baseUrl}/admin/registrations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': this.getAdminKey()
      },
      body: JSON.stringify({ status, catatan_revisi, total_poin })
    });
    return res.json();
  },

  // 8. Hapus Data Pendaftar
  async deleteRegistration(id) {
    const res = await fetch(`${this.baseUrl}/admin/registrations/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': this.getAdminKey()
      }
    });
    return res.json();
  },

  // 9. URL Ekspor CSV
  getExportCsvUrl(filters = {}) {
    const params = new URLSearchParams();
    params.append('adminKey', this.getAdminKey());
    if (filters.status) params.append('status', filters.status);
    if (filters.periode) params.append('periode', filters.periode);
    if (filters.jurusan) params.append('jurusan', filters.jurusan);
    return `${this.baseUrl}/admin/export/csv?${params.toString()}`;
  }
};


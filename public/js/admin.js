/**
 * Modul Dashboard Admin (Verifikator Dinas PSDM)
 */
const AdminModule = {
  currentFilters: {
    search: '',
    status: 'ALL',
    periode: 'ALL',
    jurusan: 'ALL'
  },
  activeRevisionId: null,
  activeApproveId: null,

  init() {
    this.bindEvents();
    this.checkSession();
  },

  checkSession() {
    const key = API.getAdminKey();
    if (key) {
      this.showAdminDashboard();
      this.loadDashboardData();
    } else {
      this.showLoginForm();
    }
  },

  bindEvents() {
    // Form Login Admin
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Logout
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        API.clearAdminKey();
        this.showLoginForm();
      });
    }

    // Filter events
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilters.search = e.target.value;
        this.debounceFilter();
      });
    }

    const statusFilter = document.getElementById('adminStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.currentFilters.status = e.target.value;
        this.loadRegistrationsTable();
      });
    }

    const jurusanFilter = document.getElementById('adminJurusanFilter');
    if (jurusanFilter) {
      jurusanFilter.addEventListener('change', (e) => {
        this.currentFilters.jurusan = e.target.value;
        this.loadRegistrationsTable();
      });
    }

    const periodeFilter = document.getElementById('adminPeriodeFilter');
    if (periodeFilter) {
      periodeFilter.addEventListener('change', (e) => {
        this.currentFilters.periode = e.target.value;
        this.loadRegistrationsTable();
      });
    }

    // Ekspor CSV
    const exportBtn = document.getElementById('btnExportCsv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.handleExportCsv();
      });
    }

    // Modal Approve Submit
    const approveForm = document.getElementById('adminApproveForm');
    if (approveForm) {
      approveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitApproveDecision();
      });
    }

    // Modal Revisi Submit
    const revisionModalForm = document.getElementById('adminRevisionModalForm');
    if (revisionModalForm) {
      revisionModalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitRevisionDecision();
      });
    }

    // Modal Revisi Close
    const closeRevisionBtn = document.getElementById('closeRevisionModalBtn');
    if (closeRevisionBtn) {
      closeRevisionBtn.addEventListener('click', () => {
        this.closeRevisionModal();
      });
    }

    // Modal Preview Close
    const closePreviewBtn = document.getElementById('closePreviewModalBtn');
    if (closePreviewBtn) {
      closePreviewBtn.addEventListener('click', () => {
        const previewModal = document.getElementById('filePreviewModal');
        if (previewModal) previewModal.classList.add('hidden');
      });
    }
  },

  debounceTimer: null,
  debounceFilter() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.loadRegistrationsTable();
    }, 300);
  },

  showLoginForm() {
    const loginSection = document.getElementById('adminLoginSection');
    const dashboardSection = document.getElementById('adminDashboardSection');
    if (loginSection) loginSection.classList.remove('hidden');
    if (dashboardSection) dashboardSection.classList.add('hidden');
  },

  showAdminDashboard() {
    const loginSection = document.getElementById('adminLoginSection');
    const dashboardSection = document.getElementById('adminDashboardSection');
    if (loginSection) loginSection.classList.add('hidden');
    if (dashboardSection) dashboardSection.classList.remove('hidden');
  },

  async handleLogin() {
    const keyInput = document.getElementById('adminAccessKeyInput');
    const errorEl = document.getElementById('adminLoginError');
    const key = keyInput ? keyInput.value.trim() : '';

    if (!key) {
      if (errorEl) {
        errorEl.textContent = 'Harap masukkan kunci akses verifikator.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    try {
      const res = await API.adminLogin(key);
      if (res.success) {
        API.setAdminKey(key);
        if (errorEl) errorEl.classList.add('hidden');
        if (keyInput) keyInput.value = '';
        this.showAdminDashboard();
        this.loadDashboardData();
      } else {
        if (errorEl) {
          errorEl.textContent = res.message || 'Kunci akses salah.';
          errorEl.classList.remove('hidden');
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'Gagal terhubung ke server.';
        errorEl.classList.remove('hidden');
      }
    }
  },

  async loadDashboardData() {
    await Promise.all([
      this.loadStatsCards(),
      this.loadRegistrationsTable()
    ]);
  },

  async loadStatsCards() {
    try {
      const res = await API.getStatistics();
      if (res.success && res.data) {
        const d = res.data;
        const totalEl = document.getElementById('statTotalPendaftar');
        const approvedEl = document.getElementById('statApproved');
        const pendingEl = document.getElementById('statPending');
        const revisionEl = document.getElementById('statRevision');

        if (totalEl) totalEl.textContent = d.total;
        if (approvedEl) approvedEl.textContent = d.approved;
        if (pendingEl) pendingEl.textContent = d.pending;
        if (revisionEl) revisionEl.textContent = d.revision;
      }
    } catch (e) {
      console.error('Error stats:', e);
    }
  },

  async loadRegistrationsTable() {
    const tbody = document.getElementById('adminTableBody');
    const countBadge = document.getElementById('adminFilteredCount');

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400">
            <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2"></i>
            Memuat data pendaftar...
          </td>
        </tr>
      `;
      if (window.lucide) lucide.createIcons();
    }

    try {
      const res = await API.getAdminRegistrations(this.currentFilters);

      if (!res.success) {
        if (res.status === 401) {
          API.clearAdminKey();
          this.showLoginForm();
          return;
        }
        throw new Error(res.message);
      }

      const list = res.data || [];
      if (countBadge) countBadge.textContent = `${list.length} pendaftar`;

      // Update periode dropdown jika ada periode baru
      if (res.meta && res.meta.periodes) {
        this.updatePeriodeDropdown(res.meta.periodes);
      }

      if (list.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-10 text-slate-400">
              <i data-lucide="inbox" class="w-8 h-8 mx-auto text-slate-500 mb-2"></i>
              Belum ada data pendaftar.
            </td>
          </tr>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      let html = '';
      list.forEach((item, index) => {
        let statusBadge = '';
        if (item.status === 'APPROVED') {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold badge-approved inline-flex items-center gap-1">✓ Lolos BAK</span>`;
        } else if (item.status === 'REVISION') {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold badge-revision inline-flex items-center gap-1">⚠ Perlu Revisi</span>`;
        } else {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold badge-pending inline-flex items-center gap-1">⏳ Menunggu</span>`;
        }

        const safeName = item.nama.replace(/"/g, '&quot;');
        const poin = item.total_poin !== undefined ? item.total_poin : 0;

        html += `
          <tr class="border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors">
            <td class="py-4 px-4 text-xs font-mono text-slate-400">${index + 1}</td>
            <td class="py-4 px-4">
              <div class="font-bold text-white text-sm">${item.nama}</div>
              <div class="text-xs font-mono text-cyan-400">NIM: ${item.nim}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">WA: <a href="https://wa.me/${item.no_wa.replace(/[^0-9]/g, '')}" target="_blank" class="text-emerald-400 hover:underline">${item.no_wa}</a></div>
            </td>
            <td class="py-4 px-4">
              <div class="text-xs font-semibold text-slate-200">${item.jurusan}</div>
              <div class="text-[11px] text-cyan-300">${item.periode_wisuda}</div>
            </td>
            <td class="py-4 px-4">
              <div class="text-xs text-slate-300 max-w-xs whitespace-pre-line bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                ${item.detail_kegiatan || '-'}
              </div>
            </td>
            <td class="py-4 px-4">
              <button onclick="AdminModule.previewFile('${item.berkas_url}', '${safeName}', '${item.berkas_mime_type || ''}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 text-xs font-medium transition-colors">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                <span>Cek Berkas</span>
              </button>
            </td>
            <td class="py-4 px-4">
              <div class="flex items-center gap-2 mb-1">
                ${statusBadge}
                <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold font-mono text-xs border border-amber-500/30">
                  ${poin} Poin
                </span>
              </div>
              ${item.catatan_revisi ? `<div class="text-[11px] text-slate-400 italic max-w-[200px] truncate" title="${item.catatan_revisi}">"${item.catatan_revisi}"</div>` : ''}
            </td>
            <td class="py-4 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="AdminModule.openApproveModal(${item.id}, '${safeName}', ${poin})" title="Setujui & Input Poin Penilaian" class="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors border border-emerald-500/30">
                  <i data-lucide="check" class="w-4 h-4"></i>
                </button>
                <button onclick="AdminModule.openRevisionModal(${item.id}, '${safeName}', '${(item.catatan_revisi || '').replace(/'/g, "\\'")}')" title="Minta Revisi Berkas" class="p-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-colors border border-red-500/30">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button onclick="AdminModule.confirmDelete(${item.id}, '${safeName}')" title="Hapus Data" class="p-2 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 transition-colors">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
      if (window.lucide) lucide.createIcons();
    } catch (err) {
      console.error(err);
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-8 text-red-400">
              Gagal memuat data pendaftar.
            </td>
          </tr>
        `;
      }
    }
  },

  updatePeriodeDropdown(periodes) {
    const sel = document.getElementById('adminPeriodeFilter');
    if (!sel) return;
    const currentVal = sel.value;
    let html = '<option value="ALL">Semua Periode Wisuda</option>';
    periodes.forEach(p => {
      html += `<option value="${p}">${p}</option>`;
    });
    sel.innerHTML = html;
    sel.value = currentVal;
  },

  previewFile(url, nama, mime) {
    const modal = document.getElementById('filePreviewModal');
    const container = document.getElementById('filePreviewContent');
    const title = document.getElementById('filePreviewTitle');
    const downloadBtn = document.getElementById('filePreviewDownloadBtn');

    if (!modal || !container) return;

    if (title) title.textContent = `Berkas Bukti: ${nama}`;
    if (downloadBtn) downloadBtn.href = url;

    const isPdf = url.toLowerCase().endsWith('.pdf') || (mime && mime.includes('pdf'));

    if (isPdf) {
      container.innerHTML = `
        <iframe src="${url}" class="w-full h-[70vh] rounded-xl border border-slate-800" frameborder="0"></iframe>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center justify-center p-4">
          <img src="${url}" alt="Bukti" class="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl" />
        </div>
      `;
    }

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  openApproveModal(id, nama, currentPoin = 0) {
    this.activeApproveId = id;
    const modal = document.getElementById('adminApproveModal');
    const title = document.getElementById('approveModalNama');
    const poinInput = document.getElementById('approvePoinInput');
    const noteInput = document.getElementById('approveNoteInput');

    if (title) title.textContent = nama;
    if (poinInput) poinInput.value = currentPoin || '';
    if (noteInput) noteInput.value = '';
    if (modal) modal.classList.remove('hidden');
  },

  closeApproveModal() {
    this.activeApproveId = null;
    const modal = document.getElementById('adminApproveModal');
    if (modal) modal.classList.add('hidden');
  },

  async submitApproveDecision() {
    if (!this.activeApproveId) return;

    const poinInput = document.getElementById('approvePoinInput');
    const noteInput = document.getElementById('approveNoteInput');
    const poin = poinInput ? parseInt(poinInput.value, 10) || 0 : 0;
    const note = noteInput ? noteInput.value.trim() : '';

    try {
      const res = await API.updateRegistrationStatus(
        this.activeApproveId,
        'APPROVED',
        note || `Memenuhi syarat kelulusan BAK Fakultas (Total Poin: ${poin}).`,
        poin
      );

      if (res.success) {
        alert(res.message);
        this.closeApproveModal();
        this.loadDashboardData();
      } else {
        alert(res.message || 'Gagal menyetujui pendaftaran.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan jaringan.');
    }
  },

  openRevisionModal(id, nama, existingNote) {
    this.activeRevisionId = id;
    const modal = document.getElementById('adminRevisionModal');
    const title = document.getElementById('revisionModalNama');
    const textarea = document.getElementById('revisionNoteInput');

    if (title) title.textContent = nama;
    if (textarea) textarea.value = existingNote || '';
    if (modal) modal.classList.remove('hidden');
  },

  closeRevisionModal() {
    this.activeRevisionId = null;
    const modal = document.getElementById('adminRevisionModal');
    if (modal) modal.classList.add('hidden');
  },

  async submitRevisionDecision() {
    if (!this.activeRevisionId) return;

    const textarea = document.getElementById('revisionNoteInput');
    const note = textarea ? textarea.value.trim() : '';

    if (!note) {
      alert('Mohon tuliskan catatan revisi yang spesifik agar mahasiswa mengetahui berkas apa yang harus diperbaiki.');
      return;
    }

    try {
      const res = await API.updateRegistrationStatus(this.activeRevisionId, 'REVISION', note);
      if (res.success) {
        alert('Status berhasil diubah menjadi PERLU REVISI dan catatan telah disimpan.');
        this.closeRevisionModal();
        this.loadDashboardData();
      } else {
        alert(res.message || 'Gagal mengirim revisi.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan.');
    }
  },

  async confirmDelete(id, nama) {
    if (!confirm(`Hapus pendaftaran atas nama "${nama}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await API.deleteRegistration(id);
      if (res.success) {
        alert('Data berhasil dihapus.');
        this.loadDashboardData();
      } else {
        alert(res.message || 'Gagal menghapus data.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan.');
    }
  },

  handleExportCsv() {
    const url = API.getExportCsvUrl(this.currentFilters);
    window.location.href = url;
  }
};

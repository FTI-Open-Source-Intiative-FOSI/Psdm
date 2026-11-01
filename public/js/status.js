/**
 * Modul Cek Status Pendaftaran BAK (Tanpa Login Mahasiswa)
 */
const StatusModule = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const searchBtn = document.getElementById('btnCheckStatus');
    const inputNim = document.getElementById('statusSearchNim');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.handleCheckStatus();
      });
    }

    if (inputNim) {
      inputNim.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleCheckStatus();
        }
      });
    }
  },

  async handleCheckStatus() {
    const inputNim = document.getElementById('statusSearchNim');
    const container = document.getElementById('statusResultContainer');
    const emptyState = document.getElementById('statusEmptyState');

    const nim = inputNim ? inputNim.value.trim() : '';

    if (!nim) {
      alert('Silakan masukkan NIM Anda terlebih dahulu.');
      return;
    }

    // Tampilkan loading state
    container.innerHTML = `
      <div class="bg-brand-surface rounded-xl p-8 text-center border border-slate-800 animate-pulse font-mono-tech text-xs">
        <i data-lucide="loader-2" class="w-6 h-6 text-brand-cyan animate-spin mx-auto mb-2"></i>
        <div class="text-slate-300">SEARCHING DOSSIER // NIM: ${nim}...</div>
      </div>
    `;
    container.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (window.lucide) lucide.createIcons();

    try {
      const res = await API.checkStatus(nim);

      if (res.success && res.data && res.data.length > 0) {
        this.renderStatusCards(res.data);
      } else {
        container.innerHTML = `
          <div class="bg-brand-surface rounded-2xl p-8 sm:p-10 text-center border border-amber-500/30">
            <div class="w-12 h-12 mx-auto rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-3">
              <i data-lucide="alert-circle" class="w-6 h-6"></i>
            </div>
            <div class="font-mono-tech text-xs text-amber-400 mb-1">// STATUS: NOT_FOUND</div>
            <h3 class="font-display text-xl font-bold text-white mb-2">Data Tidak Ditemukan</h3>
            <p class="text-slate-400 max-w-md mx-auto mb-6 text-xs leading-relaxed">
              NIM <span class="text-amber-300 font-mono-tech font-bold">${nim}</span> belum terdaftar di sistem Bintang Aktivis Kampus FTI UNAND.
            </p>
            <button onclick="App.switchTab('register')" class="px-5 py-2.5 bg-brand-cyan hover:bg-cyan-400 text-slate-950 font-mono-tech font-bold rounded-lg text-xs transition-colors">
              DAFTAR BAK FTI SEKARANG
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <div class="bg-brand-surface rounded-xl p-8 text-center border border-rose-500/30 font-mono-tech text-xs">
          <i data-lucide="x-circle" class="w-6 h-6 text-rose-400 mx-auto mb-2"></i>
          <div class="text-white font-bold mb-1">KONEKSI GAGAL</div>
          <div class="text-slate-400">Tidak dapat terhubung ke server verifikator.</div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  },

  renderStatusCards(records) {
    const container = document.getElementById('statusResultContainer');
    let html = '';

    records.forEach((record) => {
      if (record.status === 'APPROVED') {
        html += this.renderApprovedCard(record);
      } else if (record.status === 'REVISION') {
        html += this.renderRevisionCard(record);
      } else {
        html += this.renderPendingCard(record);
      }
    });

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  },

  renderApprovedCard(record) {
    return `
      <div class="plaque-honor rounded-2xl p-6 sm:p-10 mb-8 overflow-hidden">
        <div class="plaque-corner-tl"></div>
        <div class="plaque-corner-tr"></div>
        <div class="plaque-corner-bl"></div>
        <div class="plaque-corner-br"></div>

        <!-- Header Plakat -->
        <div class="text-center pb-6 border-b border-amber-500/20 relative">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/40 text-[10px] font-mono-tech text-amber-300 font-bold mb-3 tracking-widest uppercase">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            STATUS: DISETUJUI • RESMI LOLOS BAK FTI
          </div>
          <div class="text-xs font-mono-tech text-amber-400/80 tracking-widest uppercase mb-1">
            BEM KM FTI UNIVERSITAS ANDALAS • KABINET VISMAYAKRIYA
          </div>
          <h3 class="font-display text-2xl sm:text-4xl font-black text-white tracking-tight">
            PIAGAM KEHORMATAN <br>
            <span class="text-brand-gold">BINTANG AKTIVIS KAMPUS FAKULTAS</span>
          </h3>
          <p class="text-xs text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
            Dianugerahkan sebagai rekognisi apresiasi tertinggi atas rekam jejak dedikasi, keaktifan, dan prestasi di lingkungan Fakultas Teknologi Informasi kepada:
          </p>
        </div>

        <!-- Badan Penerima Plakat -->
        <div class="py-6 text-center">
          <div class="inline-block p-4 sm:p-6 rounded-xl bg-[#081120] border border-amber-500/30 max-w-md w-full shadow-2xl">
            <div class="font-display text-xl sm:text-2xl font-black text-brand-cyan tracking-wide">
              ${record.nama}
            </div>
            <div class="font-mono-tech text-xs text-slate-300 mt-1">
              NIM: <span class="text-white font-bold">${record.nim}</span> • ${record.jurusan}
            </div>
            <div class="font-mono-tech text-[11px] text-amber-400 mt-0.5">
              ${record.periode_wisuda}
            </div>

            <!-- Nilai Poin Terverifikasi -->
            <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-2">
              <span class="font-mono-tech text-xs text-slate-400">TOTAL POIN BAK:</span>
              <span class="font-mono-tech text-sm font-black text-brand-gold px-3 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                ${record.total_poin || 0} POIN
              </span>
            </div>
          </div>
        </div>

        <!-- Rekam Jejak Detail -->
        <div class="bg-[#060D19] p-4 rounded-xl border border-slate-800 text-xs font-mono-tech max-w-2xl mx-auto mb-6">
          <div class="text-[10px] text-cyan-400 uppercase tracking-wider mb-1.5">// REKAM JEJAK KEAKTIFAN TERVERIFIKASI:</div>
          <div class="text-slate-200 whitespace-pre-line leading-relaxed font-sans text-xs">
            ${record.detail_kegiatan || '-'}
          </div>
        </div>

        <!-- Footer Plakat -->
        <div class="pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-tech text-xs">
          <div class="text-slate-400 text-[11px] text-center sm:text-left">
            <div>DIVERIFIKASI RESMI OLEH: <span class="text-white font-bold">DINAS PSDM BEM KM FTI UNAND</span></div>
            <div class="text-emerald-400 text-[10px] mt-0.5">✓ SK Penetapan Bintang Aktivis Kampus Fakultas</div>
          </div>

          <div class="flex items-center gap-2">
            <a href="${record.berkas_url}" target="_blank" class="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5">
              <i data-lucide="file-check" class="w-3.5 h-3.5"></i> Berkas Bukti
            </a>
            <button onclick="window.print()" class="px-3.5 py-2 rounded bg-brand-gold hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-950/30">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i> Cetak Piagam
            </button>
          </div>
        </div>

      </div>
    `;
  },

  renderRevisionCard(record) {
    return `
      <div class="bg-brand-surface rounded-2xl p-6 sm:p-8 border border-rose-500/40 relative overflow-hidden mb-6 shadow-2xl">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/40 font-mono-tech text-xs font-bold text-rose-300">
              ⚠ STATUS: PERLU REVISI BERKAS
            </span>
            <h3 class="font-display text-xl font-bold text-white mt-1.5">${record.nama}</h3>
          </div>
          <div class="font-mono-tech text-xs text-right">
            <div class="text-slate-400">NIM: <span class="text-white">${record.nim}</span></div>
            <div class="text-cyan-400 text-[11px]">${record.periode_wisuda}</div>
          </div>
        </div>

        <!-- Box Catatan Revisi Admin -->
        <div class="mt-5 p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
          <div class="font-mono-tech text-[10px] text-rose-400 uppercase tracking-wider mb-1 font-bold">
            // CATATAN PERBAIKAN DARI VERIFIKATOR DINAS PSDM:
          </div>
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            "${record.catatan_revisi || 'Berkas bukti fisik kurang lengkap. Harap tinjau ulang lampiran SK / Sertifikat Anda.'}"
          </p>
        </div>

        <!-- Rangkuman Keaktifan Saat Ini -->
        <div class="my-4 p-3.5 bg-[#060D19] rounded-xl border border-slate-800 font-mono-tech text-xs">
          <div class="text-slate-400 text-[10px] mb-1">RANGKUMAN KEAKTIFAN TERCATAT:</div>
          <div class="text-slate-200 font-sans whitespace-pre-line text-xs">${record.detail_kegiatan || '-'}</div>
        </div>

        <!-- Form Upload Perbaikan -->
        <div class="mt-5 p-4 sm:p-5 rounded-xl bg-[#081120] border border-slate-700/80">
          <div class="font-mono-tech text-xs font-bold text-white mb-1 flex items-center gap-2">
            <i data-lucide="upload-cloud" class="w-4 h-4 text-cyan-400"></i>
            UNGGAH BERKAS PERBAIKAN SEKARANG
          </div>
          <p class="text-xs text-slate-400 mb-3">
            Tidak perlu mendaftar ulang. Cukup pilih berkas perbaikan terbaru (PDF / JPG / PNG, maks 5MB) dan kirimkan kembali.
          </p>

          <form id="revisionForm_${record.id}" onsubmit="StatusModule.handleRevisionSubmit(event, ${record.id})" class="flex flex-col sm:flex-row items-center gap-2.5">
            <input type="file" id="revisionFileInput_${record.id}" required accept=".pdf,.jpg,.jpeg,.png"
                   class="tech-input font-mono-tech w-full text-xs text-slate-300 p-2 rounded-lg cursor-pointer file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-mono-tech file:bg-cyan-500/20 file:text-cyan-300" />
            <button type="submit" id="revisionBtn_${record.id}" class="w-full sm:w-auto flex-shrink-0 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono-tech font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40">
              <i data-lucide="send" class="w-3.5 h-3.5"></i>
              <span>KIRIM REVISI</span>
            </button>
          </form>
        </div>
      </div>
    `;
  },

  renderPendingCard(record) {
    return `
      <div class="bg-brand-surface rounded-2xl p-6 sm:p-8 border border-amber-500/40 relative overflow-hidden mb-6 shadow-2xl">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/40 font-mono-tech text-xs font-bold text-amber-300">
              ⏳ STATUS: MENUNGGU VERIFIKASI PSDM
            </span>
            <h3 class="font-display text-xl font-bold text-white mt-1.5">${record.nama}</h3>
          </div>
          <div class="font-mono-tech text-xs text-right">
            <div class="text-slate-400">NIM: <span class="text-white">${record.nim}</span></div>
            <div class="text-cyan-400 text-[11px]">${record.periode_wisuda}</div>
          </div>
        </div>

        <div class="mt-5 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
          <i data-lucide="clock" class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5"></i>
          <p class="text-xs text-slate-300 leading-relaxed font-sans">
            Dokumen pendaftaran dan berkas pendukung Anda telah tercatat di sistem. Saat ini pengurus <strong class="text-amber-200">Dinas PSDM BEM KM FTI UNAND</strong> sedang memvalidasi berkas dan menghitung perolehan poin. Pantau status ini secara berkala.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 font-mono-tech text-xs">
          <div class="p-3 bg-[#060D19] rounded-lg border border-slate-800">
            <span class="text-slate-500 block text-[10px]">PROGRAM STUDI</span>
            <span class="text-white font-semibold">${record.jurusan}</span>
          </div>
          <div class="p-3 bg-[#060D19] rounded-lg border border-slate-800">
            <span class="text-slate-500 block text-[10px]">PERIODE WISUDA</span>
            <span class="text-white font-semibold">${record.periode_wisuda}</span>
          </div>
          <div class="p-3 bg-[#060D19] rounded-lg border border-slate-800">
            <span class="text-slate-500 block text-[10px]">TANGGAL MASUK</span>
            <span class="text-white font-semibold">${new Date(record.created_at).toLocaleDateString('id-ID')}</span>
          </div>
        </div>

        <div class="p-4 bg-[#060D19] rounded-xl border border-slate-800 text-xs mb-4">
          <span class="font-mono-tech text-slate-500 block text-[10px] mb-1">// RANGKUMAN REKAM JEJAK KEAKTIFAN:</span>
          <div class="text-slate-200 font-sans whitespace-pre-line text-xs leading-relaxed">${record.detail_kegiatan || '-'}</div>
        </div>

        <div class="flex items-center justify-between font-mono-tech text-xs pt-1">
          <span class="text-slate-500 text-[11px]">BERKAS TERUNGGAH: ${record.berkas_original_name || 'Dokumen'}</span>
          <a href="${record.berkas_url}" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline text-xs">
            Buka Berkas
          </a>
        </div>
      </div>
    `;
  },

  async handleRevisionSubmit(e, id) {
    e.preventDefault();
    const fileInput = document.getElementById(`revisionFileInput_${id}`);
    const submitBtn = document.getElementById(`revisionBtn_${id}`);

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      alert('Pilih berkas perbaikan terlebih dahulu.');
      return;
    }

    const file = fileInput.files[0];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      alert('Format berkas harus PDF, JPG, JPEG, atau PNG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran berkas maksimal 5 MB.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `Mengunggah...`;

    try {
      const formData = new FormData();
      formData.append('berkas', file);

      const res = await API.submitRevision(id, formData);
      if (res.success) {
        alert(res.message);
        this.handleCheckStatus();
      } else {
        alert(res.message || 'Gagal mengunggah berkas revisi.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>KIRIM REVISI</span>`;
      }
    }
  }
};

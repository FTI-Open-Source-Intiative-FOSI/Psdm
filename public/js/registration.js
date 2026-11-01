/**
 * Modul Pendaftaran Bintang Aktivis Kampus (Mahasiswa)
 */
const RegistrationModule = {
  selectedFile: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const fileInput = document.getElementById('berkasInput');
    const dropzone = document.getElementById('fileDropzone');
    const form = document.getElementById('registrationForm');
    const removeFileBtn = document.getElementById('removeFileBtn');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (dropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('border-cyan-400', 'bg-cyan-950/20');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('border-cyan-400', 'bg-cyan-950/20');
        }, false);
      });

      dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
          this.handleFileSelected(files[0]);
        }
      }, false);
    }

    if (removeFileBtn) {
      removeFileBtn.addEventListener('click', () => {
        this.clearFile();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  },

  handleFileSelected(file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxBytes = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      alert('Format berkas tidak didukung! Harap unggah file PDF, JPG, JPEG, atau PNG.');
      this.clearFile();
      return;
    }

    if (file.size > maxBytes) {
      alert('Ukuran berkas terlalu besar! Maksimal ukuran file adalah 5 MB.');
      this.clearFile();
      return;
    }

    this.selectedFile = file;

    // Tampilkan preview file info
    const placeholder = document.getElementById('dropzonePlaceholder');
    const preview = document.getElementById('dropzonePreview');
    const fileNameEl = document.getElementById('selectedFileName');
    const fileSizeEl = document.getElementById('selectedFileSize');

    if (placeholder && preview && fileNameEl && fileSizeEl) {
      placeholder.classList.add('hidden');
      preview.classList.remove('hidden');
      fileNameEl.textContent = file.name;
      fileSizeEl.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  },

  clearFile() {
    this.selectedFile = null;
    const fileInput = document.getElementById('berkasInput');
    if (fileInput) fileInput.value = '';

    const placeholder = document.getElementById('dropzonePlaceholder');
    const preview = document.getElementById('dropzonePreview');
    if (placeholder && preview) {
      placeholder.classList.remove('hidden');
      preview.classList.add('hidden');
    }
  },

  async handleSubmit() {
    const nama = document.getElementById('regNama').value.trim();
    const nim = document.getElementById('regNim').value.trim();
    const jurusan = document.getElementById('regJurusan').value;
    const periode = document.getElementById('regPeriode').value;
    const noWa = document.getElementById('regWa').value.trim();
    const detailKegiatan = document.getElementById('regDetailKegiatan').value.trim();
    const agree = document.getElementById('regAgreement').checked;

    if (!nama || !nim || !jurusan || !periode || !noWa || !detailKegiatan) {
      alert('Mohon lengkapi seluruh kolom formulir dan rangkuman keaktifan Anda.');
      return;
    }

    if (!this.selectedFile) {
      alert('Mohon unggah berkas bukti pendukung (SK / Sertifikat / Portofolio Keaktifan).');
      return;
    }

    if (!agree) {
      alert('Harap centang konfirmasi keabsahan data sebelum mengirim.');
      return;
    }

    const submitBtn = document.getElementById('submitRegBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const submitBtnSpinner = document.getElementById('submitBtnSpinner');

    // UI Loading state
    submitBtn.disabled = true;
    submitBtnText.textContent = 'Mengirim Data & Mengunggah Berkas...';
    submitBtnSpinner.classList.remove('hidden');

    try {
      const formData = new FormData();
      formData.append('nama', nama);
      formData.append('nim', nim);
      formData.append('jurusan', jurusan);
      formData.append('periode_wisuda', periode);
      formData.append('no_wa', noWa);
      formData.append('kategori', 'Keaktifan Perkuliahan');
      formData.append('detail_kegiatan', detailKegiatan);
      formData.append('berkas', this.selectedFile);

      const result = await API.submitRegistration(formData);

      if (result.success) {
        // Tampilkan modal sukses
        this.showSuccessModal(result.data);
        // Reset form
        document.getElementById('registrationForm').reset();
        this.clearFile();
      } else {
        alert(result.message || 'Gagal mengirim pendaftaran.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan atau server. Pastikan koneksi stabil.');
    } finally {
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Kirim Pendaftaran Bintang Aktivis';
      submitBtnSpinner.classList.add('hidden');
    }
  },

  showSuccessModal(data) {
    const modal = document.getElementById('successModal');
    const namaEl = document.getElementById('successNama');
    const nimEl = document.getElementById('successNim');
    const periodeEl = document.getElementById('successPeriode');

    if (namaEl) namaEl.textContent = data.nama;
    if (nimEl) nimEl.textContent = data.nim;
    if (periodeEl) periodeEl.textContent = data.periode_wisuda;

    if (modal) {
      modal.classList.remove('hidden');
    }

    // Set callback tombol langsung cek status
    const checkBtn = document.getElementById('modalCheckStatusBtn');
    if (checkBtn) {
      checkBtn.onclick = () => {
        modal.classList.add('hidden');
        App.switchTab('status');
        const statusInput = document.getElementById('statusSearchNim');
        if (statusInput) {
          statusInput.value = data.nim;
          StatusModule.handleCheckStatus();
        }
      };
    }
  }
};


/**
 * Main Controller & Tab Routing - BAK FTI UNAND
 */
const App = {
  currentTab: 'home',

  init() {
    this.bindNavigation();
    this.handleInitialRoute();
    this.loadHeroStats();

    // Inisialisasi modul-modul
    RegistrationModule.init();
    StatusModule.init();
    AdminModule.init();

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  bindNavigation() {
    // Navigasi menu header
    document.querySelectorAll('[data-nav-target]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-nav-target');
        this.switchTab(target);
      });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenuDropdown');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // Hero quick input Enter key
    const heroInput = document.getElementById('heroQuickNim');
    if (heroInput) {
      heroInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.quickSearchFromHero();
        }
      });
    }

    // Modal close outside click listeners
    window.addEventListener('click', (e) => {
      const successModal = document.getElementById('successModal');
      const previewModal = document.getElementById('filePreviewModal');
      const revisionModal = document.getElementById('adminRevisionModal');

      if (e.target === successModal) successModal.classList.add('hidden');
      if (e.target === previewModal) previewModal.classList.add('hidden');
      if (e.target === revisionModal) AdminModule.closeRevisionModal();
    });
  },

  handleInitialRoute() {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'register', 'status', 'admin'].includes(hash)) {
      this.switchTab(hash);
    } else {
      this.switchTab('home');
    }
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    window.location.hash = tabId;

    // Sembunyikan semua section view
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.add('hidden');
    });

    // Tampilkan section aktif
    const targetSection = document.getElementById(`view-${tabId}`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update style link navigasi aktif
    document.querySelectorAll('[data-nav-target]').forEach(link => {
      const target = link.getAttribute('data-nav-target');
      if (target === tabId) {
        link.classList.add('text-brand-cyan', 'bg-slate-800/80', 'border', 'border-cyan-500/30');
        link.classList.remove('text-slate-300', 'border-transparent');
      } else {
        link.classList.remove('text-brand-cyan', 'bg-slate-800/80', 'border', 'border-cyan-500/30');
        link.classList.add('text-slate-300', 'border-transparent');
      }
    });

    // Tutup mobile menu jika terbuka
    const mobileMenu = document.getElementById('mobileMenuDropdown');
    if (mobileMenu) mobileMenu.classList.add('hidden');

    // Trigger update bila masuk ke tab tertentu
    if (tabId === 'home') {
      this.loadHeroStats();
    } else if (tabId === 'admin') {
      AdminModule.checkSession();
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  quickSearchFromHero() {
    const heroInput = document.getElementById('heroQuickNim');
    const nim = heroInput ? heroInput.value.trim() : '';
    if (!nim) {
      alert('Ketikkan NIM Anda terlebih dahulu.');
      return;
    }
    this.switchTab('status');
    const statusInput = document.getElementById('statusSearchNim');
    if (statusInput) {
      statusInput.value = nim;
      StatusModule.handleCheckStatus();
    }
  },

  async loadHeroStats() {
    try {
      const res = await API.getStatistics();
      if (res.success && res.data) {
        const d = res.data;
        const totalPendaftarEl = document.getElementById('heroStatTotal');
        const approvedEl = document.getElementById('heroStatApproved');
        const pendingEl = document.getElementById('heroStatPending');

        if (totalPendaftarEl) totalPendaftarEl.textContent = d.total;
        if (approvedEl) approvedEl.textContent = d.approved;
        if (pendingEl) pendingEl.textContent = d.pending;
      }
    } catch (e) {
      console.error(e);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});


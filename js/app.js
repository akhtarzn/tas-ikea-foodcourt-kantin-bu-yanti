// Kantin Online App - Modern Responsive
// Data persistence with localStorage, fetch from JSON

class KantinApp {
  constructor() {
    this.menuData = [];
    this.filteredData = [];
    this.currentFilter = 'all';
    this.currentSearch = '';
    this.mitraData = null;
    this.init();
  }

  async init() {
    await this.loadData();
    this.loadMitra();
    this.renderAll();
    this.bindEvents();
    this.updateStats();
  }

  async loadData() {
    try {
      const response = await fetch('./data/menu.json');
      this.menuData = await response.json();
      this.filteredData = [...this.menuData];
      localStorage.setItem('kantinMenu', JSON.stringify(this.menuData));
    } catch (e) {
      // Fallback to localStorage
      const saved = localStorage.getItem('kantinMenu');
      this.menuData = saved ? JSON.parse(saved) : [];
      this.filteredData = [...this.menuData];
    }
  }

  loadMitra() {
    fetch('./data/mitra_rows.json')
      .then(r => r.json())
      .then(data => {
        this.mitraData = data[0];
        this.updateProfile();
      })
      .catch(() => {
        this.mitraData = { nama_mitra: 'Kantin Ceria', owner_name: 'Bu Yanti' };
        this.updateProfile();
      });
  }

  bindEvents() {
    // Form submit
    document.getElementById('add-form').addEventListener('submit', (e) => this.addMenu(e));
    
    // Filters
    document.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentFilter = e.target.dataset.cat;
        this.renderMenuGrid();
      });
    });

    // Search
    document.getElementById('search-input')?.addEventListener('input', (e) => {
      this.currentSearch = e.target.value.toLowerCase();
      this.renderMenuGrid();
    });

    // Delete confirm
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-delete]')) this.deleteMenu(e.target.dataset.delete);
    });
  }

  filterData() {
    let data = [...this.menuData];
    if (this.currentFilter !== 'all') {
      data = data.filter(item => item.category === this.currentFilter);
    }
    if (this.currentSearch) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(this.currentSearch) ||
        item.description.toLowerCase().includes(this.currentSearch)
      );
    }
    this.filteredData = data;
  }

  renderMenuGrid() {
    this.filterData();
    const grid = document.getElementById('menu-grid');
    const empty = document.getElementById('menu-empty');
    
    grid.innerHTML = '';
    if (this.filteredData.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    this.filteredData.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'menu-card rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br cursor-pointer hover:scale-105 transition-all duration-300 border-2 border-white/50';
      card.style.animationDelay = `${i * 0.05}s`;
      
      const catColor = {
        'Makanan': '#F87171', // coral
        'Minuman': '#10B981', // mint
        'Snack': '#FBBF24'    // amber
      }[item.category] || '#6B7280';

      card.innerHTML = `
        <div class="w-full aspect-square relative overflow-hidden bg-gradient-to-br from-${catColor.toLowerCase().replace('#','')}22 via-white/50 to-${catColor.toLowerCase().replace('#','')}44">
          ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
          <div class="absolute inset-0 flex items-center justify-center text-5xl hidden" style="background: linear-gradient(135deg, ${catColor}44, ${catColor}22);">
            ${['Makanan','🍚']['Minuman','🥤']['Snack','🍿'][item.category] || '🍽️'}
          </div>
        </div>
        <div class="p-4 bg-white/90 backdrop-blur-sm">
          <h3 class="font-bold text-lg truncate">${item.name}</h3>
          <p class="text-sm text-gray-500 truncate">${item.description}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-2xl font-bold text-gray-900">Rp ${Number(item.price).toLocaleString('id-ID')}</span>
            <div class="flex items-center gap-1">
              <span class="text-xs bg-emerald-500/20 text-emerald-700 px-2 py-1 rounded-full font-bold">${item.stock}</span>
              <span class="text-xs text-gray-400">stok</span>
            </div>
          </div>
          <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r text-white from-${catColor.toLowerCase().replace('#','')} to-${catColor.toLowerCase().replace('#','8B')}">${item.category}</span>
        </div>
      `;
      grid.appendChild(card);
    });

    // Update category buttons
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.classList.toggle('bg-gradient-to-r', btn.dataset.cat === this.currentFilter);
      btn.classList.toggle('from-mint-500', btn.dataset.cat === this.currentFilter);
      btn.classList.toggle('to-teal-500', btn.dataset.cat === this.currentFilter);
    });
  }

  renderManageList() {
    const list = document.getElementById('manage-list');
    const empty = document.getElementById('manage-empty');
    list.innerHTML = '';

    if (this.menuData.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    this.menuData.forEach(item => {
      const row = document.createElement('div');
      row.className = 'bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-xl transition-all';
      row.innerHTML = `
        <img src="${item.image_url}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-lg">${item.name}</h4>
          <p class="text-sm text-gray-600">${item.category} | Rp ${Number(item.price).toLocaleString()}</p>
          <p class="text-xs text-gray-400">Stok: ${item.stock}</p>
        </div>
        <button class="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl font-bold hover:from-red-500 hover:to-red-600 transition-all" data-delete="${item.id}">
          Hapus
        </button>
      `;
      list.appendChild(row);
    });
  }

  async addMenu(e) {
    e.preventDefault();
    const form = e.target;
    const newItem = {
      id: 'item_' + Date.now(),
      name: document.getElementById('inp-name').value,
      price: parseInt(document.getElementById('inp-price').value),
      category: document.getElementById('inp-cat').value,
      description: document.getElementById('inp-desc').value || '',
      image_url: document.getElementById('inp-image').value || '',
      stock: 10
    };

    this.menuData.unshift(newItem);
    this.saveData();
    form.reset();
    this.renderAll();
    this.showToast('Menu baru ditambahkan! ✅');
  }

  async deleteMenu(id) {
    this.menuData = this.menuData.filter(item => item.id !== id);
    this.saveData();
    this.renderAll();
    this.showToast('Menu dihapus! 🗑️');
  }

  saveData() {
    localStorage.setItem('kantinMenu', JSON.stringify(this.menuData));
  }

  updateProfile() {
    if (!this.mitraData) return;
    document.getElementById('profile-name').textContent = this.mitraData.owner_name;
    document.getElementById('header-title').textContent = this.mitraData.nama_mitra;
    document.getElementById('menu-tagline').textContent = `Kantin ${this.mitraData.sekolah} - ${this.mitraData.kategori}`;
  }

  updateStats() {
    document.getElementById('item-count').textContent = this.menuData.length;
    document.getElementById('stat-menu').textContent = this.menuData.length;
  }

  renderAll() {
    this.renderMenuGrid();
    this.renderManageList();
    this.updateStats();
  }

  showToast(msg) {
    // Simple toast
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }
}

// Global app instance
let app;

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  app = new KantinApp();
});

// Navigation (keep existing switchPage, but enhance)
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(`page-${page}`).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('bg-white/30', 'ring-2', 'ring-white/50'));
  document.querySelector(`[data-nav="${page}"]`)?.classList.add('bg-white/30', 'ring-2', 'ring-white/50');
}


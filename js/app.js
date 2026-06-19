// Farm Yanga - Shared Utilities

const DB = {
  get: (key) => { try { return JSON.parse(localStorage.getItem('fy_' + key)); } catch { return null; } },
  set: (key, val) => localStorage.setItem('fy_' + key, JSON.stringify(val)),
  del: (key) => localStorage.removeItem('fy_' + key),
};

const Auth = {
  currentUser: () => DB.get('current_user'),
  allUsers: () => DB.get('users') || {},

  login(email, password) {
    const users = this.allUsers();
    const user = users[email.toLowerCase()];
    if (!user) return { ok: false, err: 'No account found with this email.' };
    if (user.password !== btoa(password)) return { ok: false, err: 'Incorrect password.' };
    DB.set('current_user', { ...user, password: undefined });
    return { ok: true };
  },

  signup(data) {
    const users = this.allUsers();
    const email = data.email.toLowerCase();
    if (users[email]) return { ok: false, err: 'An account with this email already exists.' };
    const user = {
      id: 'u_' + Date.now(),
      name: data.name, email,
      phone: data.phone || '',
      location: data.location || 'Lilongwe',
      farmSize: data.farmSize || '',
      password: btoa(data.password),
      crops: [], createdAt: new Date().toISOString(),
    };
    users[email] = user;
    DB.set('users', users);
    DB.set('current_user', { ...user, password: undefined });
    return { ok: true };
  },

  updateUser(updates) {
    const cur = this.currentUser();
    if (!cur) return;
    const users = this.allUsers();
    const updated = { ...users[cur.email], ...updates };
    users[cur.email] = updated;
    DB.set('users', users);
    DB.set('current_user', { ...updated, password: undefined });
  },

  logout() { DB.del('current_user'); window.location.href = '../index.html'; },

  requireAuth() {
    if (!this.currentUser()) { window.location.href = '../index.html'; return false; }
    return true;
  },
};

function toast(msg, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  const t = document.createElement('div');
  t.className = `toast ${type !== 'success' ? type : ''}`;
  t.innerHTML = `<span>${icons[type] || '✓'}</span> ${msg}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

function initSidebar(activePage) {
  const user = Auth.currentUser();
  if (!user) return;
  const nameEl = document.getElementById('sidebar-user-name');
  const locEl = document.getElementById('sidebar-user-loc');
  const avEl = document.getElementById('sidebar-avatar');
  if (nameEl) nameEl.textContent = user.name;
  if (locEl) locEl.textContent = user.location || 'Malawi';
  if (avEl) avEl.textContent = user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === activePage));
  document.getElementById('logout-btn')?.addEventListener('click', () => { if (confirm('Log out of Farm Yanga?')) Auth.logout(); });
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  hamburger?.addEventListener('click', () => { sidebar?.classList.toggle('open'); overlay?.classList.toggle('open'); });
  overlay?.addEventListener('click', () => { sidebar?.classList.remove('open'); overlay?.classList.remove('open'); });
}

function setTopbarDate(titleEl, subEl, pageTitle) {
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  if (titleEl) titleEl.textContent = pageTitle || 'Dashboard';
  if (subEl) subEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getUserData(key) {
  const user = Auth.currentUser();
  if (!user) return [];
  return DB.get(`${user.id}_${key}`) || [];
}

function saveUserData(key, val) {
  const user = Auth.currentUser(); if (!user) return;
  DB.set(`${user.id}_${key}`, val);
}

function formatMK(amount) { return 'MK ' + Number(amount).toLocaleString(); }

function getMalawiSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 11 || month <= 1) return { name: 'Rainy Season', code: 'rainy' };
  if (month >= 2 && month <= 4) return { name: 'Late Rains', code: 'late_rain' };
  if (month >= 5 && month <= 7) return { name: 'Cool Dry Season', code: 'cool_dry' };
  return { name: 'Hot Dry Season', code: 'hot_dry' };
}

function getSimulatedWeather(location) {
  const month = new Date().getMonth();
  const loc = (location || 'Lilongwe').toLowerCase();
  const mods = { blantyre: -2, mzuzu: -3, zomba: -2, karonga: 3, mangochi: 2 };
  const mod = Object.entries(mods).find(([k]) => loc.includes(k))?.[1] || 0;
  const baseTemps = [25,25,24,22,20,18,18,20,23,26,26,25];
  const rainProb = [80,75,60,30,10,5,5,5,15,35,65,78];
  const icons = [['⛈️','🌧️','⛅'],['⛈️','🌧️','⛅'],['🌧️','⛅','☀️'],['⛅','☀️','☀️'],['☀️','☀️','☀️'],['☀️','☀️','☀️'],['☀️','☀️','☀️'],['☀️','☀️','⛅'],['⛅','☀️','⛅'],['⛅','🌧️','⛅'],['🌧️','⛈️','⛅'],['⛈️','🌧️','⛅']];
  const temp = baseTemps[month] + mod;
  const rain = rainProb[month];
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const forecast = Array.from({length:7}, (_,i) => {
    const d = new Date(today); d.setDate(today.getDate()+i);
    const m = d.getMonth();
    return { day: i===0?'Today':days[d.getDay()], icon: icons[m][Math.floor(Math.random()*3)], temp: baseTemps[m]+mod+Math.round((Math.random()-0.5)*4), rain: Math.max(0,Math.min(100,rainProb[m]+Math.round((Math.random()-0.5)*20))), };
  });
  return { location: location||'Lilongwe', temp, feels: temp-2, humidity: rain>50?78:55, wind: Math.floor(8+Math.random()*15), icon: icons[month][0], description: rain>60?'Heavy Rain Expected':rain>30?'Partly Cloudy':'Mostly Sunny', forecast };
}

function getFarmingAdvice(season, crops) {
  const cl = crops?.length ? crops.join(', ') : 'your crops';
  const map = {
    rainy: `🌱 Main planting season. Plant ${cl} now. Apply basal D-compound fertilizer at planting. Clear drainage channels to prevent waterlogging on ridges.`,
    late_rain: `🌿 ${cl} should be maturing. Apply CAN top-dressing to maize. Scout for fall armyworm. Begin preparing storage for harvest.`,
    cool_dry: `🌾 Harvest season. Dry grains to below 13% moisture before storing. Good time for irrigation vegetables — tomatoes, onions, cabbages are profitable at this time.`,
    hot_dry: `☀️ Land preparation time. Plough and ridge fields now. Apply lime to acidic soils. Buy seeds and fertilizer early — prices are lower before the planting rush.`,
  };
  return map[season.code] || map.hot_dry;
}

// Market prices - Malawian produce (MK per 50kg bag / kg)
const MARKET_PRICES = [
  { name:'Maize', emoji:'🌽', unit:'per 50kg bag', base:18000, change:+5.2 },
  { name:'Soybeans', emoji:'🫘', unit:'per 50kg bag', base:42000, change:+12.1 },
  { name:'Groundnuts', emoji:'🥜', unit:'per 50kg bag', base:95000, change:-3.4 },
  { name:'Tobacco (Flue)', emoji:'🍂', unit:'per kg', base:1850, change:+2.8 },
  { name:'Tomatoes', emoji:'🍅', unit:'per crate (15kg)', base:8500, change:-8.2 },
  { name:'Onions', emoji:'🧅', unit:'per 50kg bag', base:28000, change:+6.5 },
  { name:'Sweet Potato', emoji:'🍠', unit:'per 50kg bag', base:12000, change:+1.1 },
  { name:'Cassava', emoji:'🪴', unit:'per 50kg bag', base:9500, change:-1.5 },
  { name:'Beans (Kidney)', emoji:'🫘', unit:'per 50kg bag', base:68000, change:+4.3 },
  { name:'Sunflower', emoji:'🌻', unit:'per 50kg bag', base:38000, change:+9.7 },
  { name:'Pigeon Peas', emoji:'🟡', unit:'per 50kg bag', base:55000, change:+3.2 },
  { name:'Cabbage', emoji:'🥬', unit:'per head', base:800, change:-12.0 },
];

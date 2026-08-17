// ─── API Base URL ───────────────────────────────────
const API_BASE = 'http://localhost:5001/api';

// ─── Token Helpers ───────────────────────────────────
function getToken() { return localStorage.getItem('token'); }
function setToken(t) { localStorage.setItem('token', t); }
function removeToken() { localStorage.removeItem('token'); localStorage.removeItem('currentUser'); }

// ─── User Helpers ────────────────────────────────────
function isLoggedIn() { return !!getToken(); }

function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// ─── Generic API request (with JWT) ─────────────────
async function apiRequest(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  const token = getToken();
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Auth Actions ────────────────────────────────────
function loginUser(user, token) {
  setToken(token);
  setCurrentUser(user);
}

function logoutUser() {
  removeToken();
  window.location.href = 'login.html';
}

// ─── Auth Guard ───────────────────────────────────────
function checkAuth() {
  const onPublicPage =
    window.location.pathname.includes('login.html') ||
    window.location.pathname.includes('register.html');

  if (!isLoggedIn() && !onPublicPage) {
    window.location.href = 'login.html';
  }
  if (isLoggedIn() && onPublicPage) {
    window.location.href = 'index.html';
  }
}

// ─── Navbar: show user info + logout ─────────────────
function displayUserInfo() {
  const user = getCurrentUser();
  const navbar = document.querySelector('.navbar ul');
  if (!user || !navbar) return;

  // Remove existing user-info if any
  const existing = document.querySelector('.user-info');
  if (existing) existing.remove();

  const li = document.createElement('li');
  li.className = 'user-info';

  // Avatar
  const avatar = document.createElement('div');
  avatar.style.cssText = 'width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:600;color:#fff;margin-right:8px;flex-shrink:0;';
  if (user.profilePicture) {
    avatar.style.backgroundImage = `url(${user.profilePicture})`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  } else {
    const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
    avatar.textContent = initials;
    avatar.style.background = 'linear-gradient(120deg, #ff3a22, #c7af6b)';
  }

  // Role badge
  const roleBadge = document.createElement('span');
  roleBadge.textContent = user.role;
  roleBadge.style.cssText = `
    font-size:0.65rem;padding:2px 7px;border-radius:20px;font-weight:600;text-transform:uppercase;margin-right:6px;
    background:${user.role === 'admin' ? '#ff3a22' : user.role === 'organizer' ? '#c7af6b' : '#666'};color:#fff;
  `;

  // Profile link
  const link = document.createElement('a');
  link.href = 'profile.html';
  link.style.cssText = 'text-decoration:none;display:flex;align-items:center;gap:6px;cursor:pointer;transition:opacity 0.3s;';
  link.onmouseenter = () => link.style.opacity = '0.8';
  link.onmouseleave = () => link.style.opacity = '1';
  const name = document.createElement('span');
  name.textContent = user.fullName;
  name.style.cssText = 'color:#fff;font-weight:500;font-size:0.95rem;';
  link.append(avatar, roleBadge, name);

  // Logout button
  const logoutBtn = document.createElement('a');
  logoutBtn.href = '#';
  logoutBtn.className = 'logout-btn';
  logoutBtn.textContent = 'Logout';
  logoutBtn.addEventListener('click', e => { e.preventDefault(); logoutUser(); });

  li.append(link, logoutBtn);
  navbar.appendChild(li);
}

// ─── Auto-refresh user from API ───────────────────────
async function refreshCurrentUser() {
  if (!isLoggedIn()) return;
  try {
    const data = await apiRequest('/auth/me');
    setCurrentUser(data.user);
    return data.user;
  } catch {
    logoutUser();
  }
}

// ─── Role Guards ──────────────────────────────────────
function requireRole(...roles) {
  const user = getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    alert('Access denied. You do not have permission to view this page.');
    window.location.href = 'index.html';
  }
}

// ─── Init ─────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAuth);
} else {
  checkAuth();
}

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Settings,
  LogOut, Menu, X, ChevronRight, Tag
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { getSettings } from '../../utils/api';

const styles = `
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f0eff5;
}

.admin-sidebar {
  width: 260px;
  background: var(--primary);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  min-height: 70px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  text-decoration: none;
}

.sidebar-brand-img {
  height: 34px;
  max-width: 120px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}

.sidebar-brand-box {
  width: 36px; height: 36px;
  border-radius: 8px;
  background: rgba(212,175,55,0.15);
  border: 1px solid rgba(212,175,55,0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.sidebar-brand-monogram {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem; font-weight: 700; color: #d4af37;
}

.sidebar-brand-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-brand-skeleton {
  height: 14px; width: 90px;
  background: rgba(255,255,255,0.12);
  border-radius: 4px;
  animation: sbPulse 1.2s ease-in-out infinite;
}
@keyframes sbPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.sidebar-close {
  display: none;
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 6px;
  padding: 4px;
}

.sidebar-admin-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.admin-avatar {
  width: 40px; height: 40px;
  background: var(--accent);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 700; color: white; flex-shrink: 0;
}

.admin-role {
  font-size: 0.72rem; color: var(--accent);
  font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
}

.admin-email {
  font-size: 0.8rem; color: rgba(255,255,255,0.55);
  margin-top: 2px; word-break: break-all;
}

.sidebar-nav {
  flex: 1; padding: 14px 12px;
  display: flex; flex-direction: column; gap: 3px;
}

.nav-section-label {
  font-size: 0.6rem; font-weight: 600; letter-spacing: 2px;
  text-transform: uppercase; color: rgba(255,255,255,0.25);
  padding: 12px 14px 6px; margin-top: 4px;
}

.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px; border-radius: 10px;
  text-decoration: none; color: rgba(255,255,255,0.6);
  font-size: 0.88rem; font-weight: 500; transition: all 0.2s;
}

.nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
.nav-item.active { background: var(--accent); color: white; }

.nav-arrow { margin-left: auto; opacity: 0; transition: opacity 0.2s; }
.nav-item:hover .nav-arrow,
.nav-item.active .nav-arrow { opacity: 1; }

.sidebar-logout {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 24px; background: none;
  border: none; border-top: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.4); cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
  transition: color 0.2s; width: 100%; text-align: left;
}
.sidebar-logout:hover { color: var(--accent); }

.admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.admin-topbar {
  background: white; padding: 0 24px; height: 60px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  position: sticky; top: 0; z-index: 100;
}

.topbar-menu {
  display: none; background: none; border: none;
  cursor: pointer; color: var(--text); padding: 4px;
}

.topbar-title { font-weight: 600; font-size: 1rem; color: var(--primary); }

.topbar-logout {
  margin-left: auto; display: none; background: none;
  border: none; cursor: pointer; color: var(--text-muted); padding: 4px;
}
.topbar-logout:hover { color: var(--accent); }

.admin-content { flex: 1; padding: 28px; overflow-y: auto; }

.sidebar-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); z-index: 199;
}

@media (max-width: 900px) {
  .admin-sidebar {
    position: fixed; left: -280px; top: 0; height: 100vh;
    z-index: 200; width: 280px; transition: left 0.3s ease;
  }
  .admin-sidebar.open { left: 0; }
  .sidebar-close { display: block; }
  .sidebar-overlay { display: block; }
  .topbar-menu { display: block; }
  .topbar-logout { display: block; }
}

@media (max-width: 600px) {
  .admin-content { padding: 16px; }
}
`;

const navItems = [
  { to: '/admin/dashboard',  icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
  { to: '/admin/products',   icon: <Package size={19} />,         label: 'Products' },
  { to: '/admin/categories', icon: <Tag size={19} />,             label: 'Categories' },
  { to: '/admin/orders',     icon: <ShoppingBag size={19} />,     label: 'Orders' },
  { to: '/admin/settings',   icon: <Settings size={19} />,        label: 'Settings' },
];

const AdminLayout = () => {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);

  useEffect(() => {
    getSettings()
      .then(r => {
        const d = r.data?.shop_name !== undefined ? r.data : (r.data?.data || r.data || {});
        setShopSettings(d);
      })
      .catch(() => setShopSettings({}));
  }, []);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const isLoading = shopSettings === null;
  const shopName  = shopSettings?.shop_name    || 'MyShop';
  const shopLogo  = shopSettings?.shop_logo_url || '';
  const monogram  = shopName.charAt(0).toUpperCase();

  return (
    <>
      <style>{styles}</style>
      <div className="admin-layout">
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <a href="/" className="sidebar-brand">
              {isLoading ? (
                <>
                  <div className="sidebar-brand-box" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <span className="sidebar-brand-skeleton" />
                </>
              ) : shopLogo ? (
                <img src={shopLogo} alt={shopName} className="sidebar-brand-img" />
              ) : (
                <>
                  <div className="sidebar-brand-box">
                    <span className="sidebar-brand-monogram">{monogram}</span>
                  </div>
                  <span className="sidebar-brand-text">{shopName}</span>
                </>
              )}
            </a>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="sidebar-admin-info">
            <div className="admin-avatar">{admin?.email?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="admin-role">Administrator</div>
              <div className="admin-email">{admin?.email}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <span className="nav-section-label">Main Menu</span>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
                <ChevronRight size={15} className="nav-arrow" />
              </NavLink>
            ))}
          </nav>

          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="admin-main">
          <header className="admin-topbar">
            <button className="topbar-menu" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="topbar-title">
              {isLoading ? '' : `${shopName} — Admin`}
            </div>
            <button className="topbar-logout" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </header>
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;

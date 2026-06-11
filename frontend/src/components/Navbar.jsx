import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Package, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getSettings } from '../utils/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Poppins:wght@300;400;500;600;700&display=swap');

  :root {
    --wc-pink: #c0392b;
    --wc-pink-light: #c0392b;
    --wc-pink-pale: #fff0f7;
    --wc-gold: #c9922a;
    --wc-gold-light: #e8b84b;
    --wc-deep: #2d0a1e;
    --wc-cream: #fffaf6;
    --wc-border: #f0d6e8;
  }

  /* ── Announcement bar ── */
  .wc-ann-bar {
    background: linear-gradient(90deg, var(--wc-deep), #5c1040, var(--wc-deep));
    color: rgba(255,255,255,0.82);
    text-align: center;
    padding: 9px 48px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    position: relative;
  }

  .wc-ann-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--wc-gold-light); flex-shrink: 0;
  }

  .wc-ann-dismiss {
    position: absolute; right: 16px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: rgba(255,255,255,0.3); cursor: pointer;
    padding: 4px; display: flex; transition: color 0.2s;
  }
  .wc-ann-dismiss:hover { color: rgba(255,255,255,0.7); }

  /* ── Main navbar ── */
  .wc-navbar {
    background: white;
    border-bottom: 2px solid var(--wc-border);
    position: sticky; top: 0; z-index: 500;
    box-shadow: 0 2px 16px rgba(233,30,140,0.06);
  }

  .wc-navbar-inner {
    display: flex; align-items: center;
    justify-content: space-between;
    height: 70px; padding: 0 28px;
    max-width: 1440px; margin: 0 auto; gap: 16px;
  }

  /* ── LEFT ── */
  .wc-nav-left {
    display: flex; align-items: center;
    gap: 14px; flex: 1; min-width: 0;
  }

  .wc-hamburger {
    background: none; border: none; cursor: pointer;
    color: var(--wc-deep); padding: 6px; display: none;
    border-radius: 6px; transition: background 0.2s; flex-shrink: 0;
  }
  .wc-hamburger:hover { background: var(--wc-pink-pale); color: var(--wc-pink); }

  .wc-brand {
    display: flex; align-items: center;
    gap: 11px; text-decoration: none; flex-shrink: 0;
  }

  .wc-brand-logo-wrap {
    width: 46px; height: 46px; border-radius: 50%;
    background: var(--wc-pink-pale);
    border: 2px solid var(--wc-border);
    overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .wc-brand:hover .wc-brand-logo-wrap {
    border-color: var(--wc-pink);
    box-shadow: 0 0 0 3px rgba(233,30,140,0.1);
  }

  .wc-brand-logo-img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }

  .wc-brand-monogram {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem; font-weight: 600;
    color: var(--wc-pink); line-height: 1;
  }

  .wc-brand-name { display: flex; flex-direction: column; gap: 1px; min-width: 0; }

  .wc-brand-name-text {
    font-family: 'Playfair Display', serif;
    font-size: 1.18rem; font-weight: 600;
    color: var(--wc-deep); letter-spacing: 1px;
    line-height: 1; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }

  .wc-brand-tagline {
    font-family: 'Poppins', sans-serif;
    font-size: 0.58rem; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--wc-pink);
    line-height: 1; font-weight: 500;
  }

  .wc-brand-skeleton {
    height: 16px; width: 120px; background: var(--wc-border);
    border-radius: 4px; animation: wcPulse 1.2s ease-in-out infinite;
  }
  .wc-logo-skeleton {
    width: 46px; height: 46px; border-radius: 50%;
    background: var(--wc-border); animation: wcPulse 1.2s ease-in-out infinite;
  }
  @keyframes wcPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .wc-nav-divider {
    width: 1px; height: 28px;
    background: var(--wc-border); flex-shrink: 0; margin: 0 4px;
  }

  .wc-nav-links { display: flex; align-items: center; gap: 0; }

  .wc-nav-link {
    font-family: 'Poppins', sans-serif;
    font-size: 0.7rem; font-weight: 500;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: #666; text-decoration: none;
    padding: 8px 14px; border-radius: 20px;
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .wc-nav-link:hover { color: var(--wc-pink); background: var(--wc-pink-pale); }

  /* ── RIGHT ── */
  .wc-nav-right {
    display: flex; align-items: center;
    gap: 2px; flex-shrink: 0;
  }

  .wc-nav-btn {
    background: none; border: none; cursor: pointer;
    color: var(--wc-deep); padding: 9px; display: flex; align-items: center;
    border-radius: 8px; transition: background 0.2s, color 0.2s;
    text-decoration: none; position: relative;
  }
  .wc-nav-btn:hover { background: var(--wc-pink-pale); color: var(--wc-pink); }

  .wc-nav-btn-label {
    font-family: 'Poppins', sans-serif;
    font-size: 0.52rem; letter-spacing: 1px;
    text-transform: uppercase; color: #aaa;
    display: block; text-align: center; margin-top: 2px; line-height: 1;
  }

  .wc-nav-btn-inner { display: flex; flex-direction: column; align-items: center; gap: 2px; }

  .wc-cart-badge {
    position: absolute; top: 4px; right: 4px;
    background: linear-gradient(135deg, var(--wc-pink), #c0392b);
    color: white; font-size: 0.55rem; font-weight: 700;
    min-width: 15px; height: 15px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Poppins', sans-serif; padding: 0 3px; line-height: 1;
  }

  .wc-nav-sep { width: 1px; height: 20px; background: var(--wc-border); margin: 0 4px; flex-shrink: 0; }

  /* ── Search overlay ── */
  .wc-search-overlay {
    position: fixed; inset: 0;
    background: rgba(45,10,30,0.6);
    z-index: 999; display: flex; align-items: flex-start;
    justify-content: center; padding-top: 90px;
    backdrop-filter: blur(8px); animation: wcFadeIn 0.18s ease;
  }
  @keyframes wcFadeIn { from{opacity:0} to{opacity:1} }

  .wc-search-panel {
    background: white; width: 100%; max-width: 600px;
    border-radius: 16px; padding: 28px 28px 22px; margin: 0 20px;
    box-shadow: 0 28px 80px rgba(233,30,140,0.18);
    border: 1px solid var(--wc-border);
    animation: wcSlideDown 0.22s cubic-bezier(0.22,1,0.36,1);
  }
  @keyframes wcSlideDown {
    from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)}
  }

  .wc-search-label {
    font-family: 'Poppins', sans-serif; font-size: 0.6rem;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--wc-pink); margin-bottom: 14px; display: block;
    display: flex; align-items: center; gap: 8px;
  }
  .wc-search-label::before { content: '✿'; }

  .wc-search-row {
    display: flex; align-items: center; gap: 14px;
    border-bottom: 2px solid var(--wc-pink); padding-bottom: 12px;
  }
  .wc-search-row input {
    flex: 1; border: none; outline: none;
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; color: var(--wc-deep); background: transparent;
  }
  .wc-search-row input::placeholder { color: #ddd; font-style: italic; }

  .wc-search-close-btn {
    background: none; border: none; cursor: pointer;
    color: #bbb; padding: 4px; display: flex; transition: color 0.2s;
  }
  .wc-search-close-btn:hover { color: var(--wc-pink); }

  .wc-search-hint {
    margin-top: 10px; font-family: 'Poppins', sans-serif;
    font-size: 0.7rem; color: #bbb;
  }

  /* ── Mobile drawer ── */
  .wc-drawer-overlay {
    position: fixed; inset: 0; background: rgba(45,10,30,0.5);
    z-index: 998; backdrop-filter: blur(4px); animation: wcFadeIn 0.2s ease;
  }

  .wc-drawer {
    position: fixed; left: 0; top: 0; height: 100vh; width: 300px;
    background: white; z-index: 999; display: flex; flex-direction: column;
    animation: wcDrawerIn 0.3s cubic-bezier(0.22,1,0.36,1); overflow-y: auto;
    border-right: 2px solid var(--wc-border);
  }
  @keyframes wcDrawerIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }

  .wc-drawer-top {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px; border-bottom: 1px solid var(--wc-border);
    background: var(--wc-pink-pale);
  }

  .wc-drawer-brand { display: flex; align-items: center; gap: 10px; }

  .wc-drawer-logo-box {
    width: 40px; height: 40px; border-radius: 50%;
    background: white; border: 2px solid var(--wc-border);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
  }
  .wc-drawer-logo-box img { width: 100%; height: 100%; object-fit: contain; padding: 3px; }

  .wc-drawer-logo-mono {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 600; color: var(--wc-pink);
  }

  .wc-drawer-name {
    font-family: 'Playfair Display', serif;
    font-size: 1rem; font-weight: 600;
    color: var(--wc-deep); letter-spacing: 0.5px;
  }

  .wc-drawer-x {
    background: none; border: none; cursor: pointer;
    color: #999; padding: 4px; display: flex; border-radius: 4px;
    transition: color 0.2s;
  }
  .wc-drawer-x:hover { color: var(--wc-pink); }

  .wc-drawer-links { padding: 8px 0 24px; flex: 1; }

  .wc-drawer-link {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 22px; text-decoration: none; color: var(--wc-deep);
    font-family: 'Poppins', sans-serif; font-size: 0.78rem;
    letter-spacing: 1px; text-transform: uppercase; font-weight: 500;
    border-bottom: 1px solid var(--wc-border); transition: background 0.15s, color 0.15s;
  }
  .wc-drawer-link:hover { background: var(--wc-pink-pale); color: var(--wc-pink); }

  .wc-drawer-footer {
    padding: 18px 22px; border-top: 1px solid var(--wc-border);
    background: var(--wc-pink-pale);
    font-family: 'Poppins', sans-serif; font-size: 0.68rem;
    color: var(--wc-pink); letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 6px;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .wc-nav-links { display: none; }
    .wc-nav-divider { display: none; }
  }

  @media (max-width: 768px) {
    .wc-hamburger { display: flex; }
    .wc-navbar-inner { padding: 0 16px; height: 64px; }
    .wc-brand-tagline { display: none; }
    .wc-brand-logo-wrap { width: 40px; height: 40px; }
    .wc-nav-btn-label { display: none; }
  }

  @media (max-width: 480px) {
    .wc-brand-name { display: none; }
    .wc-nav-left { gap: 10px; }
  }
`;

const Navbar = () => {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [annVisible, setAnnVisible] = useState(true);

  useEffect(() => {
    getSettings()
      .then(r => {
        const data = r.data?.shop_name !== undefined ? r.data : (r.data?.data || r.data || {});
        setSettings(data);
      })
      .catch(() => setSettings({}));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch(''); setSearchOpen(false);
    }
  };

  const isLoading = settings === null;
  const shopName    = settings?.shop_name     || "Salwar Butterfly";
  const shopLogo    = settings?.shop_logo_url || '';
  const shopTagline = settings?.shop_tagline  || '';
  const monogram    = shopName.charAt(0).toUpperCase();

  return (
    <>
      <style>{styles}</style>

      {annVisible && (
        <div className="wc-ann-bar">
          <span className="wc-ann-dot" />
          🌸 New launches every day · Online payment only · WhatsApp: 8778921938
          <span className="wc-ann-dot" />
          <button className="wc-ann-dismiss" onClick={() => setAnnVisible(false)}><X size={12} /></button>
        </div>
      )}

      <header className="wc-navbar">
        <div className="wc-navbar-inner">
          <div className="wc-nav-left">
            <button className="wc-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>

            <Link to="/" className="wc-brand" aria-label={shopName}>
              {isLoading ? (
                <span className="wc-logo-skeleton" />
              ) : (
                <div className="wc-brand-logo-wrap">
                  {shopLogo
                    ? <img src={shopLogo} alt={shopName} className="wc-brand-logo-img" />
                    : <span className="wc-brand-monogram">{monogram}</span>
                  }
                </div>
              )}
              {isLoading ? (
                <span className="wc-brand-skeleton" />
              ) : (
                <div className="wc-brand-name">
                  <span className="wc-brand-name-text">{shopName}</span>
                  {shopTagline && <span className="wc-brand-tagline">{shopTagline}</span>}
                </div>
              )}
            </Link>

            <span className="wc-nav-divider" />
            <nav className="wc-nav-links">
              <Link to="/products" className="wc-nav-link">Shop</Link>
              <Link to="/orders"   className="wc-nav-link">Track Order</Link>
            </nav>
          </div>

          <div className="wc-nav-right">
            <button className="wc-nav-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <div className="wc-nav-btn-inner">
                <Search size={20} />
                <span className="wc-nav-btn-label">Search</span>
              </div>
            </button>

            <Link to="/orders" className="wc-nav-btn" aria-label="Orders">
              <div className="wc-nav-btn-inner">
                <Package size={20} />
                <span className="wc-nav-btn-label">Orders</span>
              </div>
            </Link>

            <span className="wc-nav-sep" />

            <Link to="/cart" className="wc-nav-btn" aria-label={`Cart, ${cartCount} items`}>
              <div className="wc-nav-btn-inner">
                <ShoppingBag size={20} />
                <span className="wc-nav-btn-label">Cart</span>
              </div>
              {cartCount > 0 && <span className="wc-cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="wc-search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="wc-search-panel" onClick={e => e.stopPropagation()}>
            <span className="wc-search-label">Search products</span>
            <form onSubmit={handleSearch}>
              <div className="wc-search-row">
                <Search size={20} color="#e91e8c" />
                <input autoFocus type="text" placeholder="What are you looking for?"
                  value={search} onChange={e => setSearch(e.target.value)} />
                <button type="button" className="wc-search-close-btn" onClick={() => setSearchOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </form>
            <p className="wc-search-hint">Press Enter to search</p>
          </div>
        </div>
      )}

      {drawerOpen && (
        <>
          <div className="wc-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <nav className="wc-drawer">
            <div className="wc-drawer-top">
              <div className="wc-drawer-brand">
                <div className="wc-drawer-logo-box">
                  {shopLogo
                    ? <img src={shopLogo} alt={shopName} />
                    : <span className="wc-drawer-logo-mono">{monogram}</span>
                  }
                </div>
                <span className="wc-drawer-name">{shopName}</span>
              </div>
              <button className="wc-drawer-x" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
            </div>

            <div className="wc-drawer-links">
              {[
                { to: '/',         label: 'Home' },
                { to: '/products', label: 'All Products' },
                { to: '/orders',   label: 'Track Orders' },
                { to: '/cart',     label: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}` },
              ].map(item => (
                <Link key={item.to} to={item.to} className="wc-drawer-link"
                  onClick={() => setDrawerOpen(false)}>
                  {item.label}
                  <ChevronRight size={13} color="#e91e8c" />
                </Link>
              ))}
            </div>

            <div className="wc-drawer-footer">
              🌸 {shopTagline || "Style That Speaks to You"}
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default Navbar;
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { getSettings } from './utils/api';
import RecentPurchasePopup from './components/RecentPurchasePopup';
import PolicyModal from './components/PolicyModal';
import SizeGuideModal from './components/SizeGuideModal';
import WhatsAppButton from './components/WhatsAppButton';
// Client Pages
import Navbar from './components/Navbar';
import Home from './pages/client/Home';
import ProductListing from './pages/client/ProductListing';
import ProductDetails from './pages/client/ProductDetails';
import Cart from './pages/client/Cart';
import Checkout from './pages/client/Checkout';
import OrderSuccess from './pages/client/OrderSuccess';
import MyOrders from './pages/client/MyOrders';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import AdminSettings from './pages/admin/AdminSettings';
import CategoryManagement from './pages/admin/CategoryManagement';

import TestimonialManagement from './pages/admin/TestimonialManagement';

import './index.css';

const footerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=DM+Sans:wght@300;400;500;600&display=swap');

  .uz-footer {
    background: #1a1a1a;
    color: rgba(255,255,255,0.6);
    font-family: 'DM Sans', sans-serif;
    margin-top: 60px;
  }

  .uz-footer-top {
    max-width: 1440px;
    margin: 0 auto;
    padding: 52px 28px 40px;
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
    gap: 40px;
  }

  .uz-footer-brand .uz-fb-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    text-decoration: none;
  }

  .uz-fb-logo-box {
    width: 40px; height: 40px; border-radius: 8px;
    background: rgba(212,175,55,0.15);
    border: 1px solid rgba(212,175,55,0.3);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
  }

  .uz-fb-logo-box img {
    width: 100%; height: 100%; object-fit: contain; padding: 4px;
  }

  .uz-fb-monogram {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem; font-weight: 500; color: #d4af37;
  }

  .uz-fb-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem; font-weight: 500; color: white;
    letter-spacing: 3px; text-transform: uppercase;
  }

  .uz-fb-tagline {
    font-size: 0.82rem; color: rgba(255,255,255,0.4);
    line-height: 1.7; margin-bottom: 20px;
    max-width: 260px;
  }

  .uz-fb-contact a {
    display: flex; align-items: center; gap: 8px;
    color: rgba(255,255,255,0.5); text-decoration: none;
    font-size: 0.8rem; margin-bottom: 8px;
    transition: color 0.2s;
  }
  .uz-fb-contact a:hover { color: #d4af37; }

  .uz-footer-col h4 {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.62rem; font-weight: 600;
    letter-spacing: 2.5px; text-transform: uppercase;
    color: rgba(255,255,255,0.35); margin-bottom: 16px;
  }

  .uz-footer-col a, .uz-footer-col button.uz-footer-btn-link {
    display: block; color: rgba(255,255,255,0.55);
    text-decoration: none; font-size: 0.82rem;
    margin-bottom: 10px; transition: color 0.2s;
    background: none; border: none; cursor: pointer;
    padding: 0; text-align: left; font-family: 'DM Sans', sans-serif;
  }
  .uz-footer-col a:hover,
  .uz-footer-col button.uz-footer-btn-link:hover { color: white; }

  .uz-footer-whatsapp {
    display: inline-flex; align-items: center; gap: 8px;
    background: #25d366; color: white !important;
    padding: 9px 18px; border-radius: 6px;
    font-size: 0.78rem !important; font-weight: 600;
    letter-spacing: 0.5px; margin-top: 4px;
    transition: background 0.2s !important;
  }
  .uz-footer-whatsapp:hover { background: #1ebe5d !important; color: white !important; }

  .uz-footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 18px 28px;
    max-width: 1440px; margin: 0 auto;
    display: flex; align-items: center;
    justify-content: space-between; flex-wrap: wrap; gap: 12px;
  }

  .uz-footer-copy {
    font-size: 0.72rem; color: rgba(255,255,255,0.3);
    letter-spacing: 0.5px;
  }

  .uz-footer-legal {
    display: flex; gap: 20px;
  }
  .uz-footer-legal a,
  .uz-footer-legal button.uz-footer-btn-link {
    font-size: 0.72rem; color: rgba(255,255,255,0.3);
    text-decoration: none; transition: color 0.2s;
    background: none; border: none; cursor: pointer;
    padding: 0; font-family: 'DM Sans', sans-serif;
  }
  .uz-footer-legal a:hover,
  .uz-footer-legal button.uz-footer-btn-link:hover { color: rgba(255,255,255,0.6); }

  @media (max-width: 900px) {
    .uz-footer-top { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 580px) {
    .uz-footer-top { grid-template-columns: 1fr; gap: 28px; padding: 36px 20px 28px; }
    .uz-footer-bottom { flex-direction: column; align-items: flex-start; padding: 16px 20px; }
  }
`;

const Footer = ({ shopSettings }) => {
  const [policyOpen, setPolicyOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  const settings = shopSettings || {};

  const shopName    = settings.shop_name    || 'MyShop';
  const shopLogo    = settings.shop_logo_url || '';
  const shopTagline = settings.shop_tagline  || 'Quality products delivered to your doorstep.';
  const shopPhone   = settings.shop_phone    || '';
  const shopEmail   = settings.shop_email    || '';
  const monogram    = shopName.charAt(0).toUpperCase();

  const formatPhone = (phone) => {
    const digits = phone.replace(/[^0-9]/g, '');
    const withCountry = digits.startsWith('91') && digits.length === 12
      ? digits : `91${digits}`;
    return withCountry;
  };

  const waLink = shopPhone ? `https://wa.me/${formatPhone(shopPhone)}` : null;

  return (
    <>
      <style>{footerStyles}</style>

      {/* Modals */}
      <PolicyModal
        isOpen={policyOpen}
        onClose={() => setPolicyOpen(false)}
        shopPhone={shopPhone ? formatPhone(shopPhone) : '918778921938'}
      />
      <SizeGuideModal
        isOpen={sizeOpen}
        onClose={() => setSizeOpen(false)}
        shopPhone={shopPhone ? formatPhone(shopPhone) : '918778921938'}
      />

      <footer className="uz-footer">
        <div className="uz-footer-top">

          {/* Brand column */}
          <div className="uz-footer-brand">
            <a href="/" className="uz-fb-logo">
              <div className="uz-fb-logo-box">
                {shopLogo
                  ? <img src={shopLogo} alt={shopName} />
                  : <span className="uz-fb-monogram">{monogram}</span>
                }
              </div>
              <span className="uz-fb-name">{shopName}</span>
            </a>
            <p className="uz-fb-tagline">{shopTagline}</p>
            <div className="uz-fb-contact">
              {shopPhone && (
                <a href={`tel:+${formatPhone(shopPhone)}`}>
                  📞 {shopPhone}
                </a>
              )}
              {shopEmail && (
                <a href={`mailto:${shopEmail}`}>
                  ✉️ {shopEmail}
                </a>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="uz-footer-whatsapp">
                  💬 Chat on WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Shop links */}
          <div className="uz-footer-col">
            <h4>Shop</h4>
            <a href="/products">All Products</a>
            <a href="/products?sort=newest">New Arrivals</a>
            <a href="/cart">My Cart</a>
            <a href="/orders">Track Order</a>
          </div>

          {/* Help links */}
          <div className="uz-footer-col">
            <h4>Help</h4>
            <a href="/orders">Order Status</a>
            <button className="uz-footer-btn-link" onClick={() => setPolicyOpen(true)}>
              Returns &amp; Exchanges
            </button>
            <a href="/orders">Shipping Info</a>
            <button className="uz-footer-btn-link" onClick={() => setSizeOpen(true)}>
              Size Guide
            </button>
          </div>

        </div>

        <div className="uz-footer-bottom">
          <span className="uz-footer-copy">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </span>
          <div className="uz-footer-legal">
            <a href="#">Privacy Policy</a>
            <button className="uz-footer-btn-link" onClick={() => setPolicyOpen(true)}>
              Refund Policy
            </button>
            <button className="uz-footer-btn-link" onClick={() => setSizeOpen(true)}>
              Size Guide
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

// Helper to coerce backend booleans (which may come back as 'true'/'false' strings) to real booleans.
const toBool = (val, fallback = true) => {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'boolean') return val;
  return val === 'true' || val === '1' || val === 1;
};

// Client layout wrapper — RecentPurchasePopup and WhatsAppButton only render for client pages.
// Shop settings are fetched once here and passed down to Footer + popup, avoiding duplicate fetches.
const ClientLayout = ({ children }) => {
  const [shopSettings, setShopSettings] = useState(null);

  useEffect(() => {
    getSettings()
      .then(r => {
        const d = r.data?.shop_name !== undefined ? r.data : (r.data?.data || r.data || {});
        setShopSettings(d);
      })
      .catch(() => setShopSettings({}));
  }, []);

  const showPopup = toBool(shopSettings?.show_recent_purchase_popup, true);

  return (
    <>
      {showPopup && <RecentPurchasePopup />}
      <Navbar />
      <main>{children}</main>
      <Footer shopSettings={shopSettings} />
      <WhatsAppButton />
    </>
  );
};

// Admin protected route
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin();
  if (loading) return (
    <div className="loading-container" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<ClientLayout><Home /></ClientLayout>} />
            <Route path="/products" element={<ClientLayout><ProductListing /></ClientLayout>} />
            <Route path="/products/:id" element={<ClientLayout><ProductDetails /></ClientLayout>} />
            <Route path="/cart" element={<ClientLayout><Cart /></ClientLayout>} />
            <Route path="/checkout" element={<ClientLayout><Checkout /></ClientLayout>} />
            <Route path="/order-success" element={<ClientLayout><OrderSuccess /></ClientLayout>} />
            <Route path="/orders" element={<ClientLayout><MyOrders /></ClientLayout>} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="photos" element={<TestimonialManagement />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
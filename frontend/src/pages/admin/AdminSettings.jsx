import React, { useState, useEffect, useRef } from 'react';
import {
  Save, Upload, Eye, EyeOff, QrCode, Store, Lock,
  Image, Plus, Trash2, ChevronDown, ChevronUp, Settings2,
  Palette, Star
} from 'lucide-react';
import { getSettings, updateSettings, uploadQRCode, changePassword } from '../../utils/api';
import toast from 'react-hot-toast';

const styles = `
.admin-settings {}

.save-all-btn { gap: 8px; }

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 100px;
}

.settings-section {
  padding: 0 !important;
  overflow: hidden;
}

.section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: 22px 28px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  text-align: left;
  transition: background 0.15s;
  color: var(--text);
}

.section-toggle:hover { background: var(--bg); }

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--primary);
}

.section-title h2 {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
}

.section-body {
  padding: 0 28px 28px;
  border-top: 1px solid var(--border);
}

.section-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 20px;
  margin-top: 16px;
  line-height: 1.55;
}

.field-hint {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 6px;
}

.logo-upload-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.logo-upload-area {
  width: 220px;
  height: 80px;
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.2s;
}

.logo-upload-area:hover { border-color: var(--accent); }

.logo-preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: 8px;
}

.logo-placeholder {
  text-align: center;
  padding: 12px;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.logo-placeholder svg { margin-bottom: 4px; }
.logo-placeholder p { font-weight: 500; margin-bottom: 2px; }
.logo-placeholder span { font-size: 0.72rem; }

.logo-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.danger-btn { color: var(--danger) !important; border-color: var(--danger) !important; }
.danger-btn:hover { background: var(--danger) !important; color: white !important; }

.banner-slides-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
  width: 100%;
  /* removed fixed height — lets content expand naturally */
}

.slide-image {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.slide-img-preview {
  width: 100%;
  height: auto;          /* ← was 160px fixed, now adapts to image */
  object-fit: contain;   /* ← was 'cover' (crops), now 'contain' (full image) */
  display: block;
}


.slide-editor-card {
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.slide-editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.slide-num {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.remove-slide-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.remove-slide-btn:hover { background: #fde8e8; }

.slide-img-upload {
  border-bottom: 1px solid var(--border);
  min-height: 140px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fafafa;
  transition: background 0.2s;
}

.slide-img-upload:hover { background: var(--bg); }



.slide-img-placeholder {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
}

.slide-img-placeholder svg { margin-bottom: 8px; }
.slide-img-placeholder p { font-weight: 500; margin-bottom: 4px; font-size: 0.9rem; }
.slide-img-placeholder span { font-size: 0.78rem; }

.slide-editor-card .form-row,
.slide-editor-card .form-group { padding: 0 16px; }

.slide-editor-card .form-row { padding-top: 16px; padding-bottom: 0; }
.slide-editor-card .form-row:last-child { padding-bottom: 16px; }

.add-slide-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
}

.add-slide-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(233,69,96,0.04); }

.features-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.feature-edit-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 14px;
  background: var(--bg);
  border-radius: var(--radius);
  flex-wrap: wrap;
}

.feature-num {
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-bottom: 4px;
}

.flex1 { flex: 1; min-width: 120px; }
.flex2 { flex: 2; min-width: 200px; }

.feature-edit-row .form-group { margin-bottom: 0; }

.qr-upload-area {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.qr-placeholder {
  text-align: center;
  padding: 40px;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}

.qr-placeholder:hover { background: var(--bg); }
.qr-placeholder p { font-weight: 500; margin: 12px 0 4px; }
.qr-placeholder span { font-size: 0.8rem; color: var(--text-muted); }

.qr-preview-wrap { text-align: center; padding: 20px; width: 100%; }

.qr-preview-img {
  width: 180px;
  height: 180px;
  object-fit: contain;
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 8px;
  background: white;
  display: block;
  margin: 0 auto 16px;
}

.change-qr-btn {
  background: none;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  color: var(--text-muted);
  transition: all 0.2s;
}

.change-qr-btn:hover { border-color: var(--accent); color: var(--accent); }

.pass-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.pass-input-wrap input { padding-right: 44px; }

.toggle-pass-btn {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 0;
}

.toggle-pass-btn:hover { color: var(--primary); }

.sticky-save-bar {
  position: fixed;
  bottom: 0;
  left: 260px;
  right: 0;
  background: white;
  border-top: 2px solid var(--accent);
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
}

.sticky-save-bar span {
  font-size: 0.88rem;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .sticky-save-bar { left: 0; }
  .section-body { padding: 0 16px 20px; }
  .section-toggle { padding: 18px 16px; }
}

@media (max-width: 600px) {
  .logo-upload-row { flex-direction: column; align-items: flex-start; }
  .feature-edit-row { flex-direction: column; align-items: flex-start; }
  .flex1, .flex2 { width: 100%; }
}
`;

/* ── tiny helpers ── */
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${API_URL}/settings/admin/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};

const Section = ({ icon, title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="settings-section card">
      <button className="section-toggle" onClick={() => setOpen(o => !o)}>
        <div className="section-title">
          {icon}
          <h2>{title}</h2>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
};

const BannerSlideEditor = ({ slides, onChange }) => {
  const fileRefs = useRef({});

  const addSlide = () => {
    onChange([...slides, { image: '', title: '', subtitle: '', cta_label: '', cta_link: '/products' }]);
  };

  const removeSlide = (i) => onChange(slides.filter((_, idx) => idx !== i));

  const updateSlide = (i, key, val) => {
    onChange(slides.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
  };

  const handleImageUpload = async (i, file) => {
    if (!file) return;
    try {
      const data = await uploadToCloudinary(file);
      updateSlide(i, 'image', data.url);
      toast.success('Banner image uploaded!');
    } catch {
      updateSlide(i, 'image', URL.createObjectURL(file));
      toast.error('Upload endpoint not found — preview only. Add /settings/admin/upload-image route.');
    }
  };

  return (
    <div className="banner-slides-editor">
      {slides.map((slide, i) => (
        <div key={i} className="slide-editor-card">
          <div className="slide-editor-head">
            <span className="slide-num">Slide {i + 1}</span>
            <button className="remove-slide-btn" onClick={() => removeSlide(i)}>
              <Trash2 size={15} /> Remove
            </button>
          </div>

          <div
            className="slide-img-upload"
            onClick={() => { fileRefs.current[i] = fileRefs.current[i] || document.createElement('input'); fileRefs.current[i].click(); }}
          >
            {slide.image
              ? <img src={slide.image} alt={`Slide ${i + 1}`} className="slide-img-preview" />
              : <div className="slide-img-placeholder"><Image size={32} /><p>Click to upload banner image</p><span>Recommended: 1400×420px</span></div>
            }
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={el => fileRefs.current[i] = el}
              onChange={e => handleImageUpload(i, e.target.files[0])}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Slide Title</label>
              <input value={slide.title} onChange={e => updateSlide(i, 'title', e.target.value)} placeholder="e.g. New Collection" />
            </div>
            <div className="form-group">
              <label>Eyebrow Text</label>
              <input value={slide.subtitle} onChange={e => updateSlide(i, 'subtitle', e.target.value)} placeholder="e.g. Exclusive 2025" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Button Label</label>
              <input value={slide.cta_label} onChange={e => updateSlide(i, 'cta_label', e.target.value)} placeholder="e.g. Shop Now" />
            </div>
            <div className="form-group">
              <label>Button Link</label>
              <input value={slide.cta_link} onChange={e => updateSlide(i, 'cta_link', e.target.value)} placeholder="/products" />
            </div>
          </div>
        </div>
      ))}

      <button className="add-slide-btn" onClick={addSlide}>
        <Plus size={16} /> Add Slide
      </button>
    </div>
  );
};

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    shop_name: '', shop_phone: '', shop_email: '', shop_tagline: '',
    upi_id: '', qr_image_url: '', shop_logo_url: '',
    hero_eyebrow: '', hero_title: '', hero_subtitle: '',
    featured_section_title: '',
    feature1_title: '', feature1_desc: '',
    feature2_title: '', feature2_desc: '',
    feature3_title: '', feature3_desc: '',
    feature4_title: '', feature4_desc: '',
    banner_slides: '[]',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState('');
  const [uploadingQr, setUploadingQr] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [bannerSlides, setBannerSlides] = useState([]);

  const qrRef = useRef();
  const logoRef = useRef();

  useEffect(() => {
    getSettings()
      .then(r => {
        setSettings(prev => ({ ...prev, ...r.data }));
        setQrPreview(r.data.qr_image_url || '');
        setLogoPreview(r.data.shop_logo_url || '');
        try { setBannerSlides(JSON.parse(r.data.banner_slides || '[]')); } catch { setBannerSlides([]); }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSettings({ ...settings, banner_slides: JSON.stringify(bannerSlides) });
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleQrChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleQrUpload = async () => {
    if (!qrFile) return;
    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append('qr', qrFile);
      const res = await uploadQRCode(formData);
      set('qr_image_url', res.data.qr_url);
      setQrFile(null);
      toast.success('QR code uploaded!');
    } catch {
      toast.error('Failed to upload QR code');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('logo', logoFile);
      const res = await fetch(`${API_URL}/settings/admin/upload-logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      set('shop_logo_url', data.logo_url);
      setLogoFile(null);
      toast.success('Logo uploaded!');
    } catch {
      toast.error('Upload endpoint not ready. Use Save Settings after adding upload-logo route.');
      set('shop_logo_url', logoPreview);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passForm.newPassword.length < 6) { toast.error('Min. 6 characters'); return; }
    try {
      await changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <>
      <style>{styles}</style>
      <div className="admin-settings">
        <div className="page-header">
          <div>
            <h1>Settings</h1>
            <p>Manage everything your customers see</p>
          </div>
          <button className="btn btn-primary save-all-btn" onClick={handleSaveSettings} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving…' : 'Save All Settings'}
          </button>
        </div>

        <div className="settings-sections">

          <Section icon={<Store size={20} />} title="Shop Information">
            <div className="form-row">
              <div className="form-group">
                <label>Shop Name</label>
                <input value={settings.shop_name} onChange={e => set('shop_name', e.target.value)} placeholder="Your Shop Name" />
                <span className="field-hint">Shown in navbar and browser tab</span>
              </div>
              <div className="form-group">
                <label>Tagline</label>
                <input value={settings.shop_tagline} onChange={e => set('shop_tagline', e.target.value)} placeholder="e.g. Handcrafted with love" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Phone</label>
                <input value={settings.shop_phone} onChange={e => set('shop_phone', e.target.value)} placeholder="+91 99999 99999" />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input value={settings.shop_email} onChange={e => set('shop_email', e.target.value)} placeholder="shop@example.com" />
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 320 }}>
              <label>UPI ID</label>
              <input value={settings.upi_id} onChange={e => set('upi_id', e.target.value)} placeholder="yourname@upi" />
              <span className="field-hint">Shown to customers during checkout</span>
            </div>
          </Section>

          <Section icon={<Palette size={20} />} title="Shop Logo">
            <p className="section-desc">Upload your shop logo. It will appear in the navbar instead of the text name.</p>
            <div className="logo-upload-row">
              <div className="logo-upload-area" onClick={() => logoRef.current.click()}>
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" className="logo-preview-img" />
                  : <div className="logo-placeholder"><Upload size={28} /><p>Click to upload logo</p><span>PNG/SVG recommended, transparent background</span></div>
                }
              </div>
              <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} hidden />
              <div className="logo-actions">
                <button className="btn btn-outline" onClick={() => logoRef.current.click()}>
                  <Upload size={16} /> Choose Logo
                </button>
                {logoFile && (
                  <button className="btn btn-primary" onClick={handleLogoUpload} disabled={uploadingLogo}>
                    <Save size={16} /> {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
                  </button>
                )}
                {logoPreview && !logoFile && (
                  <button className="btn btn-outline danger-btn" onClick={() => { setLogoPreview(''); set('shop_logo_url', ''); }}>
                    <Trash2 size={16} /> Remove Logo
                  </button>
                )}
              </div>
            </div>
          </Section>

          <Section icon={<Image size={20} />} title="Hero Banner Slides">
            <p className="section-desc">
              Add banner slides for the homepage hero slider. Leave empty to show the simple text hero instead.
              Each slide can have an image, title, eyebrow text, and a call-to-action button.
            </p>
            <BannerSlideEditor slides={bannerSlides} onChange={setBannerSlides} />
          </Section>

          <Section icon={<Settings2 size={20} />} title="Hero Text (shown when no banner slides)" defaultOpen={false}>
            <p className="section-desc">This text hero is shown when you haven't added any banner slides above.</p>
            <div className="form-row">
              <div className="form-group">
                <label>Eyebrow Text</label>
                <input value={settings.hero_eyebrow} onChange={e => set('hero_eyebrow', e.target.value)} placeholder="e.g. New Arrivals" />
              </div>
              <div className="form-group">
                <label>Hero Title</label>
                <input value={settings.hero_title} onChange={e => set('hero_title', e.target.value)} placeholder="e.g. Discover Products You'll Love" />
              </div>
            </div>
            <div className="form-group">
              <label>Hero Subtitle</label>
              <textarea value={settings.hero_subtitle} onChange={e => set('hero_subtitle', e.target.value)}
                rows={2} placeholder="A short description below the title" />
            </div>
          </Section>

          <Section icon={<Star size={20} />} title="Featured Products Section">
            <div className="form-group" style={{ maxWidth: 360 }}>
              <label>Section Heading</label>
              <input value={settings.featured_section_title} onChange={e => set('featured_section_title', e.target.value)} placeholder="e.g. Half Sarees" />
              <span className="field-hint">The heading above the featured products grid on the homepage</span>
            </div>
          </Section>

          <Section icon={<Settings2 size={20} />} title="Features Bar (4 Trust Badges)" defaultOpen={false}>
            <p className="section-desc">The four icons shown below the banner (Fast Delivery, Secure Payment, etc.)</p>
            <div className="features-editor">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="feature-edit-row">
                  <span className="feature-num">{n}</span>
                  <div className="form-group flex1">
                    <label>Title</label>
                    <input
                      value={settings[`feature${n}_title`]}
                      onChange={e => set(`feature${n}_title`, e.target.value)}
                      placeholder={['Fast Delivery', 'Secure Payment', 'Easy Returns', '24/7 Support'][n - 1]}
                    />
                  </div>
                  <div className="form-group flex2">
                    <label>Description</label>
                    <input
                      value={settings[`feature${n}_desc`]}
                      onChange={e => set(`feature${n}_desc`, e.target.value)}
                      placeholder={['Quick shipping to your doorstep', 'COD & UPI available', 'Hassle-free returns', 'Always here to help'][n - 1]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<QrCode size={20} />} title="UPI QR Code">
            <p className="section-desc">Upload your UPI QR code. Customers will scan this during checkout.</p>
            <div className="qr-upload-area">
              {qrPreview ? (
                <div className="qr-preview-wrap">
                  <img src={qrPreview} alt="QR Code" className="qr-preview-img" />
                  <button className="change-qr-btn" onClick={() => qrRef.current.click()}>Change QR Code</button>
                </div>
              ) : (
                <div className="qr-placeholder" onClick={() => qrRef.current.click()}>
                  <QrCode size={48} color="var(--border)" />
                  <p>Click to upload QR Code</p>
                  <span>JPG, PNG up to 5MB</span>
                </div>
              )}
            </div>
            <input ref={qrRef} type="file" accept="image/*" onChange={handleQrChange} hidden />
            {qrFile && (
              <button className="btn btn-primary" onClick={handleQrUpload} disabled={uploadingQr}
                style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                <Upload size={18} /> {uploadingQr ? 'Uploading…' : 'Upload QR Code'}
              </button>
            )}
            {!qrPreview && !qrFile && (
              <button className="btn btn-outline" onClick={() => qrRef.current.click()}
                style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                <Upload size={18} /> Select QR Image
              </button>
            )}
          </Section>

          <Section icon={<Lock size={20} />} title="Change Password" defaultOpen={false}>
            <form onSubmit={handleChangePassword} style={{ maxWidth: 420 }}>
              <div className="form-group">
                <label>Current Password</label>
                <div className="pass-input-wrap">
                  <input type={showPass ? 'text' : 'password'} value={passForm.currentPassword}
                    onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••" required />
                  <button type="button" className="toggle-pass-btn" onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passForm.newPassword}
                  onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 6 characters" required />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={passForm.confirmPassword}
                  onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat new password" required />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <Lock size={18} /> Change Password
              </button>
            </form>
          </Section>

        </div>

        <div className="sticky-save-bar">
          <span>Don't forget to save your changes!</span>
          <button className="btn btn-primary" onClick={handleSaveSettings} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;

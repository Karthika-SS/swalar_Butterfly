import { useState, useEffect } from "react";

const policyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .sb-policy-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: sbFadeIn 0.2s ease;
  }

  @keyframes sbFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes sbSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sb-policy-modal {
    background: #fffdf9;
    border-radius: 16px;
    width: 100%;
    max-width: 680px;
    max-height: 88vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: sbSlideUp 0.28s ease;
    box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  }

  .sb-policy-header {
    background: linear-gradient(135deg, #7b3fa0 0%, #c063e0 100%);
    padding: 28px 32px 24px;
    position: relative;
    flex-shrink: 0;
  }

  .sb-policy-header-badge {
    display: inline-block;
    background: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.9);
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 10px;
  }

  .sb-policy-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.7rem;
    font-weight: 600;
    color: white;
    margin: 0 0 6px;
    line-height: 1.2;
  }

  .sb-policy-header p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: rgba(255,255,255,0.75);
    margin: 0;
  }

  .sb-policy-close {
    position: absolute;
    top: 20px; right: 20px;
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    width: 34px; height: 34px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
    line-height: 1;
  }
  .sb-policy-close:hover { background: rgba(255,255,255,0.35); }

  .sb-policy-body {
    overflow-y: auto;
    padding: 28px 32px 32px;
    font-family: 'DM Sans', sans-serif;
  }

  .sb-policy-intro {
    background: #fdf4ff;
    border-left: 3px solid #c063e0;
    border-radius: 0 8px 8px 0;
    padding: 14px 18px;
    font-size: 0.87rem;
    color: #4a4a4a;
    line-height: 1.7;
    margin-bottom: 24px;
  }

  .sb-policy-contact-line {
    font-size: 0.83rem;
    color: #666;
    margin-top: 8px;
  }

  .sb-policy-contact-line a {
    color: #9b4dca;
    font-weight: 500;
    text-decoration: none;
  }

  .sb-policy-section {
    margin-bottom: 20px;
    border: 1px solid #f0e6f8;
    border-radius: 10px;
    overflow: hidden;
  }

  .sb-policy-section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: #faf5ff;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
  }
  .sb-policy-section-header:hover { background: #f3e8ff; }

  .sb-policy-section-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .sb-policy-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 0.97rem;
    font-weight: 600;
    color: #3a1a50;
    flex: 1;
  }

  .sb-policy-chevron {
    color: #9b4dca;
    font-size: 13px;
    transition: transform 0.2s;
  }
  .sb-policy-chevron.open { transform: rotate(180deg); }

  .sb-policy-section-body {
    padding: 16px 18px;
    font-size: 0.85rem;
    color: #555;
    line-height: 1.75;
    border-top: 1px solid #f0e6f8;
  }

  .sb-policy-section-body ul {
    margin: 8px 0 0;
    padding-left: 18px;
  }

  .sb-policy-section-body li {
    margin-bottom: 6px;
  }

  .sb-policy-tag {
    display: inline-block;
    background: #fce8ff;
    color: #7b3fa0;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .sb-policy-footer {
    flex-shrink: 0;
    padding: 16px 32px;
    border-top: 1px solid #f0e6f8;
    display: flex;
    gap: 10px;
    background: #fffdf9;
  }

  .sb-policy-btn {
    flex: 1;
    padding: 11px 20px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.84rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    text-decoration: none;
    display: flex; align-items: center; justify-content: center;
    gap: 6px;
  }

  .sb-policy-btn-wa {
    background: #25d366;
    color: white;
  }
  .sb-policy-btn-wa:hover { background: #1ebe5d; }

  .sb-policy-btn-close {
    background: #f3e8ff;
    color: #7b3fa0;
  }
  .sb-policy-btn-close:hover { background: #e9d5ff; }

  @media (max-width: 600px) {
    .sb-policy-header { padding: 22px 20px 18px; }
    .sb-policy-header h2 { font-size: 1.3rem; }
    .sb-policy-body { padding: 20px 20px 24px; }
    .sb-policy-footer { padding: 14px 20px; flex-direction: column; }
  }
`;

const sections = [
  {
    icon: "🎨",
    iconBg: "#fce8ff",
    tag: "Color & Material",
    title: "Color difference & material exchange",
    body: (
      <>
        <p>Exchange/Return is <strong>not accepted</strong> for the following reasons:</p>
        <ul>
          <li>A <strong>10–15% color difference</strong> may occur due to screen resolution and lighting — this is normal and not a defect.</li>
          <li>If the customer does not like the material or color of the product after ordering. All product details including fabric type are clearly mentioned in the description — please read carefully before placing your order.</li>
          <li>A <strong>sudden change of mind</strong> after placing the order.</li>
        </ul>
      </>
    ),
  },
  {
    icon: "📏",
    iconBg: "#e8f4ff",
    tag: "Size Issues",
    title: "Exchange due to size issues",
    body: (
      <>
        <p>Please refer to the <strong>size chart on each product page</strong> before confirming your order. If you are unsure about your size, reach out to us — we'll happily assist you find the perfect fit.</p>
        <ul>
          <li>We ship the exact size you ordered.</li>
          <li>If we send the <strong>wrong size</strong>, we will exchange it — contact us via Instagram or WhatsApp with your order details.</li>
          <li>Please consider the <strong>tag size in numbers</strong> when checking fit.</li>
        </ul>
      </>
    ),
  },
  {
    icon: "📦",
    iconBg: "#fff4e8",
    tag: "Damaged Products",
    title: "Exchange due to damaged products",
    body: (
      <>
        <p>We have a QC team that carefully checks all outfits before dispatch — receiving a damaged item is extremely unlikely.</p>
        <p>However, if you do receive a damaged or incorrect product:</p>
        <ul>
          <li>Record a <strong>proper unboxing video</strong> — without any pause or cut — clearly showing the damage.</li>
          <li>Contact us via <strong>Instagram or WhatsApp</strong> with your order details and the unboxing video.</li>
          <li>We will review and process your exchange promptly.</li>
        </ul>
      </>
    ),
  },
];

const PolicySection = ({ section }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="sb-policy-section">
      <div className="sb-policy-section-header" onClick={() => setOpen(o => !o)}>
        <div className="sb-policy-section-icon" style={{ background: section.iconBg }}>
          {section.icon}
        </div>
        <span className="sb-policy-section-title">{section.title}</span>
        <span className={`sb-policy-chevron ${open ? 'open' : ''}`}>▼</span>
      </div>
      {open && (
        <div className="sb-policy-section-body">
          <div className="sb-policy-tag">{section.tag}</div>
          {section.body}
        </div>
      )}
    </div>
  );
};

const PolicyModal = ({ isOpen, onClose, shopPhone = "918778921938" }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const waLink = `https://wa.me/${shopPhone.replace(/[^0-9]/g, '')}`;

  return (
    <>
      <style>{policyStyles}</style>
      <div className="sb-policy-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="sb-policy-modal">

          {/* Header */}
          <div className="sb-policy-header">
            <button className="sb-policy-close" onClick={onClose}>✕</button>
            <div className="sb-policy-header-badge">Salwar Butterfly</div>
            <h2>Cancellation, Return &amp; Exchange Policy</h2>
            <p>Customer-friendly · Stress-free shopping</p>
          </div>

          {/* Body */}
          <div className="sb-policy-body">
            <div className="sb-policy-intro">
              We follow a very customer-friendly policy to ensure your purchases are stress-free. We are always with you — before and after your purchase.
              <div className="sb-policy-contact-line">
                Have questions before ordering? Ask us on{" "}
                <a href={waLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>{" "}
                or Instagram — about fabric, design, measurements, or anything else.
              </div>
            </div>

            {sections.map((s, i) => (
              <PolicySection key={i} section={s} />
            ))}
          </div>

          {/* Footer */}
          <div className="sb-policy-footer">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="sb-policy-btn sb-policy-btn-wa"
            >
              💬 Chat on WhatsApp
            </a>
            <button className="sb-policy-btn sb-policy-btn-close" onClick={onClose}>
              Got it, Close
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default PolicyModal;

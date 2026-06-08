import { useState, useEffect } from "react";

const sizeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

  .sb-size-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: sbSizeFadeIn 0.2s ease;
  }

  @keyframes sbSizeFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes sbSizeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sb-size-modal {
    background: #fffdf9;
    border-radius: 16px;
    width: 100%;
    max-width: 620px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: sbSizeSlideUp 0.28s ease;
    box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  }

  .sb-size-header {
    background: linear-gradient(135deg, #7b3fa0 0%, #c063e0 100%);
    padding: 24px 28px 20px;
    position: relative;
    flex-shrink: 0;
  }

  .sb-size-header-badge {
    display: inline-block;
    background: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.9);
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 8px;
  }

  .sb-size-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
    margin: 0 40px 4px 0;
  }

  .sb-size-header p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.75);
    margin: 0;
  }

  .sb-size-close {
    position: absolute;
    top: 18px; right: 18px;
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    width: 32px; height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }
  .sb-size-close:hover { background: rgba(255,255,255,0.35); }

  .sb-size-body {
    overflow-y: auto;
    padding: 24px 24px 28px;
    font-family: 'DM Sans', sans-serif;
  }

  .sb-size-unit-note {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fdf4ff;
    border: 1px solid #e8c8f8;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 0.78rem;
    color: #7b3fa0;
    font-weight: 500;
    margin-bottom: 16px;
  }

  .sb-size-table-wrap {
    overflow-x: auto;
    border-radius: 10px;
    border: 1px solid #ede0f8;
    margin-bottom: 20px;
  }

  .sb-size-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .sb-size-table thead tr {
    background: #3a1a50;
  }

  .sb-size-table thead th {
    color: white;
    font-weight: 500;
    font-size: 0.75rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 12px 14px;
    text-align: center;
    white-space: nowrap;
  }

  .sb-size-table thead th:first-child { text-align: left; padding-left: 18px; }

  .sb-size-table tbody tr {
    border-bottom: 1px solid #f0e6f8;
    transition: background 0.15s;
  }
  .sb-size-table tbody tr:last-child { border-bottom: none; }
  .sb-size-table tbody tr:hover { background: #fdf4ff; }

  .sb-size-table tbody td {
    padding: 11px 14px;
    text-align: center;
    color: #444;
    font-size: 0.88rem;
  }

  .sb-size-table tbody td:first-child {
    text-align: left;
    padding-left: 18px;
    font-weight: 600;
    color: #7b3fa0;
    font-size: 0.9rem;
  }

  .sb-size-notes {
    background: #faf5ff;
    border-radius: 10px;
    padding: 16px 18px;
    border: 1px solid #ede0f8;
  }

  .sb-size-notes-title {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #9b4dca;
    margin-bottom: 10px;
  }

  .sb-size-notes ul {
    margin: 0;
    padding-left: 16px;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .sb-size-notes li {
    font-size: 0.82rem;
    color: #555;
    line-height: 1.6;
  }

  .sb-size-notes li strong {
    color: #3a1a50;
  }

  .sb-size-footer {
    flex-shrink: 0;
    padding: 14px 24px;
    border-top: 1px solid #f0e6f8;
    background: #fffdf9;
    display: flex;
    gap: 10px;
  }

  .sb-size-btn {
    flex: 1;
    padding: 11px 16px;
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

  .sb-size-btn-wa {
    background: #25d366;
    color: white;
  }
  .sb-size-btn-wa:hover { background: #1ebe5d; }

  .sb-size-btn-close {
    background: #f3e8ff;
    color: #7b3fa0;
  }
  .sb-size-btn-close:hover { background: #e9d5ff; }

  @media (max-width: 520px) {
    .sb-size-header { padding: 20px 20px 16px; }
    .sb-size-body { padding: 18px 16px 22px; }
    .sb-size-footer { padding: 12px 16px; flex-direction: column; }
    .sb-size-table thead th,
    .sb-size-table tbody td { padding: 10px 10px; }
  }
`;

const sizes = [
  { size: "S",   bust: 36, waist: 34, hip: 39, shoulder: 14   },
  { size: "M",   bust: 38, waist: 36, hip: 41, shoulder: 14.5 },
  { size: "L",   bust: 40, waist: 38, hip: 43, shoulder: 15   },
  { size: "XL",  bust: 42, waist: 40, hip: 45, shoulder: 15.5 },
  { size: "2XL", bust: 44, waist: 42, hip: 47, shoulder: 16   },
  { size: "3XL", bust: 46, waist: 44, hip: 49, shoulder: 16.5 },
];

const SizeGuideModal = ({ isOpen, onClose, shopPhone = "918778921938" }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const waLink = `https://wa.me/${shopPhone.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20need%20help%20with%20sizing`;

  return (
    <>
      <style>{sizeStyles}</style>
      <div
        className="sb-size-overlay"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div className="sb-size-modal">

          {/* Header */}
          <div className="sb-size-header">
            <button className="sb-size-close" onClick={onClose}>✕</button>
            <div className="sb-size-header-badge">Salwar Butterfly</div>
            <h2>Women's Size Guide</h2>
            <p>Garment measurements · All sizes in inches</p>
          </div>

          {/* Body */}
          <div className="sb-size-body">

            <div className="sb-size-unit-note">
              📐 All measurements are in <strong>&nbsp;Inches&nbsp;</strong> — garment measurements, not body measurements
            </div>

            {/* Table */}
            <div className="sb-size-table-wrap">
              <table className="sb-size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust</th>
                    <th>Waist</th>
                    <th>Hip</th>
                    <th>Shoulder</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map(row => (
                    <tr key={row.size}>
                      <td>{row.size}</td>
                      <td>{row.bust}"</td>
                      <td>{row.waist}"</td>
                      <td>{row.hip}"</td>
                      <td>{row.shoulder}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            <div className="sb-size-notes">
              <div className="sb-size-notes-title">📌 Important notes</div>
              <ul>
                <li>These are <strong>garment measurements</strong>, not body measurements. Take your body measurements and match to the garment accordingly.</li>
                <li>All garments have <strong>little to no margin</strong>.</li>
                <li>If you're on the borderline between two sizes, order the <strong>smaller size for a tighter fit</strong> or the <strong>larger size for a relaxed fit</strong>. The larger size can always be altered if needed.</li>
                <li>Garment measurements refer to the outfit when it is <strong>laid flat</strong>.</li>
              </ul>
            </div>

          </div>

          {/* Footer */}
          <div className="sb-size-footer">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="sb-size-btn sb-size-btn-wa"
            >
              💬 Need sizing help?
            </a>
            <button className="sb-size-btn sb-size-btn-close" onClick={onClose}>
              Got it, Close
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default SizeGuideModal;

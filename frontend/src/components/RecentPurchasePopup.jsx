import { useState, useEffect, useRef } from 'react';

// ── Fetches recent delivered/confirmed orders for social proof ─
const fetchRecentPurchases = async () => {
  try {
    const base = import.meta.env.REACT_APP_API_URL || 'https://swalar-butterfly.onrender.com/api' ||'https://www.salwarbutterfly.in/api';
    const res = await fetch(`${base}/orders/recent-purchases`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

// ── Extract city from address string ──────────────────────────
// Address format in your DB: "123 Street, Area, City, State - PIN"
const extractCity = (address = '') => {
  if (!address) return 'India';
  const parts = address.split(',').map(p => p.trim());
  // Try 3rd part first (common format), fallback to 2nd, then 1st
  const city = parts[2] || parts[1] || parts[0] || 'India';
  // Strip PIN codes and state abbreviations
  return city.replace(/\s*-\s*\d+.*$/, '').replace(/\d+/g, '').trim() || 'India';
};

// ── Time ago helper ───────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return 'just now';
  if (mins < 60)  return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7)   return `${days} day${days > 1 ? 's' : ''} ago`;
  return null; // don't show if older than 7 days
};

// ── Styles ────────────────────────────────────────────────────
const popupStyles = `
  @keyframes rpp-slideIn {
    from { transform: translateX(-120%); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }
  @keyframes rpp-slideOut {
    from { transform: translateX(0);     opacity: 1; }
    to   { transform: translateX(-120%); opacity: 0; }
  }
  @keyframes rpp-progress {
    from { width: 100%; }
    to   { width: 0%; }
  }

  .rpp-wrap {
    position: fixed;
    bottom: 24px;
    left: 20px;
    z-index: 9999;
    max-width: 320px;
    width: calc(100vw - 40px);
  }

  .rpp-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
    animation: rpp-slideIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;
    position: relative;
  }

  .rpp-card.leaving {
    animation: rpp-slideOut 0.35s ease-in forwards;
  }

  .rpp-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 36px 14px 14px;
    background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
  }

  .rpp-img {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255,255,255,0.2);
    flex-shrink: 0;
    border: 2px solid rgba(255,255,255,0.4);
  }

  .rpp-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .rpp-img-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
  }

  .rpp-name {
  font-weight: 700;
  color: white;
  font-size: 0.84rem;
}
  .rpp-text { flex: 1; min-width: 0; }

  .rpp-headline {
    font-family: 'DM Sans', 'Poppins', sans-serif;
    font-size: 0.78rem;
    color: rgba(255,255,255,0.9);
    margin: 0 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rpp-product {
    font-family: 'DM Sans', 'Poppins', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: white;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rpp-time {
    font-family: 'DM Sans', 'Poppins', sans-serif;
    font-size: 0.72rem;
    color: #ffd700;
    font-weight: 600;
    margin: 0;
  }

  .rpp-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.7);
    padding: 2px;
    line-height: 1;
    font-size: 1rem;
    transition: color 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rpp-close:hover { color: white; }

  .rpp-progress {
    height: 3px;
    background: rgba(255,255,255,0.15);
  }

  .rpp-progress-bar {
    height: 100%;
    background: rgba(255,255,255,0.55);
    animation: rpp-progress linear forwards;
  }

  @media (max-width: 400px) {
    .rpp-wrap { left: 12px; bottom: 16px; width: calc(100vw - 24px); }
  }
`;

// ── Main Component ────────────────────────────────────────────
const SHOW_DURATION = 10000;
const INTERVAL     = 60000;

const RecentPurchasePopup = () => {
  const [purchases, setPurchases]   = useState([]);
  const [current, setCurrent]       = useState(null);   // { item, timeStr }
  const [leaving, setLeaving]       = useState(false);
  const [dismissed, setDismissed]   = useState(false);
  const indexRef   = useRef(0);
  const hideTimer  = useRef(null);
  const nextTimer  = useRef(null);

  // Fetch on mount
  useEffect(() => {
    fetchRecentPurchases().then(data => {
      console.log('API response:', data[0]);
      console.log('API response:', data);
      // Filter to only items with a valid time (within 7 days)
      const valid = data.filter(p => timeAgo(p.created_at) !== null);
      setPurchases(valid);
    });
  }, []);

  // Start cycling once we have data
  useEffect(() => {
    if (purchases.length === 0) return;

    const showNext = () => {
      if (dismissed) return;
      const item = purchases[indexRef.current % purchases.length];
      const timeStr = timeAgo(item.created_at);
      if (!timeStr) { indexRef.current++; showNext(); return; }

      setCurrent({ item, timeStr });
      setLeaving(false);

      // Auto-hide after SHOW_DURATION
      hideTimer.current = setTimeout(() => {
        setLeaving(true);
        setTimeout(() => {
          setCurrent(null);
          setLeaving(false);
          indexRef.current++;
          nextTimer.current = setTimeout(showNext, INTERVAL);
        }, 380);
      }, SHOW_DURATION);
    };

    // First popup after 10 seconds
    nextTimer.current = setTimeout(showNext, 40000);

    return () => {
      clearTimeout(hideTimer.current);
      clearTimeout(nextTimer.current);
    };
  }, [purchases, dismissed]);

  const handleClose = () => {
    clearTimeout(hideTimer.current);
    clearTimeout(nextTimer.current);
    setLeaving(true);
    setTimeout(() => {
      setCurrent(null);
      setLeaving(false);
      setDismissed(true); // allow next cycle to continue
      indexRef.current++;
      nextTimer.current = setTimeout(() => {
        // resume after close
        if (purchases.length > 0) {
          const item = purchases[indexRef.current % purchases.length];
          const timeStr = timeAgo(item.created_at);
          if (timeStr) {
            setCurrent({ item, timeStr });
            hideTimer.current = setTimeout(() => {
              setLeaving(true);
              setTimeout(() => { setCurrent(null); setLeaving(false); indexRef.current++; }, 380);
            }, SHOW_DURATION);
          }
        }
      }, INTERVAL);
    }, 380);
  };

  if (!current) return <style>{popupStyles}</style>;

  const { item, timeStr } = current;
  const city = extractCity(item.customer_address);

  return (
    <>
      <style>{popupStyles}</style>
      <div className="rpp-wrap">
        <div className={`rpp-card ${leaving ? 'leaving' : ''}`}>
          <div className="rpp-inner">
            {/* Product image */}
            <div className="rpp-img">
              {item.product_image
                ? <img src={item.product_image} alt={item.product_name} />
                : <div className="rpp-img-fallback">🛍️</div>
              }
            </div>

            {/* Text */}
            <div className="rpp-text">
 <p className="rpp-headline">
  <span className="rpp-name">{item.customer_name}</span>
  {' '}from {city}
</p>
  <p className="rpp-product">{item.product_name}</p>
  <p className="rpp-time">{timeStr}</p>
</div>

            {/* Close */}
            <button className="rpp-close" onClick={handleClose} aria-label="Close">
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="rpp-progress">
            <div
              className="rpp-progress-bar"
              style={{ animationDuration: `${SHOW_DURATION}ms` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentPurchasePopup;
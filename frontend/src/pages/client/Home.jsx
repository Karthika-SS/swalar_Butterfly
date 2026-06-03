import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Phone, Heart, Sparkles, Star } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { getProducts, getCategories, getSettings } from '../../utils/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --red:         #c0392b;
    --red-hover:   #a93226;
    --cream:       #faf9f7;
    --white:       #ffffff;
    --text:        #1a1a1a;
    --text-muted:  #6b6b6b;
    --text-light:  #9e9e9e;
    --border:      #e8e8e8;
    --border-soft: #f0f0f0;
    --bg-soft:     #f5f4f2;
  }

  * { box-sizing: border-box; }

  .wc-home {
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
  }

  /* ══════════════════════
     HERO SLIDER
  ══════════════════════ */
  .wc-hero {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: #1a1a1a;
  }

  .wc-slider-track {
    position: relative;
    width: 100%;
    height: 480px;
  }

  .wc-slide {
    position: absolute; inset: 0;
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    background-color: #1a1a1a;
    opacity: 0;
    transition: opacity 0.9s ease;
  }
  .wc-slide.active { opacity: 1; z-index: 1; }

  .wc-slide::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 120px;
    background: linear-gradient(to top, rgba(0,0,0,0.18), transparent);
  }

  .wc-slide-content {
    position: relative; z-index: 2;
    height: 100%;
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 0 56px 48px;
    max-width: 700px;
  }

  .wc-slide-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.62rem;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.75);
    margin-bottom: 10px;
  }

  .wc-slide-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    font-weight: 600;
    color: white;
    line-height: 1.1;
    margin-bottom: 20px;
    letter-spacing: -0.5px;
  }

  .wc-slide-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--red);
    color: white;
    padding: 12px 28px;
    border-radius: 4px;
    text-decoration: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    width: fit-content;
    transition: background 0.2s, gap 0.2s;
  }
  .wc-slide-cta:hover { background: var(--red-hover); gap: 12px; }

  .wc-slider-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    background: white;
    border: none;
    color: var(--text);
    width: 40px; height: 40px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  }
  .wc-slider-arrow:hover { background: var(--red); color: white; }
  .wc-slider-arrow.left { left: 20px; }
  .wc-slider-arrow.right { right: 20px; }

  .wc-slider-dots {
    position: absolute;
    bottom: 18px; right: 24px;
    z-index: 10;
    display: flex; gap: 6px; align-items: center;
  }
  .wc-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.45);
    border: none; cursor: pointer; padding: 0;
    transition: all 0.3s;
  }
  .wc-dot.active { background: white; width: 20px; border-radius: 3px; }

  .wc-hero-fallback {
    background: #1a1a1a;
    min-height: 380px;
    display: flex; align-items: flex-end;
    padding: 56px;
    position: relative; overflow: hidden;
  }

  .wc-hero-fallback-inner { position: relative; z-index: 1; }

  /* ══════════════════════
     MARQUEE
  ══════════════════════ */
  .wc-marquee-strip {
    background: var(--red);
    padding: 9px 0;
    overflow: hidden;
    white-space: nowrap;
  }

  .wc-marquee-inner {
    display: inline-flex;
    animation: wc-marquee 24s linear infinite;
  }

  @keyframes wc-marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  .wc-marquee-item {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.63rem;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: white;
    padding: 0 28px;
    display: inline-flex; align-items: center; gap: 10px;
  }

  .wc-marquee-sep {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    flex-shrink: 0;
  }

  /* ══════════════════════
     CATEGORY CIRCLES
  ══════════════════════ */
  .wc-cats-section {
    padding: 40px 0 32px;
    background: var(--white);
    border-bottom: 1px solid var(--border-soft);
  }

  .wc-cats-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    gap: 28px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .wc-cat-item {
    display: flex; flex-direction: column;
    align-items: center; gap: 10px;
    text-decoration: none;
    transition: transform 0.2s;
    min-width: 80px;
  }
  .wc-cat-item:hover { transform: translateY(-4px); }

  .wc-cat-ring {
    width: 84px; height: 84px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--bg-soft);
    border: 2px solid var(--border);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .wc-cat-item:hover .wc-cat-ring {
    border-color: var(--red);
    box-shadow: 0 0 0 3px rgba(192,57,43,0.1);
  }
  .wc-cat-ring img { width: 100%; height: 100%; object-fit: cover; }

  .wc-cat-initial {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 600;
    color: var(--red);
    background: #fdf3f2;
  }

  .wc-cat-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    color: var(--text);
    font-weight: 500;
    text-align: center;
    max-width: 84px;
    line-height: 1.35;
  }

  /* ══════════════════════
     FEATURES STRIP
  ══════════════════════ */
  .wc-features-strip {
    background: var(--white);
    border-top: 1px solid var(--border-soft);
    border-bottom: 1px solid var(--border-soft);
  }

  .wc-features-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .wc-feature-cell {
    display: flex; align-items: center; gap: 12px;
    padding: 20px 24px;
    border-right: 1px solid var(--border-soft);
    transition: background 0.2s;
  }
  .wc-feature-cell:last-child { border-right: none; }
  .wc-feature-cell:hover { background: var(--bg-soft); }

  .wc-feature-icon {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: #fdf3f2;
    color: var(--red);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .wc-feature-cell h4 {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 2px;
  }
  .wc-feature-cell p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.68rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  /* ══════════════════════
     CATEGORY PRODUCT SECTIONS
  ══════════════════════ */
  .wc-cat-sections {
    background: var(--cream);
    padding-bottom: 40px;
  }

  .wc-cat-section {
    padding: 44px 0 0;
  }

  .wc-cat-section-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .wc-cat-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .wc-cat-section-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.5rem, 2.8vw, 2.1rem);
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.3px;
    line-height: 1;
  }

  .wc-cat-view-all {
    display: inline-flex;
    align-items: center;
    gap: 0;
    background: var(--red);
    color: white;
    padding: 14px 28px;
    border-radius: 6px;
    text-decoration: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.2px;
    transition: background 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
    line-height: 1.3;
    text-align: center;
  }
  .wc-cat-view-all:hover { background: var(--red-hover); }

  .wc-products-scroll-wrapper {
    position: relative;
  }

  .wc-products-scroll {
    display: flex;
    gap: 0;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .wc-products-scroll::-webkit-scrollbar { display: none; }

  .wc-products-scroll > * {
    flex: 0 0 calc(20% - 0px);
    min-width: 0;
    border-right: 1px solid var(--border-soft);
  }
  .wc-products-scroll > *:last-child { border-right: none; }

  .wc-row-arrow {
    position: absolute;
    top: 50%; transform: translateY(-50%);
    z-index: 5;
    width: 36px; height: 36px;
    border-radius: 50%;
    background: white;
    border: 1px solid var(--border);
    color: var(--text);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.2s;
  }
  .wc-row-arrow:hover { background: var(--red); color: white; border-color: var(--red); }
  .wc-row-arrow.left { left: -18px; }
  .wc-row-arrow.right { right: -18px; }

  .wc-cat-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 48px;
    border: 1px solid var(--border-soft);
    border-radius: 4px;
    background: white;
  }

  .wc-cat-section-divider {
    height: 1px;
    background: var(--border-soft);
    margin: 44px 40px 0;
    max-width: calc(1400px - 80px);
    margin-left: auto;
    margin-right: auto;
  }

  /* ══════════════════════
     TRUST STRIP
  ══════════════════════ */
  .wc-trust-strip {
    background: var(--white);
    border-top: 1px solid var(--border-soft);
    border-bottom: 1px solid var(--border-soft);
    padding: 14px 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 48px;
    flex-wrap: wrap;
  }

  .wc-trust-item {
    display: flex; align-items: center; gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--text);
  }

  .wc-trust-item span.sub { color: var(--text-muted); font-weight: 400; }

  /* ══════════════════════
     REVIEWS CAROUSEL
  ══════════════════════ */
  .wc-reviews-carousel {
    background: var(--white);
    border-top: 1px solid var(--border-soft);
    padding: 52px 0 56px;
  }

  .wc-reviews-carousel-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .wc-reviews-carousel-head {
    text-align: center;
    margin-bottom: 36px;
  }

  .wc-reviews-carousel-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    font-weight: 600;
    color: var(--text);
    margin: 0 0 6px;
    letter-spacing: -0.3px;
  }

  .wc-reviews-carousel-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .wc-reviews-track-wrapper {
    position: relative;
  }

  .wc-reviews-track {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 4px 2px 8px;
  }
  .wc-reviews-track::-webkit-scrollbar { display: none; }

  .wc-home-review-card {
    flex: 0 0 300px;
    background: var(--cream);
    border: 1px solid var(--border-soft);
    border-radius: 12px;
    padding: 22px;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .wc-home-review-card:hover {
    box-shadow: 0 6px 24px rgba(0,0,0,0.07);
    transform: translateY(-2px);
  }

  .wc-home-review-product {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    color: var(--red);
    font-weight: 600;
    letter-spacing: 0.3px;
    text-decoration: none;
    margin-bottom: 10px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .wc-home-review-product:hover { text-decoration: underline; }

  .wc-home-review-stars {
    display: flex;
    gap: 2px;
    margin-bottom: 12px;
  }

  .wc-home-review-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 6px;
  }

  .wc-home-review-body {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: var(--text-muted);
    line-height: 1.65;
    margin: 0 0 16px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .wc-home-review-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border-soft);
    padding-top: 12px;
  }

  .wc-home-review-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text);
  }

  .wc-home-review-date {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.68rem;
    color: var(--text-light);
  }

  .wc-home-review-verified {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    background: #1a1a1a;
    color: white;
    padding: 2px 7px;
    border-radius: 50px;
    letter-spacing: 0.3px;
  }

  .wc-reviews-nav-btn {
    position: absolute;
    top: 50%; transform: translateY(-50%);
    z-index: 5;
    width: 36px; height: 36px;
    border-radius: 50%;
    background: white;
    border: 1px solid var(--border);
    color: var(--text);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.2s;
  }
  .wc-reviews-nav-btn:hover { background: var(--red); color: white; border-color: var(--red); }
  .wc-reviews-nav-btn.left { left: -18px; }
  .wc-reviews-nav-btn.right { right: -18px; }

  .wc-reviews-empty-home {
    text-align: center;
    padding: 32px;
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
  }

  /* ══════════════════════
     INSTAGRAM BLOCK
  ══════════════════════ */
  .wc-insta-block {
    background: var(--bg-soft);
    border-top: 1px solid var(--border-soft);
    text-align: center;
    padding: 36px 24px;
  }

  .wc-insta-block p {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1rem, 2vw, 1.25rem);
    font-style: italic;
    color: var(--text);
    margin-bottom: 12px;
    line-height: 1.6;
  }

  .wc-insta-handle {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--red);
    letter-spacing: 0.5px;
    text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
    transition: opacity 0.2s;
  }
  .wc-insta-handle:hover { opacity: 0.75; }

  /* ══════════════════════
     LOADING / EMPTY
  ══════════════════════ */
  .wc-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 80px;
  }
  .wc-empty {
    text-align: center; padding: 64px 20px;
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
  }

  /* ══════════════════════
     RESPONSIVE
  ══════════════════════ */
  @media (max-width: 1200px) {
    .wc-products-scroll > * { flex: 0 0 25%; }
  }
  @media (max-width: 1024px) {
    .wc-features-inner { grid-template-columns: repeat(2, 1fr); }
    .wc-feature-cell:nth-child(2) { border-right: none; }
    .wc-feature-cell:nth-child(3),
    .wc-feature-cell:nth-child(4) { border-top: 1px solid var(--border-soft); }
    .wc-products-scroll > * { flex: 0 0 33.333%; }
  }
  @media (max-width: 768px) {
    .wc-slider-track { height: 300px; }
    .wc-slide-content { padding: 0 24px 36px; }
    .wc-cat-section-inner { padding: 0 16px; }
    .wc-products-scroll > * { flex: 0 0 50%; }
    .wc-trust-strip { gap: 20px; padding: 14px 20px; }
    .wc-cat-section-title { font-size: 1.4rem; }
    .wc-cats-inner { padding: 0 16px; gap: 16px; }
    .wc-hero-fallback { padding: 40px 24px; }
    .wc-cat-section-divider { margin: 36px 16px 0; }
    .wc-reviews-carousel-inner { padding: 0 20px; }
    .wc-home-review-card { flex: 0 0 260px; }
  }
  @media (max-width: 480px) {
    .wc-cat-ring { width: 68px; height: 68px; }
    .wc-features-inner { grid-template-columns: repeat(2, 1fr); }
    .wc-feature-cell { padding: 14px 14px; }
    .wc-products-scroll > * { flex: 0 0 70%; }
    .wc-row-arrow { display: none; }
    .wc-home-review-card { flex: 0 0 85vw; }
    .wc-reviews-nav-btn { display: none; }
  }
`;

const MARQUEE_ITEMS = [
  '👗 New Arrivals', '💝 Best Quality', '🚚 Fast Delivery',
  '👜 Kurtis & Sets', '🌸 Sarees', '💳 Online Payment',
  '🎀 Budget Friendly', '✨ Women\'s Choice',
];

// ── Star display helper ───────────────────────────────────────
const StarDisplay = ({ rating, size = 13 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        size={size}
        fill={s <= rating ? '#d4af37' : 'none'}
        stroke={s <= rating ? '#d4af37' : '#ddd'}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

// ── Reviews Carousel ──────────────────────────────────────────
const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/reviews/recent?limit=12`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (!loading && reviews.length === 0) return null;

  return (
    <section className="wc-reviews-carousel">
      <div className="wc-reviews-carousel-inner">
        <div className="wc-reviews-carousel-head">
          <h2 className="wc-reviews-carousel-title">Customer Reviews</h2>
          <p className="wc-reviews-carousel-sub">What our happy customers are saying 💕</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="wc-reviews-track-wrapper">
            <button className="wc-reviews-nav-btn left" onClick={() => scroll(-1)}>
              <ChevronLeft size={17} />
            </button>
            <div className="wc-reviews-track" ref={trackRef}>
              {reviews.map(review => (
                <div key={review.id} className="wc-home-review-card">
                  <Link
                    to={`/products/${review.product_id}`}
                    className="wc-home-review-product"
                  >
                    about {review.product_name}
                  </Link>

                  <div className="wc-home-review-stars">
                    <StarDisplay rating={review.rating} size={15} />
                    <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#9e9e9e', fontFamily: 'DM Sans, sans-serif' }}>
                      {new Date(review.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </span>
                  </div>

                  {review.title && (
                    <div className="wc-home-review-title">{review.title}</div>
                  )}
                  {review.body && (
                    <p className="wc-home-review-body">{review.body}</p>
                  )}

                  <div className="wc-home-review-footer">
                    <div>
                      <div className="wc-home-review-name">{review.customer_name}</div>
                    </div>
                    <span className="wc-home-review-verified">✓ Verified</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="wc-reviews-nav-btn right" onClick={() => scroll(1)}>
              <ChevronRight size={17} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ── Category hooks & components ───────────────────────────────
const useCategoryProducts = (categoryId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    getProducts({ category: categoryId, sort: 'newest' })
      .then(r => setProducts(r.data.slice(0, 8)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryId]);

  return { products, loading };
};

const CategorySection = ({ category, showDivider }) => {
  const { products, loading } = useCategoryProducts(category.id);
  const scrollRef = useRef(null);

  if (!loading && products.length === 0) return null;

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.offsetWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <>
      <section className="wc-cat-section">
        <div className="wc-cat-section-inner">
          <div className="wc-cat-section-head">
            <h2 className="wc-cat-section-title">{category.name}</h2>
            <Link to={`/products?category=${category.id}`} className="wc-cat-view-all">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="wc-cat-loading"><div className="spinner" /></div>
          ) : (
            <div className="wc-products-scroll-wrapper">
              <button className="wc-row-arrow left" onClick={() => scroll(-1)}>
                <ChevronLeft size={17} />
              </button>
              <div className="wc-products-scroll" ref={scrollRef}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <button className="wc-row-arrow right" onClick={() => scroll(1)}>
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>
      </section>
      {showDivider && <div className="wc-cat-section-divider" />}
    </>
  );
};

// ── Main Home Component ───────────────────────────────────────
const Home = () => {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings]     = useState({});
  const [loading, setLoading]       = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimer = useRef(null);

  const bannerSlides = (() => {
    try { return JSON.parse(settings.banner_slides || '[]'); }
    catch { return []; }
  })();

  const features = [
    { icon: <Truck size={17} />,  title: settings.feature1_title || 'Fast Delivery',    desc: settings.feature1_desc || '5–10 working days to your door' },
    { icon: <Shield size={17} />, title: settings.feature2_title || 'Secure Payment',   desc: settings.feature2_desc || 'GPay, PhonePe, Paytm & more' },
    { icon: <Heart size={17} />,  title: settings.feature3_title || 'Genuine Products', desc: settings.feature3_desc || '99% best product delivered' },
    { icon: <Phone size={17} />,  title: settings.feature4_title || 'WhatsApp Support', desc: settings.feature4_desc || 'Message us for any queries' },
  ];

  useEffect(() => {
    Promise.all([getCategories(), getSettings()])
      .then(([c, s]) => {
        const uniqueCategories = [
          ...new Map(c.data.map(cat => [cat.name, cat])).values()
        ];
        setCategories(uniqueCategories);
        const d = s.data?.shop_name !== undefined
          ? s.data
          : (s.data?.data || s.data || {});
        setSettings(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (bannerSlides.length > 1) {
      slideTimer.current = setInterval(
        () => setCurrentSlide(s => (s + 1) % bannerSlides.length),
        4500
      );
    }
    return () => clearInterval(slideTimer.current);
  }, [bannerSlides.length]);

  const prevSlide = () => {
    clearInterval(slideTimer.current);
    setCurrentSlide(s => (s - 1 + bannerSlides.length) % bannerSlides.length);
  };
  const nextSlide = () => {
    clearInterval(slideTimer.current);
    setCurrentSlide(s => (s + 1) % bannerSlides.length);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="wc-home">

        {/* ── HERO ── */}
        <section className="wc-hero">
          {bannerSlides.length > 0 ? (
            <div className="wc-slider-track">
              {bannerSlides.map((slide, i) => (
                <div
                  key={i}
                  className={`wc-slide ${i === currentSlide ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  {(slide.title || slide.subtitle || slide.cta_label) && (
                    <div className="wc-slide-content">
                      {slide.subtitle && <span className="wc-slide-eyebrow">{slide.subtitle}</span>}
                      {slide.title && <h1 className="wc-slide-title">{slide.title}</h1>}
                      {slide.cta_label && slide.cta_link && (
                        <Link to={slide.cta_link} className="wc-slide-cta">
                          {slide.cta_label} <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {bannerSlides.length > 1 && (
                <>
                  <button className="wc-slider-arrow left" onClick={prevSlide}><ChevronLeft size={18} /></button>
                  <button className="wc-slider-arrow right" onClick={nextSlide}><ChevronRight size={18} /></button>
                  <div className="wc-slider-dots">
                    {bannerSlides.map((_, i) => (
                      <button
                        key={i}
                        className={`wc-dot ${i === currentSlide ? 'active' : ''}`}
                        onClick={() => { clearInterval(slideTimer.current); setCurrentSlide(i); }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="wc-hero-fallback">
              <div className="wc-hero-fallback-inner">
                <span className="wc-slide-eyebrow" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 12, display: 'block', fontSize: '0.62rem', letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
                  New Collection
                </span>
                <h1 className="wc-slide-title" style={{ color: 'white', marginBottom: 24, fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 600, lineHeight: 1.1 }}>
                  {settings.hero_title || 'Style That Speaks to You'}
                </h1>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link to="/products" className="wc-slide-cta">Shop Now <ArrowRight size={14} /></Link>
                  <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'rgba(255,255,255,0.75)', padding: '11px 24px', borderRadius: 4, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 500, border: '1px solid rgba(255,255,255,0.3)', transition: 'all 0.2s' }}>
                    Track Order
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── MARQUEE ── */}
        <div className="wc-marquee-strip">
          <div className="wc-marquee-inner">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="wc-marquee-item">
                {item} <span className="wc-marquee-sep" />
              </span>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="wc-features-strip">
          <div className="wc-features-inner">
            {features.map((f, i) => (
              <div key={i} className="wc-feature-cell">
                <div className="wc-feature-icon">{f.icon}</div>
                <div><h4>{f.title}</h4><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORY CIRCLES ── */}
        {categories.length > 0 && (
          <section className="wc-cats-section">
            <div className="wc-cats-inner">
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.id}`} className="wc-cat-item">
                  <div className="wc-cat-ring">
                    {cat.image_url
                      ? <img src={cat.image_url} alt={cat.name} />
                      : <div className="wc-cat-initial">{cat.name.charAt(0)}</div>
                    }
                  </div>
                  <span className="wc-cat-label">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── TRUST STRIP ── */}
        <div className="wc-trust-strip">
          {[
            { icon: '✅', label: '8,900+ Happy Customers', sub: 'on Instagram' },
            { icon: '📦', label: '99% Best Products',      sub: 'delivered safely' },
            { icon: '🌸', label: '3,700+ Products',        sub: 'posted & sold' },
            { icon: '💬', label: 'WhatsApp Support',       sub: '8778921938' },
          ].map((b, i) => (
            <div key={i} className="wc-trust-item">
              <span style={{ fontSize: '1rem' }}>{b.icon}</span>
              <div>
                <div>{b.label}</div>
                <span className="sub">{b.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── PRODUCT SECTIONS ── */}
        {loading ? (
          <div className="wc-loading"><div className="spinner" /></div>
        ) : categories.length === 0 ? (
          <div className="wc-empty">
            <p>No categories yet. Add some from the admin panel!</p>
          </div>
        ) : (
          <div className="wc-cat-sections">
            {categories.map((cat, index) => (
              <CategorySection
                key={cat.id}
                category={cat}
                showDivider={index < categories.length - 1}
              />
            ))}
          </div>
        )}

        {/* ── CUSTOMER REVIEWS CAROUSEL ── */}
        <ReviewsCarousel />

        {/* ── INSTAGRAM CTA ── */}
        <div className="wc-insta-block">
          <p>Follow us for daily new arrivals & exclusive offers 💕</p>
          <a
            href="https://www.instagram.com/_womens_choice._/"
            target="_blank"
            rel="noopener noreferrer"
            className="wc-insta-handle"
          >
            📸 @_womens_choice._
          </a>
        </div>

      </div>
    </>
  );
};

export default Home;
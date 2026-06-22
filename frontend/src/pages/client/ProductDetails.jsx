import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Package, Shield, Truck, Minus, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getProduct } from '../../utils/api';
import toast from 'react-hot-toast';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Poppins:wght@300;400;500;600;700&display=swap');

  :root {
    --pink:       #c0392b;
    --pink-light: #c0392b;
    --pink-pale:  #fff0f7;
    --pink-soft:  #fce4f3;
    --gold:       #c9922a;
    --gold-light: #e8b84b;
    --gold-pale:  #fdf8ee;
    --cream:      #fffaf6;
    --deep:       #2d0a1e;
    --text:       #3a1a2e;
    --text-muted: #8a6070;
    --border:     #f0d6e8;
  }

  .wc-details {
    background: var(--cream);
    padding: 0 0 80px;
    font-family: 'Poppins', sans-serif;
  }

  .wc-details-breadcrumb {
    max-width: 1400px; margin: 0 auto; padding: 20px 24px;
    display: flex; align-items: center; gap: 8px;
    font-family: 'Poppins', sans-serif; font-size: 0.72rem; color: var(--text-muted);
  }

  .wc-details-breadcrumb a {
    color: var(--text-muted); text-decoration: none; transition: color 0.2s;
  }

  .wc-details-breadcrumb a:hover { color: var(--pink); }
  .wc-details-breadcrumb span { color: var(--deep); font-weight: 500; }

  .wc-details-grid {
    max-width: 1400px; margin: 0 auto; padding: 0 24px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 56px; align-items: start;
  }

  /* ── Image Gallery ── */
  .wc-gallery { display: flex; flex-direction: column; gap: 12px; }

  .wc-gallery-main {
    position: relative; aspect-ratio: 3/4; overflow: hidden;
    background: var(--pink-pale);
    border-radius: 12px; border: 1px solid var(--border);
  }

  .wc-gallery-main img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 0.5s ease;
  }

  .wc-gallery-main:hover img { transform: scale(1.04); }

  .wc-gallery-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(255,255,255,0.9); border: none; border-radius: 50%;
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 2; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: all 0.2s; color: var(--deep);
  }
  .wc-gallery-arrow:hover { background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
  .wc-gallery-arrow.prev { left: 10px; }
  .wc-gallery-arrow.next { right: 10px; }

  .wc-gallery-thumbs { display: flex; gap: 8px; }

  .wc-gallery-thumb {
    width: 72px; height: 88px; border-radius: 8px; overflow: hidden;
    border: 2px solid var(--border); cursor: pointer;
    transition: all 0.2s; flex-shrink: 0; background: var(--pink-pale);
  }

  .wc-gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .wc-gallery-thumb.active { border-color: var(--pink); box-shadow: 0 0 0 2px rgba(192,57,43,0.2); }
  .wc-gallery-thumb:hover { border-color: var(--pink); }

  .wc-details-no-img {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; color: var(--text-muted);
    font-family: 'Poppins', sans-serif;
    background: var(--pink-pale);
  }

  .wc-details-oos-banner {
    position: absolute; top: 16px; left: 16px;
    background: var(--deep); color: white;
    padding: 6px 16px;
    font-family: 'Poppins', sans-serif; font-size: 0.62rem;
    font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
    border-radius: 50px;
  }

  .wc-details-sale-badge {
    position: absolute; bottom: 14px; left: 14px;
    background: linear-gradient(135deg, var(--pink), #c0392b);
    color: white; font-family: 'Poppins', sans-serif;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 5px 16px; border-radius: 50px;
    box-shadow: 0 4px 12px rgba(233,30,140,0.4);
  }

  .wc-details-info { padding: 8px 0; }

  .wc-details-vendor {
    font-family: 'Poppins', sans-serif; font-size: 0.62rem;
    font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
    color: var(--pink); margin-bottom: 10px; display: block;
    display: flex; align-items: center; gap: 8px;
  }

  .wc-details-vendor::before { content: '✦'; }

  .wc-details-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    font-weight: 500; color: var(--deep);
    line-height: 1.15; margin-bottom: 16px; letter-spacing: 0.2px;
  }

  .wc-details-prices {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 8px; flex-wrap: wrap;
  }

  .wc-details-original {
    font-family: 'Poppins', sans-serif; font-size: 1rem;
    color: var(--text-muted); text-decoration: line-through;
  }

  .wc-details-price {
    font-family: 'Poppins', sans-serif; font-size: 1.25rem;
    color: var(--deep); font-weight: 700;
  }

  .wc-details-sale-tag {
    background: linear-gradient(135deg, var(--pink), #c0392b);
    color: white; font-family: 'Poppins', sans-serif;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; padding: 4px 12px; border-radius: 50px;
  }

  .wc-details-shipping {
    font-family: 'Poppins', sans-serif; font-size: 0.78rem;
    color: var(--text-muted); margin-bottom: 24px; font-style: italic;
  }

  .wc-details-shipping a { color: var(--pink); text-decoration: underline; }

  .wc-details-divider {
    border: none; border-top: 1.5px solid var(--border); margin: 20px 0;
  }

  .wc-size-label {
    font-family: 'Poppins', sans-serif; font-size: 0.7rem;
    font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--deep); margin-bottom: 12px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .wc-size-required {
    font-size: 0.68rem; color: var(--pink);
    font-weight: 600; letter-spacing: 0; text-transform: none;
    background: var(--pink-pale); padding: 2px 10px; border-radius: 50px;
    border: 1px solid var(--border);
  }

  .wc-sizes { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }

  .wc-size-btn {
    min-width: 48px; height: 40px; padding: 0 16px;
    border: 1.5px solid var(--border); border-radius: 50px;
    background: white; font-family: 'Poppins', sans-serif;
    font-size: 0.8rem; color: var(--text);
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }

  .wc-size-btn:hover { border-color: var(--pink); color: var(--pink); background: var(--pink-pale); }

  .wc-size-btn.selected {
    background: linear-gradient(135deg, var(--pink), #c0392b);
    border-color: var(--pink); color: white; font-weight: 700;
    box-shadow: 0 4px 12px rgba(233,30,140,0.3);
  }

  .wc-size-error {
    font-family: 'Poppins', sans-serif; font-size: 0.72rem;
    color: var(--pink); margin-bottom: 14px; font-weight: 500;
  }

  .wc-qty-label {
    font-family: 'Poppins', sans-serif; font-size: 0.7rem;
    font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--deep); margin-bottom: 10px; display: block;
  }

  .wc-qty-ctrl {
    display: flex; align-items: center;
    border: 1.5px solid var(--border); border-radius: 50px;
    width: fit-content; margin-bottom: 20px; overflow: hidden;
    background: white;
  }

  .wc-qty-btn {
    width: 44px; height: 44px; background: none; border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: var(--deep); transition: background 0.15s, color 0.15s;
  }

  .wc-qty-btn:hover:not(:disabled) { background: var(--pink-pale); color: var(--pink); }
  .wc-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .wc-qty-val {
    width: 50px; text-align: center;
    font-family: 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 700;
    border-left: 1px solid var(--border); border-right: 1px solid var(--border);
    height: 44px; display: flex; align-items: center; justify-content: center;
    color: var(--deep);
  }

  .wc-add-cart-btn {
    width: 100%; padding: 16px 24px;
    background: linear-gradient(135deg, var(--pink), #c0392b);
    color: white; border: none; border-radius: 50px;
    font-family: 'Poppins', sans-serif; font-size: 0.75rem;
    font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    gap: 10px;
    box-shadow: 0 6px 20px rgba(233,30,140,0.3);
    transition: transform 0.2s, box-shadow 0.2s, gap 0.2s;
    text-decoration: none; margin-bottom: 12px;
  }

  .wc-add-cart-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(233,30,140,0.45); gap: 14px;
  }

  .wc-add-cart-btn:disabled { background: #ddd; color: #aaa; cursor: not-allowed; box-shadow: none; }

  .wc-view-cart-btn {
    width: 100%; padding: 14px 24px;
    background: transparent; color: var(--pink);
    border: 2px solid var(--pink); border-radius: 50px;
    font-family: 'Poppins', sans-serif; font-size: 0.75rem;
    font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    gap: 10px; transition: all 0.2s; text-decoration: none; margin-bottom: 20px;
  }

  .wc-view-cart-btn:hover {
    background: var(--pink); color: white;
    box-shadow: 0 6px 20px rgba(233,30,140,0.3);
  }

  .wc-details-desc h3 {
    font-family: 'Poppins', sans-serif; font-size: 0.62rem;
    font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--pink); margin-bottom: 10px;
  }

  .wc-details-desc p {
    font-family: 'Poppins', sans-serif; font-size: 0.85rem;
    color: var(--text-muted); line-height: 1.85;
  }

  .wc-details-perks { border-top: 1.5px solid var(--border); margin-top: 24px; }

  .wc-perk-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid var(--border);
    font-family: 'Poppins', sans-serif; font-size: 0.8rem; color: var(--text-muted);
  }

  .wc-perk-item svg { color: var(--pink); flex-shrink: 0; }

  .wc-not-found {
    text-align: center; padding: 80px 24px;
    font-family: 'Poppins', sans-serif;
    max-width: 1400px; margin: 0 auto;
  }

  /* ── Reviews ── */
  .wc-reviews-section {
    max-width: 1400px; margin: 56px auto 0; padding: 0 24px;
    border-top: 1.5px solid var(--border);
  }
  .wc-reviews-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 32px 0 24px; flex-wrap: wrap; gap: 12px;
  }
  .wc-reviews-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.4rem, 2.5vw, 1.9rem); font-weight: 500; color: var(--deep); margin: 0;
  }
  .wc-reviews-summary { display: flex; align-items: center; gap: 10px; }
  .wc-reviews-avg { font-family: 'Poppins', sans-serif; font-size: 2rem; font-weight: 700; color: var(--deep); line-height: 1; }
  .wc-reviews-avg-detail { display: flex; flex-direction: column; gap: 4px; }
  .wc-reviews-count { font-family: 'Poppins', sans-serif; font-size: 0.72rem; color: var(--text-muted); }
  .wc-stars-row { display: flex; gap: 2px; }
  .wc-reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .wc-review-card { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: box-shadow 0.2s; }
  .wc-review-card:hover { box-shadow: 0 4px 16px rgba(192,57,43,0.08); }
  .wc-review-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; gap: 8px; }
  .wc-review-name { font-family: 'Poppins', sans-serif; font-size: 0.82rem; font-weight: 600; color: var(--deep); }
  .wc-review-date { font-family: 'Poppins', sans-serif; font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; margin-top: 2px; }
  .wc-review-verified { display: inline-flex; align-items: center; gap: 4px; font-family: 'Poppins', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.5px; background: var(--deep); color: white; padding: 3px 8px; border-radius: 50px; white-space: nowrap; flex-shrink: 0; }
  .wc-review-title { font-family: 'Poppins', sans-serif; font-size: 0.85rem; font-weight: 600; color: var(--deep); margin: 8px 0 4px; }
  .wc-review-body { font-family: 'Poppins', sans-serif; font-size: 0.82rem; color: var(--text-muted); line-height: 1.7; margin: 0; }
  .wc-reviews-empty { text-align: center; padding: 48px 20px; color: var(--text-muted); font-family: 'Poppins', sans-serif; font-size: 0.9rem; background: white; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 40px; }
  .wc-reviews-loading { display: flex; justify-content: center; padding: 48px; }

  @media (max-width: 768px) {
    .wc-details-grid { grid-template-columns: 1fr; gap: 28px; padding: 0 16px; }
    .wc-details-breadcrumb { padding: 16px; }
    .wc-reviews-section { padding: 0 16px; }
    .wc-reviews-grid { grid-template-columns: 1fr; }
    .wc-gallery-thumb { width: 56px; height: 68px; }
  }
`;

// ── Helpers ───────────────────────────────────────────────────
const parseSizes = (sizesStr) => {
  if (!sizesStr) return [];
  return sizesStr.split(',').map(s => s.trim()).filter(Boolean);
};

const StarDisplay = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s} size={size}
        fill={s <= rating ? '#d4af37' : 'none'}
        stroke={s <= rating ? '#d4af37' : '#ddd'}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

// ── Reviews Section ───────────────────────────────────────────
const ReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/reviews/product/${productId}`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="wc-reviews-section">
      <div className="wc-reviews-header">
        <h2 className="wc-reviews-title">Customer Reviews</h2>
        {avgRating && (
          <div className="wc-reviews-summary">
            <span className="wc-reviews-avg">{avgRating}</span>
            <div className="wc-reviews-avg-detail">
              <StarDisplay rating={Math.round(avgRating)} size={16} />
              <span className="wc-reviews-count">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="wc-reviews-loading"><div className="spinner" /></div>
      ) : reviews.length === 0 ? (
        <div className="wc-reviews-empty">
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="wc-reviews-grid">
          {reviews.map(review => (
            <div key={review.id} className="wc-review-card">
              <div className="wc-review-card-top">
                <div>
                  <div className="wc-review-name">{review.customer_name}</div>
                  <div className="wc-review-date">
                    {new Date(review.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
                <span className="wc-review-verified">✓ Verified</span>
              </div>
              <StarDisplay rating={review.rating} size={14} />
              {review.title && <div className="wc-review-title">{review.title}</div>}
              {review.body && <p className="wc-review-body">{review.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart, cart } = useCart();

  const cartItem = cart.find(i => i.id === product?.id && i.size === selectedSize);
  const hasDiscount = product?.original_price && parseFloat(product.original_price) > parseFloat(product.price);
  const availableSizes = parseSizes(product?.sizes || product?.size);

  const sizeStock = {};
  if (Array.isArray(product?.size_stock)) {
    product.size_stock.forEach(item => { sizeStock[item.size] = item.stock; });
  }

  // Build image list from product (filter out empty)
  const allImages = product
    ? [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean)
    : [];

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(r => { setProduct(r.data); setActiveImg(0); })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { setSelectedSize(null); setSizeError(false); }, [id]);

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      toast.error('Please select a size');
      return;
    }
    setSizeError(false);
    const productWithSize = { ...product, size: selectedSize };
    for (let i = 0; i < quantity; i++) addToCart(productWithSize);
    toast.success(`${quantity}× ${product.name}${selectedSize ? ` (${selectedSize})` : ''} added to cart! 🛍️`);
  };

  const prevImg = () => setActiveImg(i => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setActiveImg(i => (i + 1) % allImages.length);

  if (loading) return (
    <div className="loading-container" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!product) return (
    <>
      <style>{styles}</style>
      <div className="wc-not-found">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 500, marginBottom: 16, color: '#2d0a1e' }}>
          Product not found
        </h2>
        <Link to="/products" style={{ fontFamily: "'Poppins', sans-serif", color: '#e91e8c', textDecoration: 'underline' }}>
          Back to Products
        </Link>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="wc-details">
        <div className="wc-details-breadcrumb">
          <a href="/">Home</a> /
          <a href="/products">Products</a> /
          <span>{product.name}</span>
        </div>

        <div className="wc-details-grid">

          {/* ── Image Gallery ── */}
          <div className="wc-gallery">
            <div className="wc-gallery-main">
              {allImages.length > 0 ? (
                <>
                  <img src={allImages[activeImg]} alt={product.name} />
                  {allImages.length > 1 && (
                    <>
                      <button className="wc-gallery-arrow prev" onClick={prevImg}>
                        <ChevronLeft size={18} />
                      </button>
                      <button className="wc-gallery-arrow next" onClick={nextImg}>
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="wc-details-no-img">
                  <Package size={80} color="#e91e8c" />
                  <p>No image available</p>
                </div>
              )}
              {product.stock === 0 && <div className="wc-details-oos-banner">Out of Stock</div>}
              {hasDiscount && <span className="wc-details-sale-badge">🏷️ Sale</span>}
            </div>

            {/* Thumbnails — only show if more than 1 image */}
            {allImages.length > 1 && (
              <div className="wc-gallery-thumbs">
                {allImages.map((img, i) => (
                  <div
                    key={i}
                    className={`wc-gallery-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="wc-details-info">
            <span className="wc-details-vendor">{product.category_name || "Salwar Butterfly"}</span>
            <h1 className="wc-details-title">{product.name}</h1>

            <div className="wc-details-prices">
              {hasDiscount ? (
                <>
                  <span className="wc-details-original">
                    Rs. {parseFloat(product.original_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="wc-details-price">
                    Rs. {parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="wc-details-sale-tag">Sale</span>
                </>
              ) : (
                <span className="wc-details-price">
                  Rs. {parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <p className="wc-details-shipping">
              <a href="#">Shipping</a> calculated at checkout.
            </p>

            <hr className="wc-details-divider" />

            {availableSizes.length > 0 && (
              <>
                <div className="wc-size-label">
                  <span>Size {selectedSize && <strong>— {selectedSize}</strong>}</span>
                  <span className="wc-size-required">✦ Required</span>
                </div>
                <div className="wc-sizes">
                  {availableSizes.map(size => {
                    const stock = sizeStock[size] || 0;
                    const outOfStock = stock <= 0;
                    return (
                      <button
                        key={size}
                        disabled={outOfStock}
                        className={`wc-size-btn ${selectedSize === size ? 'selected' : ''}`}
                        onClick={() => { if (!outOfStock) { setSelectedSize(size); setSizeError(false); } }}
                        style={{
                          opacity: outOfStock ? 0.5 : 1,
                          cursor: outOfStock ? 'not-allowed' : 'pointer',
                          flexDirection: 'column', height: 'auto', padding: '10px 14px',
                        }}
                      >
                        <span>{size}</span>
                        <small style={{ fontSize: '10px', marginTop: '4px', color: outOfStock ? 'red' : '#666' }}>
                          {outOfStock ? 'Out of Stock' : `${stock} left`}
                        </small>
                      </button>
                    );
                  })}
                </div>
                {sizeError && <p className="wc-size-error">💕 Please select a size to continue</p>}
              </>
            )}

            {product.stock > 0 && (
              <>
                <span className="wc-qty-label">Quantity</span>
                <div className="wc-qty-ctrl">
                  <button className="wc-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity === 1}>
                    <Minus size={14} />
                  </button>
                  <span className="wc-qty-val">{quantity}</span>
                  <button className="wc-qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>
                    <Plus size={14} />
                  </button>
                </div>
              </>
            )}

            <button className="wc-add-cart-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
              <ShoppingBag size={17} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
            </button>

            {cartItem && (
              <Link to="/cart" className="wc-view-cart-btn">
                🛍️ View Cart ({cartItem.quantity} in cart)
              </Link>
            )}

            {product.description && (
              <>
                <hr className="wc-details-divider" />
                <div className="wc-details-desc">
                  <h3>Description</h3>
                  <p>{product.description}</p>
                </div>
              </>
            )}

            <div className="wc-details-perks">
              {[
                { icon: <Truck size={16} />, text: 'Free shipping on orders above ₹999' },
                { icon: <Shield size={16} />, text: 'Secure & encrypted payments' },
                { icon: <Package size={16} />, text: '99% best product delivered safely' },
              ].map((p, i) => (
                <div key={i} className="wc-perk-item">{p.icon} {p.text}</div>
              ))}
            </div>
          </div>
        </div>

        <ReviewsSection productId={product.id} />
      </div>
    </>
  );
};

export default ProductDetails;
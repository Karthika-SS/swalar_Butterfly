import React, { useState } from 'react';
import { Search, Package, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { getOrdersByPhone , submitReview  } from '../../utils/api';
import toast from 'react-hot-toast';

// ── Styles ────────────────────────────────────────────────────
const styles = [
  "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');",

  '.uz-orders { background: #faf8f5; padding: 48px 0 80px; min-height: 70vh; }',
  '.uz-orders-inner { max-width: 700px; margin: 0 auto; padding: 0 24px; }',

  `.uz-orders-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 32px;
    border-bottom: 1px solid #ede7da;
    position: relative;
  }`,

  `.uz-orders-header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 48px;
    height: 2px;
    background: #d4af37;
  }`,

  `.uz-orders-header h1 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 2rem;
    font-weight: 400;
    color: #1a1a1a;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }`,

  `.uz-orders-header p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: #888;
    letter-spacing: 0.3px;
  }`,

  '.uz-phone-form { margin-bottom: 40px; }',

  `.uz-phone-input-row {
    display: flex;
    gap: 0;
    border: 1px solid #ddd;
    border-radius: 2px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }`,

  `.uz-phone-input-row input {
    flex: 1;
    padding: 14px 18px;
    border: none;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: #1a1a1a;
    background: white;
  }`,

  '.uz-phone-input-row input::placeholder { color: #bbb; }',

  `.uz-phone-search-btn {
    padding: 14px 28px;
    background: #d4af37;
    color: #1a0a00;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
    white-space: nowrap;
  }`,

  '.uz-phone-search-btn:hover { background: #c9a632; }',
  '.uz-phone-search-btn:disabled { background: #ccc; cursor: not-allowed; }',

  `.uz-results-count {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    color: #aaa;
    margin-bottom: 16px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }`,

  '.uz-orders-list { display: flex; flex-direction: column; gap: 12px; }',

  `.uz-order-card {
    border: 1px solid #ede7da;
    border-radius: 2px;
    overflow: hidden;
    background: white;
    transition: box-shadow 0.2s;
  }`,

  '.uz-order-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }',

  `.uz-order-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    cursor: pointer;
    transition: background 0.15s;
    gap: 16px;
    flex-wrap: wrap;
  }`,

  '.uz-order-card-header:hover { background: #faf9f6; }',
  '.uz-order-meta { flex: 1; }',

  `.uz-order-num {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 3px;
  }`,

  `.uz-order-date {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    color: #aaa;
    letter-spacing: 0.3px;
  }`,

  '.uz-order-right { display: flex; align-items: center; gap: 12px; }',

  `.uz-order-amount {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    color: #1a1a1a;
  }`,

  `.uz-order-expand {
    background: none;
    border: none;
    cursor: pointer;
    color: #d4af37;
    padding: 2px;
    display: flex;
  }`,

  `.uz-order-body {
    border-top: 1px solid #ede7da;
    padding: 24px 20px;
    background: #faf9f6;
  }`,

  `.uz-wa-enquiry {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 24px;
    padding: 11px 22px;
    background: #25D366;
    color: #fff;
    border-radius: 2px;
    text-decoration: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: background 0.2s, transform 0.15s;
    border: none;
    cursor: pointer;
  }`,

  '.uz-wa-enquiry:hover { background: #1ebe5d; transform: translateY(-1px); }',
  '.uz-wa-enquiry svg { flex-shrink: 0; }',

  `.uz-order-items-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 12px;
  }`,

  `.uz-order-item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #ede7da;
  }`,

  `.uz-order-item-img {
    width: 44px;
    height: 44px;
    border-radius: 2px;
    overflow: hidden;
    background: #f7f3ed;
    border: 1px solid #ede7da;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }`,

  '.uz-order-item-img img { width: 100%; height: 100%; object-fit: cover; }',
  '.uz-oi-name  { flex: 1; font-family: "DM Sans", sans-serif; font-size: 0.85rem; color: #1a1a1a; }',
  '.uz-oi-size  { font-family: "DM Sans", sans-serif; font-size: 0.75rem; color: #aaa; }',
  '.uz-oi-qty   { font-family: "DM Sans", sans-serif; font-size: 0.78rem; color: #aaa; }',
  '.uz-oi-price { font-family: "DM Sans", sans-serif; font-size: 0.85rem; font-weight: 600; color: #1a1a1a; }',

  '.uz-order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }',

  `.uz-oi-group label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #d4af37;
    margin-bottom: 6px;
  }`,

  `.uz-oi-group p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: #1a1a1a;
    line-height: 1.6;
  }`,

  // Status badges
  `.uz-status-badge {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.68rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid #ede7da;
    letter-spacing: 0.5px;
  }`,
  `.uz-status-delivered { background: #edf7ed; color: #2e7d32; border-color: #c8e6c9; }`,
  `.uz-status-pending   { background: #fff8e1; color: #b8860b; border-color: #ffe082; }`,
  `.uz-status-shipped   { background: #e3f2fd; color: #1565c0; border-color: #bbdefb; }`,
  `.uz-status-other     { background: #f7f3ed; color: #888;    border-color: #ede7da; }`,

  // Review button & badge
  `.uz-review-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 7px;
    padding: 6px 14px;
    border: 1px solid #d4af37;
    border-radius: 2px;
    background: transparent;
    color: #b8932a;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }`,
  `.uz-review-btn:hover { background: #d4af37; color: #1a0a00; }`,

  `.uz-reviewed-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 7px;
    padding: 5px 12px;
    border-radius: 2px;
    border: 1px solid #c8e6c9;
    background: #edf7ed;
    color: #2e7d32;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }`,

  // Modal
  `.uz-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }`,

  `.uz-modal {
    background: white;
    border-radius: 2px;
    padding: 36px 32px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    position: relative;
  }`,

  `.uz-modal-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.5rem;
    font-weight: 400;
    color: #1a1a1a;
    margin: 0 0 4px;
  }`,

  `.uz-modal-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: #aaa;
    margin: 0 0 24px;
  }`,

  `.uz-modal-close {
    position: absolute;
    top: 16px; right: 18px;
    background: none; border: none;
    font-size: 1.4rem; color: #aaa;
    cursor: pointer; line-height: 1;
    transition: color 0.15s;
  }`,
  `.uz-modal-close:hover { color: #1a1a1a; }`,

  `.uz-modal-product {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #faf8f5;
    border: 1px solid #ede7da;
    margin-bottom: 24px;
  }`,

  `.uz-modal-product img {
    width: 44px; height: 44px;
    object-fit: cover;
    border-radius: 2px;
    border: 1px solid #ede7da;
  }`,

  `.uz-modal-product-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #1a1a1a;
  }`,

  `.uz-modal-product-size {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    color: #aaa;
    margin-top: 2px;
  }`,

  `.uz-modal-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #d4af37;
    margin-bottom: 8px;
  }`,

  `.uz-modal-input, .uz-modal-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    color: #1a1a1a;
    outline: none;
    box-sizing: border-box;
    background: white;
    transition: border-color 0.2s;
    margin-bottom: 16px;
  }`,
  `.uz-modal-input:focus, .uz-modal-textarea:focus { border-color: #d4af37; }`,
  `.uz-modal-textarea { resize: vertical; margin-bottom: 0; }`,

  `.uz-modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 24px;
  }`,

  `.uz-modal-cancel {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 2px;
    background: white;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #888;
    transition: border-color 0.2s, color 0.2s;
  }`,
  `.uz-modal-cancel:hover { border-color: #1a1a1a; color: #1a1a1a; }`,

  `.uz-modal-submit {
    flex: 2;
    padding: 12px;
    border: none;
    border-radius: 2px;
    background: #1a1a1a;
    color: white;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    transition: background 0.2s;
  }`,
  `.uz-modal-submit:hover { background: #333; }`,
  `.uz-modal-submit:disabled { background: #ccc; cursor: not-allowed; }`,

  '.uz-no-orders { text-align: center; padding: 60px 20px; }',

  `.uz-no-orders h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    font-weight: 400;
    margin: 20px 0 8px;
    color: #1a1a1a;
  }`,

  '.uz-no-orders p { font-family: "DM Sans", sans-serif; font-size: 0.85rem; color: #888; }',

  `@media (max-width: 600px) {
    .uz-phone-input-row { flex-direction: column; border: none; gap: 10px; }
    .uz-phone-input-row input { border: 1px solid #ddd; border-radius: 2px; }
    .uz-phone-search-btn { width: 100%; justify-content: center; border-radius: 2px; }
    .uz-order-info { grid-template-columns: 1fr; }
    .uz-wa-enquiry { width: 100%; justify-content: center; }
    .uz-modal { padding: 28px 20px; }
    .uz-modal-actions { flex-direction: column; }
  }`,
].join('\n');

// ── WhatsApp Icon ─────────────────────────────────────────────
const WhatsAppIcon = () => (
  <svg width="17" height="17" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.49 2.027 7.8L0 32l8.418-2.004A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.77-1.851l-.485-.288-5.002 1.191 1.23-4.877-.317-.502A13.27 13.27 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.778c-.399-.2-2.358-1.163-2.724-1.296-.366-.133-.633-.2-.9.2-.266.4-1.032 1.296-1.265 1.563-.233.266-.466.3-.865.1-.4-.2-1.687-.622-3.213-1.982-1.187-1.059-1.989-2.366-2.222-2.766-.233-.4-.025-.616.175-.815.18-.18.4-.466.6-.7.2-.233.266-.4.4-.666.133-.266.066-.5-.033-.7-.1-.2-.9-2.166-1.233-2.966-.325-.778-.655-.673-.9-.686l-.766-.013c-.266 0-.7.1-1.066.5-.366.4-1.4 1.366-1.4 3.332s1.433 3.866 1.633 4.132c.2.266 2.82 4.308 6.832 6.04.955.412 1.7.658 2.281.842.958.305 1.831.262 2.52.159.769-.115 2.358-.964 2.691-1.895.333-.932.333-1.73.233-1.896-.1-.166-.366-.266-.765-.465z" />
  </svg>
);

const SHOP_WHATSAPP = '918778921938';

const buildEnquiryUrl = (orderNumber) => {
  const text = encodeURIComponent(
    `Hi! I would like to enquire about my order.\nOrder No: ${orderNumber}\nPlease share the latest update.`
  );
  return `https://wa.me/${SHOP_WHATSAPP}?text=${text}`;
};

// ── Star Rating ───────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          color: star <= value ? '#d4af37' : '#ddd',
          transition: 'color 0.15s',
        }}
      >
        <Star size={26} fill={star <= value ? '#d4af37' : 'none'} strokeWidth={1.5} />
      </button>
    ))}
  </div>
);

// ── Review Modal ──────────────────────────────────────────────
const ReviewModal = ({ item, phone, orderId, customerName, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

 const handleSubmit = async () => {
  console.log('API baseURL:', API.defaults.baseURL);
  if (!rating) return toast.error('Please select a rating');
  setSubmitting(true);
  try {
    const { data } = await submitReview({
      product_id: item.product_id,
      product_name: item.product_name,
      order_id: orderId,
      customer_phone: phone,
      customer_name: customerName || 'Customer',
      rating,
      title,
      body,
    });
    toast.success('Review submitted! Thank you 🎉');
    onSubmitted(item.product_id);
    onClose();
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Failed to submit review');
    
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div
      className="uz-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="uz-modal">
        <button className="uz-modal-close" onClick={onClose}>×</button>

        <h3 className="uz-modal-title">Write a Review</h3>
        <p className="uz-modal-subtitle">Share your experience with this product</p>

        {/* Product preview */}
        <div className="uz-modal-product">
          {item.product_image && (
            <img src={item.product_image} alt={item.product_name} />
          )}
          <div>
            <div className="uz-modal-product-name">{item.product_name}</div>
            {item.size && (
              <div className="uz-modal-product-size">Size: {item.size}</div>
            )}
          </div>
        </div>

        {/* Star rating */}
        <label className="uz-modal-label">Your Rating *</label>
        <StarRating value={rating} onChange={setRating} />

        {/* Title */}
        <label className="uz-modal-label">Review Title</label>
        <input
          type="text"
          className="uz-modal-input"
          placeholder="e.g. Such a cutee!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />

        {/* Body */}
        <label className="uz-modal-label">Your Review</label>
        <textarea
          className="uz-modal-textarea"
          placeholder="Tell others about this product..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          rows={4}
        />

        <div className="uz-modal-actions">
          <button className="uz-modal-cancel" onClick={onClose}>Cancel</button>
          <button
            className="uz-modal-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Status badge helper ───────────────────────────────────────
const getStatusClass = (status) => {
  if (status === 'Delivered') return 'uz-status-badge uz-status-delivered';
  if (status === 'Pending')   return 'uz-status-badge uz-status-pending';
  if (status === 'Shipped')   return 'uz-status-badge uz-status-shipped';
  return 'uz-status-badge uz-status-other';
};

// ── Main Component ────────────────────────────────────────────
const MyOrders = () => {
  const [phone, setPhone]           = useState('');
  const [orders, setOrders]         = useState([]);
  const [searched, setSearched]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Review state
  const [reviewModal, setReviewModal]           = useState(null);
  const [reviewedProducts, setReviewedProducts] = useState(new Set());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const res = await getOrdersByPhone(phone.trim());
      setOrders(res.data);
      setSearched(true);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const formatAmount = (val) =>
    parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const handleReviewSubmitted = (productId) => {
    setReviewedProducts(prev => new Set([...prev, productId]));
  };

  return (
    <>
      <style>{styles}</style>
      <div className="uz-orders">
        <div className="uz-orders-inner">

          {/* Header */}
          <div className="uz-orders-header">
            <h1>My Orders</h1>
            <p>Enter your phone number to track your orders</p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="uz-phone-form">
            <div className="uz-phone-input-row">
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={15}
              />
              <button type="submit" className="uz-phone-search-btn" disabled={loading}>
                <Search size={15} />
                {loading ? 'Searching...' : 'Track Orders'}
              </button>
            </div>
          </form>

          {/* Results */}
          {searched && (
            <div>
              {orders.length === 0 ? (
                <div className="uz-no-orders">
                  <Package size={56} color="#d4af37" />
                  <h3>No orders found</h3>
                  <p>No orders found for this phone number.</p>
                </div>
              ) : (
                <div>
                  <p className="uz-results-count">
                    {orders.length} order{orders.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="uz-orders-list">
                    {orders.map((order) => {
                      const isDelivered = order.status === 'Delivered';

                      return (
                        <div key={order.id} className="uz-order-card">

                          {/* Card Header */}
                          <div
                            className="uz-order-card-header"
                            onClick={() => toggleExpand(order.id)}
                          >
                            <div className="uz-order-meta">
                              <div className="uz-order-num">{order.order_number}</div>
                              <div className="uz-order-date">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                })}
                              </div>
                            </div>

                            <div className="uz-order-right">
                              <span className="uz-order-amount">
                                Rs. {formatAmount(order.total_amount)}
                              </span>
                              <span className={getStatusClass(order.status)}>
                                {order.status}
                              </span>
                            </div>

                            <button className="uz-order-expand" type="button">
                              {expandedId === order.id
                                ? <ChevronUp size={18} />
                                : <ChevronDown size={18} />}
                            </button>
                          </div>

                          {/* Expanded Body */}
                          {expandedId === order.id && (
                            <div className="uz-order-body">

                              {/* WhatsApp Enquiry */}
                              {SHOP_WHATSAPP && (
                                <a
                                  href={buildEnquiryUrl(order.order_number)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="uz-wa-enquiry"
                                >
                                  <WhatsAppIcon />
                                  Enquire on WhatsApp
                                </a>
                              )}

                              {/* Items */}
                              <div className="uz-order-items-title">Items Ordered</div>

                              {order.items && order.items.map((item) => {
                                const alreadyReviewed = reviewedProducts.has(item.product_id);

                                return (
                                  <div key={item.id}>
                                    <div className="uz-order-item-row">
                                      <div className="uz-order-item-img">
                                        {item.product_image ? (
                                          <img src={item.product_image} alt={item.product_name} />
                                        ) : (
                                          <Package size={18} color="#d4af37" />
                                        )}
                                      </div>
                                      <span className="uz-oi-name">{item.product_name}</span>
                                      {item.size && (
                                        <span className="uz-oi-size">{item.size}</span>
                                      )}
                                      <span className="uz-oi-qty">x {item.quantity}</span>
                                      <span className="uz-oi-price">
                                        Rs. {formatAmount(item.price * item.quantity)}
                                      </span>
                                    </div>

                                    {/* Review button — only for delivered orders */}
                                    {isDelivered && (item.product_id || item.product_name) && (
                                      alreadyReviewed ? (
                                        <div className="uz-reviewed-badge">
                                          ✓ Review Submitted
                                        </div>
                                      ) : (
                                        <button
                                          className="uz-review-btn"
                                          onClick={() => setReviewModal({ item, customerName: order.customer_name, orderId: order.id })}
                                        >
                                          <Star size={11} />
                                          Write a Review
                                        </button>
                                      )
                                    )}
                                  </div>
                                );
                              })}

                              {/* Address / UPI */}
                              <div className="uz-order-info">
                                <div className="uz-oi-group">
                                  <label>Delivery Address</label>
                                  <p>{order.customer_address}</p>
                                </div>
                                {order.upi_reference && (
                                  <div className="uz-oi-group">
                                    <label>UPI Reference</label>
                                    <p>{order.upi_reference}</p>
                                  </div>
                                )}
                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
  <ReviewModal
    item={reviewModal.item}
    phone={phone}
    orderId={reviewModal.orderId}     
    customerName={reviewModal.customerName}
    onClose={() => setReviewModal(null)}
    onSubmitted={handleReviewSubmitted}
  />
)}
    </>
  );
};

export default MyOrders;
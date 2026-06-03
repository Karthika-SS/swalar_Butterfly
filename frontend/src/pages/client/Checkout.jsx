import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { placeOrder, getSettings } from '../../utils/api';
import toast from 'react-hot-toast';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .uz-checkout { background: #faf8f5; min-height: 100vh; }

  .uz-checkout-topbar {
    padding: 16px 24px;
    border-bottom: 1px solid #ede7da;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1100px;
    margin: 0 auto;
    background: #faf8f5;
  }

  .uz-checkout-brand {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.4rem;
    font-weight: 500;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #1a1a1a;
    text-decoration: none;
    transition: color 0.2s;
  }

  .uz-checkout-brand:hover { color: #d4af37; }

  .uz-checkout-cart-icon {
    background: none; border: none; cursor: pointer;
    color: #1a1a1a; padding: 4px; display: flex;
    transition: color 0.2s;
  }

  .uz-checkout-cart-icon:hover { color: #d4af37; }

  .uz-order-summary-toggle {
    background: #f7f3ed;
    border-top: 1px solid #ede7da;
    border-bottom: 1px solid #ede7da;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: #d4af37;
    max-width: 1100px;
    margin: 0 auto;
    transition: background 0.2s;
  }

  .uz-order-summary-toggle:hover { background: #f0ebe0; }

  .uz-order-summary-toggle-amount {
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .uz-checkout-grid {
    display: grid;
    grid-template-columns: 1fr 420px;
    max-width: 1100px;
    margin: 0 auto;
    min-height: calc(100vh - 60px);
  }

  .uz-checkout-form-panel {
    padding: 32px 48px 80px 24px;
    border-right: 1px solid #ede7da;
    background: white;
  }

  .uz-checkout-section-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 16px;
    margin-top: 28px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .uz-checkout-section-title:first-child { margin-top: 0; }

  .uz-checkout-field {
    position: relative;
    margin-bottom: 10px;
  }

  .uz-checkout-field input,
  .uz-checkout-field textarea,
  .uz-checkout-field select {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #e0d8cc;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    color: #1a1a1a;
    background: #faf8f5;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }

  .uz-checkout-field input:focus,
  .uz-checkout-field textarea:focus,
  .uz-checkout-field select:focus {
    border-color: #d4af37;
    background: white;
  }

  .uz-checkout-field input::placeholder,
  .uz-checkout-field textarea::placeholder { color: #bbb; }

  .uz-checkout-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .uz-checkout-checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: #555;
  }

  .uz-checkout-checkbox-row input[type="checkbox"] {
    width: 16px; height: 16px;
    accent-color: #d4af37; flex-shrink: 0; cursor: pointer;
  }

  .uz-shipping-placeholder {
    border: 1px solid #ede7da;
    border-radius: 2px;
    padding: 16px;
    background: #f7f3ed;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: #aaa;
    font-style: italic;
  }

  /* Payment options */
  .uz-payment-opts {
    display: flex; flex-direction: column; gap: 0;
    border: 1px solid #ede7da; border-radius: 2px;
    overflow: hidden; margin-bottom: 10px;
  }

  .uz-payment-opt-label {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    color: #1a1a1a;
    cursor: pointer;
    border-bottom: 1px solid #ede7da;
    background: white;
    transition: background 0.15s;
  }

  .uz-payment-opt-label:last-child { border-bottom: none; }
  .uz-payment-opt-label:hover { background: #faf8f5; }
  .uz-payment-opt-label.selected { background: #fdf8ec; border-left: 3px solid #d4af37; }

  .uz-payment-opt-label input[type="radio"] {
    accent-color: #d4af37;
    width: 16px; height: 16px; flex-shrink: 0;
  }

  .uz-payment-logos {
    display: flex; align-items: center; gap: 6px; margin-left: auto;
    font-family: 'DM Sans', sans-serif; font-size: 0.65rem; color: #888;
  }

  .uz-payment-note {
    border: 1px solid #ede7da;
    border-top: none;
    border-radius: 0 0 2px 2px;
    padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: #888;
    text-align: center;
    background: #faf8f5;
    margin-bottom: 10px;
    font-style: italic;
  }

  .uz-billing-box {
    border: 1px solid #ede7da; border-radius: 2px;
    overflow: hidden; margin-bottom: 20px;
  }

  .uz-billing-opt {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: #1a1a1a;
    cursor: pointer; border-bottom: 1px solid #ede7da;
    transition: background 0.15s;
  }

  .uz-billing-opt:last-child { border-bottom: none; }
  .uz-billing-opt:hover { background: #faf8f5; }
  .uz-billing-opt input[type="radio"] { accent-color: #d4af37; width: 16px; height: 16px; }

  .uz-discount-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: 1px solid #ede7da; border-radius: 20px;
    padding: 8px 18px; font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
    color: #888; cursor: pointer; transition: border-color 0.2s, color 0.2s; margin-bottom: 24px;
  }

  .uz-discount-btn:hover { border-color: #d4af37; color: #d4af37; }

  .uz-checkout-total-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; padding: 16px 0; border-top: 1px solid #ede7da;
  }

  .uz-checkout-total-left { display: flex; align-items: center; gap: 12px; }

  .uz-checkout-total-thumb {
    width: 44px; height: 44px; border-radius: 2px;
    overflow: hidden; background: #f7f3ed; flex-shrink: 0;
    border: 1px solid #ede7da;
  }

  .uz-checkout-total-thumb img { width: 100%; height: 100%; object-fit: cover; }

  .uz-checkout-total-info { font-family: 'DM Sans', sans-serif; }
  .uz-checkout-total-label { font-size: 0.88rem; font-weight: 600; color: #1a1a1a; }
  .uz-checkout-total-sub { font-size: 0.72rem; color: #aaa; }

  .uz-checkout-total-amount {
    display: flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif; font-size: 1.1rem; font-weight: 600; color: #1a1a1a;
  }

  .uz-currency-tag { font-size: 0.68rem; color: #aaa; font-weight: 400; }

  .uz-pay-btn {
    width: 100%; padding: 18px 24px;
    background: #d4af37; color: #1a0a00; border: none; border-radius: 2px;
    font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 700;
    letter-spacing: 2.5px; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s; margin-bottom: 20px;
  }

  .uz-pay-btn:hover { background: #c9a632; }
  .uz-pay-btn:disabled { background: #ccc; cursor: not-allowed; color: white; }

  .uz-checkout-footer {
    display: flex; flex-wrap: wrap; gap: 16px;
    padding: 16px 0; border-top: 1px solid #ede7da;
  }

  .uz-checkout-footer a {
    font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
    color: #aaa; text-decoration: none; letter-spacing: 0.3px;
    transition: color 0.2s;
  }

  .uz-checkout-footer a:hover { color: #d4af37; text-decoration: underline; }

  /* Right summary panel */
  .uz-checkout-summary-panel {
    background: #f7f3ed;
    border-left: 1px solid #ede7da;
    padding: 32px 24px;
  }

  .uz-summary-items { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
  .uz-summary-item { display: flex; align-items: center; gap: 12px; }

  .uz-summary-item-img {
    width: 56px; height: 56px; border-radius: 2px;
    overflow: hidden; background: #ede7da; position: relative; flex-shrink: 0;
    border: 1px solid #e0d8cc;
  }

  .uz-summary-item-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .uz-summary-item-qty {
    position: absolute; top: -6px; right: -6px;
    background: #d4af37; color: #1a0a00; width: 18px; height: 18px;
    border-radius: 50%; font-family: 'DM Sans', sans-serif;
    font-size: 0.62rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  .uz-summary-item-info { flex: 1; font-family: 'DM Sans', sans-serif; }
  .uz-summary-item-name { font-size: 0.82rem; color: #1a1a1a; margin-bottom: 2px; font-weight: 500; }
  .uz-summary-item-meta { font-size: 0.68rem; color: #d4af37; letter-spacing: 0.5px; text-transform: uppercase; }
  .uz-summary-item-price { font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; color: #1a1a1a; white-space: nowrap; }

  .uz-summary-divider { border: none; border-top: 1px solid #ede7da; margin: 16px 0; }

  .uz-summary-totals { display: flex; flex-direction: column; gap: 10px; }

  .uz-summary-row-line {
    display: flex; justify-content: space-between;
    font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: #666;
  }

  .uz-summary-row-line.total {
    font-size: 1rem; font-weight: 600; color: #1a1a1a;
    padding-top: 12px; border-top: 2px solid #d4af37; margin-top: 4px;
  }

  .uz-summary-row-line .free { color: #5a7a65; font-weight: 600; }

  @media (max-width: 900px) {
    .uz-checkout-grid { grid-template-columns: 1fr; }
    .uz-checkout-summary-panel { display: none; }
    .uz-checkout-form-panel { padding: 24px; }
    .uz-checkout-row { grid-template-columns: 1fr; }
  }
`;

// ── Load Razorpay checkout.js script once ─────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const s = document.createElement('script');
    s.id = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ── API helper: verify payment on our backend ─────────────────
const verifyPaymentOnBackend = async (payload) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const res = await fetch(`${API_URL}/orders/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    payment_method: 'ONLINE',
    notes: '',
  });

  useEffect(() => {
    if (cart.length === 0) navigate('/cart');
    getSettings().then(r => setSettings(r.data)).catch(() => {});
  }, [cart, navigate]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.customer_address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const fullAddress = `${form.customer_address}, ${form.city}, ${form.state} - ${form.pincode}`;
      const orderPayload = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_address: fullAddress,
        payment_method: form.payment_method,
        notes: form.notes,
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity, size: i.size || null })),
      };

      const res = await placeOrder(orderPayload);
      const data = res.data;

      if (form.payment_method === 'COD') {
        clearCart();
        navigate('/order-success', {
          state: {
            order_number: data.order_number,
            total_amount: data.total_amount,
            payment_method: 'COD',
          },
        });
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load. Please try again.');
        setLoading(false);
        return;
      }

      const { razorpay, order_id: internalOrderId } = data;

      const rzp = new window.Razorpay({
        key: razorpay.key_id,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: razorpay.name,
        description: razorpay.description,
        order_id: razorpay.order_id,
        prefill: razorpay.prefill,
        theme: razorpay.theme,

        handler: async (response) => {
          try {
            toast.loading('Verifying payment…', { id: 'verify' });

            const verifyRes = await verifyPaymentOnBackend({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: internalOrderId,
            });

            toast.dismiss('verify');

            if (verifyRes.message && verifyRes.order_number) {
              clearCart();
              navigate('/order-success', {
                state: {
                  order_number: verifyRes.order_number,
                  total_amount: verifyRes.total_amount ?? data.total_amount,
                  payment_method: 'ONLINE',
                },
              });
            } else {
              toast.error(verifyRes.message || 'Payment verification failed. Contact support.');
            }
          } catch {
            toast.dismiss('verify');
            toast.error('Verification error. Please contact support with your payment ID.');
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled. Your order is saved – complete payment to confirm.', {
              icon: '⚠️',
              duration: 5000,
            });
          },
        },
      });

      rzp.on('payment.failed', (response) => {
        setLoading(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to place order. Try again.');
    }
  };

  const shopName = settings.shop_name || 'MyShop';

  return (
    <>
      <style>{styles}</style>
      <div className="uz-checkout">
        {/* Top bar */}
        <div className="uz-checkout-topbar">
          <a href="/" className="uz-checkout-brand">{shopName}</a>
          <button className="uz-checkout-cart-icon"><ShoppingBag size={22} /></button>
        </div>

        {/* Mobile summary toggle */}
        <div className="uz-order-summary-toggle" onClick={() => setSummaryOpen(o => !o)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d4af37' }}>
            <ShoppingBag size={16} /> Order summary{' '}
            <ChevronDown size={14} style={{ transform: summaryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
          </span>
          <span className="uz-order-summary-toggle-amount">
            ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="uz-checkout-grid">

            {/* LEFT: Form */}
            <div className="uz-checkout-form-panel">

              <div className="uz-checkout-section-title">Contact</div>
              <div className="uz-checkout-field">
                <input type="email" name="email" placeholder="Email (optional)" />
              </div>
              <div className="uz-checkout-checkbox-row">
                <input type="checkbox" id="email_offers" defaultChecked />
                <label htmlFor="email_offers">Email me coupon codes and offers</label>
              </div>

              <div className="uz-checkout-section-title">Delivery</div>

              <div className="uz-checkout-field">
                <select name="country" defaultValue="India">
                  <option>India</option>
                </select>
              </div>

              <div className="uz-checkout-row">
                <div className="uz-checkout-field">
                  <input name="customer_name" value={form.customer_name} onChange={handleChange}
                    placeholder="First name" required />
                </div>
                <div className="uz-checkout-field">
                  <input name="last_name" placeholder="Last name (optional)" />
                </div>
              </div>

              <div className="uz-checkout-field">
                <input name="customer_address" value={form.customer_address} onChange={handleChange}
                  placeholder="Address" required />
              </div>
              <div className="uz-checkout-field">
                <input name="apartment" placeholder="Apartment, suite, etc. (optional)" />
              </div>

              <div className="uz-checkout-row">
                <div className="uz-checkout-field">
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
                </div>
                <div className="uz-checkout-field">
                  <select name="state" value={form.state} onChange={handleChange}>
                    {['Tamil Nadu','Karnataka','Kerala','Andhra Pradesh','Telangana','Maharashtra',
                      'Delhi','Gujarat','Rajasthan','West Bengal','Other'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="uz-checkout-row">
                <div className="uz-checkout-field">
                  <input name="pincode" value={form.pincode} onChange={handleChange}
                    placeholder="PIN code" required maxLength={6} />
                </div>
                <div className="uz-checkout-field">
                  <input name="customer_phone" value={form.customer_phone} onChange={handleChange}
                    placeholder="Phone" required maxLength={15} type="tel" />
                </div>
              </div>

              <div className="uz-checkout-checkbox-row" style={{ marginBottom: 20 }}>
                <input type="checkbox" id="save_info" />
                <label htmlFor="save_info">Save this information for next time</label>
              </div>

              

              {/* Payment */}
              <div className="uz-checkout-section-title" style={{ marginTop: 28 }}>Payment</div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#aaa', marginBottom: 12, fontStyle: 'italic' }}>
                All transactions are secure and encrypted.
              </p>

              <div className="uz-payment-opts">
                <label className={`uz-payment-opt-label ${form.payment_method === 'ONLINE' ? 'selected' : ''}`}>
                  <input type="radio" name="payment_method" value="ONLINE"
                    checked={form.payment_method === 'ONLINE'} onChange={handleChange} />
                  PhonePe Payment Gateway (UPI, Cards &amp; NetBanking)
                  <div className="uz-payment-logos">
                    <span style={{ fontWeight: 700, color: '#5f4b8b', letterSpacing: 1 }}>UPI</span>
                    <span style={{ fontWeight: 700, color: '#1a56db', letterSpacing: 1 }}>VISA</span>
                    <span style={{ fontWeight: 700, color: '#e87722', letterSpacing: 1 }}>MC</span>
                    <span>+4</span>
                  </div>
                </label>

                
              </div>

              {form.payment_method === 'ONLINE' && (
                <div className="uz-payment-note">
                  You'll be redirected to the payment gateway to complete your purchase securely.
                </div>
              )}

              

             

              

              {/* Total row */}
              <div className="uz-checkout-total-row">
                <div className="uz-checkout-total-left">
                  {cart[0] && (
                    <div className="uz-checkout-total-thumb">
                      {cart[0].image_url && <img src={cart[0].image_url} alt={cart[0].name} />}
                    </div>
                  )}
                  <div className="uz-checkout-total-info">
                    <div className="uz-checkout-total-label">Total</div>
                    <div className="uz-checkout-total-sub">
                      {cart.reduce((a, i) => a + i.quantity, 0)} item{cart.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="uz-checkout-total-amount">
                  <span className="uz-currency-tag">INR</span>
                  ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <button type="submit" className="uz-pay-btn" disabled={loading}>
                {loading ? 'Processing…' : form.payment_method === 'COD' ? 'Place Order' : 'Pay now'}
              </button>

              <div className="uz-checkout-footer">
                <a href="#">Refund policy</a>
                <a href="#">Shipping policy</a>
                <a href="#">Terms of service</a>
                <a href="#">Contact</a>
              </div>
            </div>

            {/* RIGHT: Summary panel */}
            <div className="uz-checkout-summary-panel">
              <div className="uz-summary-items">
                {cart.map(item => (
                  <div key={item.id} className="uz-summary-item">
                    <div className="uz-summary-item-img">
                      {item.image_url && <img src={item.image_url} alt={item.name} />}
                      <span className="uz-summary-item-qty">{item.quantity}</span>
                    </div>
                    <div className="uz-summary-item-info">
                      <div className="uz-summary-item-name">{item.name}</div>
                      {item.category_name && (
                        <div className="uz-summary-item-meta">{item.category_name}</div>
                      )}
                    </div>
                    <div className="uz-summary-item-price">
                      Rs. {(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="uz-summary-divider" />

              <div className="uz-summary-totals">
                <div className="uz-summary-row-line">
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="uz-summary-row-line">
                  <span>Shipping</span>
                  <span className="free">Free</span>
                </div>
                <div className="uz-summary-row-line total">
                  <span>Total</span>
                  <span>
                    <small style={{ fontSize: '0.68rem', color: '#aaa', marginRight: 4 }}>INR</small>
                    Rs. {cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </>
  );
};

export default Checkout;
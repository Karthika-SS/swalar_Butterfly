import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

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

  .wc-success {
    min-height: 80vh;
    display: flex; align-items: center; justify-content: center;
    padding: 40px 20px;
    background: var(--cream);
    font-family: 'Poppins', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .wc-success::before {
    content: '❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀';
    position: absolute; top: 20px; left: 0; right: 0;
    text-align: center; color: rgba(233,30,140,0.12);
    font-size: 1rem; letter-spacing: 6px; pointer-events: none;
  }

  .wc-success::after {
    content: '❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀';
    position: absolute; bottom: 20px; left: 0; right: 0;
    text-align: center; color: rgba(233,30,140,0.12);
    font-size: 1rem; letter-spacing: 6px; pointer-events: none;
  }

  .wc-success-card {
    max-width: 480px; width: 100%; text-align: center;
    padding: 52px 36px;
    border: 1.5px solid var(--border); border-radius: 16px;
    background: white;
    box-shadow: 0 12px 40px rgba(233,30,140,0.1);
    position: relative; z-index: 1;
  }

  .wc-success-icon {
    width: 84px; height: 84px;
    background: linear-gradient(135deg, var(--pink), #c0392b);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 28px;
    box-shadow: 0 8px 28px rgba(233,30,140,0.4);
    animation: wc-popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }

  @keyframes wc-popIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .wc-success-confetti {
    font-size: 1.8rem; margin-bottom: 4px;
    animation: wc-popIn 0.5s 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }

  .wc-success-card h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 600;
    color: var(--deep); margin-bottom: 10px;
  }

  .wc-success-sub {
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem; color: var(--text-muted);
    margin-bottom: 32px; line-height: 1.7;
  }

  .wc-success-details {
    background: var(--pink-pale);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px; margin-bottom: 20px;
    text-align: left;
  }

  .wc-success-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px solid var(--border);
    font-family: 'Poppins', sans-serif; font-size: 0.83rem;
  }

  .wc-success-row:last-child { border-bottom: none; }
  .wc-success-row span:first-child { color: var(--text-muted); }
  .wc-success-row strong { color: var(--deep); font-weight: 600; }

  .wc-success-note {
    background: var(--gold-pale);
    border: 1px solid #f0dfa8;
    border-radius: 10px;
    padding: 14px 16px; margin-bottom: 28px;
    font-family: 'Poppins', sans-serif; font-size: 0.8rem;
    color: var(--gold); text-align: left;
    display: flex; gap: 10px; align-items: flex-start;
  }

  .wc-success-note svg { color: var(--gold); flex-shrink: 0; margin-top: 2px; }

  .wc-success-actions { display: flex; flex-direction: column; gap: 12px; }

  .wc-success-primary {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 24px;
    background: linear-gradient(135deg, var(--pink), #c0392b);
    color: white; border-radius: 50px; text-decoration: none;
    font-family: 'Poppins', sans-serif; font-size: 0.72rem;
    font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    box-shadow: 0 6px 20px rgba(233,30,140,0.3);
    transition: transform 0.2s, box-shadow 0.2s, gap 0.2s;
  }

  .wc-success-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(233,30,140,0.45); gap: 12px;
  }

  .wc-success-secondary {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 24px;
    background: transparent; color: var(--pink);
    border: 2px solid var(--pink); border-radius: 50px; text-decoration: none;
    font-family: 'Poppins', sans-serif; font-size: 0.72rem;
    font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    transition: all 0.2s;
  }

  .wc-success-secondary:hover {
    background: var(--pink); color: white;
    box-shadow: 0 6px 20px rgba(233,30,140,0.3);
  }
`;

export const OrderSuccess = () => {
  const { state } = useLocation();
  if (!state?.order_number) return <Navigate to="/" />;

  return (
    <>
      <style>{styles}</style>
      <div className="wc-success">
        <div className="wc-success-card">
          <div className="wc-success-confetti">🎉</div>
          <div className="wc-success-icon">
            <CheckCircle size={44} color="white" />
          </div>
          <h1>Order Placed!</h1>
          <p className="wc-success-sub">
            Thank you for shopping with Salwar Butterfly! 🌸<br />
            We'll process your order right away and keep you updated.
          </p>

          <div className="wc-success-details">
            <div className="wc-success-row">
              <span>Order Number</span>
              <strong>{state.order_number}</strong>
            </div>
            <div className="wc-success-row">
              <span>Total Amount</span>
              <strong>Rs. {parseFloat(state.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="wc-success-row">
              <span>Payment</span>
              <strong>{state.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</strong>
            </div>
            <div className="wc-success-row">
              <span>Status</span>
              <span style={{
                background: '#fff8e1', color: '#b8860b',
                padding: '3px 14px', borderRadius: 50, fontSize: '0.68rem',
                fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                border: '1px solid #f5e08a', letterSpacing: '0.5px', textTransform: 'uppercase'
              }}>Pending</span>
            </div>
          </div>

          <div className="wc-success-note">
            <Package size={16} />
            <p>{state.payment_method === 'COD'
              ? 'Please keep the exact amount ready at the time of delivery. Delivery in 5–10 working days.'
              : 'Your payment has been recorded. We\'ll verify and ship your order soon. Thank you! 💕'
            }</p>
          </div>

          <div className="wc-success-actions">
            <Link to="/orders" className="wc-success-primary">
              <Package size={15} /> Track My Orders
            </Link>
            <Link to="/products" className="wc-success-secondary">
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
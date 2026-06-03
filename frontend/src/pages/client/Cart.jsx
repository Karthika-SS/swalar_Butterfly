import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Poppins:wght@300;400;500;600&display=swap');

  :root {
    --wc-pink: #c0392b; --wc-pink-light: #c0392b; --wc-pink-pale: #fff0f7;
    --wc-pink-soft: #fce4f3; --wc-gold: #c9922a; --wc-deep: #2d0a1e;
    --wc-cream: #fffaf6; --wc-border: #f0d6e8; --wc-text: #3a1a2e; --wc-muted: #8a6070;
  }

  .wc-cart { background: var(--wc-cream); min-height: 70vh; padding: 0 0 80px; }

  .wc-cart-warning {
    background: linear-gradient(90deg, var(--wc-pink-pale), var(--wc-cream));
    color: var(--wc-pink); text-align: center; padding: 12px 24px;
    font-family: 'Poppins', sans-serif; font-size: 0.78rem; font-weight: 500;
    border-bottom: 1px solid var(--wc-border); letter-spacing: 0.3px;
  }

  .wc-cart-inner { max-width: 900px; margin: 0 auto; padding: 40px 24px; }

  .wc-cart-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 32px; }

  .wc-cart-head h1 {
    font-family: 'Playfair Display', serif; font-size: 2rem;
    font-weight: 500; color: var(--wc-deep); letter-spacing: 0.3px;
  }

  .wc-continue-link {
    font-family: 'Poppins', sans-serif; font-size: 0.72rem; font-weight: 500;
    color: var(--wc-pink); text-decoration: none; letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 4px; transition: gap 0.2s;
  }
  .wc-continue-link:hover { gap: 8px; }

  .wc-cart-table-head {
    display: grid; grid-template-columns: 1fr auto; gap: 24px;
    padding: 0 0 12px; border-bottom: 2px solid var(--wc-border); margin-bottom: 0;
  }
  .wc-cart-table-head span {
    font-family: 'Poppins', sans-serif; font-size: 0.6rem; font-weight: 600;
    letter-spacing: 2.5px; text-transform: uppercase; color: var(--wc-muted);
  }
  .wc-cart-table-head span:last-child { text-align: right; }

  .wc-cart-item {
    display: grid; grid-template-columns: 80px 1fr auto;
    gap: 20px; padding: 20px 0; border-bottom: 1px solid var(--wc-border); align-items: start;
  }

  .wc-cart-item-img {
    width: 80px; height: 100px; border-radius: 8px;
    overflow: hidden; background: var(--wc-pink-pale); flex-shrink: 0;
    border: 1px solid var(--wc-border);
  }
  .wc-cart-item-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .wc-cart-item-info { display: flex; flex-direction: column; gap: 4px; }

  .wc-cart-item-name {
    font-family: 'Poppins', sans-serif; font-size: 0.88rem;
    color: var(--wc-text); font-weight: 500; margin-bottom: 2px;
  }

  .wc-cart-item-price { font-family: 'Poppins', sans-serif; font-size: 0.82rem; color: var(--wc-muted); }

  .wc-cart-item-cat { font-family: 'Poppins', sans-serif; font-size: 0.7rem; color: #ccc; letter-spacing: 0.5px; }

  .wc-cart-item-size {
    display: inline-flex; align-items: center;
    background: var(--wc-pink-pale); border: 1px solid var(--wc-border);
    color: var(--wc-pink); border-radius: 12px; padding: 2px 10px;
    font-family: 'Poppins', sans-serif; font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.5px; width: fit-content; margin-top: 2px;
  }

  .wc-cart-item-controls { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }

  .wc-cart-item-total { font-family: 'Poppins', sans-serif; font-size: 0.9rem; color: var(--wc-deep); font-weight: 600; }

  .wc-qty-row {
    display: flex; align-items: center; gap: 0;
    border: 1.5px solid var(--wc-border); border-radius: 25px; overflow: hidden;
  }
  .wc-qty-row button {
    width: 32px; height: 32px; background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--wc-pink); transition: background 0.15s;
  }
  .wc-qty-row button:hover:not(:disabled) { background: var(--wc-pink-pale); }
  .wc-qty-row button:disabled { opacity: 0.3; cursor: not-allowed; }
  .wc-qty-row span {
    width: 32px; text-align: center;
    font-family: 'Poppins', sans-serif; font-size: 0.82rem; font-weight: 500;
    border-left: 1px solid var(--wc-border); border-right: 1px solid var(--wc-border);
    height: 32px; display: flex; align-items: center; justify-content: center;
    color: var(--wc-text);
  }

  .wc-delete-btn {
    background: none; border: none; cursor: pointer;
    color: #ddd; padding: 4px; display: flex; transition: color 0.2s;
  }
  .wc-delete-btn:hover { color: var(--wc-pink); }

  .wc-cart-summary {
    margin-top: 32px; border-top: 2px solid var(--wc-border);
    padding-top: 24px; max-width: 400px; margin-left: auto;
  }

  .wc-summary-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px; font-family: 'Poppins', sans-serif; font-size: 0.85rem; color: var(--wc-muted);
  }
  .wc-summary-row.total {
    font-size: 1.1rem; font-weight: 600; color: var(--wc-deep);
    margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--wc-border);
  }
  .wc-summary-free { color: #2e7d32; font-weight: 500; }

  .wc-summary-note {
    font-family: 'Poppins', sans-serif; font-size: 0.7rem;
    color: #bbb; text-align: center; margin: 12px 0 20px;
  }

  .wc-checkout-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 16px;
    background: linear-gradient(135deg, var(--wc-pink), #c0392b);
    color: white; border-radius: 50px; text-decoration: none;
    font-family: 'Poppins', sans-serif; font-size: 0.8rem; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    box-shadow: 0 6px 20px rgba(233,30,140,0.3);
    transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 12px;
  }
  .wc-checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(233,30,140,0.42); }

  /* Empty */
  .wc-cart-empty {
    text-align: center; padding: 100px 24px;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
  }
  .wc-cart-empty h2 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 400; color: var(--wc-deep); }
  .wc-cart-empty p { font-family: 'Poppins', sans-serif; font-size: 0.85rem; color: var(--wc-muted); }

  .wc-start-shopping {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, var(--wc-pink), #c0392b);
    color: white; padding: 14px 36px; border-radius: 50px; text-decoration: none;
    font-family: 'Poppins', sans-serif; font-size: 0.74rem; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase; margin-top: 8px;
    box-shadow: 0 6px 20px rgba(233,30,140,0.3); transition: transform 0.2s, box-shadow 0.2s;
  }
  .wc-start-shopping:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(233,30,140,0.42); }

  .wc-empty-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--wc-pink-pale); border: 2px solid var(--wc-border);
    display: flex; align-items: center; justify-content: center;
  }

  @media (max-width: 600px) {
    .wc-cart-item { grid-template-columns: 64px 1fr; }
    .wc-cart-item-controls { flex-direction: row; align-items: center; }
    .wc-cart-table-head { display: none; }
  }
`;

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="wc-cart-empty">
          <div className="wc-empty-icon">
            <ShoppingBag size={36} color="#c0392b" />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet 🌸</p>
          <Link to="/products" className="wc-start-shopping">
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="wc-cart">
        <div className="wc-cart-warning">
          🌸 Please double-check your size before checkout — no exchanges without unboxing video
        </div>

        <div className="wc-cart-inner">
          <div className="wc-cart-head">
            <h1>Your Cart</h1>
            <Link to="/products" className="wc-continue-link">
              Continue shopping <ArrowRight size={13} />
            </Link>
          </div>

          <div className="wc-cart-table-head">
            <span>Product</span>
            <span>Total</span>
          </div>

          {cart.map(item => (
            <div key={`${item.id}-${item.size}`} className="wc-cart-item">
              <div className="wc-cart-item-img">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={24} color="#f0d6e8" />
                    </div>
                }
              </div>

              <div className="wc-cart-item-info">
                <div className="wc-cart-item-name">{item.name}</div>
                {item.category_name && <div className="wc-cart-item-cat">{item.category_name}</div>}
                <div className="wc-cart-item-price">
                  Rs. {parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                {item.size && <span className="wc-cart-item-size">Size: {item.size}</span>}

                <div className="wc-qty-row" style={{ marginTop: 10, width: 'fit-content' }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)} disabled={item.quantity === 1}>
                    <Minus size={12} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)} disabled={item.quantity >= item.stock}>
                    <Plus size={12} />
                  </button>
                  <button onClick={() => removeFromCart(item.id, item.size)}
                    style={{ borderLeft: '1px solid #f0d6e8', color: '#ddd', width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
                    onMouseLeave={e => e.currentTarget.style.color = '#ddd'}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="wc-cart-item-total">
                Rs. {(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}

          <div className="wc-cart-summary">
            <div className="wc-summary-row">
              <span>Subtotal</span>
              <span>Rs. {cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="wc-summary-row">
              <span>Shipping</span>
              <span className="wc-summary-free">Free 🎉</span>
            </div>
            <div className="wc-summary-row total">
              <span>Total</span>
              <span>Rs. {cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="wc-summary-note">Taxes included · Free shipping on all orders</p>
            <Link to="/checkout" className="wc-checkout-btn">
              Check Out <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
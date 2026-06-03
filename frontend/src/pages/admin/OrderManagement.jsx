import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { adminGetOrders, updateOrderStatus } from '../../utils/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
const styles = `
.order-mgmt {}

.order-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 20px;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  color: var(--text-muted);
}

.filter-tab:hover { border-color: var(--accent); color: var(--accent); }
.filter-tab.active { background: var(--accent); border-color: var(--accent); color: white; }

.order-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 16px;
  margin-bottom: 20px;
  max-width: 440px;
}

.order-search svg { color: var(--text-muted); }

.order-search input {
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  width: 100%;
  background: transparent;
}

.orders-list { display: flex; flex-direction: column; gap: 16px; }

.order-card-admin {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.order-admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 12px;
}

.order-num { font-weight: 700; font-size: 0.95rem; color: var(--primary); }

.order-meta-info {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot { opacity: 0.4; }

.oah-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-amount { font-weight: 700; font-size: 1.05rem; color: var(--primary); }

.expand-toggle {
  background: var(--bg);
  border: none;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  transition: all 0.2s;
}

.expand-toggle:hover { background: var(--border); color: var(--text); }

.order-customer-row {
  display: flex;
  gap: 20px;
  padding: 14px 20px;
  background: #fafafa;
  align-items: flex-start;
  flex-wrap: wrap;
}

.customer-info-item { flex: 1; min-width: 120px; }
.customer-info-item.flex-2 { flex: 2; }

.customer-info-item label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 3px;
}

.customer-info-item span { font-size: 0.88rem; color: var(--text); }

.status-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 7px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.2s;
}

.next-shipped { background: #cce5ff; color: #004085; }
.next-shipped:hover { background: #004085; color: white; }
.next-delivered, .delivered-btn { background: #d4edda; color: #155724; }
.next-delivered:hover, .delivered-btn:hover { background: #155724; color: white; }
.status-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #25D366;
  color: white;
  transition: all 0.2s;
  flex-shrink: 0;
}

.whatsapp-btn:hover:not(:disabled) {
  background: #1ebe5d;
  transform: scale(1.05);
}

.whatsapp-btn:disabled {
  background: #a8e6c1;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.whatsapp-btn svg {
  width: 20px;
  height: 20px;
  fill: white;
}

.order-admin-body {
  padding: 20px;
  border-top: 1px solid var(--border);
}

.order-admin-body h4 {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.order-items-admin { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }

.admin-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: var(--bg);
  border-radius: 8px;
  font-size: 0.88rem;
}

.admin-item-img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--border);
}

.admin-item-img img { width: 100%; height: 100%; object-fit: cover; }
.admin-no-img { width: 100%; height: 100%; }

.ai-name { flex: 1; font-weight: 500; }

.ai-size {
  background: #1a1a1a;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.ai-size.no-size {
  background: #eee;
  color: #999;
}

.ai-qty { color: var(--text-muted); white-space: nowrap; }
.ai-price { color: var(--text-muted); white-space: nowrap; }
.ai-total { font-weight: 700; white-space: nowrap; }

.order-extra-info { display: flex; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }

.extra-info-item label {
  display: block;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 4px;
}

.extra-info-item span { font-size: 0.9rem; }

.status-override {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.status-override label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.status-btns-row { display: flex; gap: 8px; flex-wrap: wrap; }

.status-opt {
  padding: 7px 16px;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  background: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  transition: all 0.2s;
  color: var(--text-muted);
}

.status-opt:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.status-opt.active { background: var(--primary); border-color: var(--primary); color: white; cursor: default; }
.status-opt:disabled:not(.active) { opacity: 0.4; cursor: not-allowed; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.empty-orders { text-align: center; padding: 60px; color: var(--text-muted); }

@media (max-width: 700px) {
  .order-customer-row { flex-direction: column; gap: 12px; }
  .admin-item-row { flex-wrap: wrap; }
  .ai-price { display: none; }
}
`;

const STATUSES = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Payment Failed', 'Cancelled'];
const statusClass = (s) => {
  if (s === 'Pending') return 'badge-pending';
  if (s === 'Shipped') return 'badge-shipped';
  if (s === 'Delivered') return 'badge-delivered';
  if (s === 'Confirmed') return 'badge-confirmed';
  if (s === 'Payment Failed') return 'badge-failed';
  if (s === 'Cancelled') return 'badge-cancelled';
  return '';
};
const nextStatus = { Pending: 'Shipped', Confirmed: 'Shipped', Shipped: 'Delivered' };

// WhatsApp SVG icon component
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Track which orders have had WhatsApp message sent
  const [whatsappSent, setWhatsappSent] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('whatsappSent') || '{}');
  } catch { return {}; }
});

  const fetchOrders = (status = filter, p = page) => {
    setLoading(true);
    adminGetOrders({ status: status !== 'All' ? status : undefined, page: p, limit: 15 })
      .then(r => {
        setOrders(r.data.orders);
        setTotalPages(r.data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(filter, page); }, [filter, page]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search)
  );

  const handleWhatsApp = (order) => {
    // Normalize phone: remove spaces/dashes, add country code if missing
    let phone = order.customer_phone.replace(/[\s\-()]/g, '');
    if (!phone.startsWith('+')) {
      // Assume Indian number if no country code
      phone = '91' + phone.replace(/^0+/, '');
    } else {
      phone = phone.replace('+', '');
    }

    const message =
      `*Subject: Order Confirmation*\n\n` +
      `Thank you for ordering with *Salwar Butterfly* 🛍️\n\n` +
      `*Order No:* ${order.order_number}\n\n` +
      `Your order has been placed successfully.\n` +
      `You can track your order using your mobile number.\n\n` +
      `For any queries, contact us.\n\n` +
      `💕 *Team Salwar Butterfly*`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.open(url, '_blank');

    // Mark this order's WhatsApp as sent
    setWhatsappSent(prev => {
  const updated = { ...prev, [order.id]: true };
  localStorage.setItem('whatsappSent', JSON.stringify(updated));
  return updated;
});
  };

  const downloadShippingSlip = (order) => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text('SHIPPING DETAILS', 20, y);
    y += 20;

    doc.setFontSize(12);
    doc.text(`Order Number: ${order.order_number}`, 20, y);
    y += 12;

    doc.text(`Customer Name: ${order.customer_name}`, 20, y);
    y += 12;

    doc.text(`Phone: ${order.customer_phone}`, 20, y);
    y += 12;

    doc.text('Shipping Address:', 20, y);
    y += 8;

    const addressLines = doc.splitTextToSize(order.customer_address || '', 160);
    doc.text(addressLines, 20, y);
    y += addressLines.length * 8 + 15;

    doc.setFontSize(15);
    doc.text('ORDER ITEMS', 20, y);
    y += 12;

    doc.setFontSize(11);
    order.items?.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.product_name}`, 20, y);
      y += 8;
      doc.text(`Size: ${item.size || 'No Size'} - Qty: ${item.quantity} - Price: Rs.${item.price}`, 30, y);
      y += 12;
      if (y > 260) { doc.addPage(); y = 20; }
    });

    y += 10;
    doc.setFontSize(12);
    doc.text(`Payment Method: ${order.payment_method}`, 20, y);
    y += 12;
    doc.text(`Order Status: ${order.status}`, 20, y);
    y += 12;
    doc.setFontSize(14);
    doc.text(`Total Amount: Rs.${order.total_amount}`, 20, y);

    doc.save(`${order.order_number}-shipping-slip.pdf`);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="order-mgmt">
        <div className="page-header">
          <div>
            <h1>Orders</h1>
            <p>Manage and track all customer orders</p>
          </div>
        </div>

        <div className="order-filters">
          {STATUSES.map(s => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => { setFilter(s); setPage(1); }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="order-search">
          <Search size={16} />
          <input
            placeholder="Search by order #, name, or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-orders"><p>No orders found</p></div>
        ) : (
          <>
            <div className="orders-list">
              {filtered.map(order => (
                <div key={order.id} className="order-card-admin">
                  <div className="order-admin-header">
                    <div className="oah-left">
                      <div className="order-num">{order.order_number}</div>
                      <div className="order-meta-info">
                        <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="dot">·</span>
                        <span>{order.payment_method}</span>
                      </div>
                    </div>
                    <div className="oah-right">
                      <span className={`badge ${statusClass(order.status)}`}>{order.status}</span>
                      <span className="order-amount">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                      <button
                        className="expand-toggle"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      >
                        {expandedId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="order-customer-row">
                    <div className="customer-info-item">
                      <label>Customer</label>
                      <span>{order.customer_name}</span>
                    </div>
                    <div className="customer-info-item">
                      <label>Phone</label>
                      <span>{order.customer_phone}</span>
                    </div>
                    <div className="customer-info-item flex-2">
                      <label>Address</label>
                      <span>{order.customer_address}</span>
                    </div>
                    <div className="status-actions">
                      {/* WhatsApp button - disabled after first send */}
                      <button
                        className="whatsapp-btn"
                        onClick={() => handleWhatsApp(order)}
                        disabled={whatsappSent[order.id]}
                        title={whatsappSent[order.id] ? 'Message already sent' : 'Send WhatsApp confirmation'}
                      >
                        <WhatsAppIcon />
                      </button>

                      <button
                        className="status-btn"
                        onClick={() => downloadShippingSlip(order)}
                        style={{ background: '#111', color: 'white' }}
                      >
                        Download PDF
                      </button>

                      {nextStatus[order.status] && (
                        <button
                          className={`status-btn next-${nextStatus[order.status].toLowerCase()}`}
                          onClick={() => handleStatusUpdate(order.id, nextStatus[order.status])}
                          disabled={updatingId === order.id}
                        >
                          {updatingId === order.id ? 'Updating…' : `Mark as ${nextStatus[order.status]}`}
                        </button>
                      )}
                      {(order.status === 'Pending' || order.status === 'Confirmed') && (
                        <button
                          className="status-btn delivered-btn"
                          onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                          disabled={updatingId === order.id}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedId === order.id && (
                    <div className="order-admin-body">
                      <h4>Order Items</h4>
                      <div className="order-items-admin">
                        {order.items?.map(item => (
                          <div key={item.id} className="admin-item-row">
                            <div className="admin-item-img">
                              {item.product_image
                                ? <img src={item.product_image} alt={item.product_name} />
                                : <div className="admin-no-img" />}
                            </div>
                            <span className="ai-name">{item.product_name}</span>
                            <span className={`ai-size ${item.size ? '' : 'no-size'}`}>
                              {item.size ? `Size: ${item.size}` : 'No size'}
                            </span>
                            <span className="ai-qty">Qty: {item.quantity}</span>
                            <span className="ai-price">₹{parseFloat(item.price).toLocaleString('en-IN')} each</span>
                            <span className="ai-total">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-extra-info">
                        {order.upi_reference && (
                          <div className="extra-info-item">
                            <label>UPI Reference</label>
                            <span>{order.upi_reference}</span>
                          </div>
                        )}
                        {order.razorpay_payment_id && (
                          <div className="extra-info-item">
                            <label>Payment ID</label>
                            <span>{order.razorpay_payment_id}</span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="extra-info-item">
                            <label>Order Notes</label>
                            <span>{order.notes}</span>
                          </div>
                        )}
                      </div>

                      <div className="status-override">
                        <label>Update Status:</label>
                        <div className="status-btns-row">
                          {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                            <button
                              key={s}
                              className={`status-opt ${order.status === s ? 'active' : ''}`}
                              onClick={() => order.status !== s && handleStatusUpdate(order.id, s)}
                              disabled={order.status === s || updatingId === order.id}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button className="btn btn-outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default OrderManagement;
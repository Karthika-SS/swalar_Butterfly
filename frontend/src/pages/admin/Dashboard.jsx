import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { getDashboardStats } from '../../utils/api';

const styles = `
.dashboard {}

.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 1.8rem; margin-bottom: 4px; }
.page-header p { color: var(--text-muted); }

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: var(--shadow);
  transition: transform 0.2s;
}

.stat-card:hover { transform: translateY(-3px); }

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.color-blue .stat-icon { background: #e0f0ff; color: #0066cc; }
.color-green .stat-icon { background: #e6f9ee; color: var(--success); }
.color-purple .stat-icon { background: #f0e8ff; color: #7c3aed; }
.color-orange .stat-icon { background: #fff4e6; color: #f97316; }

.stat-label {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary);
  font-family: 'Playfair Display', serif;
  line-height: 1;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.dash-section { padding: 24px; }

.dash-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.dash-section h2 {
  font-size: 1.1rem;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
}

.view-all-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: opacity 0.2s;
}

.view-all-link:hover { opacity: 0.7; }

.empty-text { color: var(--text-muted); font-size: 0.9rem; }

.recent-orders-table { overflow-x: auto; }

.table-head, .table-row {
  display: grid;
  grid-template-columns: 1.8fr 1.2fr 1fr 1fr 0.8fr;
  gap: 12px;
  padding: 10px 0;
  align-items: center;
  font-size: 0.85rem;
}

.table-head {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 12px;
  margin-bottom: 4px;
}

.table-row {
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}

.table-row:hover { background: var(--bg); border-radius: 6px; }
.table-row:last-child { border-bottom: none; }

.order-num-cell {
  font-weight: 600;
  color: var(--primary);
  font-size: 0.8rem;
}

.revenue-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 200px;
  padding-top: 16px;
}

.rev-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.rev-bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.rev-bar {
  width: 100%;
  background: linear-gradient(to top, var(--accent), rgba(233,69,96,0.5));
  border-radius: 6px 6px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
}

.rev-month {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 6px;
  font-weight: 600;
}

.rev-amount {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 2px;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .stat-cards { grid-template-columns: 1fr; }
  .table-head, .table-row { grid-template-columns: 1.5fr 1fr 1fr 1fr; }
  .table-head span:last-child, .table-row span:last-child { display: none; }
}
`;

const statusClass = (s) => s === 'Pending' ? 'badge-pending' : s === 'Shipped' ? 'badge-shipped' : 'badge-delivered';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!stats) return <div>Failed to load stats</div>;

  const statCards = [
    { icon: <ShoppingBag size={28} />, label: 'Total Orders', value: stats.total_orders, color: 'blue' },
    { icon: <Package size={28} />, label: 'Active Products', value: stats.total_products, color: 'green' },
    { icon: <TrendingUp size={28} />, label: 'Revenue', value: `₹${parseFloat(stats.total_revenue).toLocaleString('en-IN')}`, color: 'purple' },
    { icon: <Clock size={28} />, label: 'Pending Orders', value: stats.pending_orders, color: 'orange' },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening.</p>
        </div>

        <div className="stat-cards">
          {statCards.map((s, i) => (
            <div key={i} className={`stat-card color-${s.color}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-body">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="dash-section card">
            <div className="dash-section-header">
              <h2>Recent Orders</h2>
              <a href="/admin/orders" className="view-all-link">View All →</a>
            </div>
            {stats.recent_orders.length === 0 ? (
              <p className="empty-text">No orders yet</p>
            ) : (
              <div className="recent-orders-table">
                <div className="table-head">
                  <span>Order #</span>
                  <span>Customer</span>
                  <span>Amount</span>
                  <span>Payment Status</span>
                  <span>Date</span>
                </div>
                {stats.recent_orders.map(order => (
                  <div key={order.id} className="table-row">
                    <span className="order-num-cell">{order.order_number}</span>
                    <span>{order.customer_name}</span>
                    <span>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                    <span><span className={`badge ${statusClass(order.status)}`}>{order.status}</span></span>
                    <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dash-section card">
            <h2>Monthly Revenue</h2>
            {stats.monthly_revenue.length === 0 ? (
              <p className="empty-text">No revenue data yet</p>
            ) : (
              <div className="revenue-bars">
                {stats.monthly_revenue.map((m, i) => {
                  const maxRev = Math.max(...stats.monthly_revenue.map(x => x.revenue));
                  const pct = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0;
                  return (
                    <div key={i} className="rev-bar-item">
                      <div className="rev-bar-wrap">
                        <div className="rev-bar" style={{ height: `${pct}%` }} />
                      </div>
                      <div className="rev-month">{m.month.slice(5)}</div>
                      <div className="rev-amount">₹{parseInt(m.revenue).toLocaleString('en-IN')}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { adminLogin } from '../../utils/api';
import { useAdmin } from '../../context/AdminContext';
import toast from 'react-hot-toast';

const styles = `
.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary) 0%, #2d1b69 60%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 24px;
  padding: 48px 44px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.3);
  text-align: center;
}

.login-logo {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, var(--primary), #2d1b69);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--accent);
  margin: 0 auto 24px;
  box-shadow: 0 8px 24px rgba(26,26,46,0.3);
}

.login-card h1 {
  font-size: 1.8rem;
  color: var(--primary);
  margin-bottom: 8px;
}

.login-sub {
  color: var(--text-muted);
  margin-bottom: 32px;
}

.login-form { text-align: left; }

.input-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-wrap input {
  padding-left: 44px;
  padding-right: 44px;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

.toggle-pass {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}

.toggle-pass:hover { color: var(--primary); }

.login-btn {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 1rem;
  margin-top: 8px;
}

.login-hint {
  margin-top: 28px;
  padding: 14px;
  background: var(--bg);
  border-radius: 10px;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.8;
}
`;

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin(form);
      login(res.data.token, res.data.admin);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="admin-login-page">
        <div className="login-card">
          <div className="login-logo">
            <span>✦</span>
          </div>
          <h1>Admin Panel</h1>
          <p className="login-sub">Sign in to manage your store</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="admin@shop.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPassword(s => !s)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-hint">
            <p>Default: admin@shop.com / admin123</p>
            <p>Change password after first login.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;

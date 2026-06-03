import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Tag } from 'lucide-react';
import { getCategories } from '../../utils/api';
import toast from 'react-hot-toast';

const styles = `
.cat-mgmt {}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.cat-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.2s;
}

.cat-card:hover { transform: translateY(-2px); }

.cat-card-img {
  width: 100%; height: 120px;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}

.cat-card-img img { width: 100%; height: 100%; object-fit: cover; }

.cat-card-initial {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem; font-weight: 700;
  color: var(--text-muted);
}

.cat-card-body {
  padding: 14px 16px;
  display: flex; align-items: center; justify-content: space-between;
}

.cat-card-name {
  font-weight: 600; font-size: 0.95rem; color: var(--primary);
}

.cat-card-count {
  font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;
}

.cat-card-actions { display: flex; gap: 6px; }

.cat-action-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;
}

.cat-action-btn.edit { background: #e0f0ff; color: #0066cc; }
.cat-action-btn.edit:hover { background: #0066cc; color: white; }
.cat-action-btn.delete { background: #fde8e8; color: var(--danger); }
.cat-action-btn.delete:hover { background: var(--danger); color: white; }

.cat-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  z-index: 1000; display: flex; align-items: center;
  justify-content: center; padding: 20px; backdrop-filter: blur(4px);
}

.cat-modal {
  background: white; border-radius: var(--radius-lg);
  width: 100%; max-width: 460px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.25);
  overflow: hidden;
}

.cat-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 24px; border-bottom: 1px solid var(--border);
}

.cat-modal-header h2 {
  font-size: 1.2rem; font-family: 'DM Sans', sans-serif; font-weight: 600;
}

.cat-modal-close {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 4px; display: flex; border-radius: 6px;
}
.cat-modal-close:hover { background: var(--bg); }

.cat-modal-body { padding: 24px; }

.cat-img-upload {
  border: 2px dashed var(--border); border-radius: var(--radius);
  overflow: hidden; cursor: pointer; margin-bottom: 20px;
  min-height: 140px; display: flex; align-items: center;
  justify-content: center; transition: border-color 0.2s; background: var(--bg);
}
.cat-img-upload:hover { border-color: var(--accent); }

.cat-img-preview { width: 100%; height: 160px; object-fit: cover; display: block; }

.cat-upload-placeholder {
  text-align: center; padding: 28px; color: var(--text-muted);
}
.cat-upload-placeholder svg { margin-bottom: 8px; }
.cat-upload-placeholder p { font-weight: 500; margin-bottom: 4px; }
.cat-upload-placeholder span { font-size: 0.78rem; }

.cat-modal-footer {
  display: flex; gap: 10px; justify-content: flex-end;
  padding-top: 8px; border-top: 1px solid var(--border); margin-top: 20px;
}

.cat-empty {
  text-align: center; padding: 60px 24px; color: var(--text-muted);
}
.cat-empty h3 {
  font-size: 1.1rem; font-weight: 600; margin: 12px 0 6px;
  color: var(--primary);
}

.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  z-index: 1001; display: flex; align-items: center;
  justify-content: center; padding: 20px; backdrop-filter: blur(4px);
}
.confirm-box {
  background: white; border-radius: var(--radius-lg);
  padding: 40px; max-width: 400px; width: 100%;
  text-align: center;
}
.confirm-box h3 { font-size: 1.3rem; margin: 14px 0 8px; }
.confirm-box p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 28px; }
.confirm-actions { display: flex; gap: 12px; justify-content: center; }
`;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('adminToken');

const apiCall = async (method, path, body) => {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${getToken()}` },
  };
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_URL}${path}`, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef();

  const fetchCats = () => {
    setLoading(true);
    getCategories()
      .then(r => setCategories(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchCats, []);

  const openCreate = () => {
    setEditCat(null);
    setForm({ name: '', description: '' });
    setImgFile(null);
    setImgPreview('');
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setImgPreview(cat.image_url || '');
    setImgFile(null);
    setShowModal(true);
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const normalizedName = form.name.trim();
  if (!normalizedName) { toast.error('Category name is required'); return; }
  
  setSaving(true);
  try {
    const fd = new FormData();
    fd.append('name', normalizedName);  // ✅ use normalized name
    fd.append('description', form.description.trim());
    if (imgFile) fd.append('image', imgFile);

    if (editCat) {
      await apiCall('PUT', `/products/admin/categories/${editCat.id}`, fd);
      toast.success('Category updated!');
    } else {
      await apiCall('POST', '/products/admin/categories', fd);
      toast.success('Category created!');
    }
    setShowModal(false);
    fetchCats();
  } catch (err) {
    // ✅ Show exact error from backend
    const msg = err.message || '';
    if (msg.includes('already exists')) {
      toast.error('A category with this name already exists!');
    } else {
      toast.error('Failed to save category');
    }
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (id) => {
    try {
      await apiCall('DELETE', `/products/admin/categories/${id}`);
      toast.success('Category deleted');
      setDeleteConfirm(null);
      fetchCats();
    } catch {
      toast.error('Failed to delete — category may have products assigned to it');
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="cat-mgmt">
        <div className="page-header">
          <div>
            <h1>Categories</h1>
            <p>{categories.length} categories total</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Add Category
          </button>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : categories.length === 0 ? (
          <div className="cat-empty card">
            <Tag size={48} color="var(--border)" />
            <h3>No categories yet</h3>
            <p>Create your first category to organise your products.</p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openCreate}>
              <Plus size={16} /> Add Category
            </button>
          </div>
        ) : (
          <div className="cat-grid">
            {categories.map(cat => (
              <div key={cat.id} className="cat-card">
                <div className="cat-card-img">
                  {cat.image_url
                    ? <img src={cat.image_url} alt={cat.name} />
                    : <span className="cat-card-initial">{cat.name.charAt(0)}</span>
                  }
                </div>
                <div className="cat-card-body">
                  <div>
                    <div className="cat-card-name">{cat.name}</div>
                    {cat.product_count !== undefined && (
                      <div className="cat-card-count">{cat.product_count} products</div>
                    )}
                  </div>
                  <div className="cat-card-actions">
                    <button className="cat-action-btn edit" onClick={() => openEdit(cat)}>
                      <Pencil size={14} />
                    </button>
                    <button className="cat-action-btn delete" onClick={() => setDeleteConfirm(cat)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit modal */}
        {showModal && (
          <div className="cat-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="cat-modal" onClick={e => e.stopPropagation()}>
              <div className="cat-modal-header">
                <h2>{editCat ? 'Edit Category' : 'Add Category'}</h2>
                <button className="cat-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="cat-modal-body">
                <form onSubmit={handleSubmit}>
                  <div
                    className="cat-img-upload"
                    onClick={() => fileRef.current.click()}
                  >
                    {imgPreview
                      ? <img src={imgPreview} alt="Preview" className="cat-img-preview" />
                      : (
                        <div className="cat-upload-placeholder">
                          <Upload size={32} />
                          <p>Click to upload image</p>
                          <span>JPG, PNG, WEBP up to 5MB</span>
                        </div>
                      )
                    }
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImgChange} hidden />

                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Half Sarees"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={2}
                      placeholder="Short description (optional)"
                    />
                  </div>

                  <div className="cat-modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving…' : editCat ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="confirm-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="confirm-box" onClick={e => e.stopPropagation()}>
              <Trash2 size={40} color="var(--danger)" />
              <h3>Delete Category?</h3>
              <p>
                Delete <strong>{deleteConfirm.name}</strong>? Products in this
                category won't be deleted but will become uncategorised.
              </p>
              <div className="confirm-actions">
                <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ background: 'var(--danger)' }}
                  onClick={() => handleDelete(deleteConfirm.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryManagement;
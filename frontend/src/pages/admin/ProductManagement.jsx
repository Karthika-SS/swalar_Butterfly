import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminGetProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../../utils/api';
import toast from 'react-hot-toast';

const styles = `
.product-mgmt {}
.page-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.page-header h1 { font-size: 1.8rem; margin-bottom: 4px; }
.page-header p { color: var(--text-muted); font-size: 0.9rem; }
.mgmt-toolbar { margin-bottom: 20px; }
.search-bar { display: flex; align-items: center; gap: 10px; background: white; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 10px 16px; max-width: 340px; }
.search-bar svg { color: var(--text-muted); flex-shrink: 0; }
.search-bar input { border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; width: 100%; background: transparent; }
.products-table-wrap { overflow-x: auto; }
.products-table { width: 100%; border-collapse: collapse; }
.products-table th { text-align: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); font-weight: 600; padding: 14px 16px; border-bottom: 2px solid var(--border); white-space: nowrap; }
.products-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 0.9rem; vertical-align: middle; }
.products-table tr:last-child td { border-bottom: none; }
.products-table tr:hover td { background: #fafafa; }
.product-cell { display: flex; align-items: center; gap: 12px; }
.product-thumb { width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--bg); }
.product-thumb img { width: 100%; height: 100%; object-fit: cover; }
.no-thumb { width: 100%; height: 100%; background: var(--border); }
.product-cell-name { font-weight: 600; color: var(--primary); }
.product-cell-id { font-size: 0.75rem; color: var(--text-muted); }
.price-cell { font-weight: 700; color: var(--primary); }
.stock-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 36px; padding: 4px 10px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; }
.stock-badge.ok { background: #d4edda; color: #155724; }
.stock-badge.low { background: #fff3cd; color: #856404; }
.stock-badge.out { background: #f8d7da; color: #721c24; }
.status-pill { display: inline-flex; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.status-pill.active { background: #d4edda; color: #155724; }
.status-pill.inactive { background: #f8d7da; color: #721c24; }
.action-btns { display: flex; gap: 8px; }
.action-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.action-btn.edit { background: #e0f0ff; color: #0066cc; }
.action-btn.edit:hover { background: #0066cc; color: white; }
.action-btn.delete { background: #fde8e8; color: var(--danger); }
.action-btn.delete:hover { background: var(--danger); color: white; }
.empty-row { text-align: center; padding: 40px; color: var(--text-muted); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
.modal-box { background: white; border-radius: var(--radius-lg); width: 100%; max-width: 660px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 80px rgba(0,0,0,0.25); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: white; z-index: 1; }
.modal-header h2 { font-size: 1.3rem; font-family: 'DM Sans', sans-serif; font-weight: 600; }
.modal-close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; display: flex; border-radius: 8px; transition: all 0.2s; }
.modal-close:hover { background: var(--bg); color: var(--text); }
.modal-form { padding: 24px 28px; }
.image-upload-area { border: 2px dashed var(--border); border-radius: var(--radius); overflow: hidden; cursor: pointer; margin-bottom: 20px; transition: border-color 0.2s; min-height: 160px; display: flex; align-items: center; justify-content: center; }
.image-upload-area:hover { border-color: var(--accent); }
.upload-placeholder { text-align: center; padding: 32px; color: var(--text-muted); }
.upload-placeholder svg { margin-bottom: 8px; }
.upload-placeholder p { font-weight: 500; margin-bottom: 4px; }
.upload-placeholder span { font-size: 0.8rem; }
.image-preview { width: 100%; max-height: 240px; object-fit: cover; display: block; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.toggle-btn { display: flex; align-items: center; gap: 10px; background: none; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 12px 16px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; transition: all 0.2s; width: 100%; }
.toggle-btn.on { color: var(--success); border-color: var(--success); background: #f0fdf4; }
.toggle-btn.off { color: var(--text-muted); }
.modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border); margin-top: 20px; }
.confirm-box { background: white; border-radius: var(--radius-lg); padding: 40px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.25); }
.confirm-box h3 { font-size: 1.4rem; margin: 16px 0 10px; }
.confirm-box p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 28px; }
.confirm-actions { display: flex; gap: 12px; justify-content: center; }

/* Size + stock grid */
.size-stock-grid {
  display: flex; flex-direction: column; gap: 8px; margin-top: 10px;
}

.size-stock-row {
  display: flex; align-items: center; gap: 12px;
  background: #fafafa; border: 1px solid var(--border);
  border-radius: 8px; padding: 10px 14px;
}

.size-stock-toggle {
  min-width: 52px; height: 34px; padding: 0 12px;
  border: 1.5px solid var(--border); border-radius: 20px; background: white;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
  color: var(--text-muted); cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.size-stock-toggle:hover { border-color: #e91e8c; color: #e91e8c; }
.size-stock-toggle.active { background: #e91e8c; border-color: #e91e8c; color: white; font-weight: 700; }

.size-stock-input-wrap { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.size-stock-input-wrap label { font-family: 'DM Sans', sans-serif; font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; }
.size-stock-input {
  width: 70px; padding: 6px 10px; border: 1.5px solid var(--border);
  border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
  text-align: center; outline: none; transition: border-color 0.2s;
}
.size-stock-input:focus { border-color: #e91e8c; }
.size-stock-oos { font-family: 'DM Sans', sans-serif; font-size: 0.7rem; color: #721c24; background: #f8d7da; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
.size-stock-hint { font-size: 0.74rem; color: var(--text-muted); margin-top: 6px; }

.sizes-cell { display: flex; flex-wrap: wrap; gap: 4px; }
.size-chip { display: inline-block; padding: 2px 8px; background: #fce4f3; border-radius: 10px; font-size: 0.7rem; font-weight: 600; color: #e91e8c; }
.size-chip.oos { background: #f8d7da; color: #721c24; text-decoration: line-through; }

@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } .modal-form { padding: 20px; } }
`;

const ALL_SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

const emptyForm = {
  name: '', description: '', price: '', category_id: '', is_active: true,
  // size_stock: [{size, stock, active}]
  size_stock: ALL_SIZES.map(s => ({ size: s, stock: 0, active: false })),
};

const parseSizes = (sizesStr) => {
  if (!sizesStr) return [];
  return sizesStr.split(',').map(s => s.trim()).filter(Boolean);
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef();

  const fetchAll = () => {
    setLoading(true);
    Promise.all([adminGetProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setImageFile(null); setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    const existingSizeStock = product.size_stock || [];
    const sizeStockForm = ALL_SIZES.map(s => {
      const found = existingSizeStock.find(x => x.size === s);
      return { size: s, stock: found ? found.stock : 0, active: !!found };
    });
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id || '',
      is_active: product.is_active,
      size_stock: sizeStockForm,
    });
    setImagePreview(product.image_url || '');
    setImageFile(null);
    setShowModal(true);
  };

  const toggleSizeActive = (size) => {
    setForm(f => ({
      ...f,
      size_stock: f.size_stock.map(s =>
        s.size === size ? { ...s, active: !s.active, stock: !s.active ? s.stock : 0 } : s
      )
    }));
  };

  const updateSizeStock = (size, stock) => {
    setForm(f => ({
      ...f,
      size_stock: f.size_stock.map(s =>
        s.size === size ? { ...s, stock: parseInt(stock) || 0 } : s
      )
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category_id', form.category_id);
      formData.append('is_active', form.is_active);

      // Build active sizes string and size_stock JSON
      const activeSizeStock = form.size_stock.filter(s => s.active);
      const sizesStr = activeSizeStock.map(s => s.size).join(',');
      formData.append('sizes', sizesStr);

      // Total stock = sum of all active size stocks
      const totalStock = activeSizeStock.reduce((sum, s) => sum + (s.stock || 0), 0);
      formData.append('stock', totalStock);

      formData.append('size_stock', JSON.stringify(
        activeSizeStock.map(s => ({ size: s.size, stock: s.stock || 0 }))
      ));

      if (imageFile) formData.append('image', imageFile);

      if (editProduct) {
        await updateProduct(editProduct.id, formData);
        toast.success('Product updated!');
      } else {
        await createProduct(formData);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      fetchAll();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{styles}</style>
      <div className="product-mgmt">
        <div className="page-header">
          <div>
            <h1>Products</h1>
            <p>{products.length} products total</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Add Product
          </button>
        </div>

        <div className="mgmt-toolbar">
          <div className="search-bar">
            <Search size={16} />
            <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <div className="products-table-wrap card">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Sizes & Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="empty-row">No products found</td></tr>
                ) : filtered.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-thumb">
                          {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="no-thumb" />}
                        </div>
                        <div>
                          <div className="product-cell-name">{product.name}</div>
                          <div className="product-cell-id">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category_name || '—'}</td>
                    <td className="price-cell">₹{parseFloat(product.price).toLocaleString('en-IN')}</td>
                    <td>
                      {product.size_stock && product.size_stock.length > 0 ? (
                        <div className="sizes-cell">
                          {product.size_stock.map(s => (
                            <span key={s.size} className={`size-chip ${s.stock === 0 ? 'oos' : ''}`}
                              title={`Stock: ${s.stock}`}>
                              {s.size}: {s.stock}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No sizes set</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${product.is_active ? 'active' : 'inactive'}`}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit" onClick={() => openEdit(product)}><Pencil size={16} /></button>
                        <button className="action-btn delete" onClick={() => setDeleteConfirm(product)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={22} /></button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="image-upload-area" onClick={() => fileRef.current.click()}>
                  {imagePreview
                    ? <img src={imagePreview} alt="Preview" className="image-preview" />
                    : <div className="upload-placeholder">
                        <Upload size={32} />
                        <p>Click to upload product image</p>
                        <span>JPG, PNG, WEBP up to 5MB</span>
                      </div>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} hidden />

                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Floral Kurti" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Product description…" />
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="0.00"
                    style={{ maxWidth: 200 }} />
                </div>

                {/* Size + Stock grid */}
                <div className="form-group">
                  <label>Sizes & Stock</label>
                  <p className="size-stock-hint">Toggle a size ON to enable it, then set stock count for that size.</p>
                  <div className="size-stock-grid">
                    {form.size_stock.map(s => (
                      <div key={s.size} className="size-stock-row">
                        <button
                          type="button"
                          className={`size-stock-toggle ${s.active ? 'active' : ''}`}
                          onClick={() => toggleSizeActive(s.size)}
                        >
                          {s.size}
                        </button>

                        {s.active ? (
                          <div className="size-stock-input-wrap">
                            <label>Stock:</label>
                            <input
                              type="number" min="0"
                              className="size-stock-input"
                              value={s.stock}
                              onChange={e => updateSizeStock(s.size, e.target.value)}
                            />
                            {s.stock === 0 && <span className="size-stock-oos">Out of stock</span>}
                          </div>
                        ) : (
                          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Disabled</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="size-stock-hint" style={{ marginTop: 8 }}>
                    Active sizes: {form.size_stock.filter(s => s.active).map(s => `${s.size}(${s.stock})`).join(', ') || 'None'}
                  </p>
                </div>

                <div className="form-group toggle-group">
                  <label>Product Status</label>
                  <button
                    type="button"
                    className={`toggle-btn ${form.is_active ? 'on' : 'off'}`}
                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  >
                    {form.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    <span>{form.is_active ? 'Active (visible to customers)' : 'Hidden from customers'}</span>
                  </button>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : editProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="confirm-box" onClick={e => e.stopPropagation()}>
              <Trash2 size={40} color="var(--danger)" />
              <h3>Delete Product?</h3>
              <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
              <div className="confirm-actions">
                <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductManagement;
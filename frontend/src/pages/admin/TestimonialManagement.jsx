import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const TestimonialManagement = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const load = () => {
    API.get('/testimonials/admin/all').then(r => setItems(r.data || []));
  };

  useEffect(load, []);

  const handleFileChange = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!name || !file) {
      toast.error('Add a photo and customer name');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('customer_name', name);
      await API.post('/testimonials/admin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo added!');
      setName(''); setFile(null); setPreview('');
      load();
    } catch {
      toast.error('Failed to upload');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    await API.delete(`/testimonials/admin/${id}`);
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="admin-testimonials">
      <div className="page-header">
        <div>
          <h1>Customer Photos</h1>
          <p>Upload a photo a customer sent you — it shows on the homepage as a customer review</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, padding: 24, display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            width: 140, height: 140, border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
          }}
        >
          {preview
            ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Upload size={26} color="var(--text-muted)" />
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFileChange(e.target.files[0])} />

        <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <label>Customer Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Priya S." />
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Upload size={16} /> {saving ? 'Uploading…' : 'Add Photo'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginTop: 24 }}>
        {items.map(item => (
          <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'white' }}>
            <img src={item.image_url} alt={item.customer_name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.customer_name}</span>
              <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialManagement;
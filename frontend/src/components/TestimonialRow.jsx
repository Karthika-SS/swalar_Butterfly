import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const TestimonialRow = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get('/testimonials').then(r => setItems(r.data || [])).catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 40px 56px' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', fontWeight: 600, marginBottom: 20 }}>
        Customer Reviews
      </h2>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {items.map(item => (
          <div key={item.id} style={{ flex: '0 0 220px', position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1/1', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <img src={item.image_url} alt={item.customer_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{
              position: 'absolute', left: 8, right: 8, bottom: 8, fontSize: '0.78rem', fontWeight: 600,
              color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            }}>
              {item.customer_name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialRow;
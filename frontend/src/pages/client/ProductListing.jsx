import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { getProducts, getCategories } from '../../utils/api';

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

  .wc-listing {
  background: var(--cream);
  min-height: 80vh;
  font-family: 'Poppins', sans-serif;
}

  .wc-listing-header {
    padding: 36px 24px 22px;
    max-width: 1400px; margin: 0 auto;
    border-bottom: 2px solid var(--border);
    position: relative;
  }

  .wc-listing-header::after {
    content: '';
    position: absolute; bottom: -2px; left: 24px;
    width: 60px; height: 2px;
    background: linear-gradient(90deg, var(--cream), var(--gold));
    border-radius: 2px;
  }

  .wc-listing-eyebrow {
    font-family: 'Poppins', sans-serif;
    font-size: 0.6rem; letter-spacing: 4px; text-transform: uppercase;
    color: var(--pink); margin-bottom: 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .wc-listing-eyebrow::before { content: '✦'; }

  .wc-listing-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    font-weight: 500; color: var(--deep); letter-spacing: 0.2px;
    margin-bottom: 0;
  }

  .wc-listing-toolbar {
    max-width: 1400px; margin: 0 auto;
    padding: 14px 24px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
    background: white;
  }

  .wc-filter-sort-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: 1.5px solid var(--cream);
    border-radius: 50px; padding: 9px 20px;
    font-family: 'Poppins', sans-serif; font-size: 0.7rem;
    font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    color: var(--pink); cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }

  .wc-filter-sort-btn:hover {
    background: var(--cream); color: white;
    box-shadow: 0 4px 14px rgba(233,30,140,0.25);
  }

  .wc-product-count {
    font-family: 'Poppins', sans-serif; font-size: 0.7rem;
    color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase;
  }

  .wc-listing-body {
    max-width: 1400px; margin: 0 auto; display: flex;
  }

  /* Sidebar */
  .wc-sidebar {
    width: 248px; flex-shrink: 0;
    border-right: 1px solid var(--border);
    padding: 28px 24px; min-height: 60vh;
    background: var(--cream);
  }

  .wc-sidebar-section { margin-bottom: 32px; }

  .wc-sidebar-label {
    font-family: 'Poppins', sans-serif; font-size: 0.6rem;
    font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px;
    color: var(--pink); margin-bottom: 14px; display: block;
    display: flex; align-items: center; gap: 6px;
  }
  .wc-sidebar-label::before { content: '✦'; font-size: 0.55rem; }

  .wc-sidebar-opts { display: flex; flex-direction: column; gap: 2px; }

  .wc-sidebar-opt {
    text-align: left; background: none; border: none;
    padding: 9px 12px; border-radius: 8px;
    font-family: 'Poppins', sans-serif; font-size: 0.82rem;
    color: var(--text-muted); cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }

  .wc-sidebar-opt:hover { color: var(--pink); background: var(--cream); }

  .wc-sidebar-opt.active {
    color: var(--pink); font-weight: 600;
    background: var(--cream);
    border: 1px solid var(--border);
  }

  .wc-sort-select {
    width: 100%; padding: 10px 14px;
    border: 1.5px solid var(--border); border-radius: 8px;
    font-family: 'Poppins', sans-serif; font-size: 0.82rem;
    color: var(--deep); background: var(--cream);
    cursor: pointer; outline: none; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23e91e8c' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 32px;
    transition: border-color 0.2s;
  }

  .wc-sort-select:focus { border-color: var(--pink); outline: none; }

  .wc-clear-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: 1.5px solid var(--border); border-radius: 50px;
    padding: 7px 14px;
    color: var(--pink); font-family: 'Poppins', sans-serif;
    font-size: 0.65rem; letter-spacing: 1px; text-transform: uppercase; font-weight: 700;
    cursor: pointer; margin-top: 16px; transition: all 0.2s;
  }

  .wc-clear-btn:hover { background: var(--cream); color: white; border-color: var(--pink); }

  /* Products grid */
  .wc-products-main { 
  flex: 1;
  background: #fffaf6;
}

  .wc-products-grid-listing {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1px; background: #fffaf6;
}

  /* No results */
  .wc-no-results {
    padding: 80px 24px; text-align: center; background: white;
  }

  .wc-no-results-icon { font-size: 3rem; margin-bottom: 16px; }

  .wc-no-results h3 {
    font-family: 'Playfair Display', serif; font-size: 1.5rem;
    font-weight: 500; margin-bottom: 8px; color: var(--deep);
  }

  .wc-no-results p {
    color: var(--text-muted); font-family: 'Poppins', sans-serif;
    margin-bottom: 24px; font-size: 0.85rem;
  }

  .wc-no-results-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, var(--cream), #c0392b);
    color: white; padding: 13px 32px; border-radius: 50px; border: none;
    font-family: 'Poppins', sans-serif; font-size: 0.72rem;
    font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(233,30,140,0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .wc-no-results-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(233,30,140,0.45);
  }

  /* Mobile filter drawer */
  .wc-filter-overlay {
    display: none; position: fixed; inset: 0;
    background: var(--cream);
    z-index: 999; backdrop-filter: blur(4px);
  }

  .wc-filter-overlay.open { display: block; }

  .wc-filter-drawer {
    position: fixed; left: -300px; top: 0;
    height: 100vh; width: 285px;
    background: white; z-index: 1000;
    padding: 28px 20px; overflow-y: auto;
    transition: left 0.3s cubic-bezier(0.22,1,0.36,1);
    box-shadow: 6px 0 30px rgba(233,30,140,0.12);
  }

  .wc-filter-drawer.open { left: 0; }

  .wc-filter-drawer-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; padding-bottom: 16px;
    border-bottom: 2px solid var(--border);
    position: relative;
  }

  .wc-filter-drawer-head::after {
    content: '';
    position: absolute; bottom: -2px; left: 0;
    width: 40px; height: 2px;
    background: linear-gradient(90deg, var(--cream), var(--gold));
    border-radius: 2px;
  }

  .wc-filter-drawer-head h3 {
    font-family: 'Playfair Display', serif; font-size: 1.2rem;
    font-weight: 500; color: var(--deep);
  }

  .wc-filter-close {
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); padding: 4px; display: flex;
    transition: color 0.2s; border-radius: 50%;
  }

  .wc-filter-close:hover { color: var(--pink); background: var(--cream); }

  @media (max-width: 768px) {
    .wc-sidebar { display: none; }
    .wc-products-grid-listing { grid-template-columns: repeat(2, 1fr); }
    .wc-listing-body { flex-direction: column; }
  }

  @media (max-width: 480px) {
    .wc-products-grid-listing { grid-template-columns: repeat(2, 1fr); }
  }
`;

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ search, category, sort })
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});
  const hasFilters = search || category || sort !== 'newest';

  const pageTitle = search
    ? `Results for "${search}"`
    : category
      ? categories.find(c => c.id === parseInt(category))?.name || 'Products'
      : 'All Products';

  const FilterContent = () => (
    <>
      <div className="wc-sidebar-section">
        <span className="wc-sidebar-label">Sort By</span>
        <select value={sort} onChange={e => setParam('sort', e.target.value)} className="wc-sort-select">
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="wc-sidebar-section">
        <span className="wc-sidebar-label">Category</span>
        <div className="wc-sidebar-opts">
          <button
            className={`wc-sidebar-opt ${!category ? 'active' : ''}`}
            onClick={() => setParam('category', '')}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`wc-sidebar-opt ${category === String(c.id) ? 'active' : ''}`}
              onClick={() => setParam('category', String(c.id))}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button className="wc-clear-btn" onClick={clearFilters}>
          <X size={12} /> Clear All
        </button>
      )}
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="wc-listing">
        <div className="wc-listing-header">
          <p className="wc-listing-eyebrow">Salwar Butterfly</p>
          <h1 className="wc-listing-title">{pageTitle}</h1>
        </div>

        <div className="wc-listing-toolbar">
          <button className="wc-filter-sort-btn" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal size={14} /> Filter and sort
          </button>
          <span className="wc-product-count">{products.length} products</span>
        </div>

        <div className="wc-listing-body">
          {/* Desktop sidebar */}
          <aside className="wc-sidebar">
            <FilterContent />
          </aside>

          {/* Products */}
          <main className="wc-products-main">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <div className="spinner" />
              </div>
            ) : products.length === 0 ? (
              <div className="wc-no-results">
                <div className="wc-no-results-icon">🌸</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
                <button className="wc-no-results-btn" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="wc-products-grid-listing">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </main>
        </div>

        {/* Mobile filter drawer */}
        <div className={`wc-filter-overlay ${filterOpen ? 'open' : ''}`} onClick={() => setFilterOpen(false)} />
        <div className={`wc-filter-drawer ${filterOpen ? 'open' : ''}`}>
          <div className="wc-filter-drawer-head">
            <h3>Filter & Sort</h3>
            <button className="wc-filter-close" onClick={() => setFilterOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <FilterContent />
        </div>
      </div>
    </>
  );
};

export default ProductListing;
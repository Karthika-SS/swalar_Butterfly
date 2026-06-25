import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://swalar-butterfly.onrender.com/api'
    : 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const getCategories = () => API.get('/products/categories');
export const adminGetProducts = () => API.get('/products/admin/all');
export const createProduct = (data) =>
  API.post('/products/admin/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateProduct = (id, data) =>
  API.put(`/products/admin/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteProduct = (id) => API.delete(`/products/admin/${id}`);

// Orders
export const placeOrder         = (data)         => API.post('/orders', data);
export const getOrdersByPhone   = (phone)        => API.get(`/orders/track/${phone}`);
export const getOrderByNumber   = (num)          => API.get(`/orders/number/${num}`);
export const adminGetOrders     = (params)       => API.get('/orders/admin/all', { params });
export const getDashboardStats  = ()             => API.get('/orders/admin/dashboard');
export const updateOrderStatus  = (id, status)  => API.put(`/orders/admin/${id}/status`, { status });
export const deleteOrder = (id) => API.delete(`/orders/admin/delete/${id}`);
export const submitReview = (data) => API.post('/reviews', data);
// Settings
export const getSettings    = ()     => API.get('/settings');
export const updateSettings = (data) => API.put('/settings/admin/update', data);
export const uploadQRCode   = (data) => API.post('/settings/admin/upload-qr', data);
export const getRecentReviews = (limit = 12) => API.get(`/reviews/recent?limit=${limit}`);
export const getProductReviews = (productId) => API.get(`/reviews/product/${productId}`);
// Auth
export const adminLogin     = (data) => API.post('/auth/login', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

export default API;
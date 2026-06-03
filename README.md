# 🛍️ MyShop — Full Stack E-Commerce

A complete e-commerce solution built with **React**, **Node.js**, **MySQL**, and **Cloudinary**.

---

## 📁 Project Structure

```
ecommerce/
├── backend/          ← Node.js + Express API
└── frontend/         ← React Client App
```

---

## ⚡ Quick Setup

### Prerequisites
- Node.js 18+
- MySQL 8+
- Cloudinary account (free tier works)

---

## 🗄️ Step 1: Database Setup

1. Open MySQL and run:
```sql
-- Copy and run the entire contents of:
backend/config/schema.sql
```

---

## 🔧 Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
JWT_SECRET=change_this_to_a_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev     # Development (auto-reload)
npm start       # Production
```

Backend runs on: **http://localhost:5000**

---

## 🎨 Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

Start the frontend:
```bash
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 🔑 Admin Login

- **URL:** http://localhost:3000/admin/login
- **Email:** admin@shop.com
- **Password:** admin123

> ⚠️ Change the password immediately after first login via Admin → Settings.

---

## 🗺️ Page Routes

### Customer Side
| Route | Page |
|-------|------|
| `/` | Home |
| `/products` | Product Listing |
| `/products/:id` | Product Details |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/order-success` | Order Success |
| `/orders` | My Orders (track by phone) |

### Admin Side
| Route | Page |
|-------|------|
| `/admin/login` | Admin Login |
| `/admin/dashboard` | Dashboard |
| `/admin/products` | Product Management |
| `/admin/orders` | Order Management |
| `/admin/settings` | Settings & QR Code |

---

## 🌩️ Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy `Cloud Name`, `API Key`, `API Secret`
3. Paste into `.env` file

Images upload automatically when you add/edit products.

---

## 🚀 Production Deployment

### Backend (e.g., Railway, Render, VPS)
```bash
cd backend
npm start
```
Set all environment variables on your hosting platform.

### Frontend (e.g., Vercel, Netlify)
```bash
cd frontend
npm run build
```
Set `REACT_APP_API_URL` to your backend's live URL.

---

## 💳 Payment Flow

### COD (Cash on Delivery)
- Customer selects COD at checkout
- Order placed → Admin marks as Shipped → Delivered

### UPI Payment
1. Admin uploads QR code in **Settings**
2. Admin sets UPI ID in Settings
3. Customer scans QR at checkout, enters transaction reference
4. Admin verifies and ships the order

---

## 🔒 Security Notes

- JWT tokens expire in 7 days
- Admin password is bcrypt-hashed
- Change default credentials immediately
- Use HTTPS in production
- Set strong `JWT_SECRET` (32+ random characters)

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Backend | Node.js, Express |
| Database | MySQL 8 |
| Image Storage | Cloudinary |
| Auth | JWT + bcrypt |
| Styling | Custom CSS + Google Fonts |
| Notifications | react-hot-toast |

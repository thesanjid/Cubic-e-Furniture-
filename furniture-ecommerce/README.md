# Cubic Furniture Clone — MERN E-Commerce

A full-stack e-commerce site (MongoDB, Express, React, Node) built in the style of an
office/commercial furniture store, with a customer storefront, cart, wishlist, checkout,
SSLCommerz online payment, and an admin dashboard for managing products, categories, and orders.

> **Note on content:** the original site (cubic.furniture) loads its product data client-side,
> so there was no product catalog to copy directly. This project ships with the same
> **structure and features** (categories, products, cart, wishlist, auth, checkout) but with
> placeholder/sample content — add your real products through the Admin Dashboard.

## Features

- **Storefront**: home page, category browsing, keyword search & sort, product detail pages
  with image gallery, reviews & ratings, cart, wishlist, user accounts & order history.
- **Auth**: JWT-based register/login, protected routes.
- **Checkout**: shipping address form, Cash on Delivery or online payment.
- **Payments**: [SSLCommerz](https://www.sslcommerz.com/) integration (the standard gateway
  for Bangladesh — supports cards, mobile banking, bKash, Nagad, etc.) with sandbox mode
  enabled by default. Stripe can be added the same way if you need international cards.
- **Admin Dashboard**: stats overview, full product CRUD (with image upload), category CRUD,
  order management with status updates.

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Axios, react-icons — plain CSS (no framework
  lock-in, easy to reskin).
- **Backend**: Node.js, Express, MongoDB + Mongoose, JWT auth, Multer (image uploads),
  `sslcommerz-lts` for payments.

## Project Structure

```
furniture-ecommerce/
  backend/            Express API
    config/           DB connection
    models/           Mongoose schemas (User, Product, Category, Order)
    controllers/       Route handlers
    routes/            Express routers
    middleware/        Auth + error handling
    utils/             JWT helper, DB seeder
    uploads/           Uploaded product images (served statically)
  frontend/           React app
    src/
      pages/           Storefront pages
      admin/           Admin dashboard pages
      components/      Navbar, Footer, ProductCard, route guards
      context/         Auth + Cart state (React context)
      api/             Axios instance
      styles/          Global CSS
```

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either:
  - **Local**: install MongoDB Community Server and run it (`mongod`), or
  - **Cloud (recommended)**: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    and grab its connection string.
- A free [SSLCommerz sandbox account](https://developer.sslcommerz.com/registration/) if you
  want to test online payments (sandbox works out of the box with the default test credentials
  already in `.env.example`, but registering your own sandbox store is recommended).

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
MONGO_URI=mongodb://localhost:27017/furniture-ecommerce   # or your Atlas connection string
JWT_SECRET=some_long_random_string
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
SSLCOMMERZ_STORE_ID=your_sandbox_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sandbox_store_password
SSLCOMMERZ_IS_LIVE=false
```

Seed an admin user and starter categories:

```bash
npm run seed
```

This creates an admin login:
- **Email**: `admin@cubic.furniture`
- **Password**: `Admin@123`

(Change this password after first login — there's no "forgot password" flow built in yet,
so update it via the API or directly in MongoDB if you lose it.)

Start the API server:

```bash
npm run dev        # nodemon, auto-restarts on changes
# or
npm start
```

The API runs on **http://localhost:5000**. Health check: `GET /api/health`.

## 3. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The site runs on **http://localhost:5173** and proxies `/api` and `/uploads` requests to the
backend (see `vite.config.js`), so no CORS setup is needed in development.

## 4. Using the Admin Dashboard

1. Log in with the seeded admin account (or register a normal account, then manually set
   `isAdmin: true` on that user in MongoDB to promote it).
2. Go to **My Account menu → Admin Dashboard**, or visit `/admin` directly.
3. **Categories** tab: add your categories first (e.g. Office Chairs, Office Desks, Sofas...).
4. **Products** tab → **+ Add Product**: fill in name, category, price, stock, description,
   and upload product images (stored in `backend/uploads/` and served at `/uploads/...`).
5. **Orders** tab: view all customer orders and update their status
   (pending → processing → shipped → delivered).

## 5. Testing Payments (SSLCommerz Sandbox)

1. Add a product with stock, then shop as a normal (non-admin) user: add to cart → checkout.
2. Choose **"Pay online"** and place the order — you'll be redirected to the SSLCommerz
   sandbox payment page.
3. Use SSLCommerz's [sandbox test card/mobile banking numbers](https://developer.sslcommerz.com/doc/v4/#integration-testing)
   to simulate a successful or failed payment.
4. You'll be redirected back to `/order/:id` on your site with the payment result, and the
   order's `isPaid`/`orderStatus` fields update automatically via the success/fail/cancel routes.

For production, switch `SSLCOMMERZ_IS_LIVE=true` and use your live store credentials, and
make sure `SERVER_URL` is your real public backend URL (SSLCommerz needs to reach it for
redirects and IPN).

## 6. Deployment Notes

- **Backend**: deploy to any Node host (Render, Railway, a VPS, etc.). Set all `.env`
  variables in your host's environment settings. Point `MONGO_URI` at your production
  MongoDB Atlas cluster.
- **Frontend**: run `npm run build` in `frontend/` to produce a static `dist/` folder,
  deploy it to Vercel/Netlify/any static host, and update the Vite proxy or add a full
  API base URL (e.g. via an environment variable) pointing at your deployed backend.
- **Images**: the current setup stores uploads on local disk — for production, consider
  swapping to a cloud storage bucket (S3, Cloudinary) since local disk storage doesn't
  persist across most cloud deployments/restarts.
- Consider adding a password-reset flow, email notifications for orders, and stronger
  admin-invite handling before going fully live.

## 7. Adding More Categories to Match cubic.furniture Exactly

Since the live site's actual category/product names weren't accessible for scraping, browse
https://www.cubic.furniture/collections yourself and re-create the categories and products
you want through the Admin Dashboard (or bulk-insert them straight into MongoDB / via the
`/api/products` and `/api/categories` POST endpoints if you have the data in a spreadsheet).

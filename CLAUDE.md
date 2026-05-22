# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Backend (from cuddle-village-backend/)
npm run dev          # nodemon server.js — http://localhost:5000
npm start            # node server.js (production)
node Seedproducts.js # seed ~70 products (clears existing first)
node seedUsers.js    # seed sample admin / facilitator / customer accounts
node seedOrders.js   # seed 6 sample orders (run after both seeds above)

# Frontend (from cuddle-village-frontend/)
npm start       # React dev server — http://localhost:3000
npm run build   # Production build
npm test        # Run tests (React Testing Library / Jest)
```

## Sample Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@cuddlevillage.com` | `Admin@1234` |
| Facilitator | `facilitator@cuddlevillage.com` | `Facilitator@1` |
| Customer | `jane@cuddlevillage.com` | `User@12345` |

Run `node seedUsers.js` from `cuddle-village-backend/` to create these accounts (skips existing).

## Environment (cuddle-village-backend/.env)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=sk_test_xxx_or_sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx_or_pk_live_xxx
PAYSTACK_CALLBACK_URL=http://localhost:3000/order-success
EMAIL_USER=gmail_address
EMAIL_PASS=gmail_app_password
```

Cloudinary is configured via `config/cloudinary.js` — add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to `.env` if not already present.

## Architecture

**Backend:** Express 5 + MongoDB/Mongoose on `:5000`. CommonJS modules.  
**Frontend:** React 19 (Create React App) on `:3000`. Axios via `src/services/api.js` which auto-attaches the JWT from `localStorage`.

### Middleware order matters

`server.js` mounts the Paystack webhook route **before** `express.json()` so it receives the raw body needed for HMAC signature verification. All other routes follow after.

### Backend route map

| Prefix | File | Auth |
|---|---|---|
| `POST /api/auth/register` | `routes/authRoutes.js` | public |
| `POST /api/auth/login` | `routes/authRoutes.js` | public |
| `POST /api/auth/verify` | `routes/authRoutes.js` | public |
| `POST /api/auth/resend` | `routes/authRoutes.js` | public |
| `GET /api/products` | `routes/productRoutes.js` | public |
| `POST/PUT/DELETE /api/products` | `routes/productRoutes.js` | admin |
| `POST /api/orders` | `routes/orderRoutes.js` | user |
| `GET /api/orders/my` | `routes/orderRoutes.js` | user |
| `GET/PUT /api/orders` | `routes/orderRoutes.js` | admin |
| `GET /api/admin/users` | `routes/adminRoutes.js` | admin |
| `POST /api/admin/users` | `routes/adminRoutes.js` | admin — create account |
| `PUT /api/admin/users/:id/role` | `routes/adminRoutes.js` | admin — change role |
| `DELETE /api/admin/users/:id` | `routes/adminRoutes.js` | admin |
| `GET /api/admin/stats` | `routes/adminRoutes.js` | admin |
| `GET/PUT /api/admin/orders` | `routes/adminRoutes.js` | admin |
| `POST /api/contact` | `routes/contactRoute.js` | public |
| `POST /api/paystack/initialize` | `routes/paystackRoute.js` | user |
| `GET /api/paystack/verify/:reference` | `routes/paystackRoute.js` | user |
| `POST /api/paystack/webhook` | `routes/paystackRoute.js` | Paystack (HMAC) |

### Auth flow

1. Register → 6-digit code emailed via Nodemailer/Gmail → `POST /api/auth/verify` sets `isVerified: true`
2. Login checks `isVerified` before issuing a 1-day JWT signed with `JWT_SECRET`
3. `middleware/authMiddleware.js` exports `protect` (JWT check, attaches `req.user`), `adminOnly` (role === "admin"), and `facilitatorOnly` (role === "admin" or "facilitator")

### Login redirects

| Role | Redirect |
|---|---|
| `admin` | `/admin/admin-dashboard` |
| `facilitator` | `/facilitator/dashboard` |
| `user` with book club | `/early-learners` or `/growing-readers` |
| `user` without book club | `/home` |

### Payment flow

1. Frontend posts to `/api/paystack/initialize` → receives `authorization_url`
2. User redirects to Paystack hosted page
3. On success, Paystack calls `/api/paystack/webhook` (HMAC verified) **and** redirects to `callbackUrl`
4. Frontend hits `/api/paystack/verify/:reference` on callback to confirm and display order success
5. Both webhook and verify update `Order.paymentStatus` to `"paid"`

### Frontend structure

- `src/services/api.js` — Axios instance; single source of truth for the base URL (`REACT_APP_API_URL` or `http://localhost:5000/api`)
- `src/context/CartContext.js` — in-memory cart state (no persistence); wrapped at root in `index.js`
- `src/components/ProtectedRoute.js` — redirects to `/login` if `localStorage.token` absent
- `src/components/AdminRoute.js` — redirects non-admins away from `/admin/*`
- `src/components/FacilitatorRoute.js` — allows admin or facilitator roles
- Admin pages under `src/pages/admin/`; routes suppress Navbar/Footer (via `isAdminRoute` in App.js)
- Facilitator pages under `src/pages/facilitator/`; use regular Navbar + Footer

### Facilitator portal

- `/facilitator/dashboard` — landing page with enrolled children count, upcoming sessions, books to cover, and CTA to book club manager
- `/facilitator/book-club` — `BookClubAdmin` rendered without `AdminLayout` (`noLayout` prop)

### Data models

**User:** `name`, `email`, `password` (bcrypt), `phone`, `role` (user|admin|facilitator), `isVerified`, `verificationCode`, `loyaltyPoints`, `lifetimePoints`, `loyaltyTier`, `bookClub` (childName, childAge, dob, school, allergies, group: early-learners|growing-readers)

**Product:** `name`, `price`, `description`, `category`, `image` (Cloudinary URL), `stock`

**Order:** references `User` + array of `{product, name, qty, price, image}`, `shippingAddress`, `paymentMethod` (default M-Pesa), `totalPrice`, `paymentStatus` (unpaid|paid|failed|refunded), `paymentReference`, `status` (pending|processing|shipped|delivered|cancelled). Creating an order reduces product stock inline.

### Image uploads

Product images go through Multer + `multer-storage-cloudinary` (`middleware/upload.js`). The Cloudinary URL is stored directly in `Product.image`. Use `upload.single("image")` on create/update product routes.

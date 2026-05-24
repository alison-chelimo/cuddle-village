# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Backend (from cuddle-village-backend/)
npm run dev              # nodemon server.js — http://localhost:5000
npm start                # node server.js (production)
npm test                 # Jest test suite
npm run test:coverage    # Jest with coverage report
node Seedproducts.js     # seed ~70 products (clears existing first)
node seedUsers.js        # seed sample admin / facilitator / customer accounts
node seedOrders.js       # seed 6 sample orders (run after both seeds above)

# Frontend (from cuddle-village-frontend/)
npm start                # React dev server — http://localhost:3000
npm run build            # Production build
npm test                 # Run tests (React Testing Library / Jest)
npm run test:coverage    # Jest with coverage report
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
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Architecture

**Backend:** Express 5 + MongoDB/Mongoose on `:5000`. CommonJS modules.  
**Frontend:** React 19 (Create React App) on `:3000`. Axios via `src/services/api.js` which auto-attaches the JWT from `localStorage`.

### Middleware order matters

`server.js` mounts the Paystack webhook route **before** `express.json()` so it receives the raw body needed for HMAC signature verification. All other routes follow after.

### Rate limiting (`middleware/rateLimiter.js`)

| Limiter | Limit | Applied to |
|---|---|---|
| `adminLimiter` | 200 req / 15 min | admin routes |
| `orderLimiter` | 60 req / 15 min | order routes |
| `portalLimiter` | 200 req / 15 min | portal routes |
| `paystackLimiter` | 60 req / 15 min | paystack routes |

### Backend route map

**Auth (`routes/authRoutes.js`)**

| Endpoint | Auth |
|---|---|
| `POST /api/auth/register` | public |
| `POST /api/auth/login` | public |
| `POST /api/auth/verify` | public |
| `POST /api/auth/resend` | public |
| `POST /api/auth/forgot-password` | public |
| `POST /api/auth/reset-password` | public |
| `GET /api/auth/profile` | user |
| `PUT /api/auth/profile` | user |
| `PUT /api/auth/profile/password` | user |

**Products (`routes/productRoutes.js`)**

| Endpoint | Auth |
|---|---|
| `GET /api/products` | public |
| `POST /api/products` | admin |
| `PUT /api/products/:id` | admin |
| `DELETE /api/products/:id` | admin |

**Orders (`routes/orderRoutes.js`)**

| Endpoint | Auth |
|---|---|
| `POST /api/orders` | user |
| `GET /api/orders/my` | user |
| `GET /api/orders` | admin |
| `PUT /api/orders/:id` | admin — update status + trackingNumber |

**Admin (`routes/adminRoutes.js`)**

| Endpoint | Auth |
|---|---|
| `GET /api/admin/users` | admin |
| `POST /api/admin/users` | admin — create account |
| `PUT /api/admin/users/:id/role` | admin — change role |
| `DELETE /api/admin/users/:id` | admin |
| `GET /api/admin/stats` | admin |
| `GET /api/admin/advanced-stats` | admin |
| `GET /api/admin/dashboard` | admin |
| `GET /api/admin/orders` | admin |
| `PUT /api/admin/orders/:id/status` | admin |
| `GET /api/admin/promo-codes` | admin |
| `POST /api/admin/promo-codes` | admin |
| `PATCH /api/admin/promo-codes/:id` | admin — toggle active |
| `DELETE /api/admin/promo-codes/:id` | admin |

**Book Club (`routes/bookClubRoute.js`)**

| Endpoint | Auth |
|---|---|
| `POST /api/book-club/register` | public — parent registers child |

**Loyalty (`routes/loyaltyRoutes.js`)**

| Endpoint | Auth |
|---|---|
| `GET /api/loyalty/balance` | user |
| `GET /api/loyalty/transactions` | user — last 20 |
| `POST /api/loyalty/redeem` | user — redeem points for discount |

**Portal (`routes/portalRoutes.js`)**

| Endpoint | Auth |
|---|---|
| `GET /api/portal/hub-content/:group` | public |
| `GET /api/portal/my-child` | user |
| `GET /api/portal/upcoming-session` | user |
| `GET /api/portal/admin/enrolled` | facilitator+ |
| `GET /api/portal/admin/enrolled/:id` | facilitator+ |
| `PUT /api/portal/admin/children/:userId` | facilitator+ |
| `GET /api/portal/admin/children/:id/attendance` | facilitator+ |
| `POST /api/portal/admin/children/:id/notes` | facilitator+ |
| `GET /api/portal/admin/children/:id/notes` | facilitator+ |
| `GET /api/portal/admin/sessions` | facilitator+ |
| `POST /api/portal/admin/sessions` | facilitator+ |
| `PUT /api/portal/admin/sessions/:id` | facilitator+ |
| `GET /api/portal/admin/sessions/:id` | facilitator+ |
| `POST /api/portal/admin/sessions/:id/attendance` | facilitator+ |
| `POST /api/portal/admin/sessions/:id/bulk-attendance` | facilitator+ |
| `GET /api/portal/admin/hub-content` | facilitator+ |
| `POST /api/portal/admin/hub-content` | facilitator+ |
| `PUT /api/portal/admin/hub-content/:id` | facilitator+ |
| `DELETE /api/portal/admin/hub-content/:id` | facilitator+ |
| `GET /api/portal/admin/announcements` | facilitator+ |
| `POST /api/portal/admin/announcements` | facilitator+ |
| `PATCH /api/portal/admin/announcements/:id` | facilitator+ |

**Promo (`routes/promoRoutes.js`)**

| Endpoint | Auth |
|---|---|
| `POST /api/promo/validate` | public |

**Paystack (`routes/paystackRoute.js`)**

| Endpoint | Auth |
|---|---|
| `POST /api/paystack/initialize` | user |
| `GET /api/paystack/verify/:reference` | user |
| `POST /api/paystack/webhook` | Paystack (HMAC) — mounted before `express.json()` |

**Contact (`routes/contactRoute.js`)**

| Endpoint | Auth |
|---|---|
| `POST /api/contact` | public |

### Auth flow

1. Register → 6-digit code emailed via Nodemailer/Gmail → `POST /api/auth/verify` sets `isVerified: true`
2. Login checks `isVerified` before issuing a 1-day JWT signed with `JWT_SECRET`
3. Forgot password → reset token emailed → `POST /api/auth/reset-password` with token sets new password
4. `middleware/authMiddleware.js` exports `protect` (JWT check, attaches `req.user`), `adminOnly` (role === "admin"), and `facilitatorOnly` (role === "admin" or "facilitator")

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

### Loyalty system

- Points earned: 1 pt per 10 KES spent, awarded atomically after payment via `utils/loyaltyHelper.js`
- Tiers based on `lifetimePoints`: Bronze (0+), Silver (1000+), Gold (5000+), Platinum (15000+)
- Users redeem points via `POST /api/loyalty/redeem`; discount is applied at order creation

### Promo codes

- Public validation: `POST /api/promo/validate` (no auth required, used at checkout)
- Admin manages codes via `/api/admin/promo-codes` (CRUD + toggle active)
- `PromoCode` supports percentage or fixed discounts, min order amount, max usage, and expiry

### Frontend structure

- `src/services/api.js` — Axios instance; single source of truth for base URL (`REACT_APP_API_URL` or `http://localhost:5000/api`); auto-attaches JWT
- `src/context/CartContext.js` — cart state persisted to `localStorage` (`cv_cart` key); `CartProvider` wrapped at root in `index.js`
- `src/context/LoyaltyContext.js` — loyalty points/tier state; exposes `useLoyalty()` hook; `LoyaltyProvider` also wrapped at root
- `src/utils/auth.js` — `isAuthenticated()` helper (checks `localStorage.token`)
- `src/hooks/useToast.js` — toast notification hook
- `src/components/ProtectedRoute.js` — redirects to `/login` if token absent
- `src/components/AdminRoute.js` — redirects non-admins to `/`
- `src/components/FacilitatorRoute.js` — allows admin or facilitator roles
- `src/components/AdminLayout.js` — sidebar + topbar wrapper for admin pages
- `src/components/FacilitatorLayout.js` — sidebar + topbar wrapper for facilitator pages (green theme)
- Admin pages under `src/pages/admin/`; facilitator pages under `src/pages/facilitator/`
- Both admin and facilitator routes suppress Navbar/Footer (via `isPortalRoute` check in `App.js`)

### Facilitator portal

All facilitator routes use `FacilitatorRoute` (admin or facilitator role) and `FacilitatorLayout`:

| Route | Component | Purpose |
|---|---|---|
| `/facilitator/dashboard` | `FacilitatorDashboard` | Summary: enrolled children, upcoming sessions, books to cover |
| `/facilitator/children` | `Children` | List enrolled children |
| `/facilitator/children/:id` | `ChildProfile` | Child detail, attendance, progress notes |
| `/facilitator/sessions` | `Sessions` | List sessions |
| `/facilitator/sessions/:id` | `SessionDetail` | Session detail + attendance marking |
| `/facilitator/books` | `Books` | Hub content (books/activities/milestones) |
| `/facilitator/attendance` | `Attendance` | Attendance overview |
| `/facilitator/announcements` | `Announcements` | Create and manage announcements |
| `/facilitator/profile` | `FacilitatorProfile` | Facilitator profile |
| `/facilitator/book-club` | `BookClubAdmin` (`noLayout`) | Book club admin view (also at `/admin/book-club`) |

### Data models

**User:** `name`, `email`, `password` (bcrypt), `phone`, `role` (user|admin|facilitator), `isVerified`, `verificationCode`, `resetPasswordToken`, `resetPasswordExpires`, `loyaltyPoints`, `lifetimePoints`, `loyaltyTier` (Bronze|Silver|Gold|Platinum), `bookClub` (childName, childAge, dob, school, allergies, specialNeeds, schedule, plan, emergencyContact, group: early-learners|growing-readers, sessionsAttended, booksRead, skills, notes)

**Product:** `name`, `price`, `description`, `category`, `image` (Cloudinary URL), `stock`

**Order:** references `User` + array of `{product, name, qty, price, image}`, `shippingAddress` ({address, city, phone}), `paymentMethod` (default M-Pesa), `totalPrice`, `paymentStatus` (unpaid|paid|failed|refunded), `paymentReference`, `paidAt`, `status` (pending|processing|shipped|delivered|cancelled), `trackingNumber`, `pointsEarned`, `pointsRedeemed`, `pointsDiscount`, `promoCode`, `promoDiscount`, `receiptSent`. Creating an order reduces product stock inline.

**PromoCode:** `code` (unique, uppercase), `description`, `discountType` (percentage|fixed), `discountValue`, `minOrderAmount`, `maxUsage` (0 = unlimited), `usageCount`, `expiresAt`, `isActive`, `createdBy`

**LoyaltyTransaction:** `user`, `type` (earn|redeem), `points`, `reason`, `orderId`, `balanceAfter`

**LearningSession:** `date`, `group` (early-learners|growing-readers), `title`, `bookTitle`, `bookAuthor`, `activityDescription`, `facilitatorNotes`, `attendees` (array of User refs)

**HubContent:** `group` (early-learners|growing-readers), `contentType` (book|activity|milestone), `title`, `author`, `emoji`, `tag`, `description`, `weekLabel`, `isActive`, `order`

**Announcement:** `title`, `body`, `targetGroup` (early-learners|growing-readers|all), `status` (draft|sent), `createdBy`

**ContactMessage:** `name`, `email`, `phone`, `message`

**ProgressNote:** `child` (User ref, indexed), `content`, `createdBy`

### Image uploads

Product images go through Multer + `multer-storage-cloudinary` (`middleware/upload.js`). The Cloudinary URL is stored directly in `Product.image`. Use `upload.single("image")` on create/update product routes.

### Utils

- `utils/loyaltyHelper.js` — `TIERS` (tier definitions), `calcTier(lifetimePoints)`, `calcPoints(totalPrice)` (1 pt per 10 KES), `nextTierInfo(lifetimePoints)`, `awardLoyaltyPoints(userId, orderId, totalPrice)` (atomic, prevents double-award)
- `utils/sendEmail.js` — `sendEmail(to, code)` (verification code), `sendReceiptEmail(orderId)` (PDF receipt, atomic claim prevents double-send)
- `utils/emailTemplates.js` — `verifyEmail(code)`, `orderReceiptEmail(order, user)`, `bookClubConfirmationEmail(child, parent, program)`
- `utils/generateReceipt.js` — generates PDF receipts via PDFKit (order items, totals, discounts, loyalty points)

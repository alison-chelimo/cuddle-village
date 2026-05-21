# The Cuddle Village Inc.

A premium baby and parenting e-commerce platform for the Kenyan market. Combines a product store, a children's book club, a loyalty rewards programme, and an integrated learning portal for children.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 6, Context API, Axios, Recharts |
| Backend | Node.js, Express 5, MongoDB / Mongoose |
| Auth | JWT (1-day expiry), bcryptjs, email verification |
| Payments | Paystack (card, M-Pesa, bank transfer, USSD) |
| Images | Cloudinary via Multer |
| Email | Nodemailer / Gmail |
| Deployment | Frontend: Vercel / Netlify · Backend: Render / Railway · DB: MongoDB Atlas |

---

## Features

### Customer

- Email/password registration with 6-digit verification code
- Password reset via secure email link (1-hour expiry)
- Persistent cart (localStorage) with live item count in Navbar
- Product catalog with category sidebar, subcategory pills, and search
- Paystack-powered checkout (card, M-Pesa, bank transfer, USSD)
- Order history with status tracking (pending → processing → shipped → delivered)
- User profile: edit name/phone, change password with live requirements checklist

### Loyalty & Rewards

- Earn **1 point per KES 10** spent on every paid order
- Tiers: Bronze · Silver (1,000 pts) · Gold (5,000 pts) · Platinum (15,000 pts)
- Tier badge and points balance in Navbar and Profile
- Redeem points at checkout: **100 points = KES 50 off**
- Double-award guard — points awarded once whether webhook or verify fires first
- Full transaction history on Profile page

### Book Club

- Age-based group routing: Ages 4–5 → Early Learners · Ages 6–8 → Growing Readers
- 3-step enrolment form (child info, parent/guardian, programme selection)
- Plans: Per Session (KSh 800) · Monthly (KSh 3,000) · Premium (Custom)
- Saturday and Sunday session options

### Integrated Learning Portal

- **Parent dashboard** (`/portal/my-child`): sessions attended, books read, skills badges, upcoming session card, facilitator notes
- **Hub pages** (`/early-learners`, `/growing-readers`): inline progress section for enrolled parents; content served from database with hardcoded fallback
- **Facilitator tools** (`/admin/book-club`):
  - Enrolled children table with per-child notes, skills, and books modal
  - Session creation with attendance checklist (syncs child progress automatically)
  - Hub content CRUD (books, activities, milestones) — update without a code deploy

### Admin

- Dashboard with **7 KPI cards**: total users, orders, revenue, average order value, conversion rate, new customers this month, failed payments
- **6 charts**: monthly sales bar chart, daily revenue area chart, order status donut, payment methods donut, top 5 products horizontal bar, customer growth line chart
- Low stock alert table (colour-coded: out of stock, ≤ 2, ≤ 5)
- Product management: add/edit/delete with Cloudinary image uploads
- Order management: status updates (pending → delivered)
- User management: list with loyalty points and tier, delete
- Book Club management (facilitator role): sessions, attendance, hub content

---

## Roles

| Role | Access |
|---|---|
| `user` | Shop, cart, checkout, orders, profile, loyalty, portal |
| `facilitator` | All user access + `/admin/book-club` (sessions, attendance, hub content) |
| `admin` | Full access including products, orders, users, analytics, book club |

---

## API Routes

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | public | Register with optional book club enrolment |
| POST | `/login` | public | Returns JWT + loyalty fields |
| POST | `/verify` | public | Email verification (6-digit code) |
| POST | `/resend` | public | Resend verification code |
| POST | `/forgot-password` | public | Send password reset email |
| POST | `/reset-password/:token` | public | Reset password (token valid 1 hr) |
| GET | `/profile` | user | Get current user profile |
| PUT | `/profile` | user | Update name and phone |
| PUT | `/profile/password` | user | Change password |

### Products — `/api/products`

| Method | Path | Auth |
|---|---|---|
| GET | `/` | public |
| POST | `/` | admin |
| PUT | `/:id` | admin |
| DELETE | `/:id` | admin |

### Orders — `/api/orders`

| Method | Path | Auth |
|---|---|---|
| POST | `/` | user |
| GET | `/my` | user |
| GET | `/` | admin |
| PUT | `/:id` | admin |

### Loyalty — `/api/loyalty`

| Method | Path | Auth |
|---|---|---|
| GET | `/balance` | user |
| GET | `/transactions` | user |
| POST | `/redeem` | user |

### Portal — `/api/portal`

| Method | Path | Auth |
|---|---|---|
| GET | `/hub-content/:group` | public |
| GET | `/my-child` | user |
| GET | `/upcoming-session` | user |
| GET | `/admin/enrolled` | facilitator |
| GET/POST | `/admin/sessions` | facilitator |
| PUT | `/admin/sessions/:id` | facilitator |
| POST | `/admin/sessions/:id/attendance` | facilitator |
| PUT | `/admin/children/:userId` | facilitator |
| GET/POST/PUT/DELETE | `/admin/hub-content` | facilitator |

### Admin — `/api/admin`

| Method | Path | Auth |
|---|---|---|
| GET | `/stats` | admin |
| GET | `/advanced-stats` | admin |
| GET/DELETE | `/users` | admin |
| GET/PUT | `/orders` | admin |

### Other

| Method | Path | Auth |
|---|---|---|
| POST | `/api/contact` | public |
| POST | `/api/book-club/register` | public |
| POST | `/api/paystack/initialize` | user |
| GET | `/api/paystack/verify/:reference` | user |
| POST | `/api/paystack/webhook` | Paystack HMAC |

---

## Environment Variables

Create `cuddle-village-backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000

PAYSTACK_SECRET_KEY=sk_test_or_live_xxx
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_or_live_xxx
PAYSTACK_CALLBACK_URL=http://localhost:3000/order-success

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

CLOUD_NAME=your_cloudinary_cloud
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret
```

---

## Installation & Running

```bash
# Clone
git clone https://github.com/alison-chelimo/cuddle-village.git
cd cuddle-village

# Backend
cd cuddle-village-backend
npm install
npm run dev        # http://localhost:5000

# Frontend (separate terminal)
cd cuddle-village-frontend
npm install
npm start          # http://localhost:3000
```

---

## Data Models

**User** — name, email, password (bcrypt), phone, role (user|admin|facilitator), isVerified, bookClub (childName, childAge, group, schedule, plan, sessionsAttended[], booksRead[], skills[], notes), loyaltyPoints, lifetimePoints, loyaltyTier

**Product** — name, price, description, category, image (Cloudinary URL), stock

**Order** — user ref, orderItems[], shippingAddress, paymentMethod, totalPrice, paymentStatus (unpaid|paid|failed|refunded), status (pending|processing|shipped|delivered|cancelled), pointsEarned, pointsRedeemed, pointsDiscount

**LoyaltyTransaction** — user ref, type (earn|redeem), points, reason, orderId ref, balanceAfter

**LearningSession** — date, group, title, bookTitle, bookAuthor, activityDescription, facilitatorNotes, attendees[]

**HubContent** — group, contentType (book|activity|milestone), title, author, emoji, tag, description, weekLabel, isActive, order

**ContactMessage** — name, email, phone, message

---

## Payment Flow

1. User submits checkout form → `POST /api/orders` creates order and reduces stock
2. *(Optional)* `POST /api/loyalty/redeem` applies points discount, updates `order.totalPrice`
3. `POST /api/paystack/initialize` returns `authorization_url`
4. User redirects to Paystack hosted page (card, M-Pesa, bank, USSD)
5. Paystack fires `POST /api/paystack/webhook` (HMAC verified) → marks order paid + awards loyalty points
6. Paystack redirects to `callbackUrl` → `GET /api/paystack/verify/:reference` confirms payment

---

## Author

Alison Chelimo

## License

Proprietary — intended for The Cuddle Village Inc.

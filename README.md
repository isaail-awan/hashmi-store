# 🏪 Hashmi Store

A full-stack e-commerce web app for **Hashmi Cash & Carry**, a neighborhood grocery/household store in Rawalpindi, Pakistan. Customers browse products, place Cash-on-Delivery orders, and track them — while the store owner manages inventory, orders, and sales from a dedicated admin panel.

Built with **Next.js**, **Supabase**, and a custom **"Mandi Rate Board"** design system inspired by the hand-painted price boards of Pakistani kiryana stores.

---

## ✨ Features

### 🛍️ For Customers
- Browse products by category, with live search
- Stock status (Out of Stock / Low Stock warnings)
- Quantity selector on every product
- Wishlist — save products for later (heart icon)
- Star ratings & reviews on every product
- Cart with delivery time-slot selection (ASAP / Evening / Next morning)
- **Login required at checkout** — browsing and adding to cart is open to everyone, but placing an order requires a free account
- WhatsApp order confirmation — one tap to send the order summary to the store
- Order tracking timeline (Order Placed → Dispatched → Delivered)
- Profile settings — avatar upload, name, phone, default delivery address
- Installable as a mobile app (PWA) — "Add to Home Screen"
- Delivery restricted to Rawalpindi addresses only

### 🧑‍💼 For the Store Owner (Admin Panel — `/admin`)
- Add / edit / delete products, with image upload and stock quantity
- Mark products on sale (original price + discounted price)
- Live orders feed with status updates (Pending → Dispatched → Delivered)
- **Analytics dashboard** — revenue, average order value, order status breakdown, best-selling products
- Low-stock alerts banner
- Access restricted to a single admin email (set via environment variable) — no one else can reach `/admin`, even if they create a regular account

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, custom design tokens ("Mandi Rate Board" theme) |
| Backend | Supabase (Postgres database, Auth, Storage) |
| State | Zustand (cart, search, category filters) |
| UI Components | shadcn/ui primitives, lucide-react icons |
| Notifications | Sonner (toasts) |

---

## 📁 Project Structure

```
hashmi-store-main/
├── app/
│   ├── page.tsx              # Home page (product grid, categories, hero)
│   ├── product/[id]/         # Product detail page (reviews, wishlist, add to cart)
│   ├── cart/                 # Cart + checkout (login-gated)
│   ├── login/                # Admin login
│   ├── profile/              # Customer login/signup, order history, settings
│   ├── admin/                # Admin panel (orders, inventory, analytics)
│   └── globals.css           # Design tokens, fonts, animations
├── components/                # Reusable UI (Navbar, ProductCard bits, StarRating, etc.)
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── store.ts                # Zustand cart/search/category store
│   └── whatsapp.ts            # WhatsApp order-link builder
└── *.sql                      # Database setup & migration scripts (see below)
```

---

## 🚀 Getting Started (Local Setup)

### 1. Clone and install

```bash
git clone https://github.com/isaail-awan/hashmi-store.git
cd hashmi-store
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New Project. Once it's ready, grab these from **Settings → API**:
- Project URL
- Publishable (anon) key

### 3. Run the database setup scripts

Open the Supabase **SQL Editor** and run the following files **in this order** (paste each into a fresh query box and click Run):

1. `supabase-setup.sql` — creates `products` and `orders` tables, RLS policies, storage bucket, sample products
2. `supabase-migration-phase1.sql` — adds stock tracking + customer `profiles` table + avatar storage
3. `supabase-migration-phase2.sql` — adds delivery time-slot support to orders
4. `supabase-migration-phase3.sql` — adds `reviews` and `wishlist` tables
5. `fix-orders-rls-v2.sql` — ensures correct permissions/grants on core tables (safe to re-run anytime if you ever see a "row-level security policy" error)

> ⚠️ Run each script in its own clean query box — don't paste new SQL on top of old SQL in the same box, since Supabase runs the whole box as one transaction and a single error will roll back everything in it.

### 4. Create your admin account

Supabase Dashboard → **Authentication → Users → Add User** → enter your email/password, and check "Auto Confirm User".

Also disable email confirmation for regular signups (so customers don't get stuck at "email not confirmed"):
**Authentication → Sign In / Providers → Email → turn OFF "Confirm email"**.

### 5. Set environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxx
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com
NEXT_PUBLIC_STORE_WHATSAPP=923001234567
```

| Variable | What it's for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public/publishable API key (safe to expose — protected by RLS) |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Only this email can access `/admin` |
| `NEXT_PUBLIC_STORE_WHATSAPP` | Store's WhatsApp number (country code, no `+` or spaces) for order confirmations |

### 6. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## ☁️ Deployment (Vercel)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo
3. Add the same 4 environment variables from `.env.local` in the Vercel project settings
4. Deploy — Vercel auto-detects Next.js and builds it
5. Every future `git push` to `main` automatically redeploys

---

## 🔐 Security Notes

- Row Level Security (RLS) is enabled on every table — the database itself enforces who can read/write what, not just the app code
- Products are publicly readable but only the admin account (matching `NEXT_PUBLIC_ADMIN_EMAIL`) can add/edit/delete them
- Customers can only see and edit their own profile and orders
- Checkout requires login; browsing and adding to cart does not

---

## 🗺️ Roadmap Ideas

- Server-side rendering + pagination for faster initial load at scale
- Multiple delivery zones beyond Rawalpindi
- SMS/email order notifications
- Multi-admin roles (staff accounts with limited permissions)

---

## 📄 License

Private project — all rights reserved by the store owner.

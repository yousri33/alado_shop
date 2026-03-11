# 🛒 Alado Shop — Full Project Specification for Claude Code
> **Tagline:** "تسوّق بثقة، وُصِّل لكل مكان" | *"Commandez en confiance, livré partout en Algérie"*
> **Type:** Algerian E-Commerce (COD only) | **Stack:** Next.js + Supabase + Tailwind CSS

---

## 📌 Project Summary

Build a modern, professional, SEO-optimized Algerian e-commerce website called **Alado Shop**.
- Cash on Delivery (COD) only — no payment gateway needed
- No shopping cart — products go directly to a checkout form
- Arabic (RTL) as primary language + French secondary
- Admin dashboard to manage products, orders, and stock
- All data persisted in Supabase

---

## 🎨 Design System

### Brand Identity
| Property | Value |
|---|---|
| Primary Color | Gold / Yellow (`#F5C518` or `#FFD700`) |
| Secondary Color | White (`#FFFFFF`) |
| Dark Accent | Deep Black/Charcoal (`#1A1A1A`) |
| Background | Off-white / Light cream (`#FAFAF7`) |
| Admin Dark BG | `#0F0F0F` |
| Font (Arabic) | `Cairo` or `Tajawal` (Google Fonts) |
| Font (French/Latin) | `Inter` or `Poppins` |

### General Rules
- **RTL layout** by default (`dir="rtl"`)
- Language toggle: Arabic ↔ French (stored in `localStorage`)
- **No hero animations** (static hero image only — performance-first)
- **No splash screen**
- Clean, minimal, luxury-modern aesthetic inspired by Algerian identity
- "Made in Algeria" subtle badge or mention in footer
- No cart drawer — each product page has a standalone order form
- Mobile-first responsive design
- Smooth page transitions (CSS only, no heavy JS animation libraries)

---

## 🗂️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database + Auth | Supabase |
| Image Storage | Supabase Storage |
| Deployment | Vercel |
| RTL Support | `next-intl` or manual `dir="rtl"` |
| Icons | `lucide-react` |
| Form Validation | `react-hook-form` + `zod` |
| Notifications | `sonner` (toast library) |
| Spreadsheet Export | `xlsx` (SheetJS) |

---

## 📁 Project File Structure

```
alado-shop/
├── app/
│   ├── (store)/
│   │   ├── page.tsx                  # Homepage
│   │   ├── products/
│   │   │   └── [slug]/page.tsx       # Product detail + order form
│   │   └── order-confirmation/
│   │       └── [id]/page.tsx         # Order success page
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── products/page.tsx
│   │   └── layout.tsx                # Admin layout (protected)
│   ├── api/
│   │   └── export-orders/route.ts    # Excel export endpoint
│   └── layout.tsx                    # Root layout (RTL, fonts)
├── components/
│   ├── store/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── ColorSelector.tsx
│   │   ├── StockBadge.tsx
│   │   ├── OrderForm.tsx
│   │   ├── WilayaSelector.tsx
│   │   ├── DeliveryPriceCard.tsx
│   │   └── OrderSummary.tsx
│   ├── admin/
│   │   ├── OrdersTable.tsx
│   │   ├── OrderStatusBadge.tsx
│   │   ├── ProductForm.tsx
│   │   └── StatsCard.tsx
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts                  # Generated DB types
│   ├── wilayas.ts                    # Wilaya list + pricing data
│   ├── utils.ts
│   └── validations.ts
└── public/
    └── logo.png                      # Alado Shop logo (user-provided)
```

---

## 🗄️ Supabase Database Schema

### Table: `products`
```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_fr text,
  slug text unique not null,
  description_ar text,
  description_fr text,
  price numeric not null,
  category_id uuid references categories(id),
  is_visible boolean default true,
  created_at timestamptz default now()
);
```

### Table: `product_variants`
```sql
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  color_name_ar text,
  color_name_fr text,
  color_hex text,           -- e.g. "#FF5733"
  size text,                -- e.g. "M", "L", "XL", null if no size
  stock_quantity integer not null default 0,
  sku text
);
```

### Table: `product_images`
```sql
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  variant_id uuid references product_variants(id),  -- null = applies to all variants
  image_url text not null,
  sort_order integer default 0,
  is_primary boolean default false
);
```

### Table: `categories`
```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_fr text,
  slug text unique not null,
  sort_order integer default 0
);
```

### Table: `wilayas`
```sql
create table wilayas (
  code integer primary key,
  name_ar text not null,
  name_fr text not null
);
```

### Table: `communes`
```sql
create table communes (
  id uuid primary key default gen_random_uuid(),
  wilaya_code integer references wilayas(code),
  name_ar text not null,
  name_fr text not null
);
```

### Table: `delivery_pricing`
```sql
create table delivery_pricing (
  id uuid primary key default gen_random_uuid(),
  wilaya_code integer references wilayas(code),
  delivery_type text check (delivery_type in ('home', 'bureau')),
  courier_name text,        -- DHD, ANDERSON, NOEST, YALIDIN, ZR
  price numeric not null
);
```

### Table: `orders`
```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,   -- e.g. "ALD-00142"
  full_name text,                      -- nullable: incomplete orders still saved
  phone text not null,                 -- normalized: always stored as 213XXXXXXXX
  phone_raw text,                      -- exactly what user typed
  wilaya_code integer references wilayas(code),
  wilaya_name text,
  commune_id uuid references communes(id),
  commune_name text,
  full_address text,                   -- optional
  delivery_type text check (delivery_type in ('home', 'bureau')),
  delivery_price numeric,
  courier_name text,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  product_name text,                   -- snapshot at time of order
  variant_details text,                -- e.g. "أحمر - L"
  quantity integer not null default 1,
  unit_price numeric not null,
  total_price numeric not null,        -- unit_price * quantity + delivery_price
  status text default 'new' check (status in (
    'new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'incomplete'
  )),
  is_complete boolean default false,   -- false if user abandoned mid-form
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Table: `admin_users`
```sql
-- Uses Supabase Auth. Admin users are managed via Supabase Dashboard.
-- Extra profile table:
create table admin_profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  role text default 'staff' check (role in ('superadmin', 'staff'))
);
```

---

## 🌐 Pages & Routes

### Store (Public)

#### `/` — Homepage
- Header with logo (white/gold), language toggle (AR/FR), navigation links
- Static hero section (NO animation) — full-width image with tagline overlay in Arabic + French
- "Made in Algeria" badge subtly placed
- Category filter bar — fetched live from Supabase `categories` table
- Product grid — fetched from Supabase `products` (visible only)
- Each product card shows:
  - Primary image
  - Product name (in selected language)
  - Price in DZD
  - Color swatches (small circles, max 5 shown)
  - Stock badge: "متوفر" (green) / "نفذ المخزون" (grey, item greyed out + no click)
- SEO: `<title>`, `<meta description>`, Open Graph tags
- Footer: logo, tagline, "Made in Algeria", social links placeholder

#### `/products/[slug]` — Product Page
- Large product gallery (multiple images, no video)
- Image zoom on hover/click (lightbox style)
- Product name (AR/FR), price in DZD
- Color selector: clickable color swatches with label
  - When a color is selected, gallery updates to show that variant's images
  - Stock per variant shown: "متبقي 3 قطع" or "نفذ" (greyed out, unselectable)
- Size selector (if applicable)
- Quantity selector (default: 1, min: 1, max: available stock)
- **Order Form** (embedded on same page, no separate cart):
  - See Order Form section below
- SEO: unique title/description per product

#### `/order-confirmation/[id]` — Confirmation Page
- Show order summary:
  - Order number (e.g., ALD-00142)
  - Product name + variant + quantity
  - Customer name, wilaya, phone
  - Delivery type + price
  - Total price
- Simple success message in Arabic + French
- "العودة إلى المتجر" (Return to store) button
- No tracking link

---

### Admin (Protected — `/admin/*`)

#### `/admin/login`
- Email + password login via Supabase Auth
- On success → redirect to `/admin/dashboard`

#### `/admin/dashboard`
- Stats cards:
  - Total orders today
  - Total orders this month
  - Total revenue this month
  - Pending/New orders count (highlighted if > 0)
- Recent 10 orders table (quick view)
- Low stock alerts panel (variants with stock < 5)

#### `/admin/orders`
- Full orders table with columns:
  - Order # | Date | Name | Phone | Wilaya | Commune | Product | Variant | Qty | Total | Delivery Type | Status | Note
- **Status color badges:**
  - `new` → 🔴 Red
  - `confirmed` → 🔵 Blue
  - `processing` → 🟡 Yellow
  - `shipped` → 🟠 Orange
  - `delivered` → 🟢 Green
  - `cancelled` → ⚫ Grey
  - `returned` → 🟣 Purple
  - `incomplete` → ⚪ Light grey (italic)
- **Filters:** by status, wilaya, date range, delivery type, product
- **Bulk status update:** select multiple → change status
- **Per-order actions:**
  - Edit status
  - Add/edit admin note
  - View full order details (modal/drawer)
  - "Call" button (opens `tel:` link)
- **Export button:** Download filtered orders as `.xlsx`
- Real-time updates (Supabase Realtime subscription) — new orders appear without refresh
- Toast notification when new order arrives

#### `/admin/products`
- Product list table with: image thumbnail, name, category, price, variants count, visibility toggle
- **Add Product form:**
  - Name (AR required, FR optional)
  - Description (AR/FR)
  - Price
  - Category (dropdown from DB)
  - Images upload (Supabase Storage) — multiple, drag to reorder, mark primary
  - Variants builder:
    - Add color: color name (AR/FR) + hex color picker + stock quantity
    - Add size option (optional)
    - Each variant gets its own stock quantity
- **Edit Product** (same form, pre-filled)
- **Toggle visibility** (show/hide without deleting)
- **Delete product** (with confirmation dialog)

---

## 📋 Order Form Specification

The order form lives on the product page. It is the **only checkout mechanism** — no cart.

### Fields

| Field | Required | Notes |
|---|---|---|
| الاسم الكامل (Full Name) | ❌ Optional | If empty → order saved with `is_complete: false`, status: `incomplete` |
| رقم الهاتف (Phone) | ✅ Required | See phone normalization below |
| الولاية (Wilaya) | ✅ Required | Dropdown — triggers commune + delivery price load |
| البلدية (Commune) | ✅ Required | Dropdown — populated from DB based on selected wilaya |
| العنوان الكامل (Full Address) | ❌ Optional | Text input, placeholder: "اختياري - حي، شارع، رقم البناية..." |
| نوع التوصيل (Delivery Type) | ✅ Required | Radio or card selector: "توصيل للمنزل" vs "استلام من المكتب" |

### Phone Number Handling
- User inputs their number naturally: `0555123456` or `05 55 12 34 56` or `213555123456`
- Frontend: strip spaces, normalize to always store as `213XXXXXXXXX` in `phone` column
- Store original input in `phone_raw` column
- Validation: after normalization must match `^213(5|6|7)\d{8}$`
- Show inline error if invalid: "رقم الهاتف غير صحيح"

### Delivery Price Display
After wilaya is selected:
- Show two delivery option cards side by side:

```
┌─────────────────────┐  ┌─────────────────────┐
│   🏠 توصيل للمنزل   │  │  🏢 استلام من مكتب  │
│      700 د.ج        │  │      400 د.ج         │
└─────────────────────┘  └─────────────────────┘
```

- Do NOT show courier name to customer
- When type is selected, update Order Summary total automatically

### Order Summary (live, updates as user fills form)
```
المنتج:   اسم المنتج - اللون / الحجم
الكمية:   1
سعر المنتج: 2000 د.ج
التوصيل:  700 د.ج
─────────────────────
المجموع:  2700 د.ج
```

### Incomplete Order Capture
- The form saves a record to Supabase as soon as **phone + wilaya** are filled, even if user navigates away
- This is done via an `onBlur` debounced upsert with `is_complete: false` and `status: 'incomplete'`
- If the user completes and submits, the same record is updated to `is_complete: true` and `status: 'new'`
- This captures "almost buyers" for admin follow-up

### Submit Button
- Label: "اطلب الآن 🛒"
- Loading state: spinner + disabled
- On success: redirect to `/order-confirmation/[id]`
- On error: toast notification with message in Arabic

### Order Number Generation
- Format: `ALD-` + zero-padded incrementing number: `ALD-00001`, `ALD-00002`, etc.
- Generated server-side in a Supabase function or API route

---

## 🚚 Wilaya & Delivery Data

Seed the following into `wilayas` and `delivery_pricing` tables on setup.

### Bureau Delivery Prices (Stop Desk)

| Code | Wilaya | Courier | Prix Bureau |
|------|--------|---------|-------------|
| 1 | Adrar | DHD | 600 |
| 2 | Chlef | DHD | 400 |
| 3 | Laghouat | ANDERSON | 450 |
| 4 | Oum El Bouaghi | DHD | 400 |
| 5 | Batna | DHD | 400 |
| 6 | Béjaïa | DHD | 400 |
| 7 | Biskra | DHD | 400 |
| 8 | Béchar | DHD | 600 |
| 9 | Blida | DHD | 250 |
| 10 | Bouira | DHD | 400 |
| 11 | Tamanrasset | ANDERSON | 650 |
| 12 | Tébessa | ANDERSON | 450 |
| 13 | Tlemcen | DHD | 400 |
| 14 | Tiaret | DHD | 400 |
| 15 | Tizi Ouzou | DHD | 400 |
| 16 | Alger | DHD | 200 |
| 17 | Djelfa | DHD | 500 |
| 18 | Jijel | DHD | 400 |
| 19 | Sétif | DHD | 400 |
| 20 | Saïda | DHD | 400 |
| 21 | Skikda | DHD | 400 |
| 22 | Sidi Bel Abbès | DHD | 400 |
| 23 | Annaba | DHD | 400 |
| 24 | Guelma | DHD | 400 |
| 25 | Constantine | DHD | 400 |
| 26 | Médéa | NOEST | 400 |
| 27 | Mostaganem | DHD | 400 |
| 28 | M'Sila | ANDERSON | 450 |
| 29 | Mascara | DHD | 400 |
| 30 | Ouargla | ANDERSON | 450 |
| 31 | Oran | DHD | 400 |
| 32 | El Bayadh | ANDERSON | 450 |
| 33 | Illizi | DHD | 600 |
| 34 | Bordj Bou Arreridj | DHD | 400 |
| 35 | Boumerdès | DHD | 350 |
| 36 | El Tarf | DHD | 400 |
| 37 | Tindouf | DHD | 600 |
| 38 | Tissemsilt | DHD | 400 |
| 39 | El Oued | DHD | 500 |
| 40 | Khenchela | ANDERSON | 450 |
| 41 | Souk Ahras | ANDERSON | 450 |
| 42 | Tipaza | DHD | 350 |
| 43 | Mila | DHD | 400 |
| 44 | Aïn Defla | DHD | 400 |
| 45 | Naâma | DHD | 500 |
| 46 | Aïn Témouchent | DHD | 400 |
| 47 | Ghardaïa | DHD | 500 |
| 48 | Relizane | DHD | 400 |
| 49 | Timimoun | DHD | 600 |
| 50 | Bordj Badji Mokhtar | YALIDIN | 850 |
| 51 | Ouled Djellal | ANDERSON | 450 |
| 52 | Béni Abbès | YALIDIN | 850 |
| 53 | In Salah | DHD | 600 |
| 54 | In Guezzam | YALIDIN | 1400 |
| 55 | Touggourt | DHD | 500 |
| 56 | Djanet | ANDERSON | 850 |
| 57 | El M'Ghair | ANDERSON | 500 |
| 58 | El Meniaa | DHD | 500 |

### Home Delivery Prices

| Code | Wilaya | Courier | Prix Home |
|------|--------|---------|-----------|
| 1 | Adrar | YALIDIN | 1050 |
| 2 | Chlef | NOEST | 700 |
| 3 | Laghouat | DHD | 900 |
| 4 | Oum El Bouaghi | NOEST | 800 |
| 5 | Batna | NOEST | 800 |
| 6 | Béjaïa | DHD | 700 |
| 7 | Biskra | DHD | 900 |
| 8 | Béchar | YALIDIN | 1050 |
| 9 | Blida | ZR | 400 |
| 10 | Bouira | DHD | 650 |
| 11 | Tamanrasset | DHD | 1300 |
| 12 | Tébessa | DHD | 800 |
| 13 | Tlemcen | NOEST | 800 |
| 14 | Tiaret | DHD | 800 |
| 15 | Tizi Ouzou | DHD | 650 |
| 16 | Alger | DHD | 400 |
| 17 | Djelfa | DHD | 900 |
| 18 | Jijel | DHD | 700 |
| 19 | Sétif | DHD | 700 |
| 20 | Saïda | DHD | 800 |
| 21 | Skikda | DHD | 700 |
| 22 | Sidi Bel Abbès | DHD | 700 |
| 23 | Annaba | DHD | 700 |
| 24 | Guelma | DHD | 800 |
| 25 | Constantine | DHD | 700 |
| 26 | Médéa | NOEST | 600 |
| 27 | Mostaganem | DHD | 700 |
| 28 | M'Sila | NOEST | 800 |
| 29 | Mascara | DHD | 700 |
| 30 | Ouargla | ZR | 950 |
| 31 | Oran | DHD | 700 |
| 32 | El Bayadh | DHD | 1000 |
| 33 | Illizi | DHD | 1300 |
| 34 | Bordj Bou Arreridj | DHD | 700 |
| 35 | Boumerdès | NOEST | 600 |
| 36 | El Tarf | DHD | 800 |
| 37 | Tindouf | DHD | 1300 |
| 38 | Tissemsilt | NOEST | 800 |
| 39 | El Oued | DHD | 900 |
| 40 | Khenchela | DHD | 800 |
| 41 | Souk Ahras | DHD | 800 |
| 42 | Tipaza | NOEST | 600 |
| 43 | Mila | DHD | 700 |
| 44 | Aïn Defla | DHD | 600 |
| 45 | Naâma | DHD | 1000 |
| 46 | Aïn Témouchent | DHD | 700 |
| 47 | Ghardaïa | ZR | 950 |
| 48 | Relizane | DHD | 700 |
| 49 | Timimoun | YALIDIN | 1050 |
| 50 | Bordj Badji Mokhtar | YALIDIN | 1050 |
| 51 | Ouled Djellal | DHD | 900 |
| 52 | Béni Abbès | ZR | 1000 |
| 53 | In Salah | DHD | 1300 |
| 54 | In Guezzam | ZR | 1600 |
| 55 | Touggourt | DHD | 900 |
| 56 | Djanet | YALIDIN | 1600 |
| 57 | El M'Ghair | DHD | 900 |
| 58 | El Meniaa | YALIDIN | 950 |

> **Note:** Courier names are stored in the DB for admin/export use only. Never shown to customers on the storefront.

---

## 📊 Excel Export Specification

**Endpoint:** `GET /api/export-orders?status=all&from=2024-01-01&to=2024-12-31`

**File format:** `.xlsx` (Excel)

**Sheet name:** "طلبات علادو شوب"

**Columns (in this exact order):**

| # | Column Header | DB Field | Notes |
|---|---|---|---|
| 1 | الاسم الكامل | `full_name` | |
| 2 | رقم الهاتف | `phone` | normalized 213XXXXXXXXX |
| 3 | الولاية | `wilaya_name` | Arabic name |
| 4 | البلدية | `commune_name` | Arabic name |
| 5 | رمز الولاية | `wilaya_code` | numeric code 1–58 |
| 6 | اسم المنتج | `product_name` | snapshot |
| 7 | الكمية | `quantity` | |
| 8 | السعر الإجمالي | `total_price` | product + delivery |

**Admin filters before export:**
- Date range (from → to)
- Status (all / new / confirmed / shipped / etc.)
- Wilaya
- Delivery type (home / bureau)

**Styling:**
- Header row: gold background (`#FFD700`), bold white text, centered
- Alternating row colors (white / very light grey)
- Auto-fit column widths
- RTL text alignment for Arabic columns

---

## 🔔 Notification System (Admin)

- Use **Supabase Realtime** to subscribe to `INSERT` events on the `orders` table
- When a new order with `is_complete: true` arrives:
  - Show browser notification (with `Notification API` permission request)
  - Show toast via `sonner`: "🛒 طلب جديد! #ALD-00142 — [اسم العميل]"
  - Increment badge counter on "Orders" nav item
- When a new `incomplete` order arrives: silently update the orders table (no toast)

---

## 🧱 Key Components Detail

### `<OrderForm />` — State Machine

```
IDLE
  → user selects wilaya
    → fetch delivery prices (home + bureau)
    → show DeliveryPriceCards
  → user fills phone (onBlur, valid phone detected)
    → upsert incomplete order to Supabase (background, silent)
  → user fills remaining fields
  → user clicks "اطلب الآن"
    → validate with zod
    → if errors: show inline field errors, scroll to first error
    → if valid: POST to Supabase, update order to complete
      → on success: redirect to /order-confirmation/[id]
      → on error: show toast "حدث خطأ، يرجى المحاولة مجدداً"
```

### `<ColorSelector />` — Behavior
```
- Render one circle per variant, colored by `color_hex`
- If variant.stock_quantity === 0: show circle with diagonal red line, disabled
- Selected variant: gold border ring
- On select: update gallery to show variant images
- On select: show stock count "متبقي X قطعة" or "متوفر" if stock >= 10
```

### `<WilayaSelector />` — Behavior
```
- Searchable dropdown (user can type to filter)
- On change: fetch communes for that wilaya from Supabase
- On change: fetch delivery prices (home + bureau) from delivery_pricing
- Commune dropdown: disabled until wilaya is selected
- Both dropdowns are Arabic-first (sort by wilaya code)
```

---

## 🔐 Admin Auth & Security

- Supabase Auth (email + password)
- Protected routes: middleware checks session on all `/admin/*` routes except `/admin/login`
- If not authenticated → redirect to `/admin/login`
- Supabase RLS rules:
  - `orders`: public INSERT (anyone can place an order), SELECT/UPDATE only for authenticated admin
  - `products`: public SELECT (visible only), full CRUD for authenticated admin
  - `delivery_pricing`, `wilayas`, `communes`, `categories`: public SELECT only
- Admin roles: `superadmin` (full access) and `staff` (view orders + update status only)

---

## 🌍 SEO Requirements

- `<html lang="ar" dir="rtl">` at root
- Each page has unique `<title>` and `<meta name="description">`
- Product pages: Open Graph tags (for WhatsApp/Facebook sharing)
  - `og:title`, `og:description`, `og:image` (primary product image), `og:url`
- `robots.txt` — allow all except `/admin/*`
- `sitemap.xml` — auto-generated for all product pages
- URL structure: `/products/[slug]` (slug in French/Latin, SEO friendly)
- Image `alt` tags: product name in Arabic on all images
- No `noindex` on any store pages
- `canonical` tags on all pages

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640–1024px | 2-column product grid |
| Desktop | > 1024px | 3–4 column product grid, side-by-side product+form |

---

## 🚀 Launch Checklist

- [ ] Supabase project created, all tables seeded
- [ ] Wilaya + delivery data seeded (58 wilayas × 2 delivery types)
- [ ] At least 1 product created in admin
- [ ] Logo uploaded (white/gold version)
- [ ] Admin user created in Supabase Auth
- [ ] Environment variables set in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Domain configured (if available)
- [ ] Test order placed end-to-end
- [ ] Excel export tested
- [ ] Mobile view tested on real phone
- [ ] RTL layout verified on all pages

---

## 📝 Tone & Copy Guidelines

- All customer-facing text: **Arabic first**, French as secondary
- Admin panel: can be French or bilingual
- Error messages: Arabic, friendly and clear (not technical)
- CTA buttons: "اطلب الآن" / "أضف للطلب" — action-forward
- Empty states: helpful, not cold (e.g., "لا توجد منتجات في هذه الفئة حالياً")
- Loading states: skeleton screens (not spinners) for product grids

---

*Prepared for: **Alado Shop** | Spec Version 1.0 | Ready to build 🚀*

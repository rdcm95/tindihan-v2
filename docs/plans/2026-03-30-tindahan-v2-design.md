# Tindahan v2 — Design Plan

## Overview

Complete rebuild of the Tindahan POS app (sari-sari store) with a fresh Neo-Brutalist design. 
Same data model, same logic, same features — new visual identity. PWA-ready for mobile, tablet, and laptop.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + neo-brutalism-ui |
| Backend | Cloudflare Workers (Hono) |
| Database | Cloudflare D1 (SQLite) |
| Hosting | Cloudflare Pages |
| Auth | GitHub-connected, auto-deploy on push |
| PWA | Vite PWA plugin (Workbox) |

---

## Design System

### Color Palette

**Light Mode:**
- Background: `#FFFEF0` (off-white)
- Surface: `#FDF6E3` (cream)
- Border: `#000000`
- Text: `#000000`
- Accent: `#FFE500` (bold yellow)
- Success: `#22C55E`
- Danger: `#EF4444`

**Dark Mode:**
- Background: `#0D0D0D` (near-black)
- Surface: `#1A1A1A` (dark gray)
- Border: `#FFFFFF`
- Text: `#FFFFFF`
- Accent: `#FFE500` (bold yellow)
- Success: `#22C55E`
- Danger: `#EF4444`

### Neo-Brutalism Tokens
- Borders: `2px solid`
- Shadows: `4px 4px 0px #000` (light) / `4px 4px 0px #FFF` (dark)
- Corners: `border-radius: 8px`
- Buttons: Solid fill + hard shadow, press effect (translate + shadow removed on active)
- Cards: Fill + thick border + hard shadow
- Inputs: Bordered, no soft shadows

### Typography
- Font: `Space Grotesk` (Google Fonts)
- Weights: 400 (body), 500 (labels), 700 (headings)
- Sizes: 12/14/16/20/28px scale

### Layout
- Mobile-first, bottom nav fixed
- Tablet: 2-col product grid
- Desktop: 3-col product grid + persistent header

---

## Database Schema (Exact — proven working)

### categories
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### products
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  unit TEXT DEFAULT 'piece',
  current_cost_price REAL DEFAULT 0,
  current_sell_price REAL NOT NULL,
  stock_quantity REAL DEFAULT 0,
  low_stock_threshold REAL DEFAULT 10,
  is_active INTEGER DEFAULT 1,
  allow_decimal_qty INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### orders
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  total_amount REAL NOT NULL,
  total_cost REAL DEFAULT 0,
  total_profit REAL DEFAULT 0,
  amount_tendered REAL DEFAULT 0,
  change_given REAL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'completed',
  notes TEXT,
  order_date TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now'))
);
```

### order_items
```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  cost_price REAL DEFAULT 0,
  subtotal REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### stock_movements
```sql
CREATE TABLE stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  movement_type TEXT NOT NULL,
  quantity REAL NOT NULL,
  reference_type TEXT,
  reference_id INTEGER,
  cost_price REAL DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### cash_journal
```sql
CREATE TABLE cash_journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### month_end_counts
```sql
CREATE TABLE month_end_counts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  count_date TEXT NOT NULL,
  total_products INTEGER NOT NULL,
  total_stock_value REAL NOT NULL,
  total_cash REAL NOT NULL,
  submitted_at TEXT DEFAULT (datetime('now'))
);
```

### deposits
```sql
CREATE TABLE deposits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'open',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  closed_at TEXT
);
```

### settings
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | **Home** | Today's sales, low-stock alerts, monthly totals, deposits count |
| `/new-order` | **POS / New Order** | Category tabs, product grid, cart sheet, numeric keypad payment |
| `/inventory` | **Stock** | Search, low-stock filter toggle, restock per item |
| `/reports` | **Reports** | Daily/Monthly tabs, date picker, sales summary table |
| `/cash-journal` | **Cash Journal** | Daily balance (yesterday carried, in/out, new balance), + add entry |
| `/month-end` | **Month-End Count** | Date picker → Load count → Submit. Auto-adjusts stock |
| `/deposits` | **Deposits** | Open/Partial/Closed/All filter, + add bottle deposit |
| `/settings` | **Settings** | Store name, inventory value, dark/light toggle, product/category admin |

---

## Bottom Navigation

```
[Home]  [Stock]  [+ New Order]  [Reports]  [Journal]
```
- `[+]` POS button: larger, accent-colored (yellow)
- Active: filled icon + accent bg
- Inactive: outlined icon + transparent
- Fixed at bottom, 72px height, safe-area aware

---

## Feature Notes

- No PIN, no password (no auth)
- Fresh D1 database — no migration from old app
- Old data exported to `old-data-backup/` for reference only
- Light/dark mode toggle persisted in localStorage
- PWA: manifest.json, service worker, installable on mobile/desktop
- POS: category-first product grid, numeric keypad for amount tendered, change calculation
- Stock restock: adds quantity to existing stock, records cost price at restock time
- Month-end: physical count → compare with system → auto-adjust stock to match physical
- Reports: daily = single date picker; monthly = month/year picker
- Cash journal: running balance per day, in/out entries

---

## File Structure

```
/
├── src/
│   ├── components/
│   │   ├── ui/           # Neo-Brutalist base components
│   │   ├── layout/       # BottomNav, Header, PageContainer
│   │   ├── pos/          # ProductGrid, CartSheet, CheckoutModal, Numpad
│   │   ├── inventory/    # ProductRow, RestockModal
│   │   └── reports/      # SalesTable, DailyMonthlyToggle
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── NewOrder.jsx
│   │   ├── Inventory.jsx
│   │   ├── Reports.jsx
│   │   ├── CashJournal.jsx
│   │   ├── MonthEnd.jsx
│   │   ├── Deposits.jsx
│   │   └── Settings.jsx
│   ├── lib/
│   │   ├── db.js         # D1 client
│   │   ├── api.js        # API client
│   │   └── utils.js      # Currency format, date helpers
│   ├── contexts/
│   │   └── ThemeContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── functions/            # Cloudflare Workers (Hono API)
│   └── [[route]].ts
├── public/
│   ├── manifest.json
│   └── icon.svg
├── drizzle/              # D1 schema (optional ORM)
├── docs/
│   └── plans/
│       └── 2026-03-30-tindahan-v2-design.md
├── wrangler.toml
└── package.json
```

---

## Old Data Backup

Located at: `old-data-backup/`
- `products.json` — 269 products
- `categories.json` — 19 categories
- `orders.json` — 50 orders
- `cash-journal.json` — 50 entries
- `month-end-history.json` — 50 entries

**Not used in the new app. Reference only.**

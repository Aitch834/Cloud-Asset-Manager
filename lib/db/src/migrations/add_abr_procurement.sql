ALTER TABLE dairy_abr_test_kit_stock ADD COLUMN IF NOT EXISTS supplier_id INTEGER;

CREATE TABLE IF NOT EXISTS dairy_abr_suppliers (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES farms(id),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  account_ref TEXT,
  payment_terms_days INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dairy_abr_purchase_orders (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES farms(id),
  supplier_id INTEGER REFERENCES dairy_abr_suppliers(id),
  po_number TEXT NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dairy_abr_po_items (
  id SERIAL PRIMARY KEY,
  po_id INTEGER NOT NULL REFERENCES dairy_abr_purchase_orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity_ordered INTEGER NOT NULL DEFAULT 1,
  unit_price_pence INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS dairy_abr_grns (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES farms(id),
  po_id INTEGER REFERENCES dairy_abr_purchase_orders(id),
  grn_number TEXT,
  received_date DATE NOT NULL,
  received_by TEXT,
  condition_on_arrival TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dairy_abr_invoices (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES farms(id),
  supplier_id INTEGER REFERENCES dairy_abr_suppliers(id),
  po_id INTEGER REFERENCES dairy_abr_purchase_orders(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  net_amount_pence INTEGER,
  vat_amount_pence INTEGER,
  gross_amount_pence INTEGER,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_date DATE,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

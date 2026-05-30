-- SQL migration schema for "Candles by Dreamers" Supabase Backend
-- Guaranteed to be 100% idempotent: safe to run multiple times without any "already exists" errors.

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table (Safe if already exists)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Products Table (Safe if already exists)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    category TEXT NOT NULL REFERENCES public.categories(name) ON UPDATE CASCADE,
    scent_profile TEXT, -- e.g., "Lavender, Sage & Oakmoss"
    burn_time TEXT, -- e.g., "45 hours"
    image_urls JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of image URLs
    sizes JSONB DEFAULT '[]'::jsonb NOT NULL, -- Sized weights (e.g. ["8 oz", "16 oz"])
    stock INTEGER DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Orders Table (Safe if already exists)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable if allowing guest orders
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL,
    shipping NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending'::text NOT NULL, -- pending, processing, packed, shipped, delivered, cancelled
    payment_method TEXT DEFAULT 'razorpay'::text NOT NULL,
    payment_status TEXT DEFAULT 'pending'::text NOT NULL, -- pending, paid, failed
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Order Items Table (Safe if already exists)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    size TEXT, -- Selected size/weight (e.g. "8 oz")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Contacts Table (Safe if already exists)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Settings Table (Safe if already exists)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Seed Default Settings (Safe upsert)
INSERT INTO public.settings (key, value) VALUES
('tax_rate', '0.18') -- 18% standard GST / sales tax for India / international
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.settings (key, value) VALUES
('shipping_charge', '100.00') -- Flat rate 100 INR shipping
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.settings (key, value) VALUES
('free_shipping_threshold', '1200.00') -- Orders above 1200 INR get free shipping
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 9. Seed Default Scented Candle Categories (Safe seed)
INSERT INTO public.categories (name) VALUES
('Floral & Botanical'),
('Woody & Earthy'),
('Citrus & Fruity'),
('Sweet & Vanilla'),
('Spicy & Amber')
ON CONFLICT (name) DO NOTHING;

-- 9b. Create Sizes Table (Safe if already exists)
CREATE TABLE IF NOT EXISTS public.sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9c. Seed Default Candle Sizes (Safe seed)
INSERT INTO public.sizes (name) VALUES
('8 oz'),
('12 oz'),
('16 oz'),
('Standard Jar'),
('Travel Tin'),
('Large Jar')
ON CONFLICT (name) DO NOTHING;

-- 10. Enable Row Level Security (RLS) on all tables (Safe to run multiple times)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;

-- 11. Define Row Level Security Policies (Guarded by DROP POLICY to prevent duplication errors)

-- Categories: Anyone can select
DROP POLICY IF EXISTS "Allow public read-only categories" ON public.categories;
CREATE POLICY "Allow public read-only categories" ON public.categories 
    FOR SELECT USING (true);

-- Categories: Allow insert for admin panel
DROP POLICY IF EXISTS "Allow public insert on categories" ON public.categories;
CREATE POLICY "Allow public insert on categories" ON public.categories
    FOR INSERT WITH CHECK (true);

-- Categories: Allow update for admin panel
DROP POLICY IF EXISTS "Allow public update on categories" ON public.categories;
CREATE POLICY "Allow public update on categories" ON public.categories
    FOR UPDATE USING (true) WITH CHECK (true);

-- Categories: Allow delete for admin panel
DROP POLICY IF EXISTS "Allow public delete on categories" ON public.categories;
CREATE POLICY "Allow public delete on categories" ON public.categories
    FOR DELETE USING (true);

-- Sizes: Anyone can select
DROP POLICY IF EXISTS "Allow public read on sizes" ON public.sizes;
CREATE POLICY "Allow public read on sizes" ON public.sizes
    FOR SELECT USING (true);

-- Sizes: Allow insert for admin panel
DROP POLICY IF EXISTS "Allow public insert on sizes" ON public.sizes;
CREATE POLICY "Allow public insert on sizes" ON public.sizes
    FOR INSERT WITH CHECK (true);

-- Sizes: Allow update for admin panel
DROP POLICY IF EXISTS "Allow public update on sizes" ON public.sizes;
CREATE POLICY "Allow public update on sizes" ON public.sizes
    FOR UPDATE USING (true) WITH CHECK (true);

-- Sizes: Allow delete for admin panel
DROP POLICY IF EXISTS "Allow public delete on sizes" ON public.sizes;
CREATE POLICY "Allow public delete on sizes" ON public.sizes
    FOR DELETE USING (true);

-- Products: Anyone can select visible products
DROP POLICY IF EXISTS "Allow public read-only visible products" ON public.products;
CREATE POLICY "Allow public read-only visible products" ON public.products 
    FOR SELECT USING (is_visible = true);

-- Products: Allow insert for admin panel
DROP POLICY IF EXISTS "Allow public insert on products" ON public.products;
CREATE POLICY "Allow public insert on products" ON public.products
    FOR INSERT WITH CHECK (true);

-- Products: Allow update for admin panel
DROP POLICY IF EXISTS "Allow public update on products" ON public.products;
CREATE POLICY "Allow public update on products" ON public.products
    FOR UPDATE USING (true) WITH CHECK (true);

-- Products: Allow delete for admin panel
DROP POLICY IF EXISTS "Allow public delete on products" ON public.products;
CREATE POLICY "Allow public delete on products" ON public.products
    FOR DELETE USING (true);

-- Orders: Users can read their own orders; public/guest can insert orders
DROP POLICY IF EXISTS "Allow users to view their own orders" ON public.orders;
CREATE POLICY "Allow users to view their own orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Orders: Allow public read for admin panel
DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;
CREATE POLICY "Allow public read on orders" ON public.orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public inserts on orders" ON public.orders;
CREATE POLICY "Allow public inserts on orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Orders: Allow update for admin panel (status changes)
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders
    FOR UPDATE USING (true) WITH CHECK (true);

-- Orders: Allow delete for admin panel
DROP POLICY IF EXISTS "Allow public delete on orders" ON public.orders;
CREATE POLICY "Allow public delete on orders" ON public.orders
    FOR DELETE USING (true);

-- Order Items: Users can read their own order items; public/guest can insert order items
DROP POLICY IF EXISTS "Allow users to view their own order items" ON public.order_items;
CREATE POLICY "Allow users to view their own order items" ON public.order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

-- Order Items: Allow public read for admin panel
DROP POLICY IF EXISTS "Allow public read on order items" ON public.order_items;
CREATE POLICY "Allow public read on order items" ON public.order_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public inserts on order items" ON public.order_items;
CREATE POLICY "Allow public inserts on order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Contacts: Anyone can submit inquiries
DROP POLICY IF EXISTS "Allow public inserts on contacts" ON public.contacts;
CREATE POLICY "Allow public inserts on contacts" ON public.contacts
    FOR INSERT WITH CHECK (true);

-- Contacts: Anyone can read inquiries (needed for admin panel)
DROP POLICY IF EXISTS "Allow public read on contacts" ON public.contacts;
CREATE POLICY "Allow public read on contacts" ON public.contacts
    FOR SELECT USING (true);

-- Contacts: Allow update for admin panel edits
DROP POLICY IF EXISTS "Allow public update on contacts" ON public.contacts;
CREATE POLICY "Allow public update on contacts" ON public.contacts
    FOR UPDATE USING (true) WITH CHECK (true);

-- Contacts: Allow delete for admin panel
DROP POLICY IF EXISTS "Allow public delete on contacts" ON public.contacts;
CREATE POLICY "Allow public delete on contacts" ON public.contacts
    FOR DELETE USING (true);

-- Settings: Anyone can read settings
DROP POLICY IF EXISTS "Allow public read-only settings" ON public.settings;
CREATE POLICY "Allow public read-only settings" ON public.settings
    FOR SELECT USING (true);

-- 12. Profiles Table (Automatic signup synchronization)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies: Anyone can select
DROP POLICY IF EXISTS "Allow public read-only profiles" ON public.profiles;
CREATE POLICY "Allow public read-only profiles" ON public.profiles 
    FOR SELECT USING (true);

-- Trigger function to copy signups automatically from auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.email),
        coalesce(new.created_at, now())
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users (runs safely and updates any already signed-up users)
INSERT INTO public.profiles (id, email, full_name, created_at)
SELECT 
    id, 
    email, 
    coalesce(raw_user_meta_data->>'full_name', email),
    coalesce(created_at, now())
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 14. Create Product Images Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for product-images bucket
DROP POLICY IF EXISTS "Allow public read on product-images" ON storage.objects;
CREATE POLICY "Allow public read on product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow public upload on product-images" ON storage.objects;
CREATE POLICY "Allow public upload on product-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow public delete on product-images" ON storage.objects;
CREATE POLICY "Allow public delete on product-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- Migration: Tighten RLS policies for production-ready Razorpay integration
-- Orders and order items are now ONLY inserted by the service_role (Edge Functions),
-- never by the anon/public role from the browser.

-- ============================================================================
-- ORDERS TABLE — Secure RLS Policies
-- ============================================================================

-- Remove the old insecure public insert policy
DROP POLICY IF EXISTS "Allow public inserts on orders" ON public.orders;

-- Authenticated users can view their own orders
DROP POLICY IF EXISTS "Allow users to view their own orders" ON public.orders;
CREATE POLICY "Allow users to view their own orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Only service_role (Edge Functions) can insert orders
-- The service_role key bypasses RLS by default, so no explicit INSERT policy is needed.
-- This means the anon key from the browser can no longer insert orders directly.

-- Allow service_role to update orders (for payment status updates)
-- Service role bypasses RLS, so this is implicit. No policy needed.

-- ============================================================================
-- ORDER ITEMS TABLE — Secure RLS Policies
-- ============================================================================

-- Remove the old insecure public insert policy
DROP POLICY IF EXISTS "Allow public inserts on order items" ON public.order_items;

-- Authenticated users can view their own order items
DROP POLICY IF EXISTS "Allow users to view their own order items" ON public.order_items;
CREATE POLICY "Allow users to view their own order items" ON public.order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

-- Only service_role (Edge Functions) can insert order items
-- Service role bypasses RLS by default. No explicit policy needed.

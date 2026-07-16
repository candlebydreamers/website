-- Seed default settings for media if they do not exist
INSERT INTO public.settings (key, value) VALUES
('hero_slideshow_images', '[]'),
('our_purpose_image', '')
ON CONFLICT (key) DO NOTHING;

-- Allow public insert on settings so that upsert operations work seamlessly
DROP POLICY IF EXISTS "Allow public insert on settings" ON public.settings;
CREATE POLICY "Allow public insert on settings" ON public.settings
    FOR INSERT WITH CHECK (true);

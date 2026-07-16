-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public select on testimonials" ON public.testimonials;
CREATE POLICY "Allow public select on testimonials" ON public.testimonials
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on testimonials" ON public.testimonials;
CREATE POLICY "Allow public insert on testimonials" ON public.testimonials
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on testimonials" ON public.testimonials;
CREATE POLICY "Allow public update on testimonials" ON public.testimonials
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on testimonials" ON public.testimonials;
CREATE POLICY "Allow public delete on testimonials" ON public.testimonials
    FOR DELETE USING (true);

-- Seed initial testimonials
INSERT INTO public.testimonials (text, author, location, rating)
VALUES
('I lit the Lavender & Sage candle during my evening meditation and the fragrance filled my entire living room within minutes. The wood wick crackle is so soothing — feels like a mini spa at home!', 'Priya S.', 'Mumbai, Maharashtra', 5),
('The cedarwood and vanilla candle smells absolutely divine. It is not overpowering at all, just the right amount of luxury. Being soy-based, it burns clean with zero soot. Totally worth every rupee!', 'Arjun M.', 'Bengaluru, Karnataka', 5),
('These candles look gorgeous on my coffee table — the amber glass jars are so aesthetic. I ordered a set for Diwali gifting and everyone loved them. No headaches or black smoke like cheap candles.', 'Sneha K.', 'Delhi, NCR', 5),
('Beautiful packaging and quick delivery! I gifted these for a housewarming and my friends could not stop complimenting the vanilla fragrance. Already placing my second order.', 'Rohit D.', 'Pune, Maharashtra', 5)
ON CONFLICT DO NOTHING;

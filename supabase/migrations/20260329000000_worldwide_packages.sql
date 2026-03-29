-- Add worldwide tour package fields to the tours table
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS tour_type text NOT NULL DEFAULT 'local' CHECK (tour_type IN ('local', 'worldwide'));
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS destination text;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS highlights text[];
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS inclusions text[];
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS exclusions text[];
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS itinerary jsonb;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS difficulty text CHECK (difficulty IN ('easy', 'moderate', 'challenging'));
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS min_pax integer;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS max_pax integer;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS pricing_options jsonb;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS suitability_tags text[];
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS enquiry_only boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.tours.tour_type IS 'local = Singapore walking/day tours; worldwide = multi-day international packages';
COMMENT ON COLUMN public.tours.destination IS 'Country or city for worldwide packages, e.g. "Tokyo, Japan"';
COMMENT ON COLUMN public.tours.highlights IS 'Key selling points as a text array';
COMMENT ON COLUMN public.tours.inclusions IS 'What is included in the package price';
COMMENT ON COLUMN public.tours.exclusions IS 'What is not included in the package price';
COMMENT ON COLUMN public.tours.itinerary IS 'Day-by-day breakdown: [{day, title, description}]';
COMMENT ON COLUMN public.tours.difficulty IS 'Physical difficulty level: easy, moderate, or challenging';
COMMENT ON COLUMN public.tours.min_pax IS 'Minimum number of passengers required';
COMMENT ON COLUMN public.tours.max_pax IS 'Maximum number of passengers allowed';
COMMENT ON COLUMN public.tours.pricing_options IS 'Tiered pricing: {twin_sharing, single_supplement, child_rate}';
COMMENT ON COLUMN public.tours.suitability_tags IS 'Who this tour is suited for, e.g. ["Family-Friendly", "Senior-Friendly"]';
COMMENT ON COLUMN public.tours.enquiry_only IS 'When true, show a contact CTA instead of the online booking panel';

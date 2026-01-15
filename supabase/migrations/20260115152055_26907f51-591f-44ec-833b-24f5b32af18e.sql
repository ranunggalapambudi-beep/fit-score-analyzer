-- Add height and weight columns to athletes table
ALTER TABLE public.athletes 
ADD COLUMN IF NOT EXISTS height numeric,
ADD COLUMN IF NOT EXISTS weight numeric;
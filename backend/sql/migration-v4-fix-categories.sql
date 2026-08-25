-- Fix activities.category check constraint to include all expected values.
-- Drop the old restrictive constraint and add the one matching schema.sql.

ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS activities_category_check;

ALTER TABLE public.activities
  ADD CONSTRAINT activities_category_check
  CHECK (category IN ('adventure', 'culture', 'food', 'nature', 'relaxation', 'nightlife'));

-- Fix trips.status check constraint to include 'completed' status.
-- The original only allowed 'draft' and 'planned'.

ALTER TABLE public.trips
  DROP CONSTRAINT IF EXISTS trips_status_check;

ALTER TABLE public.trips
  ADD CONSTRAINT trips_status_check
  CHECK (status IN ('draft', 'planned', 'completed'));

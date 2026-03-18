ALTER TABLE public.videos DROP CONSTRAINT grade_valid_range;
ALTER TABLE public.videos ADD CONSTRAINT grade_valid_range CHECK (grade >= 0 AND grade <= 12);
-- Add validation constraints to videos table
ALTER TABLE public.videos 
  ADD CONSTRAINT title_not_empty CHECK (length(trim(title)) > 0),
  ADD CONSTRAINT title_max_length CHECK (length(title) <= 100),
  ADD CONSTRAINT grade_valid_range CHECK (grade BETWEEN 1 AND 12),
  ADD CONSTRAINT subject_valid_enum CHECK (subject IN (
    'Mathematics',
    'English', 
    'Amharic',
    'General Science',
    'Social Studies',
    'ICT',
    'Biology',
    'Chemistry',
    'Physics',
    'Geography',
    'History'
  ));
-- RLS Policies for journey_milestones table
-- Note: The API route uses service_role key which bypasses RLS
-- These policies are for direct database access (if needed)

-- Enable RLS on journey_milestones table
ALTER TABLE journey_milestones ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT (read) all milestones
CREATE POLICY "Allow authenticated select on journey_milestones"
ON journey_milestones
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to INSERT (create) milestones
CREATE POLICY "Allow authenticated insert on journey_milestones"
ON journey_milestones
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to UPDATE milestones
CREATE POLICY "Allow authenticated update on journey_milestones"
ON journey_milestones
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to DELETE milestones
CREATE POLICY "Allow authenticated delete on journey_milestones"
ON journey_milestones
FOR DELETE
TO authenticated
USING (true);

-- Allow public SELECT (for frontend display)
CREATE POLICY "Allow public select on journey_milestones"
ON journey_milestones
FOR SELECT
TO public
USING (is_active = true); -- Only show active milestones to public

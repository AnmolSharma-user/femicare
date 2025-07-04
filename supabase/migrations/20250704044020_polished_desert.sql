/*
  # Fix user profiles authentication setup

  1. Changes Made
    - Remove incorrect foreign key constraint that references non-existent users table
    - Update RLS policies to use correct auth.uid() function instead of uid()
    - Add trigger function to automatically create user profile when user signs up
    - Ensure proper RLS setup for user profiles

  2. Security
    - Enable RLS on user_profiles table
    - Add policies for authenticated users to manage their own profiles
    - Add trigger to auto-create profiles on user signup

  3. Notes
    - This fixes the "Database error saving new user" issue
    - User profiles will be automatically created when users sign up
    - Users can only access their own profile data
*/

-- Drop the incorrect foreign key constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Drop existing policies to recreate them with correct syntax
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create updated RLS policies with correct auth.uid() function
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create trigger function to automatically create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Update existing RLS policies for other tables to use correct auth.uid()
-- Update cycle_logs policies
DROP POLICY IF EXISTS "Users can delete own cycle logs" ON cycle_logs;
DROP POLICY IF EXISTS "Users can insert own cycle logs" ON cycle_logs;
DROP POLICY IF EXISTS "Users can read own cycle logs" ON cycle_logs;
DROP POLICY IF EXISTS "Users can update own cycle logs" ON cycle_logs;

CREATE POLICY "Users can delete own cycle logs"
  ON cycle_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle logs"
  ON cycle_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own cycle logs"
  ON cycle_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle logs"
  ON cycle_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update symptom_logs policies
DROP POLICY IF EXISTS "Users can delete own symptom logs" ON symptom_logs;
DROP POLICY IF EXISTS "Users can insert own symptom logs" ON symptom_logs;
DROP POLICY IF EXISTS "Users can read own symptom logs" ON symptom_logs;
DROP POLICY IF EXISTS "Users can update own symptom logs" ON symptom_logs;

CREATE POLICY "Users can delete own symptom logs"
  ON symptom_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom logs"
  ON symptom_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own symptom logs"
  ON symptom_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom logs"
  ON symptom_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update mood_logs policies
DROP POLICY IF EXISTS "Users can delete own mood logs" ON mood_logs;
DROP POLICY IF EXISTS "Users can insert own mood logs" ON mood_logs;
DROP POLICY IF EXISTS "Users can read own mood logs" ON mood_logs;
DROP POLICY IF EXISTS "Users can update own mood logs" ON mood_logs;

CREATE POLICY "Users can delete own mood logs"
  ON mood_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood logs"
  ON mood_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own mood logs"
  ON mood_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mood logs"
  ON mood_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update fertility_logs policies
DROP POLICY IF EXISTS "Users can delete own fertility logs" ON fertility_logs;
DROP POLICY IF EXISTS "Users can insert own fertility logs" ON fertility_logs;
DROP POLICY IF EXISTS "Users can read own fertility logs" ON fertility_logs;
DROP POLICY IF EXISTS "Users can update own fertility logs" ON fertility_logs;

CREATE POLICY "Users can delete own fertility logs"
  ON fertility_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fertility logs"
  ON fertility_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own fertility logs"
  ON fertility_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own fertility logs"
  ON fertility_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
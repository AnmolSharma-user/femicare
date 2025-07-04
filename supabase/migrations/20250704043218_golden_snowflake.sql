/*
  # Create user profiles and health data tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `date_of_birth` (date)
      - `height` (integer, in cm)
      - `weight` (decimal, in kg)
      - `average_cycle_length` (integer, default 28)
      - `average_period_length` (integer, default 5)
      - `last_period_date` (date)
      - `contraception_method` (text)
      - `health_goals` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `cycle_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `start_date` (date)
      - `end_date` (date)
      - `cycle_length` (integer)
      - `period_length` (integer)
      - `flow_intensity` (text)
      - `notes` (text)
      - `created_at` (timestamp)

    - `symptom_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `date` (date)
      - `category` (text)
      - `symptom` (text)
      - `severity` (text)
      - `notes` (text)
      - `created_at` (timestamp)

    - `mood_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `date` (date)
      - `mood` (text)
      - `energy_level` (integer, 1-10)
      - `stress_level` (integer, 1-10)
      - `sleep_quality` (integer, 1-10)
      - `notes` (text)
      - `created_at` (timestamp)

    - `fertility_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `date` (date)
      - `basal_temperature` (decimal)
      - `cervical_mucus` (text)
      - `cervix_position` (text)
      - `ovulation_test` (boolean)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  date_of_birth date,
  height integer,
  weight decimal(5,2),
  average_cycle_length integer DEFAULT 28,
  average_period_length integer DEFAULT 5,
  last_period_date date,
  contraception_method text,
  health_goals text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cycle_logs table
CREATE TABLE IF NOT EXISTS cycle_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date,
  cycle_length integer,
  period_length integer,
  flow_intensity text CHECK (flow_intensity IN ('light', 'normal', 'heavy', 'very_heavy')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create symptom_logs table
CREATE TABLE IF NOT EXISTS symptom_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  category text NOT NULL CHECK (category IN ('physical', 'energy', 'mood', 'sleep', 'other')),
  symptom text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create mood_logs table
CREATE TABLE IF NOT EXISTS mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  mood text NOT NULL,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create fertility_logs table
CREATE TABLE IF NOT EXISTS fertility_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  basal_temperature decimal(4,2),
  cervical_mucus text CHECK (cervical_mucus IN ('dry', 'sticky', 'creamy', 'watery', 'egg_white')),
  cervix_position text CHECK (cervix_position IN ('low', 'medium', 'high')),
  ovulation_test boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertility_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
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

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for cycle_logs
CREATE POLICY "Users can read own cycle logs"
  ON cycle_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle logs"
  ON cycle_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle logs"
  ON cycle_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle logs"
  ON cycle_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for symptom_logs
CREATE POLICY "Users can read own symptom logs"
  ON symptom_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom logs"
  ON symptom_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom logs"
  ON symptom_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom logs"
  ON symptom_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for mood_logs
CREATE POLICY "Users can read own mood logs"
  ON mood_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood logs"
  ON mood_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood logs"
  ON mood_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood logs"
  ON mood_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for fertility_logs
CREATE POLICY "Users can read own fertility logs"
  ON fertility_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fertility logs"
  ON fertility_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fertility logs"
  ON fertility_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fertility logs"
  ON fertility_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
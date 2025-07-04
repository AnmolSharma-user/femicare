/*
  # Add settings and preferences tables

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `notifications_enabled` (boolean)
      - `period_reminders` (boolean)
      - `fertility_reminders` (boolean)
      - `symptom_reminders` (boolean)
      - `reminder_time` (time)
      - `theme_preference` (text)
      - `language` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_insights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `insight_type` (text)
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notifications_enabled boolean DEFAULT true,
  period_reminders boolean DEFAULT true,
  fertility_reminders boolean DEFAULT true,
  ovulation_reminders boolean DEFAULT true,
  symptom_reminders boolean DEFAULT true,
  medication_reminders boolean DEFAULT false,
  hydration_reminders boolean DEFAULT true,
  reminder_time time DEFAULT '09:00:00',
  theme_preference text DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  language text DEFAULT 'en',
  data_export_format text DEFAULT 'json' CHECK (data_export_format IN ('json', 'csv', 'pdf')),
  anonymous_analytics boolean DEFAULT true,
  third_party_integration boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_insights table
CREATE TABLE IF NOT EXISTS user_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('cycle', 'wellness', 'activity', 'prediction', 'health')),
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_user_id ON user_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_created_at ON user_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_logs_user_date ON cycle_logs(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date ON symptom_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_fertility_logs_user_date ON fertility_logs(user_id, date DESC);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for user_insights
CREATE POLICY "Users can read own insights"
  ON user_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON user_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON user_insights
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON user_insights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically create user settings when profile is created
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, created_at, updated_at)
  VALUES (NEW.id, now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create settings for new users
DROP TRIGGER IF EXISTS on_user_profile_created ON user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE create_user_settings();

-- Create function to generate insights based on user data
CREATE OR REPLACE FUNCTION generate_cycle_insights(user_uuid uuid)
RETURNS void AS $$
DECLARE
  avg_cycle_length numeric;
  cycle_regularity numeric;
  last_period_date date;
  days_since_period integer;
BEGIN
  -- Calculate average cycle length from recent cycles
  SELECT AVG(cycle_length) INTO avg_cycle_length
  FROM cycle_logs 
  WHERE user_id = user_uuid 
    AND cycle_length IS NOT NULL 
    AND created_at >= NOW() - INTERVAL '6 months';

  -- Calculate cycle regularity (simplified)
  SELECT 
    CASE 
      WHEN STDDEV(cycle_length) <= 2 THEN 95
      WHEN STDDEV(cycle_length) <= 4 THEN 85
      WHEN STDDEV(cycle_length) <= 6 THEN 75
      ELSE 65
    END INTO cycle_regularity
  FROM cycle_logs 
  WHERE user_id = user_uuid 
    AND cycle_length IS NOT NULL 
    AND created_at >= NOW() - INTERVAL '6 months';

  -- Get last period date
  SELECT up.last_period_date INTO last_period_date
  FROM user_profiles up
  WHERE up.id = user_uuid;

  -- Calculate days since last period
  IF last_period_date IS NOT NULL THEN
    days_since_period := CURRENT_DATE - last_period_date;
  END IF;

  -- Generate insights based on data
  IF avg_cycle_length IS NOT NULL AND avg_cycle_length > 0 THEN
    INSERT INTO user_insights (user_id, insight_type, title, description, priority)
    VALUES (
      user_uuid,
      'cycle',
      'Cycle Pattern Analysis',
      'Your average cycle length is ' || ROUND(avg_cycle_length) || ' days with ' || ROUND(cycle_regularity) || '% regularity.',
      CASE WHEN cycle_regularity >= 90 THEN 'low' ELSE 'medium' END
    );
  END IF;

  -- Add period prediction insight
  IF last_period_date IS NOT NULL AND days_since_period IS NOT NULL THEN
    INSERT INTO user_insights (user_id, insight_type, title, description, priority)
    VALUES (
      user_uuid,
      'prediction',
      'Next Period Prediction',
      'Based on your cycle pattern, your next period is expected in approximately ' || 
      GREATEST(0, COALESCE(avg_cycle_length, 28) - days_since_period) || ' days.',
      'high'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
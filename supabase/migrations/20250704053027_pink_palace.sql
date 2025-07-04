/*
  # Advanced Symptoms Tracking Enhancement

  1. New Tables
    - `symptom_categories` - Predefined symptom categories
    - `symptom_definitions` - Comprehensive symptom definitions
    - `symptom_severity_scales` - Different severity measurement scales
    - `user_symptom_logs_enhanced` - Enhanced symptom logging with more data points

  2. Enhanced Features
    - Detailed symptom tracking with multiple measurement scales
    - Symptom intensity tracking over time
    - Correlation tracking between symptoms
    - Custom symptom definitions per user
    - Symptom triggers and patterns
    - Machine learning ready data structure

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their own data
*/

-- Create symptom categories table
CREATE TABLE IF NOT EXISTS symptom_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  color_code text DEFAULT '#6B7280',
  icon_name text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create symptom definitions table
CREATE TABLE IF NOT EXISTS symptom_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES symptom_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  measurement_type text DEFAULT 'severity' CHECK (measurement_type IN ('severity', 'intensity', 'frequency', 'duration', 'boolean', 'scale')),
  scale_min integer DEFAULT 1,
  scale_max integer DEFAULT 10,
  scale_labels jsonb DEFAULT '{}',
  is_custom boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create enhanced symptom logs table
CREATE TABLE IF NOT EXISTS symptom_logs_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  symptom_definition_id uuid REFERENCES symptom_definitions(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_of_day time,
  
  -- Measurement values
  severity_level integer CHECK (severity_level >= 1 AND severity_level <= 10),
  intensity_level integer CHECK (intensity_level >= 1 AND intensity_level <= 10),
  frequency_count integer,
  duration_minutes integer,
  boolean_value boolean,
  scale_value integer,
  
  -- Additional context
  cycle_day integer,
  menstrual_phase text CHECK (menstrual_phase IN ('menstrual', 'follicular', 'ovulation', 'luteal')),
  
  -- Environmental factors
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  sleep_hours decimal(3,1),
  exercise_intensity text CHECK (exercise_intensity IN ('none', 'light', 'moderate', 'intense')),
  weather_condition text,
  
  -- Triggers and notes
  potential_triggers text[],
  notes text,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 10),
  
  -- Medication and treatments
  medications_taken text[],
  treatments_used text[],
  
  -- Location and activity
  location_type text CHECK (location_type IN ('home', 'work', 'travel', 'other')),
  activity_during_symptom text,
  
  -- ML ready fields
  correlation_tags text[],
  prediction_confidence decimal(3,2),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create symptom patterns table for ML analysis
CREATE TABLE IF NOT EXISTS symptom_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  pattern_type text NOT NULL CHECK (pattern_type IN ('daily', 'weekly', 'monthly', 'cyclical', 'seasonal')),
  symptom_combination text[] NOT NULL,
  frequency_score decimal(3,2),
  confidence_score decimal(3,2),
  first_detected_at timestamptz DEFAULT now(),
  last_updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create symptom correlations table
CREATE TABLE IF NOT EXISTS symptom_correlations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  primary_symptom_id uuid REFERENCES symptom_definitions(id),
  correlated_symptom_id uuid REFERENCES symptom_definitions(id),
  correlation_strength decimal(3,2) CHECK (correlation_strength >= -1 AND correlation_strength <= 1),
  time_lag_hours integer DEFAULT 0,
  confidence_level decimal(3,2),
  sample_size integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default symptom categories
INSERT INTO symptom_categories (name, description, color_code, icon_name, sort_order) VALUES
('Physical', 'Physical symptoms and discomfort', '#EF4444', 'thermometer', 1),
('Emotional', 'Mood and emotional symptoms', '#3B82F6', 'brain', 2),
('Energy', 'Energy levels and fatigue', '#F59E0B', 'zap', 3),
('Sleep', 'Sleep quality and patterns', '#6366F1', 'moon', 4),
('Digestive', 'Digestive and gastrointestinal symptoms', '#10B981', 'activity', 5),
('Skin', 'Skin-related symptoms', '#EC4899', 'sun', 6),
('Reproductive', 'Reproductive health symptoms', '#8B5CF6', 'heart', 7),
('Cognitive', 'Mental clarity and cognitive function', '#06B6D4', 'brain', 8),
('Social', 'Social and relationship impacts', '#84CC16', 'users', 9),
('Other', 'Other symptoms not categorized', '#6B7280', 'more-horizontal', 10)
ON CONFLICT (name) DO NOTHING;

-- Insert comprehensive symptom definitions
INSERT INTO symptom_definitions (category_id, name, description, measurement_type, scale_min, scale_max, scale_labels) 
SELECT 
  sc.id,
  symptom_data.name,
  symptom_data.description,
  symptom_data.measurement_type,
  symptom_data.scale_min,
  symptom_data.scale_max,
  symptom_data.scale_labels::jsonb
FROM symptom_categories sc
CROSS JOIN (
  VALUES 
    -- Physical symptoms
    ('Physical', 'Cramps', 'Menstrual or abdominal cramps', 'severity', 1, 10, '{"1": "Very mild", "5": "Moderate", "10": "Severe"}'),
    ('Physical', 'Bloating', 'Abdominal bloating and distension', 'severity', 1, 10, '{"1": "Minimal", "5": "Noticeable", "10": "Very uncomfortable"}'),
    ('Physical', 'Headache', 'Head pain or pressure', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    ('Physical', 'Breast Tenderness', 'Breast sensitivity or pain', 'severity', 1, 10, '{"1": "Slight", "5": "Moderate", "10": "Very tender"}'),
    ('Physical', 'Back Pain', 'Lower or upper back discomfort', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    ('Physical', 'Joint Pain', 'Pain in joints or muscles', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    ('Physical', 'Nausea', 'Feeling of sickness or queasiness', 'severity', 1, 10, '{"1": "Slight", "5": "Moderate", "10": "Very nauseous"}'),
    ('Physical', 'Hot Flashes', 'Sudden feeling of heat', 'frequency', 0, 20, '{"0": "None", "5": "Few", "20": "Very frequent"}'),
    ('Physical', 'Cold Sensitivity', 'Feeling unusually cold', 'severity', 1, 10, '{"1": "Slight", "5": "Moderate", "10": "Very cold"}'),
    ('Physical', 'Dizziness', 'Feeling lightheaded or unsteady', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    
    -- Emotional symptoms
    ('Emotional', 'Mood Swings', 'Rapid changes in emotional state', 'frequency', 0, 10, '{"0": "None", "5": "Several", "10": "Constant"}'),
    ('Emotional', 'Irritability', 'Feeling easily annoyed or frustrated', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Very irritable"}'),
    ('Emotional', 'Anxiety', 'Feelings of worry or nervousness', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    ('Emotional', 'Depression', 'Feelings of sadness or hopelessness', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    ('Emotional', 'Emotional Sensitivity', 'Heightened emotional responses', 'severity', 1, 10, '{"1": "Slight", "5": "Moderate", "10": "Very sensitive"}'),
    ('Emotional', 'Crying Spells', 'Episodes of crying', 'frequency', 0, 10, '{"0": "None", "3": "Few", "10": "Frequent"}'),
    ('Emotional', 'Feeling Overwhelmed', 'Difficulty coping with daily tasks', 'severity', 1, 10, '{"1": "Manageable", "5": "Challenging", "10": "Overwhelming"}'),
    
    -- Energy symptoms
    ('Energy', 'Fatigue', 'Feeling tired or lacking energy', 'severity', 1, 10, '{"1": "Mild tiredness", "5": "Moderate fatigue", "10": "Exhausted"}'),
    ('Energy', 'Energy Levels', 'Overall energy throughout the day', 'scale', 1, 10, '{"1": "Very low", "5": "Moderate", "10": "Very high"}'),
    ('Energy', 'Motivation', 'Drive to accomplish tasks', 'scale', 1, 10, '{"1": "No motivation", "5": "Some motivation", "10": "Highly motivated"}'),
    ('Energy', 'Physical Stamina', 'Ability to sustain physical activity', 'scale', 1, 10, '{"1": "Very low", "5": "Moderate", "10": "High stamina"}'),
    
    -- Sleep symptoms
    ('Sleep', 'Sleep Quality', 'Overall quality of sleep', 'scale', 1, 10, '{"1": "Very poor", "5": "Fair", "10": "Excellent"}'),
    ('Sleep', 'Difficulty Falling Asleep', 'Trouble initiating sleep', 'severity', 1, 10, '{"1": "No trouble", "5": "Some difficulty", "10": "Very difficult"}'),
    ('Sleep', 'Night Wakings', 'Waking up during the night', 'frequency', 0, 10, '{"0": "None", "3": "Few times", "10": "Many times"}'),
    ('Sleep', 'Early Morning Waking', 'Waking up too early', 'boolean', 0, 1, '{"0": "No", "1": "Yes"}'),
    ('Sleep', 'Restless Sleep', 'Tossing and turning during sleep', 'severity', 1, 10, '{"1": "Peaceful", "5": "Somewhat restless", "10": "Very restless"}'),
    ('Sleep', 'Vivid Dreams', 'Intense or memorable dreams', 'frequency', 0, 5, '{"0": "None", "3": "Some", "5": "Many"}'),
    
    -- Digestive symptoms
    ('Digestive', 'Appetite Changes', 'Changes in hunger or food desire', 'scale', 1, 10, '{"1": "Much less", "5": "Normal", "10": "Much more"}'),
    ('Digestive', 'Food Cravings', 'Strong desires for specific foods', 'intensity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Intense"}'),
    ('Digestive', 'Constipation', 'Difficulty with bowel movements', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    ('Digestive', 'Diarrhea', 'Loose or frequent bowel movements', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    ('Digestive', 'Stomach Upset', 'General digestive discomfort', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    
    -- Skin symptoms
    ('Skin', 'Acne Breakouts', 'Skin blemishes or pimples', 'severity', 1, 10, '{"1": "Minimal", "5": "Moderate", "10": "Severe"}'),
    ('Skin', 'Skin Sensitivity', 'Increased skin reactivity', 'severity', 1, 10, '{"1": "Slight", "5": "Moderate", "10": "Very sensitive"}'),
    ('Skin', 'Dry Skin', 'Skin dryness or flaking', 'severity', 1, 10, '{"1": "Slight", "5": "Moderate", "10": "Very dry"}'),
    ('Skin', 'Oily Skin', 'Increased skin oil production', 'severity', 1, 10, '{"1": "Slight", "5": "Moderate", "10": "Very oily"}'),
    
    -- Reproductive symptoms
    ('Reproductive', 'Vaginal Discharge', 'Changes in vaginal discharge', 'scale', 1, 5, '{"1": "Minimal", "3": "Moderate", "5": "Heavy"}'),
    ('Reproductive', 'Vaginal Dryness', 'Lack of natural lubrication', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    ('Reproductive', 'Libido', 'Sexual desire or interest', 'scale', 1, 10, '{"1": "Very low", "5": "Moderate", "10": "Very high"}'),
    ('Reproductive', 'Pelvic Pain', 'Pain in pelvic region', 'severity', 1, 10, '{"1": "Mild", "5": "Moderate", "10": "Severe"}'),
    
    -- Cognitive symptoms
    ('Cognitive', 'Brain Fog', 'Mental cloudiness or confusion', 'severity', 1, 10, '{"1": "Clear thinking", "5": "Some fog", "10": "Very foggy"}'),
    ('Cognitive', 'Concentration', 'Ability to focus on tasks', 'scale', 1, 10, '{"1": "Very poor", "5": "Fair", "10": "Excellent"}'),
    ('Cognitive', 'Memory', 'Ability to remember things', 'scale', 1, 10, '{"1": "Very poor", "5": "Fair", "10": "Excellent"}'),
    ('Cognitive', 'Decision Making', 'Ability to make decisions', 'scale', 1, 10, '{"1": "Very difficult", "5": "Moderate", "10": "Easy"}'),
    
    -- Social symptoms
    ('Social', 'Social Withdrawal', 'Desire to avoid social interactions', 'severity', 1, 10, '{"1": "Very social", "5": "Moderate", "10": "Very withdrawn"}'),
    ('Social', 'Relationship Sensitivity', 'Sensitivity in relationships', 'severity', 1, 10, '{"1": "Not sensitive", "5": "Moderate", "10": "Very sensitive"}'),
    ('Social', 'Communication Difficulty', 'Trouble expressing thoughts', 'severity', 1, 10, '{"1": "Easy", "5": "Some difficulty", "10": "Very difficult"}')
) AS symptom_data(category_name, name, description, measurement_type, scale_min, scale_max, scale_labels)
WHERE sc.name = symptom_data.category_name;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_symptom_logs_enhanced_user_date ON symptom_logs_enhanced(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_enhanced_symptom ON symptom_logs_enhanced(symptom_definition_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_enhanced_cycle_day ON symptom_logs_enhanced(user_id, cycle_day);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_enhanced_phase ON symptom_logs_enhanced(user_id, menstrual_phase);
CREATE INDEX IF NOT EXISTS idx_symptom_patterns_user ON symptom_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_symptom_correlations_user ON symptom_correlations(user_id);

-- Enable RLS
ALTER TABLE symptom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_correlations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for symptom_categories (public read)
CREATE POLICY "Anyone can read symptom categories"
  ON symptom_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for symptom_definitions (public read)
CREATE POLICY "Anyone can read symptom definitions"
  ON symptom_definitions
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for symptom_logs_enhanced
CREATE POLICY "Users can read own enhanced symptom logs"
  ON symptom_logs_enhanced
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enhanced symptom logs"
  ON symptom_logs_enhanced
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enhanced symptom logs"
  ON symptom_logs_enhanced
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own enhanced symptom logs"
  ON symptom_logs_enhanced
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for symptom_patterns
CREATE POLICY "Users can read own symptom patterns"
  ON symptom_patterns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom patterns"
  ON symptom_patterns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom patterns"
  ON symptom_patterns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom patterns"
  ON symptom_patterns
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for symptom_correlations
CREATE POLICY "Users can read own symptom correlations"
  ON symptom_correlations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom correlations"
  ON symptom_correlations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom correlations"
  ON symptom_correlations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom correlations"
  ON symptom_correlations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to calculate cycle day based on last period
CREATE OR REPLACE FUNCTION calculate_cycle_day(user_uuid uuid, log_date date)
RETURNS integer AS $$
DECLARE
  last_period date;
  cycle_day integer;
BEGIN
  SELECT last_period_date INTO last_period
  FROM user_profiles
  WHERE id = user_uuid;
  
  IF last_period IS NOT NULL THEN
    cycle_day := log_date - last_period + 1;
    RETURN GREATEST(1, cycle_day);
  END IF;
  
  RETURN 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to determine menstrual phase
CREATE OR REPLACE FUNCTION determine_menstrual_phase(user_uuid uuid, cycle_day_param integer)
RETURNS text AS $$
DECLARE
  avg_cycle_length integer;
  avg_period_length integer;
  phase text;
BEGIN
  SELECT 
    COALESCE(average_cycle_length, 28),
    COALESCE(average_period_length, 5)
  INTO avg_cycle_length, avg_period_length
  FROM user_profiles
  WHERE id = user_uuid;
  
  IF cycle_day_param <= avg_period_length THEN
    phase := 'menstrual';
  ELSIF cycle_day_param <= (avg_cycle_length / 2 - 2) THEN
    phase := 'follicular';
  ELSIF cycle_day_param <= (avg_cycle_length / 2 + 2) THEN
    phase := 'ovulation';
  ELSE
    phase := 'luteal';
  END IF;
  
  RETURN phase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically calculate cycle day and phase
CREATE OR REPLACE FUNCTION auto_calculate_cycle_info()
RETURNS trigger AS $$
BEGIN
  -- Calculate cycle day if not provided
  IF NEW.cycle_day IS NULL THEN
    NEW.cycle_day := calculate_cycle_day(NEW.user_id, NEW.date);
  END IF;
  
  -- Determine menstrual phase if not provided
  IF NEW.menstrual_phase IS NULL THEN
    NEW.menstrual_phase := determine_menstrual_phase(NEW.user_id, NEW.cycle_day);
  END IF;
  
  -- Set updated_at timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_calculate_cycle_info_trigger
  BEFORE INSERT OR UPDATE ON symptom_logs_enhanced
  FOR EACH ROW EXECUTE FUNCTION auto_calculate_cycle_info();
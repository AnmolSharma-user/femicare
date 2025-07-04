import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Profile picture helper functions
export const uploadProfilePicture = async (file: File, userEmail: string) => {
  try {
    // Create a unique filename using user email and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
    
    // Upload file to the profile-picture bucket
    const { data, error } = await supabase.storage
      .from('profile-picture')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-picture')
      .getPublicUrl(fileName);

    return { data: { path: data.path, publicUrl }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getProfilePictureUrl = async (userEmail: string) => {
  try {
    // List files for this user
    const { data, error } = await supabase.storage
      .from('profile-picture')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      throw error;
    }

    // Find the most recent file for this user
    const userFiles = data
      .filter(file => file.name.startsWith(userEmail.replace(/[^a-zA-Z0-9]/g, '_')))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (userFiles.length > 0) {
      const { data: { publicUrl } } = supabase.storage
        .from('profile-picture')
        .getPublicUrl(userFiles[0].name);
      
      return { data: publicUrl, error: null };
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteProfilePicture = async (userEmail: string) => {
  try {
    // List files for this user
    const { data, error } = await supabase.storage
      .from('profile-picture')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      throw error;
    }

    // Find all files for this user
    const userFiles = data
      .filter(file => file.name.startsWith(userEmail.replace(/[^a-zA-Z0-9]/g, '_')))
      .map(file => file.name);

    if (userFiles.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('profile-picture')
        .remove(userFiles);

      if (deleteError) {
        throw deleteError;
      }
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Database helper functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return { data, error };
};

export const updateUserSettings = async (userId: string, settings: any) => {
  const { data, error } = await supabase
    .from('user_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  return { data, error };
};

export const getCycleLogs = async (userId: string, limit?: number) => {
  let query = supabase
    .from('cycle_logs')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const addCycleLog = async (userId: string, cycleData: any) => {
  const { data, error } = await supabase
    .from('cycle_logs')
    .insert({ user_id: userId, ...cycleData })
    .select()
    .single();
  return { data, error };
};

export const updateCycleLog = async (logId: string, updates: any) => {
  const { data, error } = await supabase
    .from('cycle_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .single();
  return { data, error };
};

export const deleteCycleLog = async (logId: string) => {
  const { error } = await supabase
    .from('cycle_logs')
    .delete()
    .eq('id', logId);
  return { error };
};

// Enhanced symptom logs functions
export const getEnhancedSymptomLogs = async (userId: string, limit?: number) => {
  let query = supabase
    .from('symptom_logs_enhanced')
    .select(`
      *,
      symptom_definitions (
        id,
        name,
        description,
        measurement_type,
        scale_min,
        scale_max,
        scale_labels,
        symptom_categories (
          id,
          name,
          color_code,
          icon_name
        )
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const addEnhancedSymptomLog = async (userId: string, symptomData: any) => {
  const { data, error } = await supabase
    .from('symptom_logs_enhanced')
    .insert({ user_id: userId, ...symptomData })
    .select(`
      *,
      symptom_definitions (
        id,
        name,
        description,
        measurement_type,
        scale_min,
        scale_max,
        scale_labels,
        symptom_categories (
          id,
          name,
          color_code,
          icon_name
        )
      )
    `)
    .single();
  return { data, error };
};

export const updateEnhancedSymptomLog = async (logId: string, updates: any) => {
  const { data, error } = await supabase
    .from('symptom_logs_enhanced')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', logId)
    .select(`
      *,
      symptom_definitions (
        id,
        name,
        description,
        measurement_type,
        scale_min,
        scale_max,
        scale_labels,
        symptom_categories (
          id,
          name,
          color_code,
          icon_name
        )
      )
    `)
    .single();
  return { data, error };
};

export const deleteEnhancedSymptomLog = async (logId: string) => {
  const { error } = await supabase
    .from('symptom_logs_enhanced')
    .delete()
    .eq('id', logId);
  return { error };
};

// Symptom categories and definitions
export const getSymptomCategories = async () => {
  const { data, error } = await supabase
    .from('symptom_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return { data, error };
};

export const getSymptomDefinitions = async (categoryId?: string) => {
  let query = supabase
    .from('symptom_definitions')
    .select(`
      *,
      symptom_categories (
        id,
        name,
        color_code,
        icon_name
      )
    `)
    .eq('is_active', true);
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;
  return { data, error };
};

// Legacy symptom logs functions (keeping for backward compatibility)
export const getSymptomLogs = async (userId: string, limit?: number) => {
  let query = supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const addSymptomLog = async (userId: string, symptomData: any) => {
  const { data, error } = await supabase
    .from('symptom_logs')
    .insert({ user_id: userId, ...symptomData })
    .select()
    .single();
  return { data, error };
};

export const updateSymptomLog = async (logId: string, updates: any) => {
  const { data, error } = await supabase
    .from('symptom_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .single();
  return { data, error };
};

export const deleteSymptomLog = async (logId: string) => {
  const { error } = await supabase
    .from('symptom_logs')
    .delete()
    .eq('id', logId);
  return { error };
};

export const getMoodLogs = async (userId: string, limit?: number) => {
  let query = supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const addMoodLog = async (userId: string, moodData: any) => {
  const { data, error } = await supabase
    .from('mood_logs')
    .insert({ user_id: userId, ...moodData })
    .select()
    .single();
  return { data, error };
};

export const updateMoodLog = async (logId: string, updates: any) => {
  const { data, error } = await supabase
    .from('mood_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .single();
  return { data, error };
};

export const deleteMoodLog = async (logId: string) => {
  const { error } = await supabase
    .from('mood_logs')
    .delete()
    .eq('id', logId);
  return { error };
};

export const getFertilityLogs = async (userId: string, limit?: number) => {
  let query = supabase
    .from('fertility_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const addFertilityLog = async (userId: string, fertilityData: any) => {
  const { data, error } = await supabase
    .from('fertility_logs')
    .insert({ user_id: userId, ...fertilityData })
    .select()
    .single();
  return { data, error };
};

export const updateFertilityLog = async (logId: string, updates: any) => {
  const { data, error } = await supabase
    .from('fertility_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .single();
  return { data, error };
};

export const deleteFertilityLog = async (logId: string) => {
  const { error } = await supabase
    .from('fertility_logs')
    .delete()
    .eq('id', logId);
  return { error };
};

export const getUserInsights = async (userId: string, limit?: number) => {
  let query = supabase
    .from('user_insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const markInsightAsRead = async (insightId: string) => {
  const { data, error } = await supabase
    .from('user_insights')
    .update({ is_read: true })
    .eq('id', insightId)
    .select()
    .single();
  return { data, error };
};

export const addUserInsight = async (userId: string, insightData: any) => {
  const { data, error } = await supabase
    .from('user_insights')
    .insert({ user_id: userId, ...insightData })
    .select()
    .single();
  return { data, error };
};

// Advanced Analytics Functions
export const getCycleAnalytics = async (userId: string) => {
  const { data: cycles, error } = await supabase
    .from('cycle_logs')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
    .limit(12);

  if (error) return { data: null, error };

  const cycleLengths = cycles.filter(c => c.cycle_length).map(c => c.cycle_length);
  const periodLengths = cycles.filter(c => c.period_length).map(c => c.period_length);
  
  const avgCycleLength = cycleLengths.length > 0 
    ? cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length 
    : 28;
    
  const avgPeriodLength = periodLengths.length > 0 
    ? periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length 
    : 5;

  const regularity = cycleLengths.length > 1 
    ? Math.max(0, 100 - (Math.abs(Math.max(...cycleLengths) - Math.min(...cycleLengths)) * 5))
    : 95;

  return {
    data: {
      averageCycleLength: Math.round(avgCycleLength),
      averagePeriodLength: Math.round(avgPeriodLength),
      regularity: Math.round(regularity),
      totalCycles: cycles.length,
      recentCycles: cycleLengths.slice(0, 3),
      cycleHistory: cycles.map(c => ({
        date: c.start_date,
        length: c.cycle_length,
        periodLength: c.period_length,
        flowIntensity: c.flow_intensity
      }))
    },
    error: null
  };
};

export const getSymptomAnalytics = async (userId: string) => {
  const { data: symptoms, error } = await supabase
    .from('symptom_logs_enhanced')
    .select(`
      *,
      symptom_definitions (
        id,
        name,
        symptom_categories (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) return { data: null, error };

  const symptomCounts = {};
  const severityCounts = { mild: 0, moderate: 0, severe: 0 };
  const categoryCounts = {};
  const cyclePhaseSymptoms = { menstrual: 0, follicular: 0, ovulation: 0, luteal: 0 };
  const dailySymptoms = {};

  symptoms.forEach(symptom => {
    const symptomName = symptom.symptom_definitions?.name || 'Unknown';
    const categoryName = symptom.symptom_definitions?.symptom_categories?.name || 'Other';
    
    symptomCounts[symptomName] = (symptomCounts[symptomName] || 0) + 1;
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    
    if (symptom.menstrual_phase) {
      cyclePhaseSymptoms[symptom.menstrual_phase] = (cyclePhaseSymptoms[symptom.menstrual_phase] || 0) + 1;
    }
    
    const dateKey = symptom.date;
    dailySymptoms[dateKey] = (dailySymptoms[dateKey] || 0) + 1;
    
    if (symptom.severity_level) {
      if (symptom.severity_level <= 3) severityCounts.mild++;
      else if (symptom.severity_level <= 6) severityCounts.moderate++;
      else severityCounts.severe++;
    }
  });

  const mostCommon = Object.entries(symptomCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([symptom, count]) => ({
      symptom,
      frequency: Math.round((count / symptoms.length) * 100)
    }));

  return {
    data: {
      totalLogs: symptoms.length,
      mostCommonSymptoms: mostCommon,
      severityDistribution: severityCounts,
      categoryDistribution: categoryCounts,
      cyclePhaseDistribution: cyclePhaseSymptoms,
      dailySymptomCounts: dailySymptoms,
      categoriesUsed: Object.keys(categoryCounts).length
    },
    error: null
  };
};

export const getAdvancedAnalytics = async (userId: string) => {
  try {
    const [cycleResult, symptomResult, moodResult] = await Promise.all([
      getCycleAnalytics(userId),
      getSymptomAnalytics(userId),
      getMoodLogs(userId, 30)
    ]);

    const cycles = cycleResult.data;
    const symptoms = symptomResult.data;
    const moods = moodResult.data || [];

    // Calculate mood trends
    const moodTrends = moods.reduce((acc, mood) => {
      const date = mood.date;
      acc[date] = {
        mood: mood.mood,
        energy: mood.energy_level,
        stress: mood.stress_level,
        sleep: mood.sleep_quality
      };
      return acc;
    }, {});

    // Calculate correlations
    const correlations = calculateSymptomCorrelations(symptoms);

    // Generate predictions
    const predictions = generatePredictions(cycles, symptoms);

    return {
      data: {
        cycles,
        symptoms,
        moodTrends,
        correlations,
        predictions,
        wellnessScore: calculateWellnessScore(cycles, symptoms, moods)
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

// Helper functions for advanced analytics
const calculateSymptomCorrelations = (symptomsData: any) => {
  if (!symptomsData || !symptomsData.dailySymptomCounts) return [];
  
  // Simplified correlation calculation
  const dates = Object.keys(symptomsData.dailySymptomCounts);
  const correlations = [];
  
  // Example correlation: stress and symptom frequency
  dates.forEach(date => {
    const symptomCount = symptomsData.dailySymptomCounts[date];
    correlations.push({
      date,
      symptomCount,
      correlation: Math.random() * 0.8 + 0.2 // Placeholder for real correlation
    });
  });
  
  return correlations;
};

const generatePredictions = (cycles: any, symptoms: any) => {
  if (!cycles || !cycles.averageCycleLength) return null;
  
  const nextPeriodDate = new Date();
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycles.averageCycleLength);
  
  return {
    nextPeriod: nextPeriodDate.toISOString().split('T')[0],
    confidence: cycles.regularity,
    ovulationWindow: {
      start: new Date(nextPeriodDate.getTime() - (cycles.averageCycleLength - 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date(nextPeriodDate.getTime() - (cycles.averageCycleLength - 12) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };
};

const calculateWellnessScore = (cycles: any, symptoms: any, moods: any[]) => {
  let score = 100;
  
  // Deduct points for irregular cycles
  if (cycles && cycles.regularity < 90) {
    score -= (90 - cycles.regularity) * 0.5;
  }
  
  // Deduct points for high symptom frequency
  if (symptoms && symptoms.totalLogs > 30) {
    score -= Math.min(20, (symptoms.totalLogs - 30) * 0.5);
  }
  
  // Add points for good mood trends
  if (moods.length > 0) {
    const avgMood = moods.reduce((sum, mood) => sum + (mood.energy_level || 5), 0) / moods.length;
    if (avgMood > 7) score += 5;
    else if (avgMood < 4) score -= 10;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

// Data export functions
export const exportUserData = async (userId: string, format: 'json' | 'csv' = 'json') => {
  try {
    const [profile, cycles, symptoms, moods, fertility, settings] = await Promise.all([
      getUserProfile(userId),
      getCycleLogs(userId),
      getEnhancedSymptomLogs(userId),
      getMoodLogs(userId),
      getFertilityLogs(userId),
      getUserSettings(userId)
    ]);

    const exportData = {
      profile: profile.data,
      cycles: cycles.data,
      symptoms: symptoms.data,
      moods: moods.data,
      fertility: fertility.data,
      settings: settings.data,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      return { data: JSON.stringify(exportData, null, 2), error: null };
    }

    return { data: exportData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
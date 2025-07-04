import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// S3 Client configuration for profile pictures
const s3Client = new S3Client({
  forcePathStyle: true,
  region: 'ap-south-1',
  endpoint: 'https://vbrvgacnjyxkrfclixbm.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: '349c240eef446eb597f6b15a8be98780',
    secretAccessKey: '72aeb5fd5215c07ee601c0191afe091eab17b376fb2dbfc98c798a50b8e92218',
  },
});

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

// Profile picture helper functions using S3
export const uploadProfilePicture = async (file: File, userEmail: string) => {
  try {
    // Create a unique filename using user email and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Upload file to the profile-picture bucket using S3
    const uploadCommand = new PutObjectCommand({
      Bucket: 'profile-picture',
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      CacheControl: '3600',
    });

    await s3Client.send(uploadCommand);

    // Construct the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/profile-picture/${fileName}`;

    return { data: { path: fileName, publicUrl }, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return { data: null, error };
  }
};

export const getProfilePictureUrl = async (userEmail: string) => {
  try {
    // List files for this user using S3
    const listCommand = new ListObjectsV2Command({
      Bucket: 'profile-picture',
      Prefix: userEmail.replace(/[^a-zA-Z0-9]/g, '_'),
    });

    const response = await s3Client.send(listCommand);

    if (response.Contents && response.Contents.length > 0) {
      // Sort by last modified date to get the most recent file
      const sortedFiles = response.Contents.sort((a, b) => {
        const dateA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
        const dateB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
        return dateB - dateA;
      });

      const mostRecentFile = sortedFiles[0];
      if (mostRecentFile.Key) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/profile-picture/${mostRecentFile.Key}`;
        return { data: publicUrl, error: null };
      }
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Get profile picture error:', error);
    return { data: null, error };
  }
};

export const deleteProfilePicture = async (userEmail: string) => {
  try {
    // List files for this user using S3
    const listCommand = new ListObjectsV2Command({
      Bucket: 'profile-picture',
      Prefix: userEmail.replace(/[^a-zA-Z0-9]/g, '_'),
    });

    const response = await s3Client.send(listCommand);

    if (response.Contents && response.Contents.length > 0) {
      // Delete all files for this user
      for (const file of response.Contents) {
        if (file.Key) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: 'profile-picture',
            Key: file.Key,
          });
          await s3Client.send(deleteCommand);
        }
      }
    }

    return { error: null };
  } catch (error) {
    console.error('Delete profile picture error:', error);
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
  // Get the current user to ensure we have the email
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { data: null, error: userError || new Error('User not authenticated') };
  }

  // Ensure we're updating the correct user and include updated_at and email
  const updateData = {
    ...updates,
    email: user.email, // Always include the email from the authenticated user
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      { id: userId, ...updateData },
      { 
        onConflict: 'id',
        ignoreDuplicates: false 
      }
    )
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
    .upsert(
      { user_id: userId, ...settings, updated_at: new Date().toISOString() },
      { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      }
    )
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
    .insert({ 
      user_id: userId, 
      ...cycleData,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  // After adding a cycle log, update the user's last period date
  if (!error && data) {
    await updateUserProfile(userId, {
      last_period_date: cycleData.start_date
    });
  }
  
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
    .insert({ 
      user_id: userId, 
      ...symptomData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
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
    .insert({ 
      user_id: userId, 
      ...symptomData,
      created_at: new Date().toISOString()
    })
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
    .insert({ 
      user_id: userId, 
      ...moodData,
      created_at: new Date().toISOString()
    })
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
    .insert({ 
      user_id: userId, 
      ...fertilityData,
      created_at: new Date().toISOString()
    })
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
    .insert({ 
      user_id: userId, 
      ...insightData,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  return { data, error };
};

// Advanced Analytics Functions with Real-time Data
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
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;
    
  const avgPeriodLength = periodLengths.length > 0 
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : 5;

  // Calculate regularity based on standard deviation
  let regularity = 95;
  if (cycleLengths.length > 1) {
    const mean = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / cycleLengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert standard deviation to regularity percentage
    regularity = Math.max(0, Math.min(100, 100 - (stdDev * 10)));
  }

  return {
    data: {
      averageCycleLength: avgCycleLength,
      averagePeriodLength: avgPeriodLength,
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
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([symptom, count]) => ({
      symptom,
      frequency: Math.round(((count as number) / symptoms.length) * 100)
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
    const [cycleResult, symptomResult, moodResult, profileResult] = await Promise.all([
      getCycleAnalytics(userId),
      getSymptomAnalytics(userId),
      getMoodLogs(userId, 30),
      getUserProfile(userId)
    ]);

    const cycles = cycleResult.data;
    const symptoms = symptomResult.data;
    const moods = moodResult.data || [];
    const profile = profileResult.data;

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

    // Generate real-time predictions based on actual data
    const predictions = generateRealTimePredictions(profile, cycles, symptoms);

    return {
      data: {
        cycles,
        symptoms,
        moodTrends,
        predictions,
        wellnessScore: calculateWellnessScore(cycles, symptoms, moods)
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};

// Enhanced prediction algorithm
const generateRealTimePredictions = (profile: any, cycles: any, symptoms: any) => {
  if (!profile || !profile.last_period_date) return null;
  
  const lastPeriodDate = new Date(profile.last_period_date);
  const today = new Date();
  const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Use actual cycle length from profile or calculated average
  const cycleLength = cycles?.averageCycleLength || profile.average_cycle_length || 28;
  const periodLength = cycles?.averagePeriodLength || profile.average_period_length || 5;
  
  // Calculate next period date
  const nextPeriodDate = new Date(lastPeriodDate);
  nextPeriodDate.setDate(lastPeriodDate.getDate() + cycleLength);
  
  // Calculate ovulation window (typically 14 days before next period)
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(nextPeriodDate.getDate() - 14);
  
  const fertilityStart = new Date(ovulationDate);
  fertilityStart.setDate(ovulationDate.getDate() - 5);
  
  const fertilityEnd = new Date(ovulationDate);
  fertilityEnd.setDate(ovulationDate.getDate() + 1);
  
  // Calculate confidence based on cycle regularity
  const confidence = cycles?.regularity || 85;
  
  return {
    nextPeriod: nextPeriodDate.toISOString().split('T')[0],
    confidence: confidence,
    ovulationWindow: {
      start: fertilityStart.toISOString().split('T')[0],
      end: fertilityEnd.toISOString().split('T')[0]
    },
    currentCycleDay: daysSinceLastPeriod + 1,
    daysUntilNextPeriod: Math.max(0, Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
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

// Real-time data refresh helper
export const refreshUserData = async (userId: string) => {
  try {
    const [profile, cycles, symptoms, moods, analytics] = await Promise.all([
      getUserProfile(userId),
      getCycleLogs(userId, 6),
      getEnhancedSymptomLogs(userId, 20),
      getMoodLogs(userId, 10),
      getAdvancedAnalytics(userId)
    ]);

    return {
      profile: profile.data,
      cycles: cycles.data,
      symptoms: symptoms.data,
      moods: moods.data,
      analytics: analytics.data,
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};
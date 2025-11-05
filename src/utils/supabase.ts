import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation with better error messages
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase Configuration Error:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseKey ? 'Present' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Expected format: https://your-project.supabase.co');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Enhanced error handling wrapper
const handleSupabaseError = (operation: string, error: any) => {
  console.error(`Supabase ${operation} error:`, error);
  
  if (error.message?.includes('Failed to fetch')) {
    return {
      ...error,
      message: 'Network connection failed. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR'
    };
  }
  
  if (error.message?.includes('Invalid API key')) {
    return {
      ...error,
      message: 'Authentication failed. Please check your Supabase configuration.',
      code: 'AUTH_ERROR'
    };
  }
  
  return error;
};

// Profile picture helper functions
export const uploadProfilePicture = async (file: File, userEmail: string) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    // Validate file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedEmail}/${Date.now()}.${fileExt}`;

    // Upload file using Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-picture')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-picture')
      .getPublicUrl(fileName);

    return { data: { path: fileName, publicUrl }, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return { data: null, error: handleSupabaseError('uploadProfilePicture', error) };
  }
};

export const getProfilePictureUrl = async (userEmail: string) => {
  try {
    const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const { data, error } = await supabase.storage
      .from('profile-picture')
      .list(sanitizedEmail);

    if (error) throw error;

    if (data && data.length > 0) {
      // Sort by created_at to get the most recent file
      const sortedFiles = data.sort((a, b) => {
        return b.created_at.localeCompare(a.created_at);
      });

      const { data: { publicUrl } } = supabase.storage
        .from('profile-picture')
        .getPublicUrl(`${sanitizedEmail}/${sortedFiles[0].name}`);

      return { data: publicUrl, error: null };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Get profile picture error:', error);
    return { data: null, error: handleSupabaseError('getProfilePictureUrl', error) };
  }
};

export const deleteProfilePicture = async (userEmail: string) => {
  try {
    const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const { data: files, error: listError } = await supabase.storage
      .from('profile-picture')
      .list(sanitizedEmail);

    if (listError) throw listError;

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${sanitizedEmail}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from('profile-picture')
        .remove(filePaths);

      if (deleteError) throw deleteError;
    }

    return { error: null };
  } catch (error) {
    console.error('Delete profile picture error:', error);
    return { error: handleSupabaseError('deleteProfilePicture', error) };
  }
};

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error: error ? handleSupabaseError('signUp', error) : null };
  } catch (error) {
    return { data: null, error: handleSupabaseError('signUp', error) };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error: error ? handleSupabaseError('signIn', error) : null };
  } catch (error) {
    return { data: null, error: handleSupabaseError('signIn', error) };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? handleSupabaseError('signOut', error) : null };
  } catch (error) {
    return { error: handleSupabaseError('signOut', error) };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error: error ? handleSupabaseError('getCurrentUser', error) : null };
  } catch (error) {
    return { user: null, error: handleSupabaseError('getCurrentUser', error) };
  }
};

// Database helper functions
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error: error ? handleSupabaseError('getUserProfile', error) : null };
  } catch (error) {
    return { data: null, error: handleSupabaseError('getUserProfile', error) };
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    // Get the current user to ensure we have the email
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: handleSupabaseError('updateUserProfile', userError || new Error('User not authenticated')) };
    }

    // Ensure we're updating the correct user and include updated_at and email
    const updateData = {
      ...updates,
      email: user.email,
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
    
    return { data, error: error ? handleSupabaseError('updateUserProfile', error) : null };
  } catch (error) {
    return { data: null, error: handleSupabaseError('updateUserProfile', error) };
  }
};

export const getUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return { data, error: error ? handleSupabaseError('getUserSettings', error) : null };
  } catch (error) {
    return { data: null, error: handleSupabaseError('getUserSettings', error) };
  }
};

export const updateUserSettings = async (userId: string, settings: any) => {
  try {
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
    return { data, error: error ? handleSupabaseError('updateUserSettings', error) : null };
  } catch (error) {
    return { data: null, error: handleSupabaseError('updateUserSettings', error) };
  }
};

export const refreshUserData = async (userId: string) => {
  try {
    const [profile, settings] = await Promise.all([
      getUserProfile(userId),
      getUserSettings(userId)
    ]);

    return {
      profile: profile.data,
      settings: settings.data,
      error: null
    };
  } catch (error) {
    return { data: null, error: handleSupabaseError('refreshUserData', error) };
  }
};

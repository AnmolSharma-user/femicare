import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

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

// S3 Client configuration with your credentials
const s3Client = new S3Client({
  forcePathStyle: true,
  region: 'ap-south-1',
  endpoint: 'https://bnalfkbveluctojtnbmk.storage.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: 'f5831bf47e0dea4ad47d02c8fa0c646e',
    secretAccessKey: '00082639bb74c3cac9acd10884e4a48e1125c7aa449d417aeea02933abccc2d1',
  },
});

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
    return { data: null, error: handleSupabaseError('uploadProfilePicture', error) };
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
    return { data: null, error: handleSupabaseError('getProfilePictureUrl', error) };
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
    return { error: handleSupabaseError('deleteProfilePicture', error) };
  }
};

// Keep all your existing helper functions below this point...

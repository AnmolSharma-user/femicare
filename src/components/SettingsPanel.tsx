import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Lock, Calendar, Download, Upload, Trash2, Camera, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserSettings, 
  updateUserSettings,
  exportUserData,
  uploadProfilePicture,
  getProfilePictureUrl,
  deleteProfilePicture
} from '../utils/supabase';
import NotificationSetup from './NotificationSetup';
import ImportDataModal from './ImportDataModal';
import { scheduleReminders, isNotificationEnabled } from '../utils/notifications';

const SettingsPanel = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadProfilePicture();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [profileResult, settingsResult] = await Promise.all([
        getUserProfile(user.id),
        getUserSettings(user.id)
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      } else {
        // If no profile exists, create a basic one
        setProfile({
          id: user.id,
          email: user.email,
          first_name: '',
          last_name: '',
          date_of_birth: '',
          height: '',
          weight: '',
          average_cycle_length: 28,
          average_period_length: 5,
          last_period_date: '',
          contraception_method: '',
          health_goals: []
        });
      }
      
      if (settingsResult.data) {
        setSettings(settingsResult.data);
      } else {
        // If no settings exist, create default ones
        setSettings({
          user_id: user.id,
          notifications_enabled: true,
          period_reminders: true,
          fertility_reminders: true,
          ovulation_reminders: true,
          symptom_reminders: true,
          medication_reminders: false,
          hydration_reminders: true,
          reminder_time: '09:00',
          theme_preference: 'system',
          language: 'en',
          data_export_format: 'json',
          anonymous_analytics: true,
          third_party_integration: false
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setSaveMessage('Error loading user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProfilePicture = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await getProfilePictureUrl(user.email);
      if (!error && data) {
        setProfilePictureUrl(data);
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.email) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSaveMessage('Please select a valid image file.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage('Image size must be less than 5MB.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setUploadingPicture(true);
    setSaveMessage('');

    try {
      // Delete existing profile picture first
      await deleteProfilePicture(user.email);

      // Upload new profile picture
      const { data, error } = await uploadProfilePicture(file, user.email);
      
      if (error) {
        throw error;
      }

      if (data?.publicUrl) {
        setProfilePictureUrl(data.publicUrl);
        setSaveMessage('Profile picture updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setSaveMessage('Error uploading profile picture. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setUploadingPicture(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!user?.email) return;

    setUploadingPicture(true);
    setSaveMessage('');

    try {
      const { error } = await deleteProfilePicture(user.email);
      
      if (error) {
        throw error;
      }

      setProfilePictureUrl(null);
      setSaveMessage('Profile picture deleted successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      setSaveMessage('Error deleting profile picture. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    setSaveMessage('');
    
    try {
      // Prepare profile data for update
      const profileData = {
        email: profile.email,
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        date_of_birth: profile.date_of_birth || null,
        height: profile.height ? parseInt(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        average_cycle_length: profile.average_cycle_length ? parseInt(profile.average_cycle_length) : 28,
        average_period_length: profile.average_period_length ? parseInt(profile.average_period_length) : 5,
        last_period_date: profile.last_period_date || null,
        contraception_method: profile.contraception_method || null,
        health_goals: profile.health_goals || []
      };

      const { data, error } = await updateUserProfile(user.id, profileData);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setProfile(data);
      }
      
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Error updating profile. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user || !settings) return;

    setSaving(true);
    setSaveMessage('');
    
    try {
      const { data, error } = await updateUserSettings(user.id, settings);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setSettings(data);
        
        // Reschedule notifications if they're enabled
        if (isNotificationEnabled() && profile) {
          scheduleReminders(profile, data);
        }
      }
      
      setSaveMessage('Settings updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setSaveMessage('Error updating settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv' = 'json') => {
    if (!user) return;

    try {
      const { data, error } = await exportUserData(user.id, format);
      if (error) throw error;

      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `femcare-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSaveMessage('Error exporting data. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const handleImportComplete = () => {
    // Refresh user data after import
    loadUserData();
    setSaveMessage('Data imported successfully! Your dashboard will update shortly.');
    setTimeout(() => setSaveMessage(''), 5000);
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'cycle', label: 'Cycle Settings', icon: Calendar },
    { id: 'data', label: 'Data Management', icon: Download },
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
            {profilePictureUrl ? (
              <img 
                src={profilePictureUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={() => setProfilePictureUrl(null)}
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          {uploadingPicture && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {profile?.first_name || profile?.last_name 
              ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
              : 'User'
            }
          </h3>
          <p className="text-gray-500">{user?.email}</p>
          <div className="flex items-center space-x-3 mt-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={uploadingPicture}
              />
              <span className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium text-sm">
                <Camera className="w-4 h-4" />
                <span>{profilePictureUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </span>
            </label>
            {profilePictureUrl && (
              <button
                onClick={handleDeleteProfilePicture}
                disabled={uploadingPicture}
                className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium text-sm"
              >
                <X className="w-4 h-4" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={profile?.first_name || ''}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={profile?.last_name || ''}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your last name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={profile?.date_of_birth || ''}
            onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            value={profile?.height || ''}
            onChange={(e) => setProfile({ ...profile, height: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="165"
            min="100"
            max="250"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={profile?.weight || ''}
            onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="60.0"
            min="30"
            max="200"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <NotificationSetup />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Period Reminders</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Period Start Reminder</p>
              <p className="text-sm text-gray-500">2 days before predicted start</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings?.period_reminders || false}
              onChange={(e) => setSettings({ ...settings, period_reminders: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Fertility Window</p>
              <p className="text-sm text-gray-500">Notify when fertile window begins</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings?.fertility_reminders || false}
              onChange={(e) => setSettings({ ...settings, fertility_reminders: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Ovulation Day</p>
              <p className="text-sm text-gray-500">Reminder on predicted ovulation day</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings?.ovulation_reminders || false}
              onChange={(e) => setSettings({ ...settings, ovulation_reminders: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Daily Reminders</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Symptom Tracking</p>
              <p className="text-sm text-gray-500">Daily reminder to log symptoms</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings?.symptom_reminders || false}
              onChange={(e) => setSettings({ ...settings, symptom_reminders: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Medication Reminder</p>
              <p className="text-sm text-gray-500">Remind to take supplements</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings?.medication_reminders || false}
              onChange={(e) => setSettings({ ...settings, medication_reminders: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Hydration Reminder</p>
              <p className="text-sm text-gray-500">Drink water reminders</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings?.hydration_reminders || false}
              onChange={(e) => setSettings({ ...settings, hydration_reminders: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Reminder Time</h3>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Daily reminder time:</label>
          <input
            type="time"
            value={settings?.reminder_time || '09:00'}
            onChange={(e) => setSettings({ ...settings, reminder_time: e.target.value })}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Privacy</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Anonymous Analytics</p>
              <p className="text-sm text-gray-500">Help improve the app with anonymous data</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings?.anonymous_analytics || false}
              onChange={(e) => setSettings({ ...settings, anonymous_analytics: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Third-party Integration</p>
              <p className="text-sm text-gray-500">Allow health app integrations</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings?.third_party_integration || false}
              onChange={(e) => setSettings({ ...settings, third_party_integration: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        <div className="space-y-3">
          <button className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors">
            <p className="font-medium text-gray-900">Change Password</p>
            <p className="text-sm text-gray-500">Update your account password</p>
          </button>
          <button className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors">
            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">Add an extra layer of security</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCycleSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Average Cycle Length
          </label>
          <input
            type="number"
            value={profile?.average_cycle_length || 28}
            onChange={(e) => setProfile({ ...profile, average_cycle_length: e.target.value })}
            min="21"
            max="35"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Typical range: 21-35 days</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Average Period Length
          </label>
          <input
            type="number"
            value={profile?.average_period_length || 5}
            onChange={(e) => setProfile({ ...profile, average_period_length: e.target.value })}
            min="3"
            max="7"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Typical range: 3-7 days</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Period Date
          </label>
          <input
            type="date"
            value={profile?.last_period_date || ''}
            onChange={(e) => setProfile({ ...profile, last_period_date: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraception Method
          </label>
          <select
            value={profile?.contraception_method || ''}
            onChange={(e) => setProfile({ ...profile, contraception_method: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select method</option>
            <option value="None">None</option>
            <option value="Birth control pills">Birth control pills</option>
            <option value="IUD (Hormonal)">IUD (Hormonal)</option>
            <option value="IUD (Copper)">IUD (Copper)</option>
            <option value="Implant">Implant</option>
            <option value="Injection">Injection</option>
            <option value="Patch">Patch</option>
            <option value="Ring">Ring</option>
            <option value="Condoms">Condoms</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
        <div className="space-y-3">
          <button 
            onClick={() => handleExportData('json')}
            className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-left hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Export All Data (JSON)</p>
                <p className="text-sm text-green-700">Download your complete health data</p>
              </div>
            </div>
          </button>
          <button 
            onClick={() => handleExportData('csv')}
            className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg text-left hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Export Data (CSV)</p>
                <p className="text-sm text-blue-700">Export data in spreadsheet format</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Import Data</h3>
        <div className="space-y-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="w-full p-4 bg-purple-50 border border-purple-200 rounded-lg text-left hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Upload className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Import from Another App</p>
                <p className="text-sm text-purple-700">Upload data from other health apps (Clue, Flo, etc.)</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        <div className="space-y-3">
          <button className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-left hover:bg-red-100 transition-colors">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Delete All Data</p>
                <p className="text-sm text-red-700">Permanently remove all your data</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'privacy':
        return renderPrivacySection();
      case 'cycle':
        return renderCycleSection();
      case 'data':
        return renderDataSection();
      default:
        return renderProfileSection();
    }
  };

  const handleSave = () => {
    if (activeSection === 'profile' || activeSection === 'cycle') {
      handleSaveProfile();
    } else if (activeSection === 'notifications') {
      handleSaveSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-gray-300 text-lg">
              Customize your FemCare experience
            </p>
          </div>
          <Settings className="w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.includes('Error') 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {renderContent()}
            
            {/* Save Button */}
            {activeSection !== 'data' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => loadUserData()}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={saving}
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportDataModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
};

export default SettingsPanel;
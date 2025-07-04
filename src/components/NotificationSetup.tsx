import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X, Settings, Clock } from 'lucide-react';
import { 
  initializeNotifications, 
  requestNotificationPermission, 
  isNotificationEnabled,
  showNotification,
  scheduleReminders
} from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getUserSettings } from '../utils/supabase';

interface NotificationSetupProps {
  onClose?: () => void;
  showAsModal?: boolean;
}

const NotificationSetup: React.FC<NotificationSetupProps> = ({ onClose, showAsModal = false }) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    checkNotificationStatus();
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [profileResult, settingsResult] = await Promise.all([
        getUserProfile(user.id),
        getUserSettings(user.id)
      ]);

      if (profileResult.data) setProfile(profileResult.data);
      if (settingsResult.data) setSettings(settingsResult.data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkNotificationStatus = async () => {
    setPermission(Notification.permission);
    
    const initialized = await initializeNotifications();
    setIsInitialized(initialized);
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    
    try {
      // Initialize service worker
      const initialized = await initializeNotifications();
      if (!initialized) {
        alert('Notifications are not supported in your browser.');
        return;
      }

      // Request permission
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      if (newPermission === 'granted') {
        // Schedule reminders if user data is available
        if (profile && settings) {
          scheduleReminders(profile, settings);
        }
      } else if (newPermission === 'denied') {
        alert('Notifications were denied. You can enable them later in your browser settings.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Error enabling notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!isNotificationEnabled()) {
      alert('Please enable notifications first.');
      return;
    }

    try {
      await showNotification({
        title: '🎉 Test Notification',
        body: 'Great! Your notifications are working perfectly.',
        tag: 'test-notification',
        data: { type: 'test' }
      });
      
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Error sending test notification.');
    }
  };

  const getStatusIcon = () => {
    if (permission === 'granted' && isInitialized) {
      return <Check className="w-6 h-6 text-green-600" />;
    } else if (permission === 'denied') {
      return <X className="w-6 h-6 text-red-600" />;
    } else {
      return <Bell className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (permission === 'granted' && isInitialized) {
      return 'Notifications Enabled';
    } else if (permission === 'denied') {
      return 'Notifications Denied';
    } else {
      return 'Notifications Disabled';
    }
  };

  const getStatusColor = () => {
    if (permission === 'granted' && isInitialized) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (permission === 'denied') {
      return 'text-red-600 bg-red-50 border-red-200';
    } else {
      return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enable Notifications</h2>
        <p className="text-gray-600">
          Get timely reminders for your period, fertility window, and daily health tracking.
        </p>
      </div>

      {/* Current Status */}
      <div className={`p-4 rounded-xl border-2 ${getStatusColor()}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-medium">{getStatusText()}</h3>
            <p className="text-sm opacity-75">
              {permission === 'granted' && isInitialized && 'You\'ll receive health reminders based on your preferences.'}
              {permission === 'denied' && 'You can enable notifications in your browser settings.'}
              {permission === 'default' && 'Click the button below to enable notifications.'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">What you'll be reminded about:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🩸</span>
              </div>
              <h4 className="font-medium text-pink-900">Period Reminders</h4>
            </div>
            <p className="text-sm text-pink-700">
              Get notified 2 days before, 1 day before, and on your expected period day.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💕</span>
              </div>
              <h4 className="font-medium text-purple-900">Fertility Window</h4>
            </div>
            <p className="text-sm text-purple-700">
              Reminders about your fertility window and ovulation day.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
              <h4 className="font-medium text-blue-900">Daily Check-ins</h4>
            </div>
            <p className="text-sm text-blue-700">
              Gentle reminders to log your symptoms, mood, and daily health data.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💧</span>
              </div>
              <h4 className="font-medium text-green-900">Wellness Reminders</h4>
            </div>
            <p className="text-sm text-green-700">
              Hydration reminders and medication alerts based on your preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Reminder Time */}
      {settings && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Reminder Time</h4>
          </div>
          <p className="text-sm text-gray-600">
            You'll receive daily reminders at {settings.reminder_time || '09:00'}. 
            You can change this in your settings.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {permission !== 'granted' && (
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Bell className="w-5 h-5" />
                <span>Enable Notifications</span>
              </>
            )}
          </button>
        )}

        {permission === 'granted' && isInitialized && (
          <button
            onClick={handleTestNotification}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center space-x-2"
          >
            {testNotificationSent ? (
              <>
                <Check className="w-5 h-5" />
                <span>Test Sent!</span>
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                <span>Send Test Notification</span>
              </>
            )}
          </button>
        )}

        {permission === 'denied' && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Notifications are blocked. To enable them:
            </p>
            <ol className="text-sm text-gray-600 text-left space-y-1">
              <li>1. Click the lock icon in your browser's address bar</li>
              <li>2. Change notifications from "Block" to "Allow"</li>
              <li>3. Refresh this page and try again</li>
            </ol>
          </div>
        )}
      </div>

      {/* Close Button for Modal */}
      {showAsModal && onClose && (
        <button
          onClick={onClose}
          className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium"
        >
          Maybe Later
        </button>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {content}
    </div>
  );
};

export default NotificationSetup;
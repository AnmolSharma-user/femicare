import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Play, Settings } from 'lucide-react';
import { 
  initializeNotifications, 
  requestNotificationPermission, 
  isNotificationEnabled,
  showNotification,
  scheduleReminders,
  clearAllNotifications
} from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getUserSettings } from '../utils/supabase';

const NotificationTest: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
      runInitialTests();
    }
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

  const runInitialTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Service Worker Support
      results.serviceWorkerSupport = 'serviceWorker' in navigator;
      
      // Test 2: Notification API Support
      results.notificationSupport = 'Notification' in window;
      
      // Test 3: Current Permission
      results.currentPermission = Notification.permission;
      
      // Test 4: Service Worker Registration
      try {
        const registration = await navigator.serviceWorker.getRegistration('/sw.js');
        results.serviceWorkerRegistered = !!registration;
        results.serviceWorkerState = registration?.active?.state || 'not found';
      } catch (error) {
        results.serviceWorkerRegistered = false;
        results.serviceWorkerError = error.message;
      }

      // Test 5: Initialize Notifications
      try {
        results.initializationSuccess = await initializeNotifications();
      } catch (error) {
        results.initializationSuccess = false;
        results.initializationError = error.message;
      }

      // Test 6: Check if enabled
      results.notificationsEnabled = isNotificationEnabled();

      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const testNotificationPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      setTestResults(prev => ({
        ...prev,
        permissionRequested: true,
        newPermission: permission
      }));
      
      // Re-run tests after permission change
      await runInitialTests();
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const testBasicNotification = async () => {
    try {
      await showNotification({
        title: '🧪 Basic Test Notification',
        body: 'This is a basic notification test.',
        tag: 'basic-test'
      });
      
      setTestResults(prev => ({
        ...prev,
        basicNotificationSent: true
      }));
    } catch (error) {
      console.error('Error sending basic notification:', error);
      setTestResults(prev => ({
        ...prev,
        basicNotificationError: error.message
      }));
    }
  };

  const testPeriodReminder = async () => {
    if (!profile) {
      alert('Profile data not loaded. Please ensure you have completed onboarding.');
      return;
    }

    try {
      await showNotification({
        title: '🩸 Period Reminder Test',
        body: 'Your period is expected in 2 days. Time to prepare!',
        tag: 'period-test',
        data: { type: 'period', days: 2 }
      });
      
      setTestResults(prev => ({
        ...prev,
        periodReminderSent: true
      }));
    } catch (error) {
      console.error('Error sending period reminder:', error);
    }
  };

  const testFertilityReminder = async () => {
    try {
      await showNotification({
        title: '💕 Fertility Window Test',
        body: 'Your fertility window starts tomorrow. Consider tracking ovulation signs!',
        tag: 'fertility-test',
        data: { type: 'fertility', phase: 'start' }
      });
      
      setTestResults(prev => ({
        ...prev,
        fertilityReminderSent: true
      }));
    } catch (error) {
      console.error('Error sending fertility reminder:', error);
    }
  };

  const testScheduledReminders = async () => {
    if (!profile || !settings) {
      alert('Profile or settings data not loaded.');
      return;
    }

    try {
      const scheduledIds = scheduleReminders(profile, settings);
      setTestResults(prev => ({
        ...prev,
        scheduledReminders: scheduledIds.length,
        scheduledIds
      }));
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  };

  const testClearNotifications = async () => {
    try {
      await clearAllNotifications();
      setTestResults(prev => ({
        ...prev,
        notificationsCleared: true
      }));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === true) return <Check className="w-5 h-5 text-green-600" />;
    if (status === false) return <X className="w-5 h-5 text-red-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusColor = (status: boolean | undefined) => {
    if (status === true) return 'bg-green-50 border-green-200 text-green-800';
    if (status === false) return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification System Test</h1>
        <p className="text-gray-600">
          Comprehensive testing of the notification system functionality
        </p>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border-2 ${getStatusColor(testResults.serviceWorkerSupport)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.serviceWorkerSupport)}
              <div>
                <h3 className="font-medium">Service Worker Support</h3>
                <p className="text-sm opacity-75">
                  {testResults.serviceWorkerSupport ? 'Supported' : 'Not Supported'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${getStatusColor(testResults.notificationSupport)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.notificationSupport)}
              <div>
                <h3 className="font-medium">Notification API</h3>
                <p className="text-sm opacity-75">
                  {testResults.notificationSupport ? 'Supported' : 'Not Supported'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${getStatusColor(testResults.serviceWorkerRegistered)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.serviceWorkerRegistered)}
              <div>
                <h3 className="font-medium">Service Worker Registration</h3>
                <p className="text-sm opacity-75">
                  {testResults.serviceWorkerRegistered ? 
                    `Registered (${testResults.serviceWorkerState})` : 
                    'Not Registered'
                  }
                </p>
                {testResults.serviceWorkerError && (
                  <p className="text-xs text-red-600 mt-1">{testResults.serviceWorkerError}</p>
                )}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${getStatusColor(testResults.initializationSuccess)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.initializationSuccess)}
              <div>
                <h3 className="font-medium">Initialization</h3>
                <p className="text-sm opacity-75">
                  {testResults.initializationSuccess ? 'Success' : 'Failed'}
                </p>
                {testResults.initializationError && (
                  <p className="text-xs text-red-600 mt-1">{testResults.initializationError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Permission Status</h2>
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border-2 ${
            testResults.currentPermission === 'granted' ? 'bg-green-50 border-green-200 text-green-800' :
            testResults.currentPermission === 'denied' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5" />
                <div>
                  <h3 className="font-medium">Current Permission</h3>
                  <p className="text-sm opacity-75">
                    {testResults.currentPermission || 'Unknown'}
                  </p>
                </div>
              </div>
              {testResults.currentPermission !== 'granted' && (
                <button
                  onClick={testNotificationPermission}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Request Permission
                </button>
              )}
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${getStatusColor(testResults.notificationsEnabled)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.notificationsEnabled)}
              <div>
                <h3 className="font-medium">Notifications Enabled</h3>
                <p className="text-sm opacity-75">
                  {testResults.notificationsEnabled ? 'Ready to send notifications' : 'Not ready'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testBasicNotification}
            disabled={!testResults.notificationsEnabled}
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <Play className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <h3 className="font-medium text-blue-900">Test Basic Notification</h3>
                <p className="text-sm text-blue-700">Send a simple test notification</p>
              </div>
            </div>
            {testResults.basicNotificationSent && (
              <div className="mt-2 text-sm text-green-600">✓ Sent successfully</div>
            )}
            {testResults.basicNotificationError && (
              <div className="mt-2 text-sm text-red-600">✗ {testResults.basicNotificationError}</div>
            )}
          </button>

          <button
            onClick={testPeriodReminder}
            disabled={!testResults.notificationsEnabled || !profile}
            className="p-4 bg-pink-50 border border-pink-200 rounded-xl hover:bg-pink-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <span className="text-pink-600">🩸</span>
              <div className="text-left">
                <h3 className="font-medium text-pink-900">Test Period Reminder</h3>
                <p className="text-sm text-pink-700">Send a period reminder notification</p>
              </div>
            </div>
            {testResults.periodReminderSent && (
              <div className="mt-2 text-sm text-green-600">✓ Sent successfully</div>
            )}
          </button>

          <button
            onClick={testFertilityReminder}
            disabled={!testResults.notificationsEnabled}
            className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <span className="text-purple-600">💕</span>
              <div className="text-left">
                <h3 className="font-medium text-purple-900">Test Fertility Reminder</h3>
                <p className="text-sm text-purple-700">Send a fertility window notification</p>
              </div>
            </div>
            {testResults.fertilityReminderSent && (
              <div className="mt-2 text-sm text-green-600">✓ Sent successfully</div>
            )}
          </button>

          <button
            onClick={testScheduledReminders}
            disabled={!testResults.notificationsEnabled || !profile || !settings}
            className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <h3 className="font-medium text-green-900">Test Scheduled Reminders</h3>
                <p className="text-sm text-green-700">Schedule reminders based on profile</p>
              </div>
            </div>
            {testResults.scheduledReminders && (
              <div className="mt-2 text-sm text-green-600">
                ✓ Scheduled {testResults.scheduledReminders} reminders
              </div>
            )}
          </button>
        </div>
      </div>

      {/* User Data Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Data Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border-2 ${getStatusColor(!!profile)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(!!profile)}
              <div>
                <h3 className="font-medium">Profile Data</h3>
                <p className="text-sm opacity-75">
                  {profile ? 'Loaded' : 'Not loaded'}
                </p>
                {profile && (
                  <div className="mt-2 text-xs space-y-1">
                    <p>Last period: {profile.last_period_date || 'Not set'}</p>
                    <p>Cycle length: {profile.average_cycle_length || 'Not set'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${getStatusColor(!!settings)}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon(!!settings)}
              <div>
                <h3 className="font-medium">Settings Data</h3>
                <p className="text-sm opacity-75">
                  {settings ? 'Loaded' : 'Not loaded'}
                </p>
                {settings && (
                  <div className="mt-2 text-xs space-y-1">
                    <p>Reminder time: {settings.reminder_time || 'Not set'}</p>
                    <p>Period reminders: {settings.period_reminders ? 'On' : 'Off'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={runInitialTests}
          disabled={loading}
          className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Running Tests...' : 'Re-run Tests'}
        </button>
        
        <button
          onClick={testClearNotifications}
          className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors"
        >
          Clear All Notifications
        </button>
      </div>

      {/* Debug Info */}
      <details className="bg-gray-50 rounded-xl p-4">
        <summary className="cursor-pointer font-medium text-gray-900 mb-2">
          Debug Information
        </summary>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default NotificationTest;
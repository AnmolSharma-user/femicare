// Enhanced notification utilities with cross-browser support
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export interface ReminderSettings {
  periodReminders: boolean;
  fertilityReminders: boolean;
  ovulationReminders: boolean;
  symptomReminders: boolean;
  medicationReminders: boolean;
  hydrationReminders: boolean;
  reminderTime: string;
}

// Browser detection utilities
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  const isMobile = /Mobi|Android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);

  return {
    isChrome,
    isSafari,
    isFirefox,
    isEdge,
    isMobile,
    isIOS,
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsNotifications: 'Notification' in window,
    supportsPushManager: 'PushManager' in window
  };
};

class NotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';
  private browserInfo = getBrowserInfo();
  private scheduledNotifications: Map<string, number> = new Map();

  constructor() {
    this.permission = Notification.permission;
    this.initializeBrowserSpecificFeatures();
  }

  private initializeBrowserSpecificFeatures() {
    // Safari-specific initialization
    if (this.browserInfo.isSafari) {
      // Safari requires user interaction for notifications
      console.log('Safari detected - notifications require user interaction');
    }

    // Chrome-specific initialization
    if (this.browserInfo.isChrome) {
      // Chrome supports advanced notification features
      console.log('Chrome detected - full notification support available');
    }

    // iOS Safari specific handling
    if (this.browserInfo.isIOS && this.browserInfo.isSafari) {
      console.log('iOS Safari detected - limited notification support');
    }
  }

  // Enhanced initialization with browser-specific handling
  async initialize(): Promise<boolean> {
    try {
      // Check basic support
      if (!this.browserInfo.supportsServiceWorker) {
        console.warn('Service Workers not supported in this browser');
        return this.initializeFallbackNotifications();
      }

      if (!this.browserInfo.supportsNotifications) {
        console.warn('Notifications not supported in this browser');
        return false;
      }

      // Browser-specific service worker registration
      const swPath = this.browserInfo.isSafari ? '/sw.js?safari=true' : '/sw.js';
      
      this.registration = await navigator.serviceWorker.register(swPath, {
        scope: '/',
        updateViaCache: 'none' // Ensure fresh service worker updates
      });

      console.log('Service Worker registered successfully');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Safari-specific handling
      if (this.browserInfo.isSafari) {
        await this.initializeSafariNotifications();
      }

      return true;
    } catch (error) {
      console.warn('Error initializing notifications:', error);
      return this.initializeFallbackNotifications();
    }
  }

  // Safari-specific notification initialization
  private async initializeSafariNotifications(): Promise<void> {
    // Safari requires explicit permission request
    if (this.permission === 'default') {
      console.log('Safari: Preparing notification permission request');
    }

    // Check for Safari push notification support
    if ('safari' in window && 'pushNotification' in (window as any).safari) {
      console.log('Safari push notifications supported');
    }
  }

  // Fallback for browsers without service worker support
  private async initializeFallbackNotifications(): Promise<boolean> {
    if (!this.browserInfo.supportsNotifications) {
      return false;
    }

    console.log('Using fallback notification system');
    return true;
  }

  // Enhanced permission request with browser-specific handling
  async requestPermission(): Promise<NotificationPermission> {
    try {
      if (this.permission === 'granted') {
        return 'granted';
      }

      if (this.permission === 'denied') {
        return 'denied';
      }

      // Safari-specific permission request
      if (this.browserInfo.isSafari) {
        return await this.requestSafariPermission();
      }

      // Standard permission request
      this.permission = await Notification.requestPermission();
      
      // Chrome-specific post-permission setup
      if (this.permission === 'granted' && this.browserInfo.isChrome) {
        await this.setupChromeNotifications();
      }

      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Safari-specific permission request
  private async requestSafariPermission(): Promise<NotificationPermission> {
    try {
      // Safari requires a user gesture
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (permission === 'granted') {
        console.log('Safari notifications enabled');
      }

      return permission;
    } catch (error) {
      console.error('Safari permission request failed:', error);
      return 'denied';
    }
  }

  // Chrome-specific notification setup
  private async setupChromeNotifications(): Promise<void> {
    try {
      // Chrome supports advanced features like actions and badges
      console.log('Setting up Chrome-specific notification features');
      
      // Test if push manager is available
      if (this.registration && 'pushManager' in this.registration) {
        console.log('Chrome push manager available');
      }
    } catch (error) {
      console.error('Chrome notification setup failed:', error);
    }
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.permission === 'granted' && 
           (this.registration !== null || !this.browserInfo.supportsServiceWorker);
  }

  // Enhanced notification display with browser-specific optimizations
  async showNotification(data: NotificationData): Promise<void> {
    if (!this.isEnabled()) {
      console.warn('Notifications not enabled');
      return;
    }

    try {
      const notificationOptions = this.buildNotificationOptions(data);

      if (this.registration) {
        // Use service worker for persistent notifications
        await this.registration.showNotification(data.title, notificationOptions);
      } else {
        // Fallback to basic notifications
        new Notification(data.title, notificationOptions);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback to basic notification
      try {
        new Notification(data.title, {
          body: data.body,
          icon: data.icon || '/vite.svg'
        });
      } catch (fallbackError) {
        console.error('Fallback notification also failed:', fallbackError);
      }
    }
  }

  // Build browser-specific notification options
  private buildNotificationOptions(data: NotificationData): NotificationOptions {
    const baseOptions: NotificationOptions = {
      body: data.body,
      icon: data.icon || '/vite.svg',
      badge: data.badge || '/vite.svg',
      tag: data.tag || 'femcare-notification',
      requireInteraction: data.requireInteraction || false,
      data: data.data || {}
    };

    // Chrome-specific enhancements
    if (this.browserInfo.isChrome) {
      baseOptions.actions = data.actions || [
        { action: 'open', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
      baseOptions.vibrate = [200, 100, 200]; // Vibration pattern for mobile
    }

    // Safari-specific adjustments
    if (this.browserInfo.isSafari) {
      // Safari has limited action support
      delete baseOptions.actions;
      baseOptions.requireInteraction = false; // Safari handles this differently
    }

    // Mobile-specific adjustments
    if (this.browserInfo.isMobile) {
      baseOptions.requireInteraction = true; // Keep notifications visible on mobile
    }

    return baseOptions;
  }

  // Enhanced scheduling with better time management
  scheduleNotification(data: NotificationData, delay: number, id?: string): string {
    const notificationId = id || `notification-${Date.now()}-${Math.random()}`;
    
    const timeoutId = window.setTimeout(() => {
      this.showNotification(data);
      this.scheduledNotifications.delete(notificationId);
    }, delay);

    this.scheduledNotifications.set(notificationId, timeoutId);
    return notificationId;
  }

  // Cancel scheduled notification
  cancelNotification(notificationId: string): void {
    const timeoutId = this.scheduledNotifications.get(notificationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(notificationId);
    }
  }

  // Cancel all scheduled notifications
  cancelAllScheduledNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  // Get all active notifications
  async getActiveNotifications(): Promise<Notification[]> {
    if (!this.registration) return [];
    
    try {
      return await this.registration.getNotifications();
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    const notifications = await this.getActiveNotifications();
    notifications.forEach(notification => notification.close());
  }

  // Enhanced period reminder generation
  generatePeriodReminders(profile: any, settings: ReminderSettings): NotificationData[] {
    const reminders: NotificationData[] = [];

    if (!settings.periodReminders || !profile?.last_period_date) {
      return reminders;
    }

    const lastPeriod = new Date(profile.last_period_date);
    const cycleLength = profile.average_cycle_length || 28;
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(lastPeriod.getDate() + cycleLength);

    const today = new Date();
    const daysUntilPeriod = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Enhanced reminder messages with emojis and better copy
    if (daysUntilPeriod === 3) {
      reminders.push({
        title: '🗓️ Period Prep Reminder',
        body: 'Your period is expected in 3 days. Time to stock up on supplies!',
        tag: 'period-3days',
        requireInteraction: false,
        data: { type: 'period', days: 3, action: 'prepare' }
      });
    }

    if (daysUntilPeriod === 2) {
      reminders.push({
        title: '🩸 Period Coming Soon',
        body: 'Your period is expected in 2 days. Don\'t forget to prepare!',
        tag: 'period-2days',
        requireInteraction: false,
        data: { type: 'period', days: 2, action: 'prepare' }
      });
    }

    if (daysUntilPeriod === 1) {
      reminders.push({
        title: '🩸 Period Tomorrow',
        body: 'Your period is expected tomorrow. Make sure you\'re ready!',
        tag: 'period-1day',
        requireInteraction: true,
        data: { type: 'period', days: 1, action: 'prepare' }
      });
    }

    if (daysUntilPeriod === 0) {
      reminders.push({
        title: '🩸 Period Expected Today',
        body: 'Your period is expected today. Remember to log it when it starts!',
        tag: 'period-today',
        requireInteraction: true,
        data: { type: 'period', days: 0, action: 'log' }
      });
    }

    // Late period reminder
    if (daysUntilPeriod < 0 && Math.abs(daysUntilPeriod) <= 5) {
      reminders.push({
        title: '⏰ Period Update',
        body: `Your period is ${Math.abs(daysUntilPeriod)} day(s) late. Consider logging if it has started.`,
        tag: 'period-late',
        requireInteraction: true,
        data: { type: 'period', days: daysUntilPeriod, action: 'check' }
      });
    }

    return reminders;
  }

  // Enhanced fertility reminders
  generateFertilityReminders(profile: any, settings: ReminderSettings): NotificationData[] {
    const reminders: NotificationData[] = [];

    if (!settings.fertilityReminders || !profile?.last_period_date) {
      return reminders;
    }

    const lastPeriod = new Date(profile.last_period_date);
    const cycleLength = profile.average_cycle_length || 28;
    const today = new Date();
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));

    const ovulationDay = Math.floor(cycleLength / 2);
    const fertilityStart = ovulationDay - 5;
    const fertilityEnd = ovulationDay + 1;

    // Fertility window starting
    if (daysSinceLastPeriod === fertilityStart - 1) {
      reminders.push({
        title: '💕 Fertility Window Starting',
        body: 'Your fertility window starts tomorrow. Great time to track ovulation signs!',
        tag: 'fertility-start',
        requireInteraction: false,
        data: { type: 'fertility', phase: 'start' }
      });
    }

    // Peak fertility
    if (daysSinceLastPeriod === ovulationDay - 1 && settings.ovulationReminders) {
      reminders.push({
        title: '🥚 Peak Fertility Tomorrow',
        body: 'Ovulation is expected tomorrow. This is your most fertile time!',
        tag: 'ovulation-peak',
        requireInteraction: false,
        data: { type: 'ovulation', phase: 'peak' }
      });
    }

    // Ovulation day
    if (daysSinceLastPeriod === ovulationDay && settings.ovulationReminders) {
      reminders.push({
        title: '🌟 Ovulation Day',
        body: 'Today is your predicted ovulation day. Peak fertility window!',
        tag: 'ovulation-day',
        requireInteraction: false,
        data: { type: 'ovulation', phase: 'day' }
      });
    }

    return reminders;
  }

  // Enhanced daily reminders with variety
  generateDailyReminders(settings: ReminderSettings): NotificationData[] {
    const reminders: NotificationData[] = [];
    const hour = new Date().getHours();

    // Morning reminders
    if (hour >= 6 && hour < 12) {
      if (settings.symptomReminders) {
        reminders.push({
          title: '🌅 Good Morning Check-in',
          body: 'How are you feeling this morning? Take a moment to log your symptoms.',
          tag: 'morning-checkin',
          requireInteraction: false,
          data: { type: 'symptoms', time: 'morning' }
        });
      }
    }

    // Afternoon reminders
    if (hour >= 12 && hour < 18) {
      if (settings.hydrationReminders) {
        reminders.push({
          title: '💧 Hydration Check',
          body: 'Remember to stay hydrated! Have you had enough water today?',
          tag: 'hydration-afternoon',
          requireInteraction: false,
          data: { type: 'hydration', time: 'afternoon' }
        });
      }
    }

    // Evening reminders
    if (hour >= 18 && hour < 22) {
      if (settings.symptomReminders) {
        reminders.push({
          title: '🌙 Evening Reflection',
          body: 'How was your day? Log your mood and any symptoms you experienced.',
          tag: 'evening-checkin',
          requireInteraction: false,
          data: { type: 'symptoms', time: 'evening' }
        });
      }

      if (settings.medicationReminders) {
        reminders.push({
          title: '💊 Medication Reminder',
          body: 'Don\'t forget to take your evening supplements or medication.',
          tag: 'medication-evening',
          requireInteraction: false,
          data: { type: 'medication', time: 'evening' }
        });
      }
    }

    return reminders;
  }

  // Calculate next reminder time with timezone support
  calculateNextReminderTime(reminderTime: string): Date {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderDate = new Date();
    
    reminderDate.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }
    
    return reminderDate;
  }

  // Enhanced daily reminder scheduling
  scheduleDailyReminders(profile: any, settings: ReminderSettings): string[] {
    const scheduledIds: string[] = [];

    if (!this.isEnabled()) {
      console.warn('Notifications not enabled, skipping reminder scheduling');
      return scheduledIds;
    }

    // Clear existing scheduled notifications
    this.cancelAllScheduledNotifications();

    const nextReminderTime = this.calculateNextReminderTime(settings.reminderTime);
    const delay = nextReminderTime.getTime() - Date.now();

    console.log(`Scheduling reminders for ${nextReminderTime.toLocaleString()}`);

    // Schedule period reminders
    const periodReminders = this.generatePeriodReminders(profile, settings);
    periodReminders.forEach((reminder, index) => {
      const id = this.scheduleNotification(reminder, delay + (index * 1000), `period-${index}`);
      scheduledIds.push(id);
    });

    // Schedule fertility reminders
    const fertilityReminders = this.generateFertilityReminders(profile, settings);
    fertilityReminders.forEach((reminder, index) => {
      const id = this.scheduleNotification(reminder, delay + (index * 1000), `fertility-${index}`);
      scheduledIds.push(id);
    });

    // Schedule daily reminders throughout the day
    const dailyReminders = this.generateDailyReminders(settings);
    dailyReminders.forEach((reminder, index) => {
      // Spread daily reminders throughout the day
      const dailyDelay = delay + (index * 2 * 60 * 60 * 1000); // 2 hours apart
      const id = this.scheduleNotification(reminder, dailyDelay, `daily-${index}`);
      scheduledIds.push(id);
    });

    console.log(`Scheduled ${scheduledIds.length} notifications`);
    return scheduledIds;
  }

  // Get browser compatibility info
  getBrowserCompatibility() {
    return {
      ...this.browserInfo,
      notificationSupport: this.browserInfo.supportsNotifications,
      serviceWorkerSupport: this.browserInfo.supportsServiceWorker,
      pushManagerSupport: this.browserInfo.supportsPushManager,
      currentPermission: this.permission,
      isEnabled: this.isEnabled()
    };
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Utility functions
export const initializeNotifications = async (): Promise<boolean> => {
  return await notificationManager.initialize();
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  return await notificationManager.requestPermission();
};

export const showNotification = async (data: NotificationData): Promise<void> => {
  return await notificationManager.showNotification(data);
};

export const scheduleReminders = (profile: any, settings: ReminderSettings): string[] => {
  return notificationManager.scheduleDailyReminders(profile, settings);
};

export const isNotificationEnabled = (): boolean => {
  return notificationManager.isEnabled();
};

export const clearAllNotifications = async (): Promise<void> => {
  return await notificationManager.clearAllNotifications();
};

export const getBrowserCompatibility = () => {
  return notificationManager.getBrowserCompatibility();
};

export const cancelAllScheduledNotifications = (): void => {
  return notificationManager.cancelAllScheduledNotifications();
};
// Notification utilities and management
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

class NotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.permission = Notification.permission;
  }

  // Initialize service worker and notifications
  async initialize(): Promise<boolean> {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers not supported');
        return false;
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    try {
      if (this.permission === 'granted') {
        return 'granted';
      }

      if (this.permission === 'denied') {
        return 'denied';
      }

      // Request permission
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.permission === 'granted' && this.registration !== null;
  }

  // Show immediate notification
  async showNotification(data: NotificationData): Promise<void> {
    if (!this.isEnabled()) {
      console.warn('Notifications not enabled');
      return;
    }

    try {
      await this.registration!.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/vite.svg',
        badge: data.badge || '/vite.svg',
        tag: data.tag || 'femcare-notification',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [
          { action: 'open', title: 'Open App' },
          { action: 'dismiss', title: 'Dismiss' }
        ],
        data: data.data || {}
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Schedule notification (using setTimeout for demo - in production use a proper scheduler)
  scheduleNotification(data: NotificationData, delay: number): number {
    return window.setTimeout(() => {
      this.showNotification(data);
    }, delay);
  }

  // Cancel scheduled notification
  cancelNotification(notificationId: number): void {
    clearTimeout(notificationId);
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

  // Generate period reminder notifications
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

    // 2 days before period
    if (daysUntilPeriod === 2) {
      reminders.push({
        title: '🩸 Period Reminder',
        body: 'Your period is expected in 2 days. Time to prepare!',
        tag: 'period-2days',
        data: { type: 'period', days: 2 }
      });
    }

    // Day before period
    if (daysUntilPeriod === 1) {
      reminders.push({
        title: '🩸 Period Tomorrow',
        body: 'Your period is expected tomorrow. Make sure you\'re prepared!',
        tag: 'period-1day',
        data: { type: 'period', days: 1 }
      });
    }

    // Period day
    if (daysUntilPeriod === 0) {
      reminders.push({
        title: '🩸 Period Expected Today',
        body: 'Your period is expected today. Don\'t forget to log it when it starts!',
        tag: 'period-today',
        data: { type: 'period', days: 0 }
      });
    }

    return reminders;
  }

  // Generate fertility reminders
  generateFertilityReminders(profile: any, settings: ReminderSettings): NotificationData[] {
    const reminders: NotificationData[] = [];

    if (!settings.fertilityReminders || !profile?.last_period_date) {
      return reminders;
    }

    const lastPeriod = new Date(profile.last_period_date);
    const cycleLength = profile.average_cycle_length || 28;
    const today = new Date();
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));

    // Fertility window (typically days 10-17 of cycle)
    const fertilityStart = 10;
    const fertilityEnd = 17;
    const ovulationDay = Math.floor(cycleLength / 2);

    if (daysSinceLastPeriod === fertilityStart - 1) {
      reminders.push({
        title: '💕 Fertility Window Starting',
        body: 'Your fertility window starts tomorrow. Consider tracking ovulation signs!',
        tag: 'fertility-start',
        data: { type: 'fertility', phase: 'start' }
      });
    }

    if (daysSinceLastPeriod === ovulationDay - 1 && settings.ovulationReminders) {
      reminders.push({
        title: '🥚 Ovulation Expected',
        body: 'Ovulation is expected tomorrow. Peak fertility time!',
        tag: 'ovulation',
        data: { type: 'ovulation' }
      });
    }

    return reminders;
  }

  // Generate daily tracking reminders
  generateDailyReminders(settings: ReminderSettings): NotificationData[] {
    const reminders: NotificationData[] = [];

    if (settings.symptomReminders) {
      reminders.push({
        title: '📝 Daily Check-in',
        body: 'How are you feeling today? Log your symptoms and mood.',
        tag: 'daily-symptoms',
        data: { type: 'symptoms' }
      });
    }

    if (settings.hydrationReminders) {
      reminders.push({
        title: '💧 Stay Hydrated',
        body: 'Remember to drink water throughout the day!',
        tag: 'hydration',
        data: { type: 'hydration' }
      });
    }

    if (settings.medicationReminders) {
      reminders.push({
        title: '💊 Medication Reminder',
        body: 'Time to take your supplements or medication.',
        tag: 'medication',
        data: { type: 'medication' }
      });
    }

    return reminders;
  }

  // Calculate next reminder time based on user preferences
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

  // Schedule daily reminders
  scheduleDailyReminders(profile: any, settings: ReminderSettings): number[] {
    const scheduledIds: number[] = [];

    if (!this.isEnabled()) {
      return scheduledIds;
    }

    const nextReminderTime = this.calculateNextReminderTime(settings.reminderTime);
    const delay = nextReminderTime.getTime() - Date.now();

    // Schedule period reminders
    const periodReminders = this.generatePeriodReminders(profile, settings);
    periodReminders.forEach(reminder => {
      const id = this.scheduleNotification(reminder, delay);
      scheduledIds.push(id);
    });

    // Schedule fertility reminders
    const fertilityReminders = this.generateFertilityReminders(profile, settings);
    fertilityReminders.forEach(reminder => {
      const id = this.scheduleNotification(reminder, delay);
      scheduledIds.push(id);
    });

    // Schedule daily reminders
    const dailyReminders = this.generateDailyReminders(settings);
    dailyReminders.forEach(reminder => {
      const id = this.scheduleNotification(reminder, delay);
      scheduledIds.push(id);
    });

    return scheduledIds;
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

export const scheduleReminders = (profile: any, settings: ReminderSettings): number[] => {
  return notificationManager.scheduleDailyReminders(profile, settings);
};

export const isNotificationEnabled = (): boolean => {
  return notificationManager.isEnabled();
};

export const clearAllNotifications = async (): Promise<void> => {
  return await notificationManager.clearAllNotifications();
};
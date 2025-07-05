import React, { useState, useEffect } from 'react';
import { Heart, User, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/Dashboard';
import CycleTracker from './components/CycleTracker';
import SymptomsTracker from './components/SymptomsTracker';
import CalendarView from './components/CalendarView';
import Analytics from './components/Analytics';
import SettingsPanel from './components/SettingsPanel';
import FloatingNavigation from './components/FloatingNavigation';
import Sidebar from './components/Sidebar';
import NotificationSetup from './components/NotificationSetup';
import { getUserProfile, getProfilePictureUrl } from './utils/supabase';
import { initializeNotifications, isNotificationEnabled } from './utils/notifications';

// Import SEO Pages
import PeriodTracker from './pages/PeriodTracker';
import OvulationTracker from './pages/OvulationTracker';
import PregnancyTracker from './pages/PregnancyTracker';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNotificationSetup, setShowNotificationSetup] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<any>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Handle routing based on URL path
    const path = window.location.pathname;
    if (path.startsWith('/pages/')) {
      setCurrentPage(path);
    }
  }, []);

  useEffect(() => {
    if (user) {
      checkUserProfile();
      loadProfilePicture();
      initializeAppNotifications();
    }
  }, [user]);

  const initializeAppNotifications = async () => {
    // Initialize notifications system
    await initializeNotifications();
    
    // Show notification setup if not already enabled and user has completed onboarding
    setTimeout(() => {
      if (!isNotificationEnabled() && profile && !showOnboarding) {
        setShowNotificationSetup(true);
      }
    }, 3000); // Show after 3 seconds
  };

  const checkUserProfile = async () => {
    if (!user) return;
    
    const { data } = await getUserProfile(user.id);
    setProfile(data);
    
    // Show onboarding if profile is incomplete
    if (!data?.date_of_birth || !data?.last_period_date) {
      setShowOnboarding(true);
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

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh profile data after onboarding
    checkUserProfile();
    // Show notification setup after onboarding
    setTimeout(() => {
      if (!isNotificationEnabled()) {
        setShowNotificationSetup(true);
      }
    }, 1000);
  };

  // Handle SEO page routing
  if (currentPage.startsWith('/pages/')) {
    switch (currentPage) {
      case '/pages/period-tracker':
        return <PeriodTracker />;
      case '/pages/ovulation-tracker':
        return <OvulationTracker />;
      case '/pages/pregnancy-tracker':
        return <PregnancyTracker />;
      default:
        // Redirect to period tracker for unknown pages
        return <PeriodTracker />;
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'cycle':
        return <CycleTracker />;
      case 'symptoms':
        return <SymptomsTracker />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'signup') {
      return (
        <SignUp 
          onToggleMode={() => setAuthMode('signin')}
          onSignUpSuccess={() => setShowOnboarding(true)}
        />
      );
    }
    return <SignIn onToggleMode={() => setAuthMode('signup')} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                FemCare
              </h1>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {profilePictureUrl ? (
                    <img 
                      src={profilePictureUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={() => setProfilePictureUrl(null)}
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Main Content */}
        <main className={`flex-1 ${isMobile ? 'pb-20' : 'lg:ml-64'} px-4 sm:px-6 lg:px-8 py-4 md:py-8`}>
          {renderContent()}
        </main>
      </div>

      {/* Mobile Floating Navigation */}
      {isMobile && (
        <FloatingNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Notification Setup Modal */}
      {showNotificationSetup && (
        <NotificationSetup 
          showAsModal={true}
          onClose={() => setShowNotificationSetup(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
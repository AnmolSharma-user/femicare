import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Heart, Calendar, Target, User, Activity, CheckCircle } from 'lucide-react';
import { updateUserProfile } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingData {
  personalInfo: {
    dateOfBirth: string;
    height: string;
    weight: string;
  };
  cycleInfo: {
    averageCycleLength: string;
    averagePeriodLength: string;
    lastPeriodDate: string;
    contraceptionMethod: string;
  };
  healthGoals: string[];
  preferences: {
    trackFertility: boolean;
    trackMood: boolean;
    trackSymptoms: boolean;
    notifications: boolean;
  };
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    personalInfo: {
      dateOfBirth: '',
      height: '',
      weight: ''
    },
    cycleInfo: {
      averageCycleLength: '28',
      averagePeriodLength: '5',
      lastPeriodDate: '',
      contraceptionMethod: ''
    },
    healthGoals: [],
    preferences: {
      trackFertility: true,
      trackMood: true,
      trackSymptoms: true,
      notifications: true
    }
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to FemCare',
      subtitle: 'Let\'s personalize your health journey',
      icon: Heart
    },
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Help us understand your basic health profile',
      icon: User
    },
    {
      id: 'cycle',
      title: 'Cycle Information',
      subtitle: 'Tell us about your menstrual cycle',
      icon: Calendar
    },
    {
      id: 'goals',
      title: 'Health Goals',
      subtitle: 'What would you like to track and achieve?',
      icon: Target
    },
    {
      id: 'preferences',
      title: 'Tracking Preferences',
      subtitle: 'Customize your tracking experience',
      icon: Activity
    },
    {
      id: 'complete',
      title: 'All Set!',
      subtitle: 'Your personalized health tracker is ready',
      icon: CheckCircle
    }
  ];

  const healthGoalOptions = [
    'Track menstrual cycle',
    'Monitor fertility',
    'Manage PMS symptoms',
    'Improve sleep quality',
    'Track mood patterns',
    'Plan pregnancy',
    'Monitor contraception',
    'General wellness'
  ];

  const contraceptionOptions = [
    'None',
    'Birth control pills',
    'IUD (Hormonal)',
    'IUD (Copper)',
    'Implant',
    'Injection',
    'Patch',
    'Ring',
    'Condoms',
    'Other'
  ];

  const updateData = (section: keyof OnboardingData, updates: any) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const toggleHealthGoal = (goal: string) => {
    setData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter(g => g !== goal)
        : [...prev.healthGoals, goal]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const profileData = {
        date_of_birth: data.personalInfo.dateOfBirth,
        height: parseInt(data.personalInfo.height),
        weight: parseFloat(data.personalInfo.weight),
        average_cycle_length: parseInt(data.cycleInfo.averageCycleLength),
        average_period_length: parseInt(data.cycleInfo.averagePeriodLength),
        last_period_date: data.cycleInfo.lastPeriodDate,
        contraception_method: data.cycleInfo.contraceptionMethod,
        health_goals: data.healthGoals
      };

      await updateUserProfile(user.id, profileData);
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to FemCare</h2>
              <p className="text-lg text-gray-600 mb-6">
                We'll ask you a few questions to personalize your health tracking experience. 
                This will only take a few minutes.
              </p>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-purple-800 text-sm">
                  Your data is private and secure. We use this information to provide 
                  personalized insights and predictions.
                </p>
              </div>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={data.personalInfo.dateOfBirth}
                onChange={(e) => updateData('personalInfo', { dateOfBirth: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={data.personalInfo.height}
                  onChange={(e) => updateData('personalInfo', { height: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="165"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={data.personalInfo.weight}
                  onChange={(e) => updateData('personalInfo', { weight: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="60.0"
                />
              </div>
            </div>
          </div>
        );

      case 'cycle':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When was your last period?
              </label>
              <input
                type="date"
                value={data.cycleInfo.lastPeriodDate}
                onChange={(e) => updateData('cycleInfo', { lastPeriodDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Cycle Length (days)
                </label>
                <select
                  value={data.cycleInfo.averageCycleLength}
                  onChange={(e) => updateData('cycleInfo', { averageCycleLength: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 21).map(days => (
                    <option key={days} value={days}>{days} days</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Period Length (days)
                </label>
                <select
                  value={data.cycleInfo.averagePeriodLength}
                  onChange={(e) => updateData('cycleInfo', { averagePeriodLength: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Array.from({ length: 8 }, (_, i) => i + 3).map(days => (
                    <option key={days} value={days}>{days} days</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraception Method
              </label>
              <select
                value={data.cycleInfo.contraceptionMethod}
                onChange={(e) => updateData('cycleInfo', { contraceptionMethod: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select method</option>
                {contraceptionOptions.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Select all that apply to you:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {healthGoalOptions.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleHealthGoal(goal)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    data.healthGoals.includes(goal)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      data.healthGoals.includes(goal)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {data.healthGoals.includes(goal) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{goal}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <p className="text-gray-600">Customize your tracking experience:</p>
            <div className="space-y-4">
              {Object.entries(data.preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {key === 'trackFertility' && 'Track Fertility Signs'}
                      {key === 'trackMood' && 'Track Mood & Energy'}
                      {key === 'trackSymptoms' && 'Track Symptoms'}
                      {key === 'notifications' && 'Enable Notifications'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {key === 'trackFertility' && 'Monitor ovulation signs and fertility window'}
                      {key === 'trackMood' && 'Log daily mood and energy levels'}
                      {key === 'trackSymptoms' && 'Record physical and emotional symptoms'}
                      {key === 'notifications' && 'Get reminders and health insights'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateData('preferences', { [key]: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You're All Set!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your personalized health tracker is ready. Start logging your data to get 
                insights and predictions tailored just for you.
              </p>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-green-800 text-sm">
                  Remember: The more data you log, the more accurate your predictions will become.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'personal':
        return data.personalInfo.dateOfBirth;
      case 'cycle':
        return data.cycleInfo.lastPeriodDate;
      case 'goals':
        return data.healthGoals.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          {/* Step Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {React.createElement(steps[currentStep].icon, { className: "w-8 h-8 text-white" })}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600">
              {steps[currentStep].subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
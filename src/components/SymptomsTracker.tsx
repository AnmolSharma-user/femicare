import React, { useState, useEffect } from 'react';
import { Plus, Thermometer, Zap, Brain, Heart, Moon, Activity, Sun, Users, MoreHorizontal, Calendar, Clock, MapPin, Pill } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getEnhancedSymptomLogs, 
  getSymptomCategories,
  getSymptomDefinitions,
  getSymptomAnalytics,
  deleteEnhancedSymptomLog 
} from '../utils/supabase';
import LogSymptomPage from './LogSymptomPage';
import ViewAllSymptomsPage from './ViewAllSymptomsPage';

const SymptomsTracker = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showLogSymptomPage, setShowLogSymptomPage] = useState(false);
  const [showViewAllPage, setShowViewAllPage] = useState(false);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    thermometer: Thermometer,
    brain: Brain,
    zap: Zap,
    moon: Moon,
    activity: Activity,
    sun: Sun,
    heart: Heart,
    users: Users,
    'more-horizontal': MoreHorizontal
  };

  useEffect(() => {
    if (user) {
      loadSymptomData();
    }
  }, [user]);

  const loadSymptomData = async () => {
    if (!user) return;

    try {
      const [symptomsResult, categoriesResult, definitionsResult, analyticsResult] = await Promise.all([
        getEnhancedSymptomLogs(user.id, 20),
        getSymptomCategories(),
        getSymptomDefinitions(),
        getSymptomAnalytics(user.id)
      ]);

      if (symptomsResult.data) setSymptoms(symptomsResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (definitionsResult.data) setDefinitions(definitionsResult.data);
      if (analyticsResult.data) setAnalytics(analyticsResult.data);
    } catch (error) {
      console.error('Error loading symptom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSymptom = async (symptomId: string) => {
    try {
      await deleteEnhancedSymptomLog(symptomId);
      await loadSymptomData();
    } catch (error) {
      console.error('Error deleting symptom:', error);
    }
  };

  const handleLogSymptomSuccess = () => {
    setShowLogSymptomPage(false);
    loadSymptomData();
  };

  const handleViewAllBack = () => {
    setShowViewAllPage(false);
    loadSymptomData(); // Refresh data when coming back
  };

  // Show Log Symptom Page
  if (showLogSymptomPage) {
    return (
      <LogSymptomPage 
        onBack={() => setShowLogSymptomPage(false)}
        onSuccess={handleLogSymptomSuccess}
      />
    );
  }

  // Show View All Symptoms Page
  if (showViewAllPage) {
    return (
      <ViewAllSymptomsPage 
        onBack={handleViewAllBack}
        onAddNew={() => {
          setShowViewAllPage(false);
          setShowLogSymptomPage(true);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Advanced Symptoms Tracker</h2>
            <p className="text-purple-100 text-base md:text-lg">
              Comprehensive symptom tracking for better health insights
            </p>
            {analytics && (
              <p className="text-purple-200 text-sm mt-1">
                {analytics.totalLogs} symptoms logged • {analytics.categoriesUsed} categories tracked
              </p>
            )}
          </div>
          <button
            onClick={() => setShowLogSymptomPage(true)}
            className="bg-white/20 backdrop-blur-sm text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-medium hover:bg-white/30 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Log Symptom</span>
            <span className="sm:hidden">Log</span>
          </button>
        </div>
      </div>

      {/* Quick Category Access */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {categories.map((category) => {
          const Icon = iconMap[category.icon_name] || Heart;
          const categoryCount = analytics?.categoryDistribution?.[category.name] || 0;
          return (
            <button
              key={category.id}
              onClick={() => setShowLogSymptomPage(true)}
              className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              style={{ borderLeftColor: category.color_code, borderLeftWidth: '4px' }}
            >
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: category.color_code }}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm md:text-base">{category.name}</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {categoryCount} logged
              </p>
            </button>
          );
        })}
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Recent Symptom Logs</h3>
          <button 
            onClick={() => setShowViewAllPage(true)}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          {symptoms.length > 0 ? (
            symptoms.map((symptom) => {
              const definition = definitions.find(d => d.id === symptom.symptom_definition_id);
              const category = categories.find(c => c.id === definition?.category_id);
              const Icon = iconMap[category?.icon_name] || Heart;
              
              return (
                <div key={symptom.id} className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category?.color_code || '#6B7280' }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm md:text-base">{definition?.name}</span>
                        <p className="text-xs md:text-sm text-gray-500">{category?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-xs md:text-sm text-gray-400">
                          {new Date(symptom.date).toLocaleDateString()}
                        </p>
                        {symptom.time_of_day && (
                          <p className="text-xs text-gray-400">
                            {symptom.time_of_day}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSymptom(symptom.id)}
                        className="text-red-500 hover:text-red-700 text-xs md:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
                    {symptom.severity_level && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Severity:</span>
                        <span className="font-medium">{symptom.severity_level}/10</span>
                      </div>
                    )}
                    {symptom.intensity_level && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Intensity:</span>
                        <span className="font-medium">{symptom.intensity_level}/10</span>
                      </div>
                    )}
                    {symptom.mood_rating && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Mood:</span>
                        <span className="font-medium">{symptom.mood_rating}/10</span>
                      </div>
                    )}
                    {symptom.cycle_day && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Cycle Day:</span>
                        <span className="font-medium">{symptom.cycle_day}</span>
                      </div>
                    )}
                  </div>
                  
                  {symptom.notes && (
                    <p className="text-xs md:text-sm text-gray-600 mt-2 italic">
                      "{symptom.notes}"
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No symptoms logged yet</p>
              <button 
                onClick={() => setShowLogSymptomPage(true)}
                className="flex items-center space-x-2 mx-auto px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Log Your First Symptom</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomsTracker;
import React, { useState, useEffect } from 'react';
import { Plus, Thermometer, Zap, Brain, Heart, Moon, Activity, Sun, Users, MoreHorizontal, Calendar, Clock, MapPin, Pill, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getEnhancedSymptomLogs, 
  addEnhancedSymptomLog, 
  getSymptomCategories,
  getSymptomDefinitions,
  getSymptomAnalytics,
  deleteEnhancedSymptomLog 
} from '../utils/supabase';

const SymptomsTracker = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    symptom_definition_id: '',
    date: new Date().toISOString().split('T')[0],
    time_of_day: new Date().toTimeString().slice(0, 5),
    severity_level: 5,
    intensity_level: 5,
    frequency_count: 1,
    duration_minutes: 30,
    boolean_value: false,
    scale_value: 5,
    stress_level: 5,
    sleep_hours: 8,
    exercise_intensity: 'none',
    weather_condition: '',
    potential_triggers: [],
    notes: '',
    mood_rating: 5,
    medications_taken: [],
    treatments_used: [],
    location_type: 'home',
    activity_during_symptom: ''
  });

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

  const handleAddSymptom = async () => {
    if (!user || !formData.symptom_definition_id) return;

    try {
      const selectedDefinition = definitions.find(d => d.id === formData.symptom_definition_id);
      const symptomData = {
        symptom_definition_id: formData.symptom_definition_id,
        date: formData.date,
        time_of_day: formData.time_of_day,
        notes: formData.notes,
        stress_level: formData.stress_level,
        sleep_hours: formData.sleep_hours,
        exercise_intensity: formData.exercise_intensity,
        weather_condition: formData.weather_condition,
        potential_triggers: formData.potential_triggers,
        mood_rating: formData.mood_rating,
        medications_taken: formData.medications_taken,
        treatments_used: formData.treatments_used,
        location_type: formData.location_type,
        activity_during_symptom: formData.activity_during_symptom
      };

      // Add measurement value based on type
      switch (selectedDefinition?.measurement_type) {
        case 'severity':
          symptomData.severity_level = formData.severity_level;
          break;
        case 'intensity':
          symptomData.intensity_level = formData.intensity_level;
          break;
        case 'frequency':
          symptomData.frequency_count = formData.frequency_count;
          break;
        case 'duration':
          symptomData.duration_minutes = formData.duration_minutes;
          break;
        case 'boolean':
          symptomData.boolean_value = formData.boolean_value;
          break;
        case 'scale':
          symptomData.scale_value = formData.scale_value;
          break;
      }

      await addEnhancedSymptomLog(user.id, symptomData);
      await loadSymptomData();
      setShowAddSymptom(false);
      resetForm();
    } catch (error) {
      console.error('Error adding symptom:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      symptom_definition_id: '',
      date: new Date().toISOString().split('T')[0],
      time_of_day: new Date().toTimeString().slice(0, 5),
      severity_level: 5,
      intensity_level: 5,
      frequency_count: 1,
      duration_minutes: 30,
      boolean_value: false,
      scale_value: 5,
      stress_level: 5,
      sleep_hours: 8,
      exercise_intensity: 'none',
      weather_condition: '',
      potential_triggers: [],
      notes: '',
      mood_rating: 5,
      medications_taken: [],
      treatments_used: [],
      location_type: 'home',
      activity_during_symptom: ''
    });
    setSelectedCategory('');
  };

  const handleDeleteSymptom = async (symptomId: string) => {
    try {
      await deleteEnhancedSymptomLog(symptomId);
      await loadSymptomData();
    } catch (error) {
      console.error('Error deleting symptom:', error);
    }
  };

  const getFilteredDefinitions = () => {
    if (!selectedCategory) return definitions;
    const category = categories.find(c => c.id === selectedCategory);
    return definitions.filter(d => d.category_id === selectedCategory);
  };

  const renderMeasurementInput = () => {
    const selectedDefinition = definitions.find(d => d.id === formData.symptom_definition_id);
    if (!selectedDefinition) return null;

    const { measurement_type, scale_min, scale_max, scale_labels } = selectedDefinition;

    switch (measurement_type) {
      case 'severity':
      case 'intensity':
      case 'scale':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {measurement_type.charAt(0).toUpperCase() + measurement_type.slice(1)} Level ({scale_min}-{scale_max})
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min={scale_min}
                max={scale_max}
                value={formData[`${measurement_type}_level`] || formData.scale_value}
                onChange={(e) => {
                  const field = measurement_type === 'scale' ? 'scale_value' : `${measurement_type}_level`;
                  setFormData({ ...formData, [field]: parseInt(e.target.value) });
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{scale_labels?.[scale_min] || scale_min}</span>
                <span className="font-medium text-purple-600">
                  {formData[`${measurement_type}_level`] || formData.scale_value}
                </span>
                <span>{scale_labels?.[scale_max] || scale_max}</span>
              </div>
            </div>
          </div>
        );

      case 'frequency':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Frequency Count
            </label>
            <input
              type="number"
              min="0"
              value={formData.frequency_count}
              onChange={(e) => setFormData({ ...formData, frequency_count: parseInt(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="How many times?"
            />
          </div>
        );

      case 'duration':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Duration in minutes"
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={formData.boolean_value}
              onChange={(e) => setFormData({ ...formData, boolean_value: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedDefinition.name}
            </span>
          </div>
        );

      default:
        return null;
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
            onClick={() => setShowAddSymptom(true)}
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
              onClick={() => {
                setSelectedCategory(category.id);
                setShowAddSymptom(true);
              }}
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
          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
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
                onClick={() => setShowAddSymptom(true)}
                className="flex items-center space-x-2 mx-auto px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Log Your First Symptom</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Add Symptom Modal */}
      {showAddSymptom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Log New Symptom</h3>
                <p className="text-sm md:text-base text-gray-600 mt-1">Track your symptoms for better health insights</p>
              </div>
              <button
                onClick={() => {
                  setShowAddSymptom(false);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.time_of_day}
                      onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {categories.map((category) => {
                      const Icon = iconMap[category.icon_name] || Heart;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-3 border-2 rounded-lg transition-all text-sm flex flex-col items-center space-y-2 ${
                            selectedCategory === category.id
                              ? 'border-purple-500 text-white shadow-lg'
                              : 'border-gray-300 hover:border-purple-500 hover:shadow-md'
                          }`}
                          style={{
                            backgroundColor: selectedCategory === category.id ? category.color_code : 'transparent',
                            color: selectedCategory === category.id ? 'white' : 'inherit'
                          }}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Symptom Selection */}
                {selectedCategory && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Symptom
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {getFilteredDefinitions().map((definition) => (
                        <button
                          key={definition.id}
                          onClick={() => setFormData({ ...formData, symptom_definition_id: definition.id })}
                          className={`p-3 border-2 rounded-lg transition-all text-sm text-left ${
                            formData.symptom_definition_id === definition.id
                              ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                              : 'border-gray-300 hover:bg-purple-50 hover:border-purple-500'
                          }`}
                        >
                          <div className="font-medium">{definition.name}</div>
                          {definition.description && (
                            <div className="text-xs opacity-75 mt-1">{definition.description}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Measurement Input */}
                {formData.symptom_definition_id && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {renderMeasurementInput()}
                  </div>
                )}
                
                {/* Additional Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Stress Level (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.stress_level}
                      onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Low</span>
                      <span className="font-medium text-purple-600">{formData.stress_level}</span>
                      <span>High</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Mood Rating (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.mood_rating}
                      onChange={(e) => setFormData({ ...formData, mood_rating: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Poor</span>
                      <span className="font-medium text-purple-600">{formData.mood_rating}</span>
                      <span>Great</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Sleep Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={formData.sleep_hours}
                      onChange={(e) => setFormData({ ...formData, sleep_hours: parseFloat(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Exercise Intensity
                    </label>
                    <select
                      value={formData.exercise_intensity}
                      onChange={(e) => setFormData({ ...formData, exercise_intensity: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="none">None</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="intense">Intense</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Any additional notes about this symptom..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowAddSymptom(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSymptom}
                disabled={!formData.symptom_definition_id}
                className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Save Symptom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomsTracker;
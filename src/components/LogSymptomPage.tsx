import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Save, Thermometer, Brain, Heart, Zap, Moon, Activity, Sun, Users, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  addEnhancedSymptomLog, 
  getSymptomCategories,
  getSymptomDefinitions
} from '../utils/supabase';

interface LogSymptomPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const LogSymptomPage: React.FC<LogSymptomPageProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResult, definitionsResult] = await Promise.all([
        getSymptomCategories(),
        getSymptomDefinitions()
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (definitionsResult.data) setDefinitions(definitionsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDefinitions = () => {
    if (!selectedCategory) return definitions;
    return definitions.filter(d => d.category_id === selectedCategory);
  };

  const handleSave = async () => {
    if (!user || !formData.symptom_definition_id) return;

    setSaving(true);
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
      onSuccess();
    } catch (error) {
      console.error('Error saving symptom:', error);
    } finally {
      setSaving(false);
    }
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
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              {measurement_type.charAt(0).toUpperCase() + measurement_type.slice(1)} Level
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min={scale_min}
                max={scale_max}
                value={formData[`${measurement_type}_level`] || formData.scale_value}
                onChange={(e) => {
                  const field = measurement_type === 'scale' ? 'scale_value' : `${measurement_type}_level`;
                  setFormData({ ...formData, [field]: parseInt(e.target.value) });
                }}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((formData[`${measurement_type}_level`] || formData.scale_value) - scale_min) / (scale_max - scale_min) * 100}%, #E5E7EB ${((formData[`${measurement_type}_level`] || formData.scale_value) - scale_min) / (scale_max - scale_min) * 100}%, #E5E7EB 100%)`
                }}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{scale_labels?.[scale_min] || scale_min}</span>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {formData[`${measurement_type}_level`] || formData.scale_value}
                  </div>
                  <div className="text-sm text-gray-500">out of {scale_max}</div>
                </div>
                <span className="text-sm text-gray-500">{scale_labels?.[scale_max] || scale_max}</span>
              </div>
            </div>
          </div>
        );

      case 'frequency':
        return (
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              How many times?
            </label>
            <input
              type="number"
              min="0"
              value={formData.frequency_count}
              onChange={(e) => setFormData({ ...formData, frequency_count: parseInt(e.target.value) })}
              className="w-full p-4 text-xl border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter count"
            />
          </div>
        );

      case 'duration':
        return (
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full p-4 text-xl border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter duration"
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              {selectedDefinition.name}
            </label>
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => setFormData({ ...formData, boolean_value: false })}
                className={`px-8 py-4 rounded-xl font-medium text-lg transition-all ${
                  !formData.boolean_value
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                No
              </button>
              <button
                onClick={() => setFormData({ ...formData, boolean_value: true })}
                className={`px-8 py-4 rounded-xl font-medium text-lg transition-all ${
                  formData.boolean_value
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Yes
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.date && formData.time_of_day;
      case 2:
        return selectedCategory;
      case 3:
        return formData.symptom_definition_id;
      case 4:
        return true; // Measurement step is optional
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Log New Symptom</h1>
                <p className="text-sm text-gray-500">Step {currentStep} of 5</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">When did this happen?</h2>
                <p className="text-gray-600">Select the date and time of your symptom</p>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-3">
                  <label className="block text-lg font-medium text-gray-900">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-medium text-gray-900">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time_of_day}
                    onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                    className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category Selection */}
          {currentStep === 2 && (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of symptom?</h2>
                <p className="text-gray-600">Choose the category that best describes your symptom</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {categories.map((category) => {
                  const Icon = iconMap[category.icon_name] || Heart;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-6 border-2 rounded-xl transition-all text-center ${
                        selectedCategory === category.id
                          ? 'border-purple-500 shadow-lg scale-105'
                          : 'border-gray-300 hover:border-purple-300 hover:shadow-md'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === category.id ? category.color_code + '20' : 'transparent'
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: category.color_code }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Symptom Selection */}
          {currentStep === 3 && selectedCategory && (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Thermometer className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Which symptom?</h2>
                <p className="text-gray-600">Select the specific symptom you're experiencing</p>
              </div>

              <div className="space-y-3 max-w-2xl mx-auto max-h-96 overflow-y-auto">
                {getFilteredDefinitions().map((definition) => (
                  <button
                    key={definition.id}
                    onClick={() => setFormData({ ...formData, symptom_definition_id: definition.id })}
                    className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                      formData.symptom_definition_id === definition.id
                        ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                        : 'border-gray-300 hover:bg-purple-50 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium text-lg">{definition.name}</div>
                    {definition.description && (
                      <div className="text-sm opacity-75 mt-1">{definition.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Measurement */}
          {currentStep === 4 && formData.symptom_definition_id && (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How severe is it?</h2>
                <p className="text-gray-600">Rate the intensity of your symptom</p>
              </div>

              <div className="max-w-md mx-auto">
                {renderMeasurementInput()}
              </div>
            </div>
          )}

          {/* Step 5: Additional Details */}
          {currentStep === 5 && (
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Details</h2>
                <p className="text-gray-600">Help us understand the context better</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-gray-900">
                      Stress Level (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.stress_level}
                      onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Low</span>
                      <span className="font-medium text-purple-600">{formData.stress_level}</span>
                      <span>High</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-gray-900">
                      Mood Rating (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.mood_rating}
                      onChange={(e) => setFormData({ ...formData, mood_rating: parseInt(e.target.value) })}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Poor</span>
                      <span className="font-medium text-purple-600">{formData.mood_rating}</span>
                      <span>Great</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-medium text-gray-900">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Any additional details about this symptom..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between items-center max-w-2xl mx-auto">
              <button
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onBack()}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceedToNextStep()}
                  className="px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Symptom'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogSymptomPage;
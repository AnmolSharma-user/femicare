import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Calendar, Edit, Trash2, Plus, Eye, ChevronDown, X, Save, Thermometer, Brain, Heart, Zap, Moon, Activity, Sun, Users, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getEnhancedSymptomLogs, 
  getSymptomCategories,
  getSymptomDefinitions,
  updateEnhancedSymptomLog,
  deleteEnhancedSymptomLog 
} from '../utils/supabase';

interface ViewAllSymptomsPageProps {
  onBack: () => void;
  onAddNew: () => void;
}

const ViewAllSymptomsPage: React.FC<ViewAllSymptomsPageProps> = ({ onBack, onAddNew }) => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<any>(null);
  const [viewingSymptom, setViewingSymptom] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
      loadData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [symptoms, searchTerm, selectedCategory, selectedSeverity, dateRange, sortBy, sortOrder]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [symptomsResult, categoriesResult, definitionsResult] = await Promise.all([
        getEnhancedSymptomLogs(user.id, 1000), // Load more symptoms for comprehensive view
        getSymptomCategories(),
        getSymptomDefinitions()
      ]);

      if (symptomsResult.data) setSymptoms(symptomsResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (definitionsResult.data) setDefinitions(definitionsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...symptoms];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(symptom => {
        const definition = definitions.find(d => d.id === symptom.symptom_definition_id);
        const category = categories.find(c => c.id === definition?.category_id);
        return (
          definition?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          symptom.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(symptom => {
        const definition = definitions.find(d => d.id === symptom.symptom_definition_id);
        return definition?.category_id === selectedCategory;
      });
    }

    // Severity filter
    if (selectedSeverity) {
      const severityRange = getSeverityRange(selectedSeverity);
      filtered = filtered.filter(symptom => {
        const severity = symptom.severity_level || symptom.intensity_level || symptom.scale_value || 0;
        return severity >= severityRange.min && severity <= severityRange.max;
      });
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(symptom => symptom.date >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(symptom => symptom.date <= dateRange.end);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'severity':
          aValue = a.severity_level || a.intensity_level || a.scale_value || 0;
          bValue = b.severity_level || b.intensity_level || b.scale_value || 0;
          break;
        case 'category':
          const aDefinition = definitions.find(d => d.id === a.symptom_definition_id);
          const bDefinition = definitions.find(d => d.id === b.symptom_definition_id);
          const aCategory = categories.find(c => c.id === aDefinition?.category_id);
          const bCategory = categories.find(c => c.id === bDefinition?.category_id);
          aValue = aCategory?.name || '';
          bValue = bCategory?.name || '';
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSymptoms(filtered);
  };

  const getSeverityRange = (severity: string) => {
    switch (severity) {
      case 'mild': return { min: 1, max: 3 };
      case 'moderate': return { min: 4, max: 6 };
      case 'severe': return { min: 7, max: 10 };
      default: return { min: 0, max: 10 };
    }
  };

  const handleDeleteSymptom = async (symptomId: string) => {
    if (!confirm('Are you sure you want to delete this symptom log?')) return;

    try {
      await deleteEnhancedSymptomLog(symptomId);
      await loadData();
    } catch (error) {
      console.error('Error deleting symptom:', error);
      alert('Error deleting symptom. Please try again.');
    }
  };

  const handleUpdateSymptom = async (symptomId: string, updates: any) => {
    try {
      await updateEnhancedSymptomLog(symptomId, updates);
      await loadData();
      setEditingSymptom(null);
    } catch (error) {
      console.error('Error updating symptom:', error);
      alert('Error updating symptom. Please try again.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSeverity('');
    setDateRange({ start: '', end: '' });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory) count++;
    if (selectedSeverity) count++;
    if (dateRange.start || dateRange.end) count++;
    return count;
  };

  const renderSymptomCard = (symptom: any) => {
    const definition = definitions.find(d => d.id === symptom.symptom_definition_id);
    const category = categories.find(c => c.id === definition?.category_id);
    const Icon = iconMap[category?.icon_name] || Heart;

    return (
      <div key={symptom.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: category?.color_code || '#6B7280' }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base md:text-lg">{definition?.name}</h3>
              <p className="text-sm text-gray-500">{category?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewingSymptom(symptom)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingSymptom(symptom)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteSymptom(symptom.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Date:</span>
            <p className="font-medium">{new Date(symptom.date).toLocaleDateString()}</p>
          </div>
          {symptom.time_of_day && (
            <div>
              <span className="text-gray-500">Time:</span>
              <p className="font-medium">{symptom.time_of_day}</p>
            </div>
          )}
          {(symptom.severity_level || symptom.intensity_level || symptom.scale_value) && (
            <div>
              <span className="text-gray-500">Severity:</span>
              <p className="font-medium">
                {symptom.severity_level || symptom.intensity_level || symptom.scale_value}/10
              </p>
            </div>
          )}
          {symptom.cycle_day && (
            <div>
              <span className="text-gray-500">Cycle Day:</span>
              <p className="font-medium">{symptom.cycle_day}</p>
            </div>
          )}
        </div>

        {symptom.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 italic">"{symptom.notes}"</p>
          </div>
        )}
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingSymptom) return null;

    const definition = definitions.find(d => d.id === editingSymptom.symptom_definition_id);
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Edit Symptom</h3>
            <button
              onClick={() => setEditingSymptom(null)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={editingSymptom.date}
                  onChange={(e) => setEditingSymptom({ ...editingSymptom, date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={editingSymptom.time_of_day || ''}
                  onChange={(e) => setEditingSymptom({ ...editingSymptom, time_of_day: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {definition?.measurement_type === 'severity' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editingSymptom.severity_level || 5}
                  onChange={(e) => setEditingSymptom({ ...editingSymptom, severity_level: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Mild</span>
                  <span className="font-medium text-purple-600">{editingSymptom.severity_level || 5}</span>
                  <span>Severe</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editingSymptom.stress_level || 5}
                  onChange={(e) => setEditingSymptom({ ...editingSymptom, stress_level: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center text-sm text-purple-600 font-medium">
                  {editingSymptom.stress_level || 5}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood Rating (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editingSymptom.mood_rating || 5}
                  onChange={(e) => setEditingSymptom({ ...editingSymptom, mood_rating: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center text-sm text-purple-600 font-medium">
                  {editingSymptom.mood_rating || 5}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={editingSymptom.notes || ''}
                onChange={(e) => setEditingSymptom({ ...editingSymptom, notes: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setEditingSymptom(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateSymptom(editingSymptom.id, editingSymptom)}
                className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderViewModal = () => {
    if (!viewingSymptom) return null;

    const definition = definitions.find(d => d.id === viewingSymptom.symptom_definition_id);
    const category = categories.find(c => c.id === definition?.category_id);
    const Icon = iconMap[category?.icon_name] || Heart;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: category?.color_code || '#6B7280' }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{definition?.name}</h3>
                <p className="text-sm text-gray-500">{category?.name}</p>
              </div>
            </div>
            <button
              onClick={() => setViewingSymptom(null)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(viewingSymptom.date).toLocaleDateString()}</span>
                    </div>
                    {viewingSymptom.time_of_day && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{viewingSymptom.time_of_day}</span>
                      </div>
                    )}
                    {viewingSymptom.cycle_day && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cycle Day:</span>
                        <span className="font-medium">{viewingSymptom.cycle_day}</span>
                      </div>
                    )}
                    {viewingSymptom.menstrual_phase && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phase:</span>
                        <span className="font-medium capitalize">{viewingSymptom.menstrual_phase}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Measurements</h4>
                  <div className="space-y-2 text-sm">
                    {viewingSymptom.severity_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Severity:</span>
                        <span className="font-medium">{viewingSymptom.severity_level}/10</span>
                      </div>
                    )}
                    {viewingSymptom.intensity_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Intensity:</span>
                        <span className="font-medium">{viewingSymptom.intensity_level}/10</span>
                      </div>
                    )}
                    {viewingSymptom.frequency_count && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="font-medium">{viewingSymptom.frequency_count} times</span>
                      </div>
                    )}
                    {viewingSymptom.duration_minutes && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{viewingSymptom.duration_minutes} minutes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Context</h4>
                  <div className="space-y-2 text-sm">
                    {viewingSymptom.stress_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stress Level:</span>
                        <span className="font-medium">{viewingSymptom.stress_level}/10</span>
                      </div>
                    )}
                    {viewingSymptom.mood_rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mood:</span>
                        <span className="font-medium">{viewingSymptom.mood_rating}/10</span>
                      </div>
                    )}
                    {viewingSymptom.sleep_hours && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sleep:</span>
                        <span className="font-medium">{viewingSymptom.sleep_hours} hours</span>
                      </div>
                    )}
                    {viewingSymptom.exercise_intensity && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exercise:</span>
                        <span className="font-medium capitalize">{viewingSymptom.exercise_intensity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(viewingSymptom.potential_triggers?.length > 0 || viewingSymptom.medications_taken?.length > 0) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Info</h4>
                    <div className="space-y-2 text-sm">
                      {viewingSymptom.potential_triggers?.length > 0 && (
                        <div>
                          <span className="text-gray-600">Triggers:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {viewingSymptom.potential_triggers.map((trigger, index) => (
                              <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {viewingSymptom.medications_taken?.length > 0 && (
                        <div>
                          <span className="text-gray-600">Medications:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {viewingSymptom.medications_taken.map((med, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {med}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {viewingSymptom.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{viewingSymptom.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setViewingSymptom(null);
                  setEditingSymptom(viewingSymptom);
                }}
                className="px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewingSymptom(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">All Symptom Logs</h1>
                <p className="text-sm text-gray-500">
                  {filteredSymptoms.length} of {symptoms.length} symptoms
                  {getActiveFiltersCount() > 0 && ` (${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? 's' : ''} active)`}
                </p>
              </div>
            </div>
            <button
              onClick={onAddNew}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear All ({getActiveFiltersCount()})
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4" />
              <span>Toggle Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search symptoms, categories, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Severities</option>
                  <option value="mild">Mild (1-3)</option>
                  <option value="moderate">Moderate (4-6)</option>
                  <option value="severe">Severe (7-10)</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'severity' | 'category')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="severity">Severity</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredSymptoms.length > 0 ? (
            filteredSymptoms.map(renderSymptomCard)
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No symptoms found</h3>
              <p className="text-gray-600 mb-6">
                {symptoms.length === 0 
                  ? "You haven't logged any symptoms yet."
                  : "Try adjusting your filters or search terms."
                }
              </p>
              <button
                onClick={onAddNew}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Log Your First Symptom</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {renderEditModal()}
      {renderViewModal()}
    </div>
  );
};

export default ViewAllSymptomsPage;
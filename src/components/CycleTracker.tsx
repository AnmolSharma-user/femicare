import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Droplets, Heart, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  getCycleLogs, 
  addCycleLog, 
  getCycleAnalytics,
  updateUserProfile 
} from '../utils/supabase';

const CycleTracker = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [cycleLogs, setCycleLogs] = useState<any[]>([]);
  const [cycleAnalytics, setCycleAnalytics] = useState<any>(null);
  const [showLogPeriod, setShowLogPeriod] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    flowIntensity: 'normal',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadCycleData();
    }
  }, [user]);

  const loadCycleData = async () => {
    if (!user) return;

    try {
      const [profileResult, cycleResult, analyticsResult] = await Promise.all([
        getUserProfile(user.id),
        getCycleLogs(user.id, 6),
        getCycleAnalytics(user.id)
      ]);

      if (profileResult.data) setProfile(profileResult.data);
      if (cycleResult.data) setCycleLogs(cycleResult.data);
      if (analyticsResult.data) setCycleAnalytics(analyticsResult.data);
    } catch (error) {
      console.error('Error loading cycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCycleDay = () => {
    if (!profile?.last_period_date) return 1;
    
    const lastPeriod = new Date(profile.last_period_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPeriod.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const calculateNextPeriod = () => {
    if (!profile?.last_period_date) return new Date();
    
    const lastPeriod = new Date(profile.last_period_date);
    const cycleLength = cycleAnalytics?.averageCycleLength || profile?.average_cycle_length || 28;
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(lastPeriod.getDate() + cycleLength);
    
    return nextPeriod;
  };

  const getCurrentPhase = () => {
    const cycleDay = calculateCycleDay();
    const cycleLength = cycleAnalytics?.averageCycleLength || profile?.average_cycle_length || 28;
    const periodLength = cycleAnalytics?.averagePeriodLength || profile?.average_period_length || 5;
    
    if (cycleDay <= periodLength) return 'Menstrual';
    if (cycleDay <= cycleLength / 2 - 2) return 'Follicular';
    if (cycleDay <= cycleLength / 2 + 2) return 'Ovulation';
    return 'Luteal';
  };

  const getFertilityWindow = () => {
    if (!profile?.last_period_date) return { start: new Date(), end: new Date() };
    
    const lastPeriod = new Date(profile.last_period_date);
    const cycleLength = cycleAnalytics?.averageCycleLength || profile?.average_cycle_length || 28;
    
    const ovulationDay = Math.round(cycleLength / 2);
    const fertilityStart = new Date(lastPeriod);
    fertilityStart.setDate(lastPeriod.getDate() + ovulationDay - 5);
    
    const fertilityEnd = new Date(lastPeriod);
    fertilityEnd.setDate(lastPeriod.getDate() + ovulationDay + 1);
    
    return { start: fertilityStart, end: fertilityEnd };
  };

  const handleLogPeriod = async () => {
    if (!user) return;

    try {
      const cycleData = {
        start_date: formData.startDate,
        flow_intensity: formData.flowIntensity,
        notes: formData.notes
      };

      await addCycleLog(user.id, cycleData);
      
      // Update last period date in profile
      await updateUserProfile(user.id, {
        last_period_date: formData.startDate
      });

      // Reload data
      await loadCycleData();
      setShowLogPeriod(false);
      setFormData({
        startDate: new Date().toISOString().split('T')[0],
        flowIntensity: 'normal',
        notes: ''
      });
    } catch (error) {
      console.error('Error logging period:', error);
    }
  };

  const phases = [
    {
      name: 'Menstrual',
      days: `1-${cycleAnalytics?.averagePeriodLength || 5}`,
      color: 'bg-red-500',
      description: 'Your period is here. Focus on rest and comfort.',
      tips: ['Use heat pads for cramps', 'Stay hydrated', 'Gentle exercise like yoga']
    },
    {
      name: 'Follicular',
      days: `1-${Math.round((cycleAnalytics?.averageCycleLength || 28) / 2) - 1}`,
      color: 'bg-pink-500',
      description: 'Energy levels start rising. Great time for new projects.',
      tips: ['Increase exercise intensity', 'Try new activities', 'Focus on goal setting']
    },
    {
      name: 'Ovulation',
      days: `${Math.round((cycleAnalytics?.averageCycleLength || 28) / 2)}`,
      color: 'bg-purple-500',
      description: 'Peak fertility window. You might feel more confident.',
      tips: ['Track basal body temperature', 'Notice cervical mucus changes', 'Peak energy for workouts']
    },
    {
      name: 'Luteal',
      days: `${Math.round((cycleAnalytics?.averageCycleLength || 28) / 2) + 1}-${cycleAnalytics?.averageCycleLength || 28}`,
      color: 'bg-indigo-500',
      description: 'Energy may fluctuate. Listen to your body.',
      tips: ['Focus on self-care', 'Maintain consistent sleep', 'Prepare for next cycle']
    }
  ];

  const currentPhase = getCurrentPhase();
  const currentPhaseData = phases.find(p => p.name === currentPhase) || phases[0];
  const fertilityWindow = getFertilityWindow();
  const nextPeriod = calculateNextPeriod();
  const daysUntilNextPeriod = Math.ceil((nextPeriod.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Cycle Tracker</h2>
            <p className="text-pink-100 text-lg">
              Day {calculateCycleDay()} of your cycle • {currentPhase} Phase
            </p>
            {cycleAnalytics && (
              <p className="text-pink-200 text-sm mt-1">
                {cycleAnalytics.regularity}% regular • {cycleLogs.length} cycles tracked
              </p>
            )}
          </div>
          <button
            onClick={() => setShowLogPeriod(true)}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Log Period</span>
          </button>
        </div>
      </div>

      {/* Current Phase Details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-4 h-4 rounded-full ${currentPhaseData.color}`}></div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{currentPhaseData.name} Phase</h3>
            <p className="text-gray-500">Days {currentPhaseData.days}</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">{currentPhaseData.description}</p>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3">Tips for this phase:</h4>
          <ul className="space-y-2">
            {currentPhaseData.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cycle Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cycle Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Cycle Timeline</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Droplets className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Last Period</p>
                  <p className="text-sm text-gray-500">
                    {profile?.last_period_date 
                      ? new Date(profile.last_period_date).toLocaleDateString()
                      : 'Not logged yet'
                    }
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-red-600">
                {cycleAnalytics?.averagePeriodLength || profile?.average_period_length || 5} days
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Fertility Window</p>
                  <p className="text-sm text-gray-500">
                    {fertilityWindow.start.toLocaleDateString()} - {fertilityWindow.end.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-purple-600">6 days</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Next Period</p>
                  <p className="text-sm text-gray-500">
                    {nextPeriod.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-indigo-600">
                {Math.max(0, daysUntilNextPeriod)} days
              </span>
            </div>
          </div>
        </div>

        {/* Predictions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Cycle Statistics</h3>
          
          <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Average Cycle Length</p>
              <p className="text-3xl font-bold text-gray-900">
                {cycleAnalytics?.averageCycleLength || profile?.average_cycle_length || 28}
              </p>
              <p className="text-sm text-gray-500">days</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-pink-50 rounded-xl">
                <Moon className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Period Length</p>
                <p className="text-xl font-bold text-gray-900">
                  {cycleAnalytics?.averagePeriodLength || profile?.average_period_length || 5}
                </p>
                <p className="text-xs text-gray-500">days avg</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Sun className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Regularity</p>
                <p className="text-xl font-bold text-gray-900">
                  {cycleAnalytics?.regularity || 95}%
                </p>
                <p className="text-xs text-gray-500">accurate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cycle Logs */}
      {cycleLogs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Cycles</h3>
          
          <div className="space-y-4">
            {cycleLogs.map((cycle) => (
              <div key={cycle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(cycle.start_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {cycle.flow_intensity} flow
                      {cycle.cycle_length && ` • ${cycle.cycle_length} day cycle`}
                    </p>
                  </div>
                </div>
                {cycle.notes && (
                  <p className="text-sm text-gray-600 max-w-xs truncate">
                    {cycle.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Cycle Phases</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {phases.map((phase, index) => (
            <div 
              key={index} 
              className={`p-4 border-2 rounded-xl hover:shadow-md transition-all ${
                phase.name === currentPhase 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${phase.color}`}></div>
                <div>
                  <h4 className="font-medium text-gray-900">{phase.name}</h4>
                  <p className="text-sm text-gray-500">Days {phase.days}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{phase.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Log Period Modal */}
      {showLogPeriod && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Log Period</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flow Intensity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['light', 'normal', 'heavy', 'very_heavy'].map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => setFormData({ ...formData, flowIntensity: intensity })}
                      className={`p-3 border rounded-lg transition-colors text-sm capitalize ${
                        formData.flowIntensity === intensity
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'border-gray-300 hover:bg-pink-50 hover:border-pink-500'
                      }`}
                    >
                      {intensity.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowLogPeriod(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogPeriod}
                  className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleTracker;
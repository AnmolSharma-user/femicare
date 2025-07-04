import React, { useState, useEffect } from 'react';
import { Calendar, Droplets, Heart, TrendingUp, Clock, Target, Plus, Activity, Zap, Moon, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  getSymptomLogs, 
  getMoodLogs, 
  getCycleLogs,
  getUserInsights,
  getCycleAnalytics,
  addMoodLog,
  addSymptomLog,
  addCycleLog
} from '../utils/supabase';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [recentSymptoms, setRecentSymptoms] = useState<any[]>([]);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);
  const [cycleLogs, setCycleLogs] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [cycleAnalytics, setCycleAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickLog, setShowQuickLog] = useState<string | null>(null);
  const [quickLogData, setQuickLogData] = useState({
    mood: 'good',
    energy: 5,
    stress: 5,
    sleep: 5,
    symptom: '',
    severity: 'mild',
    category: 'physical',
    periodStart: new Date().toISOString().split('T')[0],
    flowIntensity: 'normal'
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [
        profileResult, 
        symptomsResult, 
        moodsResult, 
        cycleResult,
        insightsResult,
        analyticsResult
      ] = await Promise.all([
        getUserProfile(user.id),
        getSymptomLogs(user.id, 5),
        getMoodLogs(user.id, 3),
        getCycleLogs(user.id, 3),
        getUserInsights(user.id, 3),
        getCycleAnalytics(user.id)
      ]);

      if (profileResult.data) setProfile(profileResult.data);
      if (symptomsResult.data) setRecentSymptoms(symptomsResult.data);
      if (moodsResult.data) setRecentMoods(moodsResult.data);
      if (cycleResult.data) setCycleLogs(cycleResult.data);
      if (insightsResult.data) setInsights(insightsResult.data);
      if (analyticsResult.data) setCycleAnalytics(analyticsResult.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    if (!profile?.last_period_date) return 0;
    
    const lastPeriod = new Date(profile.last_period_date);
    const cycleLength = cycleAnalytics?.averageCycleLength || profile?.average_cycle_length || 28;
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(lastPeriod.getDate() + cycleLength);
    
    const today = new Date();
    const diffTime = nextPeriod.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
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

  const getFertilityStatus = () => {
    const phase = getCurrentPhase();
    if (phase === 'Ovulation') return 'High';
    if (phase === 'Follicular' && calculateCycleDay() > 10) return 'Medium';
    return 'Low';
  };

  const handleQuickLog = async (type: string) => {
    if (!user) return;

    try {
      switch (type) {
        case 'mood':
          await addMoodLog(user.id, {
            date: new Date().toISOString().split('T')[0],
            mood: quickLogData.mood,
            energy_level: quickLogData.energy,
            stress_level: quickLogData.stress,
            sleep_quality: quickLogData.sleep
          });
          break;
        case 'symptom':
          await addSymptomLog(user.id, {
            date: new Date().toISOString().split('T')[0],
            category: quickLogData.category,
            symptom: quickLogData.symptom,
            severity: quickLogData.severity
          });
          break;
        case 'period':
          await addCycleLog(user.id, {
            start_date: quickLogData.periodStart,
            flow_intensity: quickLogData.flowIntensity
          });
          break;
      }
      
      setShowQuickLog(null);
      await loadDashboardData();
    } catch (error) {
      console.error('Error logging data:', error);
    }
  };

  const todayStats = {
    cycleDay: calculateCycleDay(),
    nextPeriod: calculateNextPeriod(),
    currentPhase: getCurrentPhase(),
    fertility: getFertilityStatus()
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    return user?.email?.split('@')[0] || 'there';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-green-400';
      default: return 'bg-blue-400';
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {getGreeting()}, {getUserName()}!
          </h2>
          <p className="text-pink-100 text-base md:text-lg">
            Today is day {todayStats.cycleDay} of your cycle. You're in the {todayStats.currentPhase.toLowerCase()} phase.
          </p>
          {cycleAnalytics && (
            <p className="text-pink-200 text-sm mt-2">
              Your cycle regularity: {cycleAnalytics.regularity}% • Average length: {cycleAnalytics.averageCycleLength} days
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Cycle Day</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{todayStats.cycleDay}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Next Period</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{todayStats.nextPeriod}</p>
              <p className="text-xs text-gray-400">days</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Droplets className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Current Phase</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{todayStats.currentPhase}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Fertility</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{todayStats.fertility}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Symptoms */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-pink-600 hover:text-pink-700 font-medium text-sm">
              View All
            </button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {recentSymptoms.length > 0 ? (
              recentSymptoms.map((symptom) => (
                <div key={symptom.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      symptom.severity === 'mild' ? 'bg-green-400' :
                      symptom.severity === 'moderate' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">{symptom.symptom}</p>
                      <p className="text-xs md:text-sm text-gray-500 capitalize">{symptom.category} • {symptom.severity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs md:text-sm text-gray-400">
                      {new Date(symptom.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No recent symptoms logged</p>
                <button 
                  onClick={() => setShowQuickLog('symptom')}
                  className="flex items-center space-x-2 mx-auto px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Symptom</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Health Insights</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3 md:space-y-4">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <div key={insight.id} className={`p-3 md:p-4 rounded-xl border-2 ${getPriorityColor(insight.priority)}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getPriorityDot(insight.priority)}`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">{insight.title}</h4>
                      <p className="text-xs md:text-sm text-gray-600">{insight.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No insights available yet</p>
                <p className="text-sm text-gray-400">Keep logging your data to get personalized insights</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Mood Logs */}
      {recentMoods.length > 0 && (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Recent Mood Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentMoods.map((mood) => (
              <div key={mood.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 capitalize">{mood.mood}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(mood.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {mood.energy_level && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Energy:</span>
                      <span className="font-medium">{mood.energy_level}/10</span>
                    </div>
                  )}
                  {mood.stress_level && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stress:</span>
                      <span className="font-medium">{mood.stress_level}/10</span>
                    </div>
                  )}
                  {mood.sleep_quality && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sleep:</span>
                      <span className="font-medium">{mood.sleep_quality}/10</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button 
            onClick={() => setShowQuickLog('period')}
            className="p-3 md:p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors text-center"
          >
            <Droplets className="w-5 h-5 md:w-6 md:h-6 text-pink-600 mx-auto mb-2" />
            <p className="text-xs md:text-sm font-medium text-gray-900">Log Period</p>
          </button>
          <button 
            onClick={() => setShowQuickLog('symptom')}
            className="p-3 md:p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center"
          >
            <Heart className="w-5 h-5 md:w-6 md:h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs md:text-sm font-medium text-gray-900">Add Symptom</p>
          </button>
          <button 
            onClick={() => setShowQuickLog('mood')}
            className="p-3 md:p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors text-center"
          >
            <Brain className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-xs md:text-sm font-medium text-gray-900">Mood Check</p>
          </button>
          <button className="p-3 md:p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors text-center">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-rose-600 mx-auto mb-2" />
            <p className="text-xs md:text-sm font-medium text-gray-900">Set Reminder</p>
          </button>
        </div>
      </div>

      {/* Quick Log Modals */}
      {showQuickLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Quick {showQuickLog === 'period' ? 'Period' : showQuickLog === 'mood' ? 'Mood' : 'Symptom'} Log
            </h3>
            
            {showQuickLog === 'mood' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                  <select
                    value={quickLogData.mood}
                    onChange={(e) => setQuickLogData({ ...quickLogData, mood: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="great">Great</option>
                    <option value="good">Good</option>
                    <option value="okay">Okay</option>
                    <option value="low">Low</option>
                    <option value="anxious">Anxious</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Energy</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={quickLogData.energy}
                      onChange={(e) => setQuickLogData({ ...quickLogData, energy: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{quickLogData.energy}/10</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stress</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={quickLogData.stress}
                      onChange={(e) => setQuickLogData({ ...quickLogData, stress: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{quickLogData.stress}/10</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sleep</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={quickLogData.sleep}
                      onChange={(e) => setQuickLogData({ ...quickLogData, sleep: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{quickLogData.sleep}/10</div>
                  </div>
                </div>
              </div>
            )}

            {showQuickLog === 'symptom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symptom</label>
                  <input
                    type="text"
                    value={quickLogData.symptom}
                    onChange={(e) => setQuickLogData({ ...quickLogData, symptom: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Headache, Cramps, Bloating"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={quickLogData.category}
                      onChange={(e) => setQuickLogData({ ...quickLogData, category: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="physical">Physical</option>
                      <option value="energy">Energy</option>
                      <option value="mood">Mood</option>
                      <option value="sleep">Sleep</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={quickLogData.severity}
                      onChange={(e) => setQuickLogData({ ...quickLogData, severity: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {showQuickLog === 'period' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={quickLogData.periodStart}
                    onChange={(e) => setQuickLogData({ ...quickLogData, periodStart: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flow Intensity</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['light', 'normal', 'heavy', 'very_heavy'].map((intensity) => (
                      <button
                        key={intensity}
                        onClick={() => setQuickLogData({ ...quickLogData, flowIntensity: intensity })}
                        className={`p-3 border rounded-lg transition-colors text-sm capitalize ${
                          quickLogData.flowIntensity === intensity
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'border-gray-300 hover:bg-pink-50 hover:border-pink-500'
                        }`}
                      >
                        {intensity.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowQuickLog(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleQuickLog(showQuickLog)}
                className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, BarChart3, PieChart, Activity, Brain, Heart, Zap, Moon, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { getAdvancedAnalytics, getCycleLogs, getEnhancedSymptomLogs, getMoodLogs } from '../utils/supabase';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [cycleTrends, setCycleTrends] = useState<any[]>([]);
  const [symptomTrends, setSymptomTrends] = useState<any[]>([]);
  const [moodTrends, setMoodTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      const [analyticsResult, cyclesResult, symptomsResult, moodsResult] = await Promise.all([
        getAdvancedAnalytics(user.id),
        getCycleLogs(user.id, 12),
        getEnhancedSymptomLogs(user.id, 100),
        getMoodLogs(user.id, 30)
      ]);

      if (analyticsResult.data) setAnalytics(analyticsResult.data);
      
      // Process cycle trends
      if (cyclesResult.data) {
        const cycleData = cyclesResult.data
          .filter(c => c.cycle_length)
          .map((cycle, index) => ({
            cycle: `Cycle ${cyclesResult.data.length - index}`,
            length: cycle.cycle_length,
            periodLength: cycle.period_length || 0,
            date: cycle.start_date,
            flowIntensity: cycle.flow_intensity
          }))
          .reverse();
        setCycleTrends(cycleData);
      }

      // Process symptom trends
      if (symptomsResult.data) {
        const symptomsByDate = symptomsResult.data.reduce((acc, symptom) => {
          const date = symptom.date;
          if (!acc[date]) {
            acc[date] = {
              date,
              count: 0,
              avgSeverity: 0,
              avgMood: 0,
              avgStress: 0,
              symptoms: []
            };
          }
          acc[date].count++;
          acc[date].avgSeverity += symptom.severity_level || 0;
          acc[date].avgMood += symptom.mood_rating || 0;
          acc[date].avgStress += symptom.stress_level || 0;
          acc[date].symptoms.push(symptom.symptom_definitions?.name || 'Unknown');
          return acc;
        }, {});

        const symptomData = Object.values(symptomsByDate).map((day: any) => ({
          ...day,
          avgSeverity: day.count > 0 ? Math.round(day.avgSeverity / day.count) : 0,
          avgMood: day.count > 0 ? Math.round(day.avgMood / day.count) : 0,
          avgStress: day.count > 0 ? Math.round(day.avgStress / day.count) : 0,
          formattedDate: format(parseISO(day.date), 'MMM dd')
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-30);

        setSymptomTrends(symptomData);
      }

      // Process mood trends
      if (moodsResult.data) {
        const moodData = moodsResult.data.map(mood => ({
          date: mood.date,
          formattedDate: format(parseISO(mood.date), 'MMM dd'),
          mood: mood.mood,
          energy: mood.energy_level || 0,
          stress: mood.stress_level || 0,
          sleep: mood.sleep_quality || 0
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setMoodTrends(moodData);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6366F1', '#84CC16'];

  const wellnessData = analytics ? [
    { subject: 'Cycle Regularity', A: analytics.cycles?.regularity || 0, fullMark: 100 },
    { subject: 'Mood Stability', A: 85, fullMark: 100 },
    { subject: 'Energy Levels', A: 78, fullMark: 100 },
    { subject: 'Sleep Quality', A: 82, fullMark: 100 },
    { subject: 'Symptom Management', A: Math.max(0, 100 - (analytics.symptoms?.totalLogs || 0) * 2), fullMark: 100 },
    { subject: 'Overall Health', A: analytics.wellnessScore || 75, fullMark: 100 }
  ] : [];

  const phaseData = analytics?.symptoms?.cyclePhaseDistribution ? [
    { name: 'Menstrual', value: analytics.symptoms.cyclePhaseDistribution.menstrual || 0, color: '#EF4444' },
    { name: 'Follicular', value: analytics.symptoms.cyclePhaseDistribution.follicular || 0, color: '#EC4899' },
    { name: 'Ovulation', value: analytics.symptoms.cyclePhaseDistribution.ovulation || 0, color: '#8B5CF6' },
    { name: 'Luteal', value: analytics.symptoms.cyclePhaseDistribution.luteal || 0, color: '#6366F1' }
  ] : [];

  const categoryData = analytics?.symptoms?.categoryDistribution ? 
    Object.entries(analytics.symptoms.categoryDistribution).map(([name, value], index) => ({
      name,
      value: value as number,
      color: COLORS[index % COLORS.length]
    })) : [];

  const renderOverview = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-500">Wellness Score</h3>
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{analytics?.wellnessScore || 0}</div>
          <p className="text-xs md:text-sm text-purple-600">
            {(analytics?.wellnessScore || 0) >= 80 ? 'Excellent' : 
             (analytics?.wellnessScore || 0) >= 60 ? 'Good' : 'Needs Attention'}
          </p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-500">Cycle Regularity</h3>
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{analytics?.cycles?.regularity || 0}%</div>
          <p className="text-xs md:text-sm text-green-600">
            {(analytics?.cycles?.regularity || 0) >= 90 ? 'Very Regular' : 
             (analytics?.cycles?.regularity || 0) >= 70 ? 'Mostly Regular' : 'Irregular'}
          </p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-500">Symptoms Tracked</h3>
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{analytics?.symptoms?.totalLogs || 0}</div>
          <p className="text-xs md:text-sm text-pink-600">Last 90 days</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-500">Data Points</h3>
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
            {(analytics?.cycles?.totalCycles || 0) + (analytics?.symptoms?.totalLogs || 0) + (moodTrends.length || 0)}
          </div>
          <p className="text-xs md:text-sm text-indigo-600">Total logged</p>
        </div>
      </div>

      {/* Wellness Radar Chart */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Wellness Overview</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={wellnessData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Wellness" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions and Insights */}
      {analytics?.predictions && (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Predictions & Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="p-3 md:p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                <h4 className="text-sm md:text-base font-medium text-purple-900">Next Period Prediction</h4>
              </div>
              <p className="text-sm md:text-base text-purple-800 mb-1 md:mb-2">
                Expected: {format(parseISO(analytics.predictions.nextPeriod), 'MMM dd, yyyy')}
              </p>
              <p className="text-xs md:text-sm text-purple-600">
                Confidence: {analytics.predictions.confidence}%
              </p>
            </div>

            <div className="p-3 md:p-4 bg-pink-50 rounded-xl border border-pink-200">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
                <h4 className="text-sm md:text-base font-medium text-pink-900">Fertility Window</h4>
              </div>
              <p className="text-sm md:text-base text-pink-800 mb-1 md:mb-2">
                {format(parseISO(analytics.predictions.ovulationWindow.start), 'MMM dd')} - {format(parseISO(analytics.predictions.ovulationWindow.end), 'MMM dd')}
              </p>
              <p className="text-xs md:text-sm text-pink-600">
                Optimal conception window
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCycleAnalytics = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Cycle Length Trends */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Cycle Length Trends</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cycleTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cycle" tick={{ fontSize: 12 }} />
              <YAxis domain={[20, 40]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="length" stroke="#8B5CF6" strokeWidth={3} name="Cycle Length" />
              <Line type="monotone" dataKey="periodLength" stroke="#EC4899" strokeWidth={2} name="Period Length" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flow Intensity Distribution */}
      {cycleTrends.length > 0 && (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Flow Intensity Distribution</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleTrends.reduce((acc, cycle) => {
                const intensity = cycle.flowIntensity || 'normal';
                const existing = acc.find(item => item.intensity === intensity);
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ intensity, count: 1 });
                }
                return acc;
              }, [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="intensity" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cycle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h4 className="text-sm md:text-base font-medium text-gray-900 mb-3 md:mb-4">Average Cycle Length</h4>
          <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1 md:mb-2">
            {analytics?.cycles?.averageCycleLength || 0} days
          </div>
          <p className="text-xs md:text-sm text-gray-500">
            Range: {cycleTrends.length > 0 ? `${Math.min(...cycleTrends.map(c => c.length))} - ${Math.max(...cycleTrends.map(c => c.length))} days` : 'No data'}
          </p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h4 className="text-sm md:text-base font-medium text-gray-900 mb-3 md:mb-4">Average Period Length</h4>
          <div className="text-2xl md:text-3xl font-bold text-pink-600 mb-1 md:mb-2">
            {analytics?.cycles?.averagePeriodLength || 0} days
          </div>
          <p className="text-xs md:text-sm text-gray-500">
            Typical range: 3-7 days
          </p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h4 className="text-sm md:text-base font-medium text-gray-900 mb-3 md:mb-4">Regularity Score</h4>
          <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1 md:mb-2">
            {analytics?.cycles?.regularity || 0}%
          </div>
          <p className="text-xs md:text-sm text-gray-500">
            {(analytics?.cycles?.regularity || 0) >= 90 ? 'Excellent' : 
             (analytics?.cycles?.regularity || 0) >= 70 ? 'Good' : 'Needs attention'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderSymptomAnalytics = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Symptom Trends Over Time */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Symptom Trends (Last 30 Days)</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={symptomTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="count" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Symptom Count" />
              <Area type="monotone" dataKey="avgSeverity" stackId="2" stroke="#EC4899" fill="#EC4899" fillOpacity={0.6} name="Avg Severity" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Symptom Categories Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Symptoms by Category</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fontSize: 12 }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Symptoms by Cycle Phase</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most Common Symptoms */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Most Common Symptoms</h3>
        <div className="space-y-3 md:space-y-4">
          {analytics?.symptoms?.mostCommonSymptoms?.map((symptom, index) => (
            <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm md:text-base text-purple-600 font-medium">{index + 1}</span>
                </div>
                <span className="text-sm md:text-base font-medium text-gray-900">{symptom.symptom}</span>
              </div>
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-20 md:w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${symptom.frequency}%` }}
                  ></div>
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-600">{symptom.frequency}%</span>
              </div>
            </div>
          )) || <p className="text-gray-500 text-center py-8">No symptom data available</p>}
        </div>
      </div>
    </div>
  );

  const renderMoodAnalytics = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Mood Trends */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Mood & Wellness Trends</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moodTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="energy" stroke="#F59E0B" strokeWidth={2} name="Energy Level" />
              <Line type="monotone" dataKey="stress" stroke="#EF4444" strokeWidth={2} name="Stress Level" />
              <Line type="monotone" dataKey="sleep" stroke="#3B82F6" strokeWidth={2} name="Sleep Quality" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood Distribution */}
      {moodTrends.length > 0 && (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Mood Distribution</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodTrends.reduce((acc, mood) => {
                const existing = acc.find(item => item.mood === mood.mood);
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ mood: mood.mood, count: 1 });
                }
                return acc;
              }, [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mood" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Wellness Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
            <h4 className="text-sm md:text-base font-medium text-gray-900">Average Energy</h4>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-yellow-600 mb-1 md:mb-2">
            {moodTrends.length > 0 ? 
              Math.round(moodTrends.reduce((sum, mood) => sum + mood.energy, 0) / moodTrends.length) : 0}/10
          </div>
          <p className="text-xs md:text-sm text-gray-500">Last 30 days</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <Brain className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            <h4 className="text-sm md:text-base font-medium text-gray-900">Average Stress</h4>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-red-600 mb-1 md:mb-2">
            {moodTrends.length > 0 ? 
              Math.round(moodTrends.reduce((sum, mood) => sum + mood.stress, 0) / moodTrends.length) : 0}/10
          </div>
          <p className="text-xs md:text-sm text-gray-500">Lower is better</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <Moon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            <h4 className="text-sm md:text-base font-medium text-gray-900">Sleep Quality</h4>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1 md:mb-2">
            {moodTrends.length > 0 ? 
              Math.round(moodTrends.reduce((sum, mood) => sum + mood.sleep, 0) / moodTrends.length) : 0}/10
          </div>
          <p className="text-xs md:text-sm text-gray-500">Average rating</p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'cycles', label: 'Cycle Analysis', icon: Calendar },
    { id: 'symptoms', label: 'Symptom Patterns', icon: Heart },
    { id: 'mood', label: 'Mood & Wellness', icon: Brain }
  ];

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
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Advanced Analytics</h2>
            <p className="text-indigo-100 text-base md:text-lg">
              Comprehensive insights into your health patterns and trends
            </p>
            {analytics && (
              <p className="text-indigo-200 text-xs md:text-sm mt-2">
                {analytics.cycles?.totalCycles || 0} cycles • {analytics.symptoms?.totalLogs || 0} symptoms • {moodTrends.length} mood logs
              </p>
            )}
          </div>
          <BarChart3 className="w-10 h-10 md:w-12 md:h-12 text-white/80" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl md:rounded-2xl p-2 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 md:flex md:space-x-2 gap-2 md:gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center md:justify-start space-x-1 md:space-x-2 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl transition-all text-sm md:text-base ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'cycles' && renderCycleAnalytics()}
      {activeTab === 'symptoms' && renderSymptomAnalytics()}
      {activeTab === 'mood' && renderMoodAnalytics()}

      {/* Data Quality Indicator */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Data Quality & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className={`p-3 md:p-4 rounded-xl border-2 ${
            (analytics?.cycles?.totalCycles || 0) >= 3 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {(analytics?.cycles?.totalCycles || 0) >= 3 ? 
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" /> : 
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              }
              <span className="text-sm md:text-base font-medium">Cycle Data</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              {(analytics?.cycles?.totalCycles || 0) >= 3 ? 
                'Sufficient data for accurate predictions' : 
                'Log more cycles for better insights'
              }
            </p>
          </div>

          <div className={`p-3 md:p-4 rounded-xl border-2 ${
            (analytics?.symptoms?.totalLogs || 0) >= 10 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {(analytics?.symptoms?.totalLogs || 0) >= 10 ? 
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" /> : 
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              }
              <span className="text-sm md:text-base font-medium">Symptom Data</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              {(analytics?.symptoms?.totalLogs || 0) >= 10 ? 
                'Good symptom tracking for pattern analysis' : 
                'Track more symptoms for better correlations'
              }
            </p>
          </div>

          <div className={`p-3 md:p-4 rounded-xl border-2 ${
            moodTrends.length >= 7 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {moodTrends.length >= 7 ? 
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" /> : 
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              }
              <span className="text-sm md:text-base font-medium">Mood Data</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              {moodTrends.length >= 7 ? 
                'Regular mood tracking for wellness insights' : 
                'Log mood daily for better wellness tracking'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
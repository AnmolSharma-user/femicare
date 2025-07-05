import React, { useState } from 'react';
import { Brain, Heart, Zap, Moon, Thermometer, Calendar, CheckCircle, Plus } from 'lucide-react';
import PageLayout from './PageLayout';

const PMSSymptomTracker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<{[key: string]: number}>({});
  const [cycleDay, setCycleDay] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const pmsSymptoms = {
    physical: [
      'Bloating', 'Breast tenderness', 'Headaches', 'Fatigue', 'Cramps', 
      'Back pain', 'Joint pain', 'Food cravings', 'Weight gain', 'Acne'
    ],
    emotional: [
      'Mood swings', 'Irritability', 'Anxiety', 'Depression', 'Crying spells',
      'Anger', 'Feeling overwhelmed', 'Social withdrawal', 'Confusion', 'Tension'
    ],
    behavioral: [
      'Sleep changes', 'Appetite changes', 'Concentration problems', 'Forgetfulness',
      'Decreased motivation', 'Social isolation', 'Increased conflicts'
    ]
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
      const newSeverity = { ...severity };
      delete newSeverity[symptom];
      setSeverity(newSeverity);
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
      setSeverity({ ...severity, [symptom]: 5 });
    }
  };

  const updateSeverity = (symptom: string, value: number) => {
    setSeverity({ ...severity, [symptom]: value });
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) return;

    const totalSymptoms = selectedSymptoms.length;
    const avgSeverity = Object.values(severity).reduce((a, b) => a + b, 0) / totalSymptoms;
    
    const physicalCount = selectedSymptoms.filter(s => pmsSymptoms.physical.includes(s)).length;
    const emotionalCount = selectedSymptoms.filter(s => pmsSymptoms.emotional.includes(s)).length;
    const behavioralCount = selectedSymptoms.filter(s => pmsSymptoms.behavioral.includes(s)).length;

    let severity_level = 'Mild';
    if (avgSeverity >= 7 || totalSymptoms >= 8) severity_level = 'Severe';
    else if (avgSeverity >= 5 || totalSymptoms >= 5) severity_level = 'Moderate';

    let phase = 'Unknown';
    if (cycleDay) {
      const day = parseInt(cycleDay);
      if (day >= 1 && day <= 5) phase = 'Menstrual';
      else if (day >= 6 && day <= 13) phase = 'Follicular';
      else if (day >= 14 && day <= 16) phase = 'Ovulation';
      else if (day >= 17 && day <= 28) phase = 'Luteal (PMS likely)';
    }

    setAnalysis({
      totalSymptoms,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
      severity_level,
      physicalCount,
      emotionalCount,
      behavioralCount,
      phase,
      recommendations: generateRecommendations(severity_level, physicalCount, emotionalCount, behavioralCount)
    });
  };

  const generateRecommendations = (severity: string, physical: number, emotional: number, behavioral: number) => {
    const recommendations = [];
    
    if (physical > 0) {
      recommendations.push('Consider anti-inflammatory foods and gentle exercise');
      recommendations.push('Stay hydrated and limit salt intake');
    }
    
    if (emotional > 0) {
      recommendations.push('Practice stress management techniques');
      recommendations.push('Consider meditation or yoga');
    }
    
    if (behavioral > 0) {
      recommendations.push('Maintain regular sleep schedule');
      recommendations.push('Plan lighter activities during PMS days');
    }
    
    if (severity === 'Severe') {
      recommendations.push('Consider consulting healthcare provider');
      recommendations.push('Track symptoms for 2-3 cycles');
    }
    
    return recommendations;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <p className="text-xl text-gray-600 mb-8">
        Track and manage PMS symptoms effectively. Identify patterns, monitor severity, and get personalized recommendations for relief.
      </p>
      
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          PMS Symptom Tracker & Analyzer
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Cycle Day (optional)
            </label>
            <input
              type="number"
              min="1"
              max="35"
              value={cycleDay}
              onChange={(e) => setCycleDay(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Day of cycle (1-35)"
            />
          </div>
          <div className="flex items-end">
            <div className="w-full text-center">
              <div className="text-sm text-gray-600">Selected Symptoms</div>
              <div className="text-2xl font-bold text-purple-600">{selectedSymptoms.length}</div>
            </div>
          </div>
        </div>

        {/* Symptom Categories */}
        <div className="space-y-6 mb-6">
          {Object.entries(pmsSymptoms).map(([category, symptoms]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 capitalize flex items-center space-x-2">
                {category === 'physical' && <Thermometer className="w-5 h-5 text-red-600" />}
                {category === 'emotional' && <Brain className="w-5 h-5 text-blue-600" />}
                {category === 'behavioral' && <Zap className="w-5 h-5 text-green-600" />}
                <span>{category} Symptoms</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {symptoms.map((symptom) => (
                  <div key={symptom} className="space-y-2">
                    <button
                      onClick={() => toggleSymptom(symptom)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedSymptoms.includes(symptom)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{symptom}</span>
                        {selectedSymptoms.includes(symptom) && (
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                    </button>
                    
                    {selectedSymptoms.includes(symptom) && (
                      <div className="px-3">
                        <label className="block text-xs text-gray-600 mb-1">Severity (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={severity[symptom] || 5}
                          onChange={(e) => updateSeverity(symptom, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Mild</span>
                          <span className="font-medium text-purple-600">{severity[symptom] || 5}</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={analyzeSymptoms}
          disabled={selectedSymptoms.length === 0}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Analyze PMS Symptoms</span>
        </button>
        
        {analysis && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3">PMS Analysis Results:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
              <div>
                <div className="text-xl font-bold text-purple-600">{analysis.totalSymptoms}</div>
                <div className="text-sm text-purple-700">Total Symptoms</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">{analysis.avgSeverity}</div>
                <div className="text-sm text-purple-700">Avg Severity</div>
              </div>
              <div>
                <div className={`text-xl font-bold ${
                  analysis.severity_level === 'Mild' ? 'text-green-600' :
                  analysis.severity_level === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysis.severity_level}
                </div>
                <div className="text-sm text-purple-700">PMS Level</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">{analysis.phase}</div>
                <div className="text-sm text-purple-700">Cycle Phase</div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <h5 className="font-medium text-purple-900">Symptom Breakdown:</h5>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-red-600">{analysis.physicalCount}</div>
                  <div className="text-gray-600">Physical</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-blue-600">{analysis.emotionalCount}</div>
                  <div className="text-gray-600">Emotional</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-green-600">{analysis.behavioralCount}</div>
                  <div className="text-gray-600">Behavioral</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-purple-900">Recommendations:</h5>
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Track your PMS patterns over multiple cycles for better insights! 
                <a href="/auth/signup" className="text-purple-600 font-medium hover:underline ml-1">
                  Try FemCare's Advanced PMS Tracker →
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const mainContent = (
    <div className="space-y-16">
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding PMS (Premenstrual Syndrome)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-6">
              PMS affects up to 85% of menstruating women, causing physical and emotional symptoms 
              in the 1-2 weeks before menstruation. Understanding your patterns helps manage symptoms effectively.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">PMS vs PMDD:</h3>
            <ul className="space-y-3">
              {[
                'PMS: Mild to moderate symptoms, manageable daily life',
                'PMDD: Severe symptoms interfering with work/relationships',
                'PMS affects 85% of women, PMDD affects 3-8%',
                'Both improve significantly after menstruation starts',
                'PMDD may require medical treatment',
                'Tracking helps distinguish between PMS and PMDD'
              ].map((point, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">PMS Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">1-5</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Menstrual Phase</div>
                  <div className="text-sm text-gray-600">Symptoms improve/disappear</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">6-13</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Follicular Phase</div>
                  <div className="text-sm text-gray-600">Symptom-free period</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">14-16</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Ovulation</div>
                  <div className="text-sm text-gray-600">Some may feel symptoms</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border-2 border-red-200">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">17-28</span>
                </div>
                <div>
                  <div className="font-medium text-red-900">Luteal Phase</div>
                  <div className="text-sm text-red-700">PMS symptoms peak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete PMS Symptom Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              category: 'Physical Symptoms',
              icon: Thermometer,
              color: 'bg-red-100 text-red-600',
              symptoms: [
                'Bloating and water retention',
                'Breast tenderness and swelling',
                'Headaches and migraines',
                'Fatigue and low energy',
                'Abdominal cramps',
                'Back and joint pain',
                'Food cravings (especially sweet/salty)',
                'Weight gain (1-5 pounds)',
                'Acne breakouts',
                'Digestive issues'
              ]
            },
            {
              category: 'Emotional Symptoms',
              icon: Brain,
              color: 'bg-blue-100 text-blue-600',
              symptoms: [
                'Mood swings and irritability',
                'Anxiety and nervousness',
                'Depression and sadness',
                'Crying spells',
                'Anger and hostility',
                'Feeling overwhelmed',
                'Emotional sensitivity',
                'Low self-esteem',
                'Tension and restlessness',
                'Social withdrawal'
              ]
            },
            {
              category: 'Behavioral Symptoms',
              icon: Zap,
              color: 'bg-green-100 text-green-600',
              symptoms: [
                'Sleep disturbances',
                'Appetite changes',
                'Concentration problems',
                'Forgetfulness',
                'Decreased motivation',
                'Social isolation',
                'Increased conflicts',
                'Clumsiness',
                'Decreased productivity',
                'Changes in libido'
              ]
            }
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                <category.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
              <ul className="space-y-2">
                {category.symptoms.map((symptom, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">PMS Management Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Natural Remedies</h3>
            {[
              {
                title: 'Dietary Changes',
                tips: ['Reduce salt, sugar, and caffeine', 'Increase calcium and magnesium', 'Eat complex carbohydrates', 'Stay hydrated']
              },
              {
                title: 'Exercise',
                tips: ['Regular aerobic exercise', 'Yoga and stretching', 'Walking or swimming', 'Strength training']
              },
              {
                title: 'Stress Management',
                tips: ['Meditation and mindfulness', 'Deep breathing exercises', 'Adequate sleep (7-9 hours)', 'Relaxation techniques']
              }
            ].map((strategy, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">{strategy.title}</h4>
                <ul className="space-y-2">
                  {strategy.tips.map((tip, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Medical Treatments</h3>
            {[
              {
                title: 'Over-the-Counter',
                options: ['NSAIDs (ibuprofen, naproxen)', 'Calcium and magnesium supplements', 'Vitamin B6', 'Evening primrose oil']
              },
              {
                title: 'Prescription Options',
                options: ['Hormonal birth control', 'Antidepressants (SSRIs)', 'Diuretics for bloating', 'GnRH agonists (severe cases)']
              },
              {
                title: 'Alternative Therapies',
                options: ['Acupuncture', 'Massage therapy', 'Herbal supplements', 'Light therapy']
              }
            ].map((treatment, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">{treatment.title}</h4>
                <ul className="space-y-2">
                  {treatment.options.map((option, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{option}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const relatedPages = [
    {
      title: 'Period Tracker',
      description: 'Track your menstrual cycle and PMS patterns',
      href: '/pages/period-tracker',
      category: 'Tracking'
    },
    {
      title: 'Mood Tracker',
      description: 'Monitor mood changes throughout your cycle',
      href: '/pages/mood-tracker',
      category: 'Mental Health'
    },
    {
      title: 'Period Pain Tracker',
      description: 'Track and manage menstrual pain and cramps',
      href: '/pages/period-pain-tracker',
      category: 'Pain Management'
    },
    {
      title: 'Hormonal Imbalance Tracker',
      description: 'Monitor symptoms of hormonal imbalances',
      href: '/pages/hormonal-imbalance-tracker',
      category: 'Hormones'
    },
    {
      title: 'Sleep Quality Tracker',
      description: 'Track sleep patterns and PMS-related sleep issues',
      href: '/pages/sleep-quality-tracker',
      category: 'Sleep'
    },
    {
      title: 'Stress Tracker',
      description: 'Monitor stress levels and their impact on PMS',
      href: '/pages/stress-tracker',
      category: 'Stress'
    }
  ];

  const faq = [
    {
      question: 'What is the difference between PMS and PMDD?',
      answer: 'PMS (Premenstrual Syndrome) causes mild to moderate symptoms that don\'t significantly interfere with daily life. PMDD (Premenstrual Dysphoric Disorder) involves severe symptoms that seriously impact work, relationships, and daily functioning. PMDD affects 3-8% of women and may require medical treatment.'
    },
    {
      question: 'When do PMS symptoms typically start?',
      answer: 'PMS symptoms usually begin 1-2 weeks before menstruation (during the luteal phase) and improve significantly within a few days of period starting. Symptoms are most severe 2-7 days before menstruation.'
    },
    {
      question: 'Can diet really help with PMS symptoms?',
      answer: 'Yes, dietary changes can significantly reduce PMS symptoms. Reducing salt, sugar, and caffeine while increasing calcium, magnesium, and complex carbohydrates can help. Eating regular meals and staying hydrated also helps stabilize mood and energy.'
    },
    {
      question: 'How long should I track PMS symptoms?',
      answer: 'Track symptoms for at least 2-3 menstrual cycles to identify patterns. This helps distinguish PMS from other conditions and provides valuable information for healthcare providers if treatment is needed.'
    },
    {
      question: 'When should I see a doctor about PMS?',
      answer: 'Consult a healthcare provider if PMS symptoms severely interfere with work, relationships, or daily activities, if you suspect PMDD, if symptoms don\'t improve with lifestyle changes, or if you experience severe depression or anxiety.'
    },
    {
      question: 'Can exercise really help with PMS?',
      answer: 'Yes, regular exercise is one of the most effective natural treatments for PMS. It helps reduce bloating, improves mood through endorphin release, reduces stress, and can decrease the severity of both physical and emotional symptoms.'
    }
  ];

  return (
    <PageLayout
      title="PMS Symptom Tracker - Track Premenstrual Syndrome | FemCare"
      description="Track and manage PMS symptoms with FemCare's comprehensive tracker. Monitor physical, emotional, and behavioral symptoms. Get personalized relief recommendations."
      h1="PMS Symptom Tracker & Management Guide"
      heroContent={heroContent}
      mainContent={mainContent}
      relatedPages={relatedPages}
      faq={faq}
    />
  );
};

export default PMSSymptomTracker;
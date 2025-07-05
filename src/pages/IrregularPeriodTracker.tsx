import React, { useState } from 'react';
import { AlertTriangle, Calendar, TrendingUp, Clock, Heart, Calculator, CheckCircle } from 'lucide-react';
import PageLayout from './PageLayout';

const IrregularPeriodTracker = () => {
  const [periods, setPeriods] = useState([{ date: '', length: '5' }]);
  const [analysis, setAnalysis] = useState<any>(null);

  const addPeriod = () => {
    setPeriods([...periods, { date: '', length: '5' }]);
  };

  const updatePeriod = (index: number, field: string, value: string) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    setPeriods(updated);
  };

  const analyzePattern = () => {
    const validPeriods = periods.filter(p => p.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (validPeriods.length < 2) return;

    const cycleLengths = [];
    for (let i = 1; i < validPeriods.length; i++) {
      const days = Math.floor((new Date(validPeriods[i].date).getTime() - new Date(validPeriods[i-1].date).getTime()) / (1000 * 60 * 60 * 24));
      cycleLengths.push(days);
    }

    const avgLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((acc, length) => acc + Math.pow(length - avgLength, 2), 0) / cycleLengths.length;
    const stdDev = Math.sqrt(variance);
    
    let irregularityLevel = 'Regular';
    if (stdDev > 7) irregularityLevel = 'Highly Irregular';
    else if (stdDev > 4) irregularityLevel = 'Moderately Irregular';
    else if (stdDev > 2) irregularityLevel = 'Slightly Irregular';

    setAnalysis({
      avgLength: Math.round(avgLength),
      stdDev: Math.round(stdDev),
      irregularityLevel,
      cycleLengths,
      recommendation: stdDev > 7 ? 'Consult healthcare provider' : 'Continue monitoring'
    });
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <p className="text-xl text-gray-600 mb-8">
        Track and understand irregular menstrual cycles. Identify patterns, monitor changes, and get insights to discuss with your healthcare provider.
      </p>
      
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-3xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Irregular Period Pattern Analyzer
        </h3>
        
        <div className="space-y-4 mb-6">
          {periods.map((period, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Start Date
                </label>
                <input
                  type="date"
                  value={period.date}
                  onChange={(e) => updatePeriod(index, 'date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Length (days)
                </label>
                <select
                  value={period.length}
                  onChange={(e) => updatePeriod(index, 'length', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Array.from({ length: 8 }, (_, i) => i + 3).map(days => (
                    <option key={days} value={days}>{days} days</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                {index === periods.length - 1 && (
                  <button
                    onClick={addPeriod}
                    className="w-full bg-purple-100 text-purple-600 py-3 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    Add Period
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={analyzePattern}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Calculator className="w-5 h-5" />
          <span>Analyze Pattern</span>
        </button>
        
        {analysis && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3">Pattern Analysis Results:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className="text-xl font-bold text-purple-600">{analysis.avgLength}</div>
                <div className="text-sm text-purple-700">Average Cycle Length</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">{analysis.stdDev}</div>
                <div className="text-sm text-purple-700">Variation (days)</div>
              </div>
              <div>
                <div className={`text-xl font-bold ${
                  analysis.irregularityLevel === 'Regular' ? 'text-green-600' :
                  analysis.irregularityLevel.includes('Slightly') ? 'text-yellow-600' :
                  analysis.irregularityLevel.includes('Moderately') ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {analysis.irregularityLevel}
                </div>
                <div className="text-sm text-purple-700">Pattern Status</div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <strong>Recommendation:</strong> {analysis.recommendation}
                <br />
                <a href="/auth/signup" className="text-purple-600 font-medium hover:underline ml-1">
                  Get detailed irregular period tracking with FemCare →
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Irregular Periods</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-6">
              Irregular periods are menstrual cycles that vary significantly in length, timing, or flow. 
              While some variation is normal, persistent irregularity may indicate underlying health conditions that require attention.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Signs of Irregular Periods:</h3>
            <ul className="space-y-3">
              {[
                'Cycles shorter than 21 days or longer than 35 days',
                'Variation of more than 7-9 days between cycles',
                'Missing periods for 3+ months (not pregnant)',
                'Bleeding between periods or after intercourse',
                'Extremely heavy or light flow',
                'Periods lasting longer than 7 days'
              ].map((sign, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{sign}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Normal vs. Irregular Cycles</h3>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-lg border-l-4 border-green-500">
                <div className="font-medium text-green-900">Normal Cycle</div>
                <div className="text-sm text-green-700">21-35 days, consistent timing</div>
              </div>
              <div className="p-3 bg-white rounded-lg border-l-4 border-yellow-500">
                <div className="font-medium text-yellow-900">Slightly Irregular</div>
                <div className="text-sm text-yellow-700">Variation of 2-4 days</div>
              </div>
              <div className="p-3 bg-white rounded-lg border-l-4 border-orange-500">
                <div className="font-medium text-orange-900">Moderately Irregular</div>
                <div className="text-sm text-orange-700">Variation of 5-7 days</div>
              </div>
              <div className="p-3 bg-white rounded-lg border-l-4 border-red-500">
                <div className="font-medium text-red-900">Highly Irregular</div>
                <div className="text-sm text-red-700">Variation of 8+ days or missed periods</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Common Causes of Irregular Periods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              category: 'Hormonal Causes',
              icon: TrendingUp,
              causes: ['PCOS (Polycystic Ovary Syndrome)', 'Thyroid disorders', 'Perimenopause', 'Hormonal birth control changes'],
              color: 'bg-blue-100 text-blue-600'
            },
            {
              category: 'Lifestyle Factors',
              icon: Heart,
              causes: ['Extreme stress', 'Significant weight changes', 'Excessive exercise', 'Poor nutrition'],
              color: 'bg-green-100 text-green-600'
            },
            {
              category: 'Medical Conditions',
              icon: AlertTriangle,
              causes: ['Endometriosis', 'Uterine fibroids', 'Pelvic inflammatory disease', 'Eating disorders'],
              color: 'bg-red-100 text-red-600'
            },
            {
              category: 'Age-Related',
              icon: Clock,
              causes: ['Adolescence (first 2 years)', 'Perimenopause (40s-50s)', 'Postpartum period', 'Breastfeeding'],
              color: 'bg-purple-100 text-purple-600'
            },
            {
              category: 'Medications',
              icon: Calendar,
              causes: ['Blood thinners', 'Antidepressants', 'Chemotherapy', 'Hormonal medications'],
              color: 'bg-yellow-100 text-yellow-600'
            },
            {
              category: 'Other Factors',
              icon: Heart,
              causes: ['Travel and time zone changes', 'Chronic illness', 'Recent pregnancy', 'Rapid weight loss'],
              color: 'bg-pink-100 text-pink-600'
            }
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                <category.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.category}</h3>
              <ul className="space-y-2">
                {category.causes.map((cause, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">When to See a Healthcare Provider</h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-8 h-8 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-red-900 mb-4">Seek Medical Attention If:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ul className="space-y-3">
                  {[
                    'Periods suddenly become very irregular',
                    'No period for 3+ months (not pregnant)',
                    'Bleeding between periods regularly',
                    'Periods last longer than 7 days'
                  ].map((symptom, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-red-800">{symptom}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-3">
                  {[
                    'Severe pain during periods',
                    'Very heavy bleeding (changing pad/tampon hourly)',
                    'Periods interfere with daily activities',
                    'Trying to conceive for 6+ months'
                  ].map((symptom, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-red-800">{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Managing Irregular Periods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Lifestyle Modifications</h3>
            {[
              {
                title: 'Stress Management',
                tips: ['Practice meditation or yoga', 'Maintain regular sleep schedule', 'Consider counseling if needed']
              },
              {
                title: 'Nutrition',
                tips: ['Eat balanced, regular meals', 'Maintain healthy weight', 'Limit caffeine and alcohol']
              },
              {
                title: 'Exercise',
                tips: ['Moderate, regular exercise', 'Avoid excessive training', 'Include strength and cardio']
              }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">{category.title}</h4>
                <ul className="space-y-2">
                  {category.tips.map((tip, i) => (
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
                title: 'Hormonal Therapy',
                options: ['Birth control pills', 'Hormonal IUD', 'Hormone replacement therapy']
              },
              {
                title: 'Targeted Treatments',
                options: ['PCOS management', 'Thyroid medication', 'Endometriosis treatment']
              },
              {
                title: 'Monitoring',
                options: ['Regular blood tests', 'Ultrasound examinations', 'Hormone level tracking']
              }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">{category.title}</h4>
                <ul className="space-y-2">
                  {category.options.map((option, i) => (
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
      description: 'Track regular and irregular menstrual cycles',
      href: '/pages/period-tracker',
      category: 'Tracking'
    },
    {
      title: 'PCOS Symptom Tracker',
      description: 'Monitor PCOS symptoms and irregular periods',
      href: '/pages/pcos-symptom-tracker',
      category: 'Conditions'
    },
    {
      title: 'Late Period Calculator',
      description: 'Calculate how late your period is and possible causes',
      href: '/pages/late-period-calculator',
      category: 'Analysis'
    },
    {
      title: 'Hormonal Imbalance Tracker',
      description: 'Track symptoms of hormonal imbalances',
      href: '/pages/hormonal-imbalance-tracker',
      category: 'Health'
    },
    {
      title: 'Perimenopause Tracker',
      description: 'Monitor perimenopause symptoms and cycle changes',
      href: '/pages/perimenopause-tracker',
      category: 'Life Stages'
    },
    {
      title: 'Thyroid Symptom Tracker',
      description: 'Track thyroid-related menstrual irregularities',
      href: '/pages/thyroid-symptom-tracker',
      category: 'Conditions'
    }
  ];

  const faq = [
    {
      question: 'What is considered an irregular period?',
      answer: 'An irregular period is one that varies significantly in timing (cycles shorter than 21 days or longer than 35 days), has unpredictable timing with variations of more than 7-9 days, or involves missed periods, unusual bleeding patterns, or significant changes in flow.'
    },
    {
      question: 'How long should I track before seeing a pattern?',
      answer: 'Track for at least 3-6 months to identify patterns in irregular cycles. This gives healthcare providers enough data to assess your cycle and determine if treatment is needed.'
    },
    {
      question: 'Can stress really cause irregular periods?',
      answer: 'Yes, chronic stress can significantly impact your menstrual cycle by affecting hormone production. Stress can delay ovulation, cause missed periods, or make cycles unpredictable.'
    },
    {
      question: 'Are irregular periods normal for teenagers?',
      answer: 'Yes, irregular periods are common in the first 1-2 years after menarche (first period) as the body adjusts to hormonal changes. However, if irregularity persists beyond 2 years, consult a healthcare provider.'
    },
    {
      question: 'Can irregular periods affect fertility?',
      answer: 'Irregular periods can make it harder to predict ovulation and conceive, but many women with irregular cycles can still get pregnant. If you\'re trying to conceive, tracking ovulation signs and consulting a fertility specialist may help.'
    },
    {
      question: 'When should I be concerned about irregular periods?',
      answer: 'Consult a healthcare provider if you experience sudden changes in cycle regularity, miss periods for 3+ months (when not pregnant), have severe pain, very heavy bleeding, or if irregular periods interfere with your daily life.'
    }
  ];

  return (
    <PageLayout
      title="Irregular Period Tracker - Monitor Cycle Irregularities | FemCare"
      description="Track irregular periods and identify patterns with FemCare's specialized tracker. Monitor cycle variations, understand causes, and get insights for healthcare discussions."
      h1="Irregular Period Tracker & Pattern Analyzer"
      heroContent={heroContent}
      mainContent={mainContent}
      relatedPages={relatedPages}
      faq={faq}
    />
  );
};

export default IrregularPeriodTracker;
import React, { useState } from 'react';
import { Clock, AlertTriangle, Calendar, Heart, Calculator, CheckCircle, Info } from 'lucide-react';
import PageLayout from './PageLayout';

const LatePeriodCalculator = () => {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [result, setResult] = useState<any>(null);

  const calculateLateness = () => {
    if (!lastPeriod) return;
    
    const lastDate = new Date(lastPeriod);
    const expectedDate = new Date(lastDate);
    expectedDate.setDate(lastDate.getDate() + parseInt(cycleLength));
    
    const today = new Date();
    const daysLate = Math.floor((today.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let status = 'On Time';
    let urgency = 'low';
    let recommendations = [];
    
    if (daysLate < 0) {
      status = `${Math.abs(daysLate)} days early`;
      urgency = 'low';
      recommendations = ['Your period is expected soon', 'Continue normal activities'];
    } else if (daysLate === 0) {
      status = 'Expected today';
      urgency = 'low';
      recommendations = ['Your period is due today', 'Monitor for signs'];
    } else if (daysLate <= 5) {
      status = `${daysLate} days late`;
      urgency = 'low';
      recommendations = ['Slight delay is normal', 'Continue monitoring', 'Consider stress factors'];
    } else if (daysLate <= 10) {
      status = `${daysLate} days late`;
      urgency = 'medium';
      recommendations = ['Consider taking pregnancy test', 'Review recent stress/lifestyle changes', 'Monitor for symptoms'];
    } else if (daysLate <= 30) {
      status = `${daysLate} days late`;
      urgency = 'high';
      recommendations = ['Take pregnancy test if sexually active', 'Consider healthcare consultation', 'Track any symptoms'];
    } else {
      status = `${daysLate} days late`;
      urgency = 'high';
      recommendations = ['Consult healthcare provider', 'Rule out pregnancy', 'Investigate underlying causes'];
    }
    
    setResult({
      daysLate,
      status,
      urgency,
      expectedDate: expectedDate.toLocaleDateString(),
      recommendations
    });
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <p className="text-xl text-gray-600 mb-8">
        Calculate how late your period is and understand possible causes. Get personalized recommendations based on your cycle timing.
      </p>
      
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Late Period Calculator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Period Start Date
            </label>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usual Cycle Length
            </label>
            <select
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Array.from({ length: 15 }, (_, i) => i + 21).map(days => (
                <option key={days} value={days}>{days} days</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={calculateLateness}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Calculator className="w-5 h-5" />
          <span>Calculate</span>
        </button>
        
        {result && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              result.urgency === 'low' ? 'bg-green-50 border-green-200' :
              result.urgency === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-3 mb-3">
                <Clock className={`w-6 h-6 ${
                  result.urgency === 'low' ? 'text-green-600' :
                  result.urgency === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <h4 className={`font-semibold ${
                  result.urgency === 'low' ? 'text-green-900' :
                  result.urgency === 'medium' ? 'text-yellow-900' :
                  'text-red-900'
                }`}>
                  Period Status: {result.status}
                </h4>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600">Expected date was: {result.expectedDate}</div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900">Recommendations:</h5>
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Need comprehensive period tracking and predictions? 
                <a href="/auth/signup" className="text-purple-600 font-medium hover:underline ml-1">
                  Try FemCare's Advanced Period Tracker →
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Late Periods</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-6">
              A late period is when your menstrual cycle extends beyond your normal cycle length. 
              While occasional delays are normal, understanding the causes can help you determine when to seek medical advice.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">When is a Period Considered Late?</h3>
            <ul className="space-y-3">
              {[
                '1-5 days late: Usually normal variation',
                '6-10 days late: Consider pregnancy test',
                '11-30 days late: Investigate causes',
                '30+ days late: Consult healthcare provider',
                'Missed 3+ periods: Requires medical evaluation'
              ].map((timeframe, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{timeframe}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Late Period Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border-l-4 border-green-500">
                <div className="text-green-600 font-bold">1-5 days</div>
                <div className="text-sm text-gray-600">Normal variation - monitor</div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border-l-4 border-yellow-500">
                <div className="text-yellow-600 font-bold">6-10 days</div>
                <div className="text-sm text-gray-600">Consider pregnancy test</div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border-l-4 border-orange-500">
                <div className="text-orange-600 font-bold">11-30 days</div>
                <div className="text-sm text-gray-600">Investigate underlying causes</div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border-l-4 border-red-500">
                <div className="text-red-600 font-bold">30+ days</div>
                <div className="text-sm text-gray-600">Medical consultation needed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Common Causes of Late Periods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              category: 'Pregnancy',
              icon: Heart,
              description: 'Most common cause in sexually active women',
              causes: ['Early pregnancy', 'Implantation timing', 'Hormonal changes'],
              likelihood: 'High if sexually active',
              color: 'bg-pink-100 text-pink-600'
            },
            {
              category: 'Stress',
              icon: AlertTriangle,
              description: 'Physical or emotional stress affects hormones',
              causes: ['Work stress', 'Life changes', 'Illness', 'Travel'],
              likelihood: 'Very common',
              color: 'bg-red-100 text-red-600'
            },
            {
              category: 'Weight Changes',
              icon: TrendingUp,
              description: 'Significant weight gain or loss',
              causes: ['Rapid weight loss', 'Eating disorders', 'Obesity', 'Extreme dieting'],
              likelihood: 'Common',
              color: 'bg-blue-100 text-blue-600'
            },
            {
              category: 'Hormonal Issues',
              icon: Calendar,
              description: 'Hormonal imbalances affect cycle timing',
              causes: ['PCOS', 'Thyroid disorders', 'Perimenopause', 'Birth control changes'],
              likelihood: 'Moderate',
              color: 'bg-purple-100 text-purple-600'
            },
            {
              category: 'Medications',
              icon: Info,
              description: 'Certain medications can delay periods',
              causes: ['Antidepressants', 'Blood thinners', 'Chemotherapy', 'Emergency contraception'],
              likelihood: 'Depends on medication',
              color: 'bg-yellow-100 text-yellow-600'
            },
            {
              category: 'Lifestyle Factors',
              icon: Clock,
              description: 'Daily habits that affect hormones',
              causes: ['Excessive exercise', 'Poor sleep', 'Alcohol/drug use', 'Shift work'],
              likelihood: 'Common',
              color: 'bg-green-100 text-green-600'
            }
          ].map((cause, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className={`w-12 h-12 ${cause.color} rounded-lg flex items-center justify-center mb-4`}>
                <cause.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{cause.category}</h3>
              <p className="text-gray-600 mb-3 text-sm">{cause.description}</p>
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500">Common causes:</div>
                <ul className="space-y-1">
                  {cause.causes.map((item, i) => (
                    <li key={i} className="text-xs text-gray-600">• {item}</li>
                  ))}
                </ul>
                <div className="text-xs font-medium text-purple-600 mt-2">
                  Likelihood: {cause.likelihood}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">What to Do When Your Period is Late</h2>
        <div className="space-y-8">
          {[
            {
              timeframe: '1-5 Days Late',
              urgency: 'Low',
              color: 'border-green-200 bg-green-50',
              actions: [
                'Continue normal activities',
                'Monitor for period symptoms',
                'Reduce stress if possible',
                'Maintain healthy lifestyle'
              ]
            },
            {
              timeframe: '6-10 Days Late',
              urgency: 'Medium',
              color: 'border-yellow-200 bg-yellow-50',
              actions: [
                'Take home pregnancy test if sexually active',
                'Review recent stress or lifestyle changes',
                'Track any symptoms or changes',
                'Consider consulting healthcare provider'
              ]
            },
            {
              timeframe: '11-30 Days Late',
              urgency: 'High',
              color: 'border-orange-200 bg-orange-50',
              actions: [
                'Take pregnancy test regardless of sexual activity',
                'Schedule appointment with healthcare provider',
                'Review medications and supplements',
                'Document any symptoms or changes'
              ]
            },
            {
              timeframe: '30+ Days Late',
              urgency: 'Very High',
              color: 'border-red-200 bg-red-50',
              actions: [
                'Consult healthcare provider immediately',
                'Bring detailed cycle history',
                'Discuss all medications and supplements',
                'Prepare for potential testing'
              ]
            }
          ].map((stage, index) => (
            <div key={index} className={`rounded-xl p-6 border-2 ${stage.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{stage.timeframe}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  stage.urgency === 'Low' ? 'bg-green-100 text-green-800' :
                  stage.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  stage.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {stage.urgency} Priority
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stage.actions.map((action, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Pregnancy Testing Guidelines</h2>
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-pink-900 mb-4">When to Test</h3>
              <ul className="space-y-3">
                {[
                  'First day of missed period for most accurate results',
                  'Wait at least 1 week after missed period if negative',
                  'Test with first morning urine for best accuracy',
                  'Retest in 1 week if period still hasn\'t arrived'
                ].map((guideline, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span className="text-pink-800">{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-pink-900 mb-4">Test Accuracy</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium text-pink-900">Day of missed period</div>
                  <div className="text-sm text-pink-700">99% accurate</div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium text-pink-900">1 week before missed period</div>
                  <div className="text-sm text-pink-700">76% accurate</div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium text-pink-900">2 weeks before missed period</div>
                  <div className="text-sm text-pink-700">51% accurate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const relatedPages = [
    {
      title: 'Period Tracker',
      description: 'Track your menstrual cycle and predict future periods',
      href: '/pages/period-tracker',
      category: 'Tracking'
    },
    {
      title: 'Irregular Period Tracker',
      description: 'Monitor and analyze irregular menstrual patterns',
      href: '/pages/irregular-period-tracker',
      category: 'Analysis'
    },
    {
      title: 'Pregnancy Tracker',
      description: 'Track pregnancy symptoms and development',
      href: '/pages/pregnancy-tracker',
      category: 'Pregnancy'
    },
    {
      title: 'Ovulation Tracker',
      description: 'Monitor ovulation and fertile window timing',
      href: '/pages/ovulation-tracker',
      category: 'Fertility'
    },
    {
      title: 'PCOS Symptom Tracker',
      description: 'Track PCOS-related menstrual irregularities',
      href: '/pages/pcos-symptom-tracker',
      category: 'Conditions'
    },
    {
      title: 'Stress & Period Tracker',
      description: 'Monitor how stress affects your menstrual cycle',
      href: '/pages/stress-period-tracker',
      category: 'Lifestyle'
    }
  ];

  const faq = [
    {
      question: 'How late can a period be before I should worry?',
      answer: 'A period can be up to 5 days late and still be considered normal. If you\'re sexually active and your period is 6+ days late, consider taking a pregnancy test. If it\'s 30+ days late, consult a healthcare provider regardless of sexual activity.'
    },
    {
      question: 'Can stress really make my period late?',
      answer: 'Yes, stress is one of the most common causes of late periods. Both physical and emotional stress can disrupt hormone production, delaying ovulation and subsequently your period. Managing stress through relaxation techniques may help regulate your cycle.'
    },
    {
      question: 'When should I take a pregnancy test?',
      answer: 'Take a pregnancy test on the first day of your missed period for most accurate results. If negative and your period still hasn\'t arrived, retest in one week. Use first morning urine for best accuracy.'
    },
    {
      question: 'What if my pregnancy test is negative but my period is still late?',
      answer: 'A negative test with a late period could indicate testing too early, a faulty test, or other causes like stress, weight changes, or hormonal imbalances. Retest in a week or consult your healthcare provider.'
    },
    {
      question: 'Can birth control cause late periods?',
      answer: 'Yes, hormonal birth control can affect period timing. Starting, stopping, or changing birth control methods can cause irregular periods for several months as your body adjusts to hormonal changes.'
    },
    {
      question: 'How long can periods be delayed by stress?',
      answer: 'Stress can delay periods by days to weeks, and in severe cases, cause them to stop entirely (amenorrhea). The delay depends on the severity and duration of stress. Managing stress typically helps restore normal cycles.'
    }
  ];

  return (
    <PageLayout
      title="Late Period Calculator - How Late is My Period? | FemCare"
      description="Calculate how late your period is and understand possible causes. Get personalized recommendations based on your cycle timing with FemCare's late period calculator."
      h1="Late Period Calculator & Guidance"
      heroContent={heroContent}
      mainContent={mainContent}
      relatedPages={relatedPages}
      faq={faq}
    />
  );
};

export default LatePeriodCalculator;
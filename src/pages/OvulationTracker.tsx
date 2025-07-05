import React, { useState } from 'react';
import { Heart, Calendar, TrendingUp, Thermometer, Droplets, Clock, CheckCircle, Calculator } from 'lucide-react';
import PageLayout from './PageLayout';

const OvulationTracker = () => {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [prediction, setPrediction] = useState<any>(null);

  const calculateOvulation = () => {
    if (!lastPeriod) return;
    
    const lastDate = new Date(lastPeriod);
    const ovulationDate = new Date(lastDate);
    ovulationDate.setDate(lastDate.getDate() + parseInt(cycleLength) - 14);
    
    const fertilityStart = new Date(ovulationDate);
    fertilityStart.setDate(ovulationDate.getDate() - 5);
    
    const fertilityEnd = new Date(ovulationDate);
    fertilityEnd.setDate(ovulationDate.getDate() + 1);
    
    const today = new Date();
    const daysToOvulation = Math.ceil((ovulationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    setPrediction({
      ovulationDate: ovulationDate.toLocaleDateString(),
      fertilityStart: fertilityStart.toLocaleDateString(),
      fertilityEnd: fertilityEnd.toLocaleDateString(),
      daysToOvulation: Math.max(0, daysToOvulation),
      isInFertileWindow: today >= fertilityStart && today <= fertilityEnd
    });
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <p className="text-xl text-gray-600 mb-8">
        Track your ovulation and fertile window with precision. Maximize your chances of conception or practice natural family planning with confidence.
      </p>
      
      {/* Quick Calculator */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Ovulation & Fertility Calculator
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
              Average Cycle Length
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
          onClick={calculateOvulation}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Calculator className="w-5 h-5" />
          <span>Calculate Ovulation</span>
        </button>
        
        {prediction && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-lg border-2 ${prediction.isInFertileWindow ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'}`}>
              <h4 className={`font-semibold mb-3 ${prediction.isInFertileWindow ? 'text-green-900' : 'text-purple-900'}`}>
                {prediction.isInFertileWindow ? '🌟 You\'re in your fertile window!' : 'Your Ovulation Prediction:'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-purple-600">{prediction.ovulationDate}</div>
                  <div className="text-sm text-purple-700">Ovulation Date</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{prediction.fertilityStart}</div>
                  <div className="text-sm text-purple-700">Fertile Window Starts</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{prediction.fertilityEnd}</div>
                  <div className="text-sm text-purple-700">Fertile Window Ends</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Get personalized ovulation tracking with BBT, cervical mucus monitoring, and more! 
                <a href="/auth/signup" className="text-purple-600 font-medium hover:underline ml-1">
                  Try FemCare's Advanced Ovulation Tracker →
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
      {/* Understanding Ovulation */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Ovulation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-6">
              Ovulation is the release of a mature egg from your ovary, typically occurring around day 14 of a 28-day cycle. 
              This creates a 6-day fertile window when conception is most likely to occur.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Track Ovulation?</h3>
            <ul className="space-y-3">
              {[
                'Maximize chances of conception',
                'Practice natural family planning',
                'Understand your fertility patterns',
                'Identify potential fertility issues',
                'Plan intimate moments effectively',
                'Monitor hormonal health'
              ].map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Ovulation Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1-5</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Menstrual Phase</div>
                  <div className="text-sm text-gray-600">Period days, low fertility</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">6-13</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Follicular Phase</div>
                  <div className="text-sm text-gray-600">Egg development, increasing fertility</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border-2 border-purple-200">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">14</span>
                </div>
                <div>
                  <div className="font-medium text-purple-900">Ovulation Day</div>
                  <div className="text-sm text-purple-700">Peak fertility, egg release</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">15-28</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Luteal Phase</div>
                  <div className="text-sm text-gray-600">Post-ovulation, decreasing fertility</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ovulation Signs and Symptoms */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Signs and Symptoms of Ovulation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Thermometer,
              title: 'Basal Body Temperature',
              description: 'Slight temperature rise (0.5-1°F) after ovulation',
              reliability: 'High',
              color: 'bg-red-100 text-red-600'
            },
            {
              icon: Droplets,
              title: 'Cervical Mucus',
              description: 'Clear, stretchy, egg-white consistency',
              reliability: 'High',
              color: 'bg-blue-100 text-blue-600'
            },
            {
              icon: Heart,
              title: 'Ovulation Pain',
              description: 'Mild pain on one side of the abdomen',
              reliability: 'Medium',
              color: 'bg-pink-100 text-pink-600'
            },
            {
              icon: TrendingUp,
              title: 'LH Surge',
              description: 'Luteinizing hormone spike detected by tests',
              reliability: 'Very High',
              color: 'bg-green-100 text-green-600'
            },
            {
              icon: Calendar,
              title: 'Cervix Position',
              description: 'Cervix becomes higher, softer, and more open',
              reliability: 'Medium',
              color: 'bg-purple-100 text-purple-600'
            },
            {
              icon: Clock,
              title: 'Increased Libido',
              description: 'Natural increase in sexual desire',
              reliability: 'Low',
              color: 'bg-yellow-100 text-yellow-600'
            }
          ].map((sign, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className={`w-12 h-12 ${sign.color} rounded-lg flex items-center justify-center mb-4`}>
                <sign.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{sign.title}</h3>
              <p className="text-gray-600 mb-3">{sign.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Reliability:</span>
                <span className={`text-sm font-medium ${
                  sign.reliability === 'Very High' ? 'text-green-600' :
                  sign.reliability === 'High' ? 'text-blue-600' :
                  sign.reliability === 'Medium' ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {sign.reliability}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ovulation Tracking Methods */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Ovulation Tracking Methods</h2>
        <div className="space-y-8">
          {[
            {
              method: 'Calendar Method',
              accuracy: '75-80%',
              description: 'Predicts ovulation based on cycle length and previous patterns',
              pros: ['Simple to use', 'No cost', 'Good for regular cycles'],
              cons: ['Less accurate for irregular cycles', 'Doesn\'t account for cycle variations']
            },
            {
              method: 'Basal Body Temperature (BBT)',
              accuracy: '85-90%',
              description: 'Tracks daily temperature changes to confirm ovulation',
              pros: ['Confirms ovulation occurred', 'Inexpensive', 'Natural method'],
              cons: ['Requires daily measurement', 'Confirms after ovulation', 'Affected by illness/sleep']
            },
            {
              method: 'Cervical Mucus Monitoring',
              accuracy: '80-85%',
              description: 'Observes changes in cervical mucus consistency and amount',
              pros: ['Predicts ovulation in advance', 'Natural method', 'No equipment needed'],
              cons: ['Requires learning', 'Can be affected by infections', 'Subjective interpretation']
            },
            {
              method: 'Ovulation Predictor Kits (OPKs)',
              accuracy: '90-95%',
              description: 'Detects luteinizing hormone (LH) surge before ovulation',
              pros: ['High accuracy', 'Predicts ovulation 12-36 hours ahead', 'Easy to use'],
              cons: ['Ongoing cost', 'May not work for PCOS', 'Single-use tests']
            },
            {
              method: 'FemCare Advanced Tracking',
              accuracy: '95-98%',
              description: 'Combines multiple methods with AI analysis for maximum accuracy',
              pros: ['Highest accuracy', 'Personalized predictions', 'Comprehensive tracking', 'Data backup'],
              cons: ['Requires app subscription']
            }
          ].map((method, index) => (
            <div key={index} className={`bg-white rounded-xl p-6 border-2 ${
              method.method === 'FemCare Advanced Tracking' ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.method}</h3>
                  <p className="text-gray-600">{method.description}</p>
                </div>
                <div className="mt-4 lg:mt-0">
                  <div className="text-2xl font-bold text-purple-600">{method.accuracy}</div>
                  <div className="text-sm text-gray-500">Accuracy Rate</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">✅ Pros:</h4>
                  <ul className="space-y-1">
                    {method.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-gray-600">• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">❌ Cons:</h4>
                  <ul className="space-y-1">
                    {method.cons.map((con, i) => (
                      <li key={i} className="text-sm text-gray-600">• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fertility Window Optimization */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Optimizing Your Fertile Window</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">For Trying to Conceive</h3>
            <ul className="space-y-3">
              {[
                'Have intercourse every other day during fertile window',
                'Focus on the 3 days before ovulation',
                'Track multiple ovulation signs for accuracy',
                'Maintain a healthy lifestyle and diet',
                'Consider prenatal vitamins with folic acid',
                'Reduce stress and get adequate sleep'
              ].map((tip, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">For Natural Family Planning</h3>
            <ul className="space-y-3">
              {[
                'Avoid unprotected intercourse during fertile window',
                'Use barrier methods during high-risk days',
                'Track temperature and mucus consistently',
                'Allow for cycle variations and early ovulation',
                'Consider extended abstinence periods',
                'Consult healthcare provider for guidance'
              ].map((tip, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
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
      category: 'Cycle'
    },
    {
      title: 'Fertility Tracker',
      description: 'Comprehensive fertility monitoring and optimization',
      href: '/pages/fertility-tracker',
      category: 'Fertility'
    },
    {
      title: 'BBT Ovulation Tracker',
      description: 'Track basal body temperature for ovulation confirmation',
      href: '/pages/bbt-ovulation-tracker',
      category: 'Temperature'
    },
    {
      title: 'Cervical Mucus Tracker',
      description: 'Monitor cervical mucus changes throughout your cycle',
      href: '/pages/cervical-mucus-tracker',
      category: 'Signs'
    },
    {
      title: 'Trying to Conceive Tracker',
      description: 'Optimize your conception journey with detailed tracking',
      href: '/pages/trying-to-conceive-tracker',
      category: 'Conception'
    },
    {
      title: 'PCOS Ovulation Tracker',
      description: 'Specialized tracking for women with PCOS',
      href: '/pages/pcos-ovulation-tracker',
      category: 'Conditions'
    }
  ];

  const faq = [
    {
      question: 'When do I ovulate in my cycle?',
      answer: 'Most women ovulate around 14 days before their next period. For a 28-day cycle, this is typically day 14. However, ovulation timing can vary between days 11-21 depending on your cycle length.'
    },
    {
      question: 'How long does the fertile window last?',
      answer: 'The fertile window lasts about 6 days: the 5 days before ovulation plus the day of ovulation. Sperm can survive up to 5 days in the reproductive tract, while the egg survives 12-24 hours.'
    },
    {
      question: 'Can I get pregnant outside my fertile window?',
      answer: 'While pregnancy is most likely during the fertile window, it\'s possible (though rare) to conceive outside this time due to cycle variations, early ovulation, or sperm survival.'
    },
    {
      question: 'What if I have irregular cycles?',
      answer: 'Irregular cycles make ovulation prediction more challenging. Track multiple signs (BBT, cervical mucus, OPKs) and consider consulting a healthcare provider to identify underlying causes.'
    },
    {
      question: 'How accurate are ovulation predictor kits?',
      answer: 'OPKs are 90-95% accurate at detecting the LH surge that occurs 12-36 hours before ovulation. They\'re most effective when used consistently during your expected fertile window.'
    },
    {
      question: 'Can stress affect ovulation timing?',
      answer: 'Yes, stress can delay or prevent ovulation by affecting hormone levels. Chronic stress, illness, travel, and significant life changes can all impact ovulation timing.'
    }
  ];

  return (
    <PageLayout
      title="Ovulation Tracker - Free Fertility Calendar & Ovulation Calculator | FemCare"
      description="Track ovulation and fertile window with FemCare's accurate ovulation tracker. Free fertility calendar, ovulation calculator, and conception timing tools."
      h1="Free Ovulation Tracker & Fertility Calendar"
      heroContent={heroContent}
      mainContent={mainContent}
      relatedPages={relatedPages}
      faq={faq}
    />
  );
};

export default OvulationTracker;
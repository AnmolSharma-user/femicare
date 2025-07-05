import React, { useState } from 'react';
import { Baby, Calendar, Clock, Heart, Calculator, CheckCircle, TrendingUp } from 'lucide-react';
import PageLayout from './PageLayout';

const DueDateCalculator = () => {
  const [calculationMethod, setCalculationMethod] = useState('lmp');
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [conceptionDate, setConceptionDate] = useState('');
  const [ultrasoundDate, setUltrasoundDate] = useState('');
  const [gestationalAge, setGestationalAge] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateDueDate = () => {
    let dueDate: Date;
    let conceptionEstimate: Date;
    let method = '';

    if (calculationMethod === 'lmp' && lastPeriod) {
      const lmpDate = new Date(lastPeriod);
      dueDate = new Date(lmpDate);
      dueDate.setDate(lmpDate.getDate() + 280); // 40 weeks
      
      conceptionEstimate = new Date(lmpDate);
      conceptionEstimate.setDate(lmpDate.getDate() + parseInt(cycleLength) - 14);
      method = 'Last Menstrual Period';
      
    } else if (calculationMethod === 'conception' && conceptionDate) {
      conceptionEstimate = new Date(conceptionDate);
      dueDate = new Date(conceptionEstimate);
      dueDate.setDate(conceptionEstimate.getDate() + 266); // 38 weeks
      method = 'Conception Date';
      
    } else if (calculationMethod === 'ultrasound' && ultrasoundDate && gestationalAge) {
      const ultrasound = new Date(ultrasoundDate);
      const weeksFromUltrasound = parseFloat(gestationalAge);
      const daysFromUltrasound = weeksFromUltrasound * 7;
      
      dueDate = new Date(ultrasound);
      dueDate.setDate(ultrasound.getDate() + (280 - daysFromUltrasound));
      
      conceptionEstimate = new Date(dueDate);
      conceptionEstimate.setDate(dueDate.getDate() - 266);
      method = 'Ultrasound Dating';
      
    } else {
      return;
    }

    const today = new Date();
    const daysSinceConception = Math.floor((today.getTime() - conceptionEstimate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksPregnant = Math.floor(daysSinceConception / 7);
    const daysExtra = daysSinceConception % 7;
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine trimester
    let trimester = 1;
    if (weeksPregnant >= 27) trimester = 3;
    else if (weeksPregnant >= 13) trimester = 2;
    
    // Calculate important milestones
    const viabilityDate = new Date(conceptionEstimate);
    viabilityDate.setDate(conceptionEstimate.getDate() + (24 * 7)); // 24 weeks
    
    const fullTermDate = new Date(conceptionEstimate);
    fullTermDate.setDate(conceptionEstimate.getDate() + (37 * 7)); // 37 weeks
    
    setResult({
      dueDate: dueDate.toLocaleDateString(),
      conceptionDate: conceptionEstimate.toLocaleDateString(),
      weeksPregnant,
      daysExtra,
      trimester,
      daysUntilDue: Math.max(0, daysUntilDue),
      method,
      viabilityDate: viabilityDate.toLocaleDateString(),
      fullTermDate: fullTermDate.toLocaleDateString(),
      isPregnant: daysSinceConception > 0 && daysUntilDue > 0
    });
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <p className="text-xl text-gray-600 mb-8">
        Calculate your due date with precision using multiple methods. Get detailed pregnancy timeline and important milestone dates.
      </p>
      
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-3xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Due Date Calculator
        </h3>
        
        {/* Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Calculation Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'lmp', label: 'Last Menstrual Period', desc: 'Most common method' },
              { id: 'conception', label: 'Conception Date', desc: 'If you know when you conceived' },
              { id: 'ultrasound', label: 'Ultrasound Dating', desc: 'Most accurate method' }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setCalculationMethod(method.id)}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  calculationMethod === method.id
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="font-medium">{method.label}</div>
                <div className="text-sm text-gray-500">{method.desc}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Input Fields Based on Method */}
        <div className="space-y-4 mb-6">
          {calculationMethod === 'lmp' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Menstrual Period Start Date
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
            </>
          )}
          
          {calculationMethod === 'conception' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conception Date
              </label>
              <input
                type="date"
                value={conceptionDate}
                onChange={(e) => setConceptionDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
          
          {calculationMethod === 'ultrasound' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ultrasound Date
                </label>
                <input
                  type="date"
                  value={ultrasoundDate}
                  onChange={(e) => setUltrasoundDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gestational Age at Ultrasound (weeks)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="4"
                  max="42"
                  value={gestationalAge}
                  onChange={(e) => setGestationalAge(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 12.3"
                />
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={calculateDueDate}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Calculator className="w-5 h-5" />
          <span>Calculate Due Date</span>
        </button>
        
        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3">Your Pregnancy Details:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <div className="text-xl font-bold text-purple-600">{result.dueDate}</div>
                  <div className="text-sm text-purple-700">Due Date</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">
                    {result.weeksPregnant}w {result.daysExtra}d
                  </div>
                  <div className="text-sm text-purple-700">Weeks Pregnant</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{result.trimester}</div>
                  <div className="text-sm text-purple-700">Trimester</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{result.daysUntilDue}</div>
                  <div className="text-sm text-purple-700">Days Until Due</div>
                </div>
              </div>
              <div className="text-center text-sm text-purple-600">
                Calculated using: {result.method}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">Important Dates:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-900">Estimated Conception:</div>
                  <div className="text-green-700">{result.conceptionDate}</div>
                </div>
                <div>
                  <div className="font-medium text-green-900">Viability (24 weeks):</div>
                  <div className="text-green-700">{result.viabilityDate}</div>
                </div>
                <div>
                  <div className="font-medium text-green-900">Full Term (37 weeks):</div>
                  <div className="text-green-700">{result.fullTermDate}</div>
                </div>
                <div>
                  <div className="font-medium text-green-900">Due Date Range:</div>
                  <div className="text-green-700">±2 weeks from due date</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Track your complete pregnancy journey with weekly updates! 
                <a href="/auth/signup" className="text-purple-600 font-medium hover:underline ml-1">
                  Try FemCare's Advanced Pregnancy Tracker →
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Due Date Calculation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-6">
              Due date calculation helps estimate when your baby will arrive. While only 5% of babies are born on their exact due date, 
              most arrive within 2 weeks before or after the estimated date.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Calculation Methods:</h3>
            <ul className="space-y-3">
              {[
                'LMP Method: Most common, adds 280 days to last period',
                'Conception Date: Adds 266 days to known conception',
                'Ultrasound: Most accurate, especially in first trimester',
                'IVF Transfer: Most precise for assisted reproduction',
                'Fundal Height: Physical measurement method',
                'Multiple methods increase accuracy'
              ].map((method, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{method}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Pregnancy Duration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="font-medium text-gray-900">From LMP</span>
                <span className="text-purple-600 font-bold">40 weeks (280 days)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="font-medium text-gray-900">From Conception</span>
                <span className="text-purple-600 font-bold">38 weeks (266 days)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="font-medium text-gray-900">Full Term</span>
                <span className="text-purple-600 font-bold">37-42 weeks</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="font-medium text-gray-900">Average Birth</span>
                <span className="text-purple-600 font-bold">39-40 weeks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Due Date Accuracy by Method</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Accuracy</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Best Used When</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">Last Menstrual Period</td>
                <td className="px-6 py-4 text-yellow-600">±1-2 weeks</td>
                <td className="px-6 py-4 text-gray-600">Regular 28-day cycles</td>
                <td className="px-6 py-4 text-gray-600">Irregular cycles, uncertain dates</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">First Trimester Ultrasound</td>
                <td className="px-6 py-4 text-green-600">±3-5 days</td>
                <td className="px-6 py-4 text-gray-600">6-12 weeks pregnant</td>
                <td className="px-6 py-4 text-gray-600">Less accurate later in pregnancy</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">Second Trimester Ultrasound</td>
                <td className="px-6 py-4 text-yellow-600">±1-2 weeks</td>
                <td className="px-6 py-4 text-gray-600">13-26 weeks pregnant</td>
                <td className="px-6 py-4 text-gray-600">Growth variations affect accuracy</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">Third Trimester Ultrasound</td>
                <td className="px-6 py-4 text-red-600">±2-3 weeks</td>
                <td className="px-6 py-4 text-gray-600">Late pregnancy dating</td>
                <td className="px-6 py-4 text-gray-600">Significant growth variations</td>
              </tr>
              <tr className="bg-purple-50">
                <td className="px-6 py-4 font-medium text-purple-900">IVF Transfer Date</td>
                <td className="px-6 py-4 text-green-600 font-semibold">±1-2 days</td>
                <td className="px-6 py-4 text-purple-600">IVF pregnancies</td>
                <td className="px-6 py-4 text-purple-600">Only for assisted reproduction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Important Pregnancy Milestones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              week: '4-6 weeks',
              milestone: 'Missed Period',
              description: 'First sign of pregnancy, home tests become positive',
              icon: Calendar,
              color: 'bg-pink-100 text-pink-600'
            },
            {
              week: '6-8 weeks',
              milestone: 'First Prenatal Visit',
              description: 'Confirm pregnancy, establish due date, initial health assessment',
              icon: Heart,
              color: 'bg-red-100 text-red-600'
            },
            {
              week: '11-14 weeks',
              milestone: 'First Trimester Screening',
              description: 'Nuchal translucency scan, genetic screening options',
              icon: TrendingUp,
              color: 'bg-blue-100 text-blue-600'
            },
            {
              week: '18-22 weeks',
              milestone: 'Anatomy Scan',
              description: 'Detailed ultrasound, gender determination, structural assessment',
              icon: Baby,
              color: 'bg-purple-100 text-purple-600'
            },
            {
              week: '24 weeks',
              milestone: 'Viability',
              description: 'Baby has chance of survival outside womb with medical care',
              icon: CheckCircle,
              color: 'bg-green-100 text-green-600'
            },
            {
              week: '28 weeks',
              milestone: 'Third Trimester',
              description: 'Increased monitoring, glucose screening, final preparations',
              icon: Clock,
              color: 'bg-yellow-100 text-yellow-600'
            },
            {
              week: '37 weeks',
              milestone: 'Full Term',
              description: 'Baby is considered full term, safe for delivery',
              icon: CheckCircle,
              color: 'bg-green-100 text-green-600'
            },
            {
              week: '39-40 weeks',
              milestone: 'Due Date',
              description: 'Estimated delivery date, most babies born around this time',
              icon: Baby,
              color: 'bg-purple-100 text-purple-600'
            },
            {
              week: '42 weeks',
              milestone: 'Post-term',
              description: 'Increased monitoring, possible induction consideration',
              icon: Clock,
              color: 'bg-orange-100 text-orange-600'
            }
          ].map((milestone, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className={`w-12 h-12 ${milestone.color} rounded-lg flex items-center justify-center mb-4`}>
                <milestone.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.week}</h3>
              <h4 className="font-medium text-gray-800 mb-2">{milestone.milestone}</h4>
              <p className="text-sm text-gray-600">{milestone.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Due Date vs. Actual Birth Statistics</h2>
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Birth Timing Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">On exact due date</span>
                  <span className="text-purple-600 font-bold">5%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Within 1 week of due date</span>
                  <span className="text-purple-600 font-bold">25%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Within 2 weeks of due date</span>
                  <span className="text-purple-600 font-bold">70%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Before 37 weeks (preterm)</span>
                  <span className="text-orange-600 font-bold">10%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">After 42 weeks (post-term)</span>
                  <span className="text-red-600 font-bold">5%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Factors Affecting Birth Timing</h3>
              <ul className="space-y-3">
                {[
                  'First pregnancies tend to go longer',
                  'Previous pregnancy history affects timing',
                  'Maternal age influences delivery timing',
                  'Multiple pregnancies (twins) deliver earlier',
                  'Medical conditions may require early delivery',
                  'Natural labor onset varies significantly'
                ].map((factor, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const relatedPages = [
    {
      title: 'Pregnancy Tracker',
      description: 'Track your pregnancy journey week by week',
      href: '/pages/pregnancy-tracker',
      category: 'Pregnancy'
    },
    {
      title: 'Conception Calculator',
      description: 'Calculate conception date and fertile window',
      href: '/pages/conception-calculator',
      category: 'Conception'
    },
    {
      title: 'Pregnancy Week by Week',
      description: 'Detailed weekly pregnancy development guide',
      href: '/pages/pregnancy-week-by-week',
      category: 'Development'
    },
    {
      title: 'Ovulation Tracker',
      description: 'Track ovulation and optimize conception timing',
      href: '/pages/ovulation-tracker',
      category: 'Fertility'
    },
    {
      title: 'Contraction Timer',
      description: 'Time contractions and track labor progress',
      href: '/pages/contraction-timer',
      category: 'Labor'
    },
    {
      title: 'Pregnancy Milestone Tracker',
      description: 'Track important pregnancy milestones and appointments',
      href: '/pages/pregnancy-milestone-tracker',
      category: 'Milestones'
    }
  ];

  const faq = [
    {
      question: 'How accurate are due date calculations?',
      answer: 'Due date calculations are estimates with varying accuracy. First trimester ultrasounds are most accurate (±3-5 days), while LMP calculations are accurate within ±1-2 weeks. Only 5% of babies are born on their exact due date, with 70% born within 2 weeks of the estimated date.'
    },
    {
      question: 'Which calculation method is most accurate?',
      answer: 'First trimester ultrasound (6-12 weeks) is the most accurate method for dating pregnancy. IVF transfer dates are most precise for assisted reproduction. LMP calculations work well for women with regular cycles but are less accurate with irregular cycles.'
    },
    {
      question: 'Can my due date change during pregnancy?',
      answer: 'Yes, due dates may be adjusted based on ultrasound measurements, especially if there\'s a significant discrepancy between LMP dating and ultrasound dating. First trimester ultrasounds are typically used to confirm or adjust the due date.'
    },
    {
      question: 'What if I don\'t remember my last period date?',
      answer: 'If you don\'t remember your LMP, an early ultrasound (before 12 weeks) can accurately date your pregnancy. The earlier the ultrasound, the more accurate the dating will be.'
    },
    {
      question: 'Do first babies come later than the due date?',
      answer: 'First-time mothers (primigravidas) tend to deliver slightly later than the due date on average, often going 1-2 days past their due date. However, this varies significantly between individuals.'
    },
    {
      question: 'When should I be concerned if I go past my due date?',
      answer: 'Most healthcare providers begin increased monitoring after 41 weeks and may discuss induction options after 42 weeks. Post-term pregnancy (beyond 42 weeks) occurs in about 5% of pregnancies and requires closer medical supervision.'
    }
  ];

  return (
    <PageLayout
      title="Due Date Calculator - Accurate Pregnancy Due Date Calculator | FemCare"
      description="Calculate your due date with FemCare's accurate pregnancy calculator. Multiple calculation methods including LMP, conception date, and ultrasound dating. Free due date calculator."
      h1="Due Date Calculator & Pregnancy Timeline"
      heroContent={heroContent}
      mainContent={mainContent}
      relatedPages={relatedPages}
      faq={faq}
    />
  );
};

export default DueDateCalculator;
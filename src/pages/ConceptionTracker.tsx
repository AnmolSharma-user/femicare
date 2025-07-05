import React, { useState } from 'react';
import { Heart, Calendar, TrendingUp, Target, Calculator, CheckCircle, Baby } from 'lucide-react';
import PageLayout from './PageLayout';

const ConceptionTracker = () => {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [tryingMonths, setTryingMonths] = useState('');
  const [age, setAge] = useState('');
  const [prediction, setPrediction] = useState<any>(null);

  const calculateConception = () => {
    if (!lastPeriod) return;
    
    const lastDate = new Date(lastPeriod);
    const today = new Date();
    
    // Calculate ovulation and fertile window
    const ovulationDate = new Date(lastDate);
    ovulationDate.setDate(lastDate.getDate() + parseInt(cycleLength) - 14);
    
    const fertilityStart = new Date(ovulationDate);
    fertilityStart.setDate(ovulationDate.getDate() - 5);
    
    const fertilityEnd = new Date(ovulationDate);
    fertilityEnd.setDate(ovulationDate.getDate() + 1);
    
    // Calculate next fertile window
    const nextCycle = new Date(lastDate);
    nextCycle.setDate(lastDate.getDate() + parseInt(cycleLength));
    
    const nextOvulation = new Date(nextCycle);
    nextOvulation.setDate(nextCycle.getDate() - 14);
    
    const nextFertilityStart = new Date(nextOvulation);
    nextFertilityStart.setDate(nextOvulation.getDate() - 5);
    
    const nextFertilityEnd = new Date(nextOvulation);
    nextFertilityEnd.setDate(nextOvulation.getDate() + 1);
    
    // Calculate conception probability based on age
    let monthlyChance = 20; // Base 20% for healthy couples
    if (age) {
      const ageNum = parseInt(age);
      if (ageNum < 25) monthlyChance = 25;
      else if (ageNum < 30) monthlyChance = 20;
      else if (ageNum < 35) monthlyChance = 15;
      else if (ageNum < 40) monthlyChance = 10;
      else monthlyChance = 5;
    }
    
    // Adjust for trying duration
    let adjustedChance = monthlyChance;
    if (tryingMonths) {
      const months = parseInt(tryingMonths);
      if (months > 6) adjustedChance = Math.max(5, monthlyChance * 0.8);
      if (months > 12) adjustedChance = Math.max(3, monthlyChance * 0.6);
    }
    
    const daysToNextFertility = Math.ceil((nextFertilityStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    setPrediction({
      nextOvulation: nextOvulation.toLocaleDateString(),
      nextFertilityStart: nextFertilityStart.toLocaleDateString(),
      nextFertilityEnd: nextFertilityEnd.toLocaleDateString(),
      daysToNextFertility: Math.max(0, daysToNextFertility),
      monthlyChance: Math.round(adjustedChance),
      cumulativeChance6: Math.round(100 * (1 - Math.pow(1 - adjustedChance/100, 6))),
      cumulativeChance12: Math.round(100 * (1 - Math.pow(1 - adjustedChance/100, 12)))
    });
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <p className="text-xl text-gray-600 mb-8">
        Optimize your conception journey with personalized fertility tracking. Calculate your fertile window, conception probability, and get expert guidance.
      </p>
      
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-3xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Conception Probability Calculator
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Age
            </label>
            <input
              type="number"
              min="18"
              max="50"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Age"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Months Trying (optional)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={tryingMonths}
              onChange={(e) => setTryingMonths(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Months"
            />
          </div>
        </div>
        
        <button
          onClick={calculateConception}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Calculator className="w-5 h-5" />
          <span>Calculate Conception Chances</span>
        </button>
        
        {prediction && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3">Your Fertility Forecast:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-xl font-bold text-purple-600">{prediction.nextFertilityStart}</div>
                  <div className="text-sm text-purple-700">Fertile Window Starts</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{prediction.nextOvulation}</div>
                  <div className="text-sm text-purple-700">Ovulation Day</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{prediction.daysToNextFertility}</div>
                  <div className="text-sm text-purple-700">Days Until Fertile Window</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">Conception Probability:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{prediction.monthlyChance}%</div>
                  <div className="text-sm text-green-700">This Cycle</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{prediction.cumulativeChance6}%</div>
                  <div className="text-sm text-green-700">Within 6 Months</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{prediction.cumulativeChance12}%</div>
                  <div className="text-sm text-green-700">Within 12 Months</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Get personalized conception tracking and fertility insights! 
                <a href="/auth/signup" className="text-purple-600 font-medium hover:underline ml-1">
                  Try FemCare's Advanced Conception Tracker →
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Conception</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-6">
              Conception occurs when sperm fertilizes an egg, typically in the fallopian tube. 
              Understanding your fertile window and optimizing timing significantly increases your chances of conception.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Conception Facts:</h3>
            <ul className="space-y-3">
              {[
                'Healthy couples have 15-25% chance per cycle',
                'Fertile window is 6 days: 5 before + day of ovulation',
                'Sperm can survive up to 5 days in reproductive tract',
                'Egg survives 12-24 hours after ovulation',
                '85% of couples conceive within 12 months',
                'Age significantly affects conception rates'
              ].map((fact, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Conception Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">Day 1</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Fertilization</div>
                  <div className="text-sm text-gray-600">Sperm meets egg</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">3-4</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Cell Division</div>
                  <div className="text-sm text-gray-600">Embryo develops</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">6-12</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Implantation</div>
                  <div className="text-sm text-gray-600">Embryo attaches to uterus</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border-2 border-pink-200">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <Baby className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-pink-900">Pregnancy</div>
                  <div className="text-sm text-pink-700">HCG production begins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Optimizing Your Conception Chances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              category: 'Timing',
              icon: Calendar,
              tips: [
                'Have intercourse every other day during fertile window',
                'Focus on 3 days before ovulation',
                'Don\'t wait for positive ovulation test',
                'Continue through ovulation day'
              ],
              color: 'bg-blue-100 text-blue-600'
            },
            {
              category: 'Lifestyle',
              icon: Heart,
              tips: [
                'Maintain healthy weight (BMI 18.5-24.9)',
                'Take folic acid (400-800 mcg daily)',
                'Limit alcohol and eliminate smoking',
                'Manage stress levels'
              ],
              color: 'bg-green-100 text-green-600'
            },
            {
              category: 'Nutrition',
              icon: Target,
              tips: [
                'Eat balanced diet rich in antioxidants',
                'Include omega-3 fatty acids',
                'Limit caffeine to 200mg daily',
                'Stay hydrated'
              ],
              color: 'bg-purple-100 text-purple-600'
            },
            {
              category: 'Tracking',
              icon: TrendingUp,
              tips: [
                'Monitor basal body temperature',
                'Track cervical mucus changes',
                'Use ovulation predictor kits',
                'Record cycle patterns'
              ],
              color: 'bg-pink-100 text-pink-600'
            },
            {
              category: 'Health',
              icon: CheckCircle,
              tips: [
                'Get preconception checkup',
                'Update vaccinations',
                'Manage chronic conditions',
                'Review medications'
              ],
              color: 'bg-yellow-100 text-yellow-600'
            },
            {
              category: 'Partner Health',
              icon: Heart,
              tips: [
                'Partner takes multivitamin',
                'Avoid excessive heat (hot tubs, saunas)',
                'Limit alcohol consumption',
                'Maintain healthy lifestyle'
              ],
              color: 'bg-red-100 text-red-600'
            }
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                <category.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.category}</h3>
              <ul className="space-y-2">
                {category.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Conception Rates by Age</h2>
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Age Range</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Monthly Chance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">6 Months</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">12 Months</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Considerations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">Under 25</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">25%</td>
                  <td className="py-3 px-4 text-green-600">82%</td>
                  <td className="py-3 px-4 text-green-600">96%</td>
                  <td className="py-3 px-4 text-gray-600">Peak fertility years</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">25-29</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">20%</td>
                  <td className="py-3 px-4 text-green-600">74%</td>
                  <td className="py-3 px-4 text-green-600">93%</td>
                  <td className="py-3 px-4 text-gray-600">Excellent fertility</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">30-34</td>
                  <td className="py-3 px-4 text-yellow-600 font-semibold">15%</td>
                  <td className="py-3 px-4 text-yellow-600">63%</td>
                  <td className="py-3 px-4 text-yellow-600">86%</td>
                  <td className="py-3 px-4 text-gray-600">Good fertility</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">35-39</td>
                  <td className="py-3 px-4 text-orange-600 font-semibold">10%</td>
                  <td className="py-3 px-4 text-orange-600">47%</td>
                  <td className="py-3 px-4 text-orange-600">72%</td>
                  <td className="py-3 px-4 text-gray-600">Declining fertility</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">40+</td>
                  <td className="py-3 px-4 text-red-600 font-semibold">5%</td>
                  <td className="py-3 px-4 text-red-600">26%</td>
                  <td className="py-3 px-4 text-red-600">44%</td>
                  <td className="py-3 px-4 text-gray-600">Consider fertility specialist</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">When to Seek Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-red-900 mb-4">Consult a Fertility Specialist If:</h3>
            <ul className="space-y-3">
              {[
                'Under 35: Trying for 12+ months',
                'Over 35: Trying for 6+ months',
                'Irregular or absent periods',
                'Known fertility issues',
                'History of miscarriages',
                'Partner has fertility concerns'
              ].map((condition, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-red-800">{condition}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Fertility Testing May Include:</h3>
            <ul className="space-y-3">
              {[
                'Hormone level testing',
                'Ovulation monitoring',
                'Fallopian tube evaluation',
                'Uterine assessment',
                'Semen analysis (partner)',
                'Genetic screening'
              ].map((test, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-800">{test}</span>
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
      title: 'Ovulation Tracker',
      description: 'Track ovulation and optimize fertile window timing',
      href: '/pages/ovulation-tracker',
      category: 'Fertility'
    },
    {
      title: 'Fertility Tracker',
      description: 'Comprehensive fertility monitoring and optimization',
      href: '/pages/fertility-tracker',
      category: 'Fertility'
    },
    {
      title: 'Trying to Conceive Tracker',
      description: 'Specialized tracking for conception journey',
      href: '/pages/trying-to-conceive-tracker',
      category: 'TTC'
    },
    {
      title: 'BBT Ovulation Tracker',
      description: 'Track basal body temperature for ovulation',
      href: '/pages/bbt-ovulation-tracker',
      category: 'Temperature'
    },
    {
      title: 'Pregnancy Tracker',
      description: 'Track pregnancy journey week by week',
      href: '/pages/pregnancy-tracker',
      category: 'Pregnancy'
    },
    {
      title: 'Due Date Calculator',
      description: 'Calculate estimated due date and conception date',
      href: '/pages/due-date-calculator',
      category: 'Pregnancy'
    }
  ];

  const faq = [
    {
      question: 'What are the chances of getting pregnant each month?',
      answer: 'Healthy couples under 30 have about a 20-25% chance of conceiving each month when timing intercourse correctly. This decreases with age: 15% for ages 30-34, 10% for ages 35-39, and 5% for ages 40+.'
    },
    {
      question: 'When is the best time to have intercourse for conception?',
      answer: 'The best time is during your fertile window: the 5 days before ovulation plus the day of ovulation. Focus especially on the 2-3 days before ovulation, as this is when conception is most likely to occur.'
    },
    {
      question: 'How long should we try before seeking help?',
      answer: 'If you\'re under 35, try for 12 months before consulting a fertility specialist. If you\'re 35 or older, seek help after 6 months of trying. Consult sooner if you have known fertility issues or irregular cycles.'
    },
    {
      question: 'Can stress affect conception?',
      answer: 'Yes, chronic stress can affect hormone levels and ovulation, potentially reducing conception chances. While normal life stress is unlikely to prevent pregnancy, managing stress through relaxation techniques may help.'
    },
    {
      question: 'Do I need to track ovulation to get pregnant?',
      answer: 'While not required, tracking ovulation significantly improves your chances by helping you identify your fertile window. Many couples conceive without tracking, but it can be especially helpful if you have irregular cycles.'
    },
    {
      question: 'What lifestyle changes can improve conception chances?',
      answer: 'Maintain a healthy weight, take folic acid, limit alcohol and caffeine, don\'t smoke, exercise regularly but not excessively, manage stress, and ensure both partners follow healthy lifestyle habits.'
    }
  ];

  return (
    <PageLayout
      title="Conception Tracker - Optimize Your Fertility Journey | FemCare"
      description="Track conception chances and optimize fertility with FemCare's conception tracker. Calculate fertile windows, conception probability, and get expert guidance for TTC."
      h1="Conception Tracker & Fertility Optimizer"
      heroContent={heroContent}
      mainContent={mainContent}
      relatedPages={relatedPages}
      faq={faq}
    />
  );
};

export default ConceptionTracker;
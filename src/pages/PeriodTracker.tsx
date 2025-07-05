import React, { useState } from 'react';
import { Calendar, Clock, Droplets, TrendingUp, Heart, Calculator, CheckCircle, ArrowRight } from 'lucide-react';
import PageLayout from './PageLayout';

const PeriodTracker = () => {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [prediction, setPrediction] = useState<any>(null);

  const calculatePrediction = () => {
    if (!lastPeriod) return;
    
    const lastDate = new Date(lastPeriod);
    const nextPeriod = new Date(lastDate);
    nextPeriod.setDate(lastDate.getDate() + parseInt(cycleLength));
    
    const today = new Date();
    const daysUntil = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    setPrediction({
      nextPeriod: nextPeriod.toLocaleDateString(),
      daysUntil: Math.max(0, daysUntil),
      cycleDay: Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    });
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <p className="text-xl text-gray-600 mb-8">
        Track your menstrual cycle with precision. Get accurate predictions, understand your patterns, and take control of your reproductive health.
      </p>
      
      {/* Quick Calculator */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Quick Period Prediction Calculator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              Cycle Length (days)
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
              Period Length (days)
            </label>
            <select
              value={periodLength}
              onChange={(e) => setPeriodLength(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Array.from({ length: 8 }, (_, i) => i + 3).map(days => (
                <option key={days} value={days}>{days} days</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={calculatePrediction}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Calculator className="w-5 h-5" />
          <span>Calculate Prediction</span>
        </button>
        
        {prediction && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3">Your Prediction Results:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{prediction.nextPeriod}</div>
                <div className="text-sm text-purple-700">Next Period Date</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{prediction.daysUntil}</div>
                <div className="text-sm text-purple-700">Days Until Next Period</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{prediction.cycleDay}</div>
                <div className="text-sm text-purple-700">Current Cycle Day</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Want more accurate predictions and detailed insights? 
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
      {/* What is Period Tracking */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">What is Period Tracking?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-6">
              Period tracking is the practice of monitoring your menstrual cycle to understand your body's natural rhythm. 
              By recording when your period starts and ends, along with symptoms and flow intensity, you can predict future cycles and identify patterns.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits of Period Tracking:</h3>
            <ul className="space-y-3">
              {[
                'Predict your next period with 95% accuracy',
                'Identify irregular cycles early',
                'Plan activities around your cycle',
                'Track PMS symptoms and patterns',
                'Monitor reproductive health',
                'Optimize fertility planning'
              ].map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Average Menstrual Cycle</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="font-medium text-gray-700">Cycle Length</span>
                <span className="text-purple-600 font-bold">21-35 days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="font-medium text-gray-700">Period Length</span>
                <span className="text-purple-600 font-bold">3-7 days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="font-medium text-gray-700">Average Cycle</span>
                <span className="text-purple-600 font-bold">28 days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="font-medium text-gray-700">Ovulation Day</span>
                <span className="text-purple-600 font-bold">Day 14</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Track Your Period */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Track Your Period Effectively</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Calendar,
              title: 'Mark Start Date',
              description: 'Record the first day of your period each month. This is day 1 of your cycle.',
              color: 'bg-pink-100 text-pink-600'
            },
            {
              icon: Droplets,
              title: 'Track Flow',
              description: 'Note the intensity of your flow: light, normal, heavy, or very heavy.',
              color: 'bg-red-100 text-red-600'
            },
            {
              icon: Clock,
              title: 'Monitor Duration',
              description: 'Record how many days your period lasts, typically 3-7 days.',
              color: 'bg-purple-100 text-purple-600'
            },
            {
              icon: Heart,
              title: 'Note Symptoms',
              description: 'Track PMS symptoms, mood changes, and physical discomfort.',
              color: 'bg-blue-100 text-blue-600'
            }
          ].map((step, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-4`}>
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Period Tracking Methods */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Period Tracking Methods Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Accuracy</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Convenience</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">Paper Calendar</td>
                <td className="px-6 py-4 text-gray-600">Basic</td>
                <td className="px-6 py-4 text-gray-600">Low</td>
                <td className="px-6 py-4 text-gray-600">Date marking only</td>
                <td className="px-6 py-4 text-gray-600">Beginners</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">Basic Apps</td>
                <td className="px-6 py-4 text-gray-600">Good</td>
                <td className="px-6 py-4 text-gray-600">Medium</td>
                <td className="px-6 py-4 text-gray-600">Predictions, reminders</td>
                <td className="px-6 py-4 text-gray-600">Casual tracking</td>
              </tr>
              <tr className="bg-purple-50">
                <td className="px-6 py-4 font-medium text-purple-900">FemCare Advanced</td>
                <td className="px-6 py-4 text-purple-600 font-semibold">Excellent</td>
                <td className="px-6 py-4 text-purple-600 font-semibold">High</td>
                <td className="px-6 py-4 text-purple-600 font-semibold">AI predictions, symptoms, analytics</td>
                <td className="px-6 py-4 text-purple-600 font-semibold">Comprehensive health</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Common Period Tracking Mistakes */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Common Period Tracking Mistakes to Avoid</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              mistake: 'Only tracking period days',
              solution: 'Track your entire cycle including ovulation, PMS symptoms, and mood changes for complete insights.'
            },
            {
              mistake: 'Inconsistent logging',
              solution: 'Set daily reminders and make tracking a habit. Even 2-3 missed days can affect prediction accuracy.'
            },
            {
              mistake: 'Ignoring irregular patterns',
              solution: 'Document irregular cycles and consult healthcare providers if patterns persist for 3+ months.'
            },
            {
              mistake: 'Not tracking symptoms',
              solution: 'Record PMS symptoms, flow intensity, and mood to identify patterns and triggers.'
            },
            {
              mistake: 'Using unreliable methods',
              solution: 'Choose a dedicated period tracking app with proven accuracy rather than basic calendar marking.'
            },
            {
              mistake: 'Not backing up data',
              solution: 'Use cloud-based tracking to ensure your valuable health data is never lost.'
            }
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-red-600 mb-3">❌ {item.mistake}</h3>
              <p className="text-gray-700 mb-3">{item.solution}</p>
              <div className="text-sm text-green-600 font-medium">✅ Better approach</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const relatedPages = [
    {
      title: 'Ovulation Tracker',
      description: 'Track your fertile window and optimize conception timing',
      href: '/pages/ovulation-tracker',
      category: 'Fertility'
    },
    {
      title: 'PMS Symptom Tracker',
      description: 'Monitor and manage premenstrual syndrome symptoms',
      href: '/pages/pms-symptom-tracker',
      category: 'Symptoms'
    },
    {
      title: 'Irregular Period Tracker',
      description: 'Understand and track irregular menstrual cycles',
      href: '/pages/irregular-period-tracker',
      category: 'Health'
    },
    {
      title: 'Period Pain Tracker',
      description: 'Monitor menstrual pain patterns and find relief',
      href: '/pages/period-pain-tracker',
      category: 'Symptoms'
    },
    {
      title: 'Menstrual Flow Tracker',
      description: 'Track flow intensity and identify changes',
      href: '/pages/menstrual-flow-tracker',
      category: 'Tracking'
    },
    {
      title: 'First Period Tracker',
      description: 'Guide for teens starting their menstrual journey',
      href: '/pages/first-period-tracker',
      category: 'Education'
    }
  ];

  const faq = [
    {
      question: 'How accurate are period tracking apps?',
      answer: 'Modern period tracking apps like FemCare can achieve 95%+ accuracy when you consistently log your data. The accuracy improves over time as the app learns your unique patterns.'
    },
    {
      question: 'What should I track besides my period dates?',
      answer: 'Track flow intensity, symptoms (cramps, mood, energy), ovulation signs, sexual activity, and any medications. This comprehensive data provides better predictions and health insights.'
    },
    {
      question: 'How long does it take to see accurate predictions?',
      answer: 'Most apps need 2-3 cycles of data to provide reliable predictions. FemCare\'s AI can start making accurate predictions after just one complete cycle.'
    },
    {
      question: 'Can period tracking help with fertility planning?',
      answer: 'Yes! Period tracking helps identify your fertile window, ovulation timing, and optimal conception days. It\'s essential for both trying to conceive and natural family planning.'
    },
    {
      question: 'What if my periods are irregular?',
      answer: 'Period tracking is especially important for irregular cycles. It helps identify patterns, triggers, and provides data for healthcare consultations. Track consistently even with irregular periods.'
    },
    {
      question: 'Is my period tracking data private and secure?',
      answer: 'FemCare uses bank-level encryption and HIPAA-compliant security measures. Your health data is private, secure, and never shared without your explicit consent.'
    }
  ];

  return (
    <PageLayout
      title="Period Tracker - Free Menstrual Cycle Calendar & Predictions | FemCare"
      description="Track your period with FemCare's accurate period tracker. Get predictions, monitor symptoms, and understand your menstrual cycle. Free period calendar with 95% accuracy."
      h1="Free Period Tracker & Menstrual Cycle Calendar"
      heroContent={heroContent}
      mainContent={mainContent}
      relatedPages={relatedPages}
      faq={faq}
    />
  );
};

export default PeriodTracker;
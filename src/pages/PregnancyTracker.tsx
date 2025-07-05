import React, { useState } from 'react';
import { Baby, Calendar, Heart, TrendingUp, Clock, Scale, CheckCircle, Calculator } from 'lucide-react';
import PageLayout from './PageLayout';

const PregnancyTracker = () => {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [prediction, setPrediction] = useState<any>(null);

  const calculatePregnancy = () => {
    if (!lastPeriod) return;
    
    const lmpDate = new Date(lastPeriod);
    const dueDate = new Date(lmpDate);
    dueDate.setDate(lmpDate.getDate() + 280); // 40 weeks
    
    const today = new Date();
    const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksPregnant = Math.floor(daysSinceLMP / 7);
    const daysExtra = daysSinceLMP % 7;
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine trimester
    let trimester = 1;
    if (weeksPregnant >= 27) trimester = 3;
    else if (weeksPregnant >= 13) trimester = 2;
    
    setPrediction({
      dueDate: dueDate.toLocaleDateString(),
      weeksPregnant,
      daysExtra,
      trimester,
      daysUntilDue: Math.max(0, daysUntilDue),
      conceptionDate: new Date(lmpDate.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
    });
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <p className="text-xl text-gray-600 mb-8">
        Track your pregnancy journey week by week. Monitor your baby's development, track symptoms, and prepare for each milestone with confidence.
      </p>
      
      {/* Quick Calculator */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Pregnancy Due Date Calculator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Menstrual Period (LMP)
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
          onClick={calculatePregnancy}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Calculator className="w-5 h-5" />
          <span>Calculate Due Date</span>
        </button>
        
        {prediction && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3">Your Pregnancy Details:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-purple-600">{prediction.dueDate}</div>
                  <div className="text-sm text-purple-700">Due Date</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">
                    {prediction.weeksPregnant}w {prediction.daysExtra}d
                  </div>
                  <div className="text-sm text-purple-700">Weeks Pregnant</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{prediction.trimester}</div>
                  <div className="text-sm text-purple-700">Trimester</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{prediction.daysUntilDue}</div>
                  <div className="text-sm text-purple-700">Days Until Due</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Track your complete pregnancy journey with personalized insights! 
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
      {/* Understanding Pregnancy Tracking */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Pregnancy Tracking Guide</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-6">
              Pregnancy tracking helps you monitor your baby's development, track symptoms, and prepare for each stage of your journey. 
              From conception to delivery, comprehensive tracking ensures you and your baby stay healthy.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Pregnancy Tracking:</h3>
            <ul className="space-y-3">
              {[
                'Monitor baby\'s weekly development',
                'Track pregnancy symptoms and changes',
                'Prepare for prenatal appointments',
                'Monitor weight gain and nutrition',
                'Track fetal movements and kicks',
                'Plan for labor and delivery'
              ].map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Pregnancy Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">First Trimester</div>
                  <div className="text-sm text-gray-600">Weeks 1-12: Organ development</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Second Trimester</div>
                  <div className="text-sm text-gray-600">Weeks 13-26: Growth & movement</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Third Trimester</div>
                  <div className="text-sm text-gray-600">Weeks 27-40: Final development</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border-2 border-pink-200">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <Baby className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-pink-900">Birth</div>
                  <div className="text-sm text-pink-700">Week 40: Your baby arrives!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Track During Pregnancy */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Essential Pregnancy Tracking Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Baby,
              title: 'Baby Development',
              description: 'Track weekly milestones, size comparisons, and organ development',
              items: ['Weekly size updates', 'Organ development', 'Movement patterns', 'Growth milestones']
            },
            {
              icon: Scale,
              title: 'Weight & Nutrition',
              description: 'Monitor healthy weight gain and nutritional needs',
              items: ['Weekly weight tracking', 'Calorie requirements', 'Vitamin intake', 'Food aversions']
            },
            {
              icon: Heart,
              title: 'Symptoms & Health',
              description: 'Track pregnancy symptoms and health changes',
              items: ['Morning sickness', 'Energy levels', 'Sleep quality', 'Physical changes']
            },
            {
              icon: Calendar,
              title: 'Appointments',
              description: 'Schedule and track prenatal care visits',
              items: ['Doctor visits', 'Ultrasounds', 'Test results', 'Vaccination schedule']
            },
            {
              icon: TrendingUp,
              title: 'Fetal Movement',
              description: 'Monitor baby\'s kicks and movement patterns',
              items: ['Daily kick counts', 'Movement timing', 'Activity patterns', 'Sleep cycles']
            },
            {
              icon: Clock,
              title: 'Contractions',
              description: 'Track labor signs and contraction timing',
              items: ['Braxton Hicks', 'True contractions', 'Timing intervals', 'Intensity levels']
            }
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                <category.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <ul className="space-y-1">
                {category.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-500 flex items-center space-x-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Trimester-by-Trimester Guide */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Trimester-by-Trimester Tracking Guide</h2>
        <div className="space-y-8">
          {[
            {
              trimester: 'First Trimester (Weeks 1-12)',
              color: 'border-green-200 bg-green-50',
              headerColor: 'text-green-900',
              focus: 'Foundation & Early Development',
              keyMilestones: [
                'Implantation and early organ formation',
                'Heart begins beating (week 6)',
                'Brain and nervous system development',
                'First prenatal appointment (week 8-10)'
              ],
              commonSymptoms: [
                'Morning sickness and nausea',
                'Breast tenderness',
                'Fatigue and mood changes',
                'Food aversions and cravings'
              ],
              trackingPriorities: [
                'Prenatal vitamin intake',
                'Symptom severity and patterns',
                'Weight changes',
                'Appointment scheduling'
              ]
            },
            {
              trimester: 'Second Trimester (Weeks 13-26)',
              color: 'border-blue-200 bg-blue-50',
              headerColor: 'text-blue-900',
              focus: 'Growth & Movement',
              keyMilestones: [
                'Gender determination possible (week 16-20)',
                'First fetal movements felt (week 16-22)',
                'Anatomy scan (week 18-22)',
                'Viability milestone (week 24)'
              ],
              commonSymptoms: [
                'Increased energy levels',
                'Growing belly and weight gain',
                'Skin and hair changes',
                'Possible back pain'
              ],
              trackingPriorities: [
                'Fetal movement patterns',
                'Weight gain progression',
                'Ultrasound measurements',
                'Exercise and activity levels'
              ]
            },
            {
              trimester: 'Third Trimester (Weeks 27-40)',
              color: 'border-purple-200 bg-purple-50',
              headerColor: 'text-purple-900',
              focus: 'Final Development & Preparation',
              keyMilestones: [
                'Rapid brain development',
                'Lung maturation',
                'Baby drops into birth position',
                'Full-term development (week 37)'
              ],
              commonSymptoms: [
                'Increased fetal movement',
                'Braxton Hicks contractions',
                'Sleep difficulties',
                'Shortness of breath'
              ],
              trackingPriorities: [
                'Daily kick counts',
                'Contraction timing',
                'Birth preparation',
                'Hospital bag checklist'
              ]
            }
          ].map((trimester, index) => (
            <div key={index} className={`rounded-xl p-6 border-2 ${trimester.color}`}>
              <h3 className={`text-2xl font-bold ${trimester.headerColor} mb-4`}>
                {trimester.trimester}
              </h3>
              <p className="text-lg text-gray-700 mb-6 font-medium">{trimester.focus}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Milestones</h4>
                  <ul className="space-y-2">
                    {trimester.keyMilestones.map((milestone, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Common Symptoms</h4>
                  <ul className="space-y-2">
                    {trimester.commonSymptoms.map((symptom, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Tracking Priorities</h4>
                  <ul className="space-y-2">
                    {trimester.trackingPriorities.map((priority, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pregnancy Tracking Tools */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Essential Pregnancy Tracking Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              category: 'Digital Tools',
              tools: [
                'Pregnancy tracking apps with week-by-week guides',
                'Kick counter apps for fetal movement',
                'Contraction timer for labor tracking',
                'Weight and nutrition tracking apps',
                'Appointment reminder systems'
              ]
            },
            {
              category: 'Physical Tools',
              tools: [
                'Pregnancy journal or diary',
                'Digital scale for weight monitoring',
                'Blood pressure monitor (if recommended)',
                'Measuring tape for belly growth',
                'Pregnancy pillow for comfort tracking'
              ]
            },
            {
              category: 'Medical Monitoring',
              tools: [
                'Regular prenatal checkups',
                'Ultrasound examinations',
                'Blood tests and screenings',
                'Glucose tolerance tests',
                'Fetal heart rate monitoring'
              ]
            },
            {
              category: 'Lifestyle Tracking',
              tools: [
                'Exercise and activity logs',
                'Sleep quality monitoring',
                'Nutrition and meal planning',
                'Stress and mood tracking',
                'Preparation milestone checklists'
              ]
            }
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h3>
              <ul className="space-y-3">
                {category.tools.map((tool, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const relatedPages = [
    {
      title: 'Due Date Calculator',
      description: 'Calculate your estimated due date and track pregnancy progress',
      href: '/pages/due-date-calculator',
      category: 'Pregnancy'
    },
    {
      title: 'Conception Calculator',
      description: 'Determine conception date and fertile window',
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
      title: 'Kick Counter',
      description: 'Track fetal movements and baby\'s activity patterns',
      href: '/pages/kick-counter',
      category: 'Monitoring'
    },
    {
      title: 'Contraction Timer',
      description: 'Time contractions and track labor progress',
      href: '/pages/contraction-timer',
      category: 'Labor'
    },
    {
      title: 'Pregnancy Weight Tracker',
      description: 'Monitor healthy weight gain throughout pregnancy',
      href: '/pages/pregnancy-weight-tracker',
      category: 'Health'
    }
  ];

  const faq = [
    {
      question: 'When should I start tracking my pregnancy?',
      answer: 'Start tracking as soon as you know you\'re pregnant, ideally around 4-6 weeks. Early tracking helps establish baselines for weight, symptoms, and appointment scheduling.'
    },
    {
      question: 'How accurate are pregnancy due date calculators?',
      answer: 'Due date calculators are accurate within 1-2 weeks for most women. Only about 5% of babies are born on their exact due date, with most arriving within 2 weeks before or after.'
    },
    {
      question: 'What should I track in my first trimester?',
      answer: 'Focus on prenatal vitamin intake, morning sickness patterns, weight changes, and appointment scheduling. Early symptom tracking helps identify patterns and concerns.'
    },
    {
      question: 'When should I start counting fetal movements?',
      answer: 'Most doctors recommend starting kick counts around 28 weeks when movements become more regular. You should feel at least 10 movements in 2 hours during baby\'s active periods.'
    },
    {
      question: 'How much weight should I gain during pregnancy?',
      answer: 'Recommended weight gain depends on your pre-pregnancy BMI: 25-35 lbs for normal weight, 15-25 lbs for overweight, and 11-20 lbs for obese women. Consult your healthcare provider for personalized guidance.'
    },
    {
      question: 'What pregnancy symptoms should I track and report?',
      answer: 'Track severe nausea, unusual pain, bleeding, severe headaches, vision changes, and decreased fetal movement. Report any concerning symptoms to your healthcare provider immediately.'
    }
  ];

  return (
    <PageLayout
      title="Pregnancy Tracker - Free Week by Week Pregnancy Calendar | FemCare"
      description="Track your pregnancy journey week by week with FemCare's comprehensive pregnancy tracker. Monitor baby development, symptoms, and milestones. Free pregnancy calendar."
      h1="Free Pregnancy Tracker & Week-by-Week Guide"
      heroContent={heroContent}
      mainContent={mainContent}
      relatedPages={relatedPages}
      faq={faq}
    />
  );
};

export default PregnancyTracker;
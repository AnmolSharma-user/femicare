import React from 'react';
import { ArrowRight, Heart, Calendar, TrendingUp, Users, Star, CheckCircle } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  description: string;
  h1: string;
  heroContent: React.ReactNode;
  mainContent: React.ReactNode;
  relatedPages?: Array<{
    title: string;
    description: string;
    href: string;
    category: string;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  h1,
  heroContent,
  mainContent,
  relatedPages = [],
  faq = []
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* SEO Head */}
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="period tracker, ovulation tracker, pregnancy tracker, women's health, menstrual cycle, fertility tracking" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="canonical" href={`https://femcare.app${window.location.pathname}`} />
      </head>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                FemCare
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="/auth/signin" className="text-gray-600 hover:text-purple-600 font-medium">
                Sign In
              </a>
              <a href="/auth/signup" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all">
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {h1}
            </h1>
            {heroContent}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {mainContent}
      </main>

      {/* Related Pages */}
      {relatedPages.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Related Health Trackers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPages.map((page, index) => (
                <a
                  key={index}
                  href={page.href}
                  className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-purple-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {page.category}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {page.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faq.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faq.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of women who trust FemCare for comprehensive health tracking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center space-x-2"
            >
              <span>Start Free Today</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/features"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all"
            >
              Learn More
            </a>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-pink-200 text-sm">Active Users</div>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold">4.8★</div>
              <div className="text-pink-200 text-sm">User Rating</div>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-pink-200 text-sm">Uptime</div>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold">HIPAA</div>
              <div className="text-pink-200 text-sm">Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FemCare</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering women with comprehensive health tracking and insights.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Trackers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/pages/period-tracker" className="hover:text-white">Period Tracker</a></li>
                <li><a href="/pages/ovulation-tracker" className="hover:text-white">Ovulation Tracker</a></li>
                <li><a href="/pages/pregnancy-tracker" className="hover:text-white">Pregnancy Tracker</a></li>
                <li><a href="/pages/fertility-tracker" className="hover:text-white">Fertility Tracker</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/community" className="hover:text-white">Community</a></li>
                <li><a href="/feedback" className="hover:text-white">Feedback</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FemCare. All rights reserved. Made with ❤️ for women's health.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
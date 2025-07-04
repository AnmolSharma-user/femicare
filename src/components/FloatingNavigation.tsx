import React from 'react';
import { Calendar, TrendingUp, Heart, Settings, BarChart3, Grid3X3 } from 'lucide-react';

interface FloatingNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ activeTab, setActiveTab }) => {
  const navigation = [
    { id: 'dashboard', label: 'Home', icon: Grid3X3 },
    { id: 'cycle', label: 'Cycle', icon: Calendar },
    { id: 'symptoms', label: 'Symptoms', icon: Heart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background with blur and border */}
      <div className="bg-white/95 backdrop-blur-lg border-t border-pink-100 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-3 safe-area-inset-bottom">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  activeTab === item.id
                    ? 'text-white'
                    : 'text-gray-600 hover:text-pink-600'
                }`}
              >
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg scale-110'
                    : 'hover:bg-pink-50'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FloatingNavigation;
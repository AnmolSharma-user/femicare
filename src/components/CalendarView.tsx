import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Droplets, Heart, Circle } from 'lucide-react';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Sample cycle data
  const cycleData = {
    periodDays: [15, 16, 17, 18, 19], // Days of the month
    fertilityDays: [26, 27, 28, 29, 30, 31, 1, 2],
    ovulationDay: 29,
    symptoms: {
      15: ['cramps', 'bloating'],
      16: ['mood-low'],
      17: ['energy-low'],
      28: ['mood-high'],
      29: ['energy-high'],
      30: ['mood-high']
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDayType = (day) => {
    if (cycleData.periodDays.includes(day)) return 'period';
    if (cycleData.fertilityDays.includes(day)) return 'fertility';
    if (cycleData.ovulationDay === day) return 'ovulation';
    return 'normal';
  };

  const getDayStyles = (day, dayType) => {
    const baseStyles = 'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium cursor-pointer transition-all hover:scale-105';
    
    switch (dayType) {
      case 'period':
        return `${baseStyles} bg-red-500 text-white`;
      case 'fertility':
        return `${baseStyles} bg-purple-200 text-purple-800`;
      case 'ovulation':
        return `${baseStyles} bg-purple-500 text-white ring-2 ring-purple-300`;
      default:
        return `${baseStyles} hover:bg-gray-100`;
    }
  };

  const getSymptomIcons = (day) => {
    const symptoms = cycleData.symptoms[day] || [];
    return symptoms.map((symptom, index) => {
      switch (symptom) {
        case 'cramps':
          return <Circle key={index} className="w-2 h-2 text-red-500 fill-current" />;
        case 'bloating':
          return <Circle key={index} className="w-2 h-2 text-orange-500 fill-current" />;
        case 'mood-high':
          return <Circle key={index} className="w-2 h-2 text-green-500 fill-current" />;
        case 'mood-low':
          return <Circle key={index} className="w-2 h-2 text-blue-500 fill-current" />;
        case 'energy-high':
          return <Circle key={index} className="w-2 h-2 text-yellow-500 fill-current" />;
        case 'energy-low':
          return <Circle key={index} className="w-2 h-2 text-gray-500 fill-current" />;
        default:
          return null;
      }
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="w-10 h-10"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayType = getDayType(day);
      const symptoms = getSymptomIcons(day);
      
      days.push(
        <div key={day} className="relative">
          <div
            className={getDayStyles(day, dayType)}
            onClick={() => setSelectedDate(day)}
          >
            {day}
          </div>
          {symptoms.length > 0 && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {symptoms}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Calendar View</h2>
            <p className="text-purple-100 text-lg">
              Track your cycle and symptoms visually
            </p>
          </div>
          <Calendar className="w-12 h-12 text-white/80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Legend */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Period</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full ring-2 ring-purple-300"></div>
                <span className="text-sm text-gray-700">Ovulation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-200 rounded-full"></div>
                <span className="text-sm text-gray-700">Fertility Window</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Symptoms</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Circle className="w-3 h-3 text-red-500 fill-current" />
                  <span className="text-xs text-gray-600">Cramps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Circle className="w-3 h-3 text-green-500 fill-current" />
                  <span className="text-xs text-gray-600">Good mood</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Circle className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">High energy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cycle Day</span>
                <span className="font-medium text-gray-900">14</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phase</span>
                <span className="font-medium text-purple-600">Ovulation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fertility</span>
                <span className="font-medium text-purple-600">High</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2">
                <Droplets className="w-4 h-4" />
                <span>Log Period</span>
              </button>
              <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Add Symptom</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">Cycle Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Day Type:</span>
                    <span className="font-medium capitalize">{getDayType(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Symptoms:</span>
                    <span className="font-medium">
                      {cycleData.symptoms[selectedDate]?.length || 0} logged
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedDate(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
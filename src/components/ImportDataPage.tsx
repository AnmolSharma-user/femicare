import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, Download, AlertCircle, CheckCircle, Calendar, Heart, Activity, Loader2, Info, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  addCycleLog, 
  addEnhancedSymptomLog, 
  addMoodLog, 
  updateUserProfile,
  getSymptomDefinitions,
  getSymptomCategories 
} from '../utils/supabase';

interface ImportDataPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface ImportStats {
  cycles: number;
  symptoms: number;
  moods: number;
  errors: number;
}

const ImportDataPage: React.FC<ImportDataPageProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<'select' | 'preview' | 'importing' | 'complete'>('select');
  const [previewData, setPreviewData] = useState<any>(null);

  const supportedFormats = [
    {
      name: 'JSON Format',
      description: 'Standard JSON export from health apps',
      extensions: ['.json'],
      example: 'femcare-export.json',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      name: 'CSV Format',
      description: 'Comma-separated values from spreadsheets',
      extensions: ['.csv'],
      example: 'health-data.csv',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      name: 'Clue Export',
      description: 'Export from Clue period tracker',
      extensions: ['.json', '.csv'],
      example: 'clue-export.json',
      icon: Heart,
      color: 'bg-pink-500'
    },
    {
      name: 'Flo Export',
      description: 'Export from Flo period tracker',
      extensions: ['.json', '.csv'],
      example: 'flo-data.json',
      icon: Activity,
      color: 'bg-purple-500'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = async (file: File) => {
    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else {
        throw new Error('Unsupported file format');
      }

      setPreviewData(data);
      setStep('preview');
    } catch (error) {
      console.error('Error previewing file:', error);
      setErrors(['Error reading file. Please check the format and try again.']);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return { cycles: data, symptoms: [], moods: [] };
  };

  const normalizeData = (data: any) => {
    if (data.cycles || data.symptoms || data.moods) {
      return data;
    }

    if (data.periods || data.mood_tracking) {
      return mapFloData(data);
    }

    if (data.length && Array.isArray(data)) {
      return { cycles: data, symptoms: [], moods: [] };
    }

    if (data.export_date || data.user_id) {
      return mapClueData(data);
    }

    const cycles = [];
    const symptoms = [];
    const moods = [];

    Object.keys(data).forEach(key => {
      if (key.toLowerCase().includes('cycle') || key.toLowerCase().includes('period')) {
        if (Array.isArray(data[key])) {
          cycles.push(...data[key]);
        }
      } else if (key.toLowerCase().includes('symptom')) {
        if (Array.isArray(data[key])) {
          symptoms.push(...data[key]);
        }
      } else if (key.toLowerCase().includes('mood')) {
        if (Array.isArray(data[key])) {
          moods.push(...data[key]);
        }
      }
    });

    return { cycles, symptoms, moods };
  };

  const mapClueData = (data: any) => {
    const cycles = [];
    const symptoms = [];
    const moods = [];

    if (data.cycles) {
      data.cycles.forEach((cycle: any) => {
        cycles.push({
          start_date: cycle.start_date || cycle.date,
          cycle_length: cycle.cycle_length || cycle.length,
          period_length: cycle.period_length || cycle.bleeding_days,
          flow_intensity: cycle.flow || 'normal',
          notes: cycle.notes || ''
        });
      });
    }

    if (data.symptoms) {
      data.symptoms.forEach((symptom: any) => {
        symptoms.push({
          date: symptom.date,
          symptom: symptom.name || symptom.symptom,
          category: symptom.category || 'physical',
          severity: symptom.severity || 'mild',
          notes: symptom.notes || ''
        });
      });
    }

    if (data.moods) {
      data.moods.forEach((mood: any) => {
        moods.push({
          date: mood.date,
          mood: mood.mood || 'okay',
          energy_level: mood.energy || 5,
          stress_level: mood.stress || 5,
          sleep_quality: mood.sleep || 5,
          notes: mood.notes || ''
        });
      });
    }

    return { cycles, symptoms, moods };
  };

  const mapFloData = (data: any) => {
    const cycles = [];
    const symptoms = [];
    const moods = [];

    if (data.periods) {
      data.periods.forEach((period: any) => {
        cycles.push({
          start_date: period.start_date,
          period_length: period.duration || 5,
          flow_intensity: period.intensity || 'normal',
          notes: period.notes || ''
        });
      });
    }

    if (data.symptoms) {
      data.symptoms.forEach((symptom: any) => {
        symptoms.push({
          date: symptom.date,
          symptom: symptom.type || symptom.name,
          category: symptom.category || 'physical',
          severity: symptom.intensity || 'mild',
          notes: symptom.notes || ''
        });
      });
    }

    if (data.mood_tracking) {
      data.mood_tracking.forEach((mood: any) => {
        moods.push({
          date: mood.date,
          mood: mood.mood || 'okay',
          energy_level: mood.energy || 5,
          stress_level: mood.stress || 5,
          notes: mood.notes || ''
        });
      });
    }

    return { cycles, symptoms, moods };
  };

  const importData = async () => {
    if (!user || !previewData) return;

    setImporting(true);
    setStep('importing');
    
    const stats: ImportStats = { cycles: 0, symptoms: 0, moods: 0, errors: 0 };
    const importErrors: string[] = [];

    try {
      const normalizedData = normalizeData(previewData);
      
      const [categoriesResult, definitionsResult] = await Promise.all([
        getSymptomCategories(),
        getSymptomDefinitions()
      ]);

      const categories = categoriesResult.data || [];
      const definitions = definitionsResult.data || [];

      // Import cycles
      if (normalizedData.cycles && normalizedData.cycles.length > 0) {
        for (const cycle of normalizedData.cycles) {
          try {
            await addCycleLog(user.id, {
              start_date: cycle.start_date || cycle.date,
              cycle_length: cycle.cycle_length || cycle.length,
              period_length: cycle.period_length || cycle.bleeding_days || 5,
              flow_intensity: cycle.flow_intensity || cycle.flow || 'normal',
              notes: cycle.notes || ''
            });
            stats.cycles++;
          } catch (error) {
            stats.errors++;
            importErrors.push(`Error importing cycle: ${error.message}`);
          }
        }
      }

      // Import symptoms
      if (normalizedData.symptoms && normalizedData.symptoms.length > 0) {
        for (const symptom of normalizedData.symptoms) {
          try {
            const symptomName = symptom.symptom || symptom.name || symptom.type;
            const definition = definitions.find(d => 
              d.name.toLowerCase().includes(symptomName.toLowerCase()) ||
              symptomName.toLowerCase().includes(d.name.toLowerCase())
            );

            if (definition) {
              await addEnhancedSymptomLog(user.id, {
                symptom_definition_id: definition.id,
                date: symptom.date,
                severity_level: mapSeverityToNumber(symptom.severity || symptom.intensity),
                notes: symptom.notes || ''
              });
            } else {
              await addEnhancedSymptomLog(user.id, {
                symptom_definition_id: definitions[0]?.id,
                date: symptom.date,
                severity_level: mapSeverityToNumber(symptom.severity || symptom.intensity),
                notes: `${symptomName}: ${symptom.notes || ''}`
              });
            }
            stats.symptoms++;
          } catch (error) {
            stats.errors++;
            importErrors.push(`Error importing symptom: ${error.message}`);
          }
        }
      }

      // Import moods
      if (normalizedData.moods && normalizedData.moods.length > 0) {
        for (const mood of normalizedData.moods) {
          try {
            await addMoodLog(user.id, {
              date: mood.date,
              mood: mood.mood || 'okay',
              energy_level: mood.energy_level || mood.energy || 5,
              stress_level: mood.stress_level || mood.stress || 5,
              sleep_quality: mood.sleep_quality || mood.sleep || 5,
              notes: mood.notes || ''
            });
            stats.moods++;
          } catch (error) {
            stats.errors++;
            importErrors.push(`Error importing mood: ${error.message}`);
          }
        }
      }

      if (stats.cycles > 0 && normalizedData.cycles.length > 0) {
        const latestCycle = normalizedData.cycles
          .sort((a, b) => new Date(b.start_date || b.date).getTime() - new Date(a.start_date || a.date).getTime())[0];
        
        if (latestCycle) {
          await updateUserProfile(user.id, {
            last_period_date: latestCycle.start_date || latestCycle.date
          });
        }
      }

      setImportStats(stats);
      setErrors(importErrors);
      setStep('complete');

    } catch (error) {
      console.error('Import error:', error);
      setErrors([`Import failed: ${error.message}`]);
      setStep('complete');
    } finally {
      setImporting(false);
    }
  };

  const mapSeverityToNumber = (severity: string | number): number => {
    if (typeof severity === 'number') return Math.min(10, Math.max(1, severity));
    
    const severityMap = {
      'mild': 3,
      'light': 3,
      'moderate': 6,
      'medium': 6,
      'severe': 9,
      'heavy': 9,
      'intense': 9
    };

    return severityMap[severity?.toLowerCase()] || 5;
  };

  const getStepTitle = () => {
    switch (step) {
      case 'select': return 'Select Your Data File';
      case 'preview': return 'Preview Import Data';
      case 'importing': return 'Importing Your Data';
      case 'complete': return 'Import Complete!';
      default: return 'Import Health Data';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'select': return 'Choose a file containing your health data from other apps';
      case 'preview': return 'Review your data before importing to ensure accuracy';
      case 'importing': return 'Please wait while we process and import your health data';
      case 'complete': return 'Your health data has been successfully imported';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Import Health Data</h1>
                <p className="text-sm text-gray-500">{getStepDescription()}</p>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="hidden md:flex items-center space-x-4">
              {['select', 'preview', 'importing', 'complete'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step === stepName ? 'bg-blue-600 text-white scale-110' :
                    ['select', 'preview', 'importing', 'complete'].indexOf(step) > index ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {['select', 'preview', 'importing', 'complete'].indexOf(step) > index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`w-8 h-1 mx-2 transition-all ${
                      ['select', 'preview', 'importing', 'complete'].indexOf(step) > index ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
              <p className="text-gray-600">{getStepDescription()}</p>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 md:p-8">
            {/* Step 1: File Selection */}
            {step === 'select' && (
              <div className="space-y-8">
                {/* Supported Formats */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 text-center">Supported Formats</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {supportedFormats.map((format, index) => {
                      const Icon = format.icon;
                      return (
                        <div key={index} className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-all group hover:shadow-md">
                          <div className="text-center">
                            <div className={`w-12 h-12 ${format.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{format.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                            <div className="space-y-1 text-xs text-gray-500">
                              <p>Extensions: {format.extensions.join(', ')}</p>
                              <p className="text-blue-600">Example: {format.example}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="max-w-2xl mx-auto">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-medium text-gray-900 mb-4">Choose your data file</h3>
                    <p className="text-gray-600 mb-6">
                      Select a JSON or CSV file containing your health data
                    </p>
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer text-lg"
                    >
                      <Upload className="w-6 h-6" />
                      <span>Select File</span>
                    </label>
                  </div>
                </div>

                {/* Instructions */}
                <div className="max-w-4xl mx-auto">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-3">Before importing:</h4>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• Make sure your data includes dates in YYYY-MM-DD format</li>
                          <li>• Cycle data should include start dates and lengths</li>
                          <li>• Symptom data should include dates and descriptions</li>
                          <li>• Large files may take a few minutes to process</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {step === 'preview' && (
              <div className="space-y-8">
                {(() => {
                  const normalizedData = normalizeData(previewData);
                  return (
                    <>
                      {/* Data Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-pink-50 rounded-xl border border-pink-200 text-center">
                          <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-medium text-pink-900 mb-2">Cycles</h3>
                          <p className="text-3xl font-bold text-pink-600 mb-1">{normalizedData.cycles?.length || 0}</p>
                          <p className="text-sm text-pink-700">Period cycles found</p>
                        </div>

                        <div className="p-6 bg-purple-50 rounded-xl border border-purple-200 text-center">
                          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-medium text-purple-900 mb-2">Symptoms</h3>
                          <p className="text-3xl font-bold text-purple-600 mb-1">{normalizedData.symptoms?.length || 0}</p>
                          <p className="text-sm text-purple-700">Symptom entries found</p>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 text-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-medium text-blue-900 mb-2">Moods</h3>
                          <p className="text-3xl font-bold text-blue-600 mb-1">{normalizedData.moods?.length || 0}</p>
                          <p className="text-sm text-blue-700">Mood entries found</p>
                        </div>
                      </div>

                      {/* Sample Data Preview */}
                      {normalizedData.cycles?.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Sample Cycle Data</h3>
                          <div className="bg-gray-50 rounded-xl p-6 max-h-64 overflow-y-auto">
                            <pre className="text-sm text-gray-700">
                              {JSON.stringify(normalizedData.cycles.slice(0, 3), null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Step 3: Importing */}
            {step === 'importing' && (
              <div className="text-center space-y-8 py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Importing Your Data</h2>
                  <p className="text-gray-600 text-lg">
                    Please wait while we process and import your health data...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few minutes depending on the amount of data.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === 'complete' && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Import Complete!</h2>
                  <p className="text-gray-600 text-lg">
                    Your health data has been successfully imported.
                  </p>
                </div>

                {/* Import Statistics */}
                {importStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-3xl font-bold text-green-600">{importStats.cycles}</p>
                      <p className="text-sm text-green-700">Cycles</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="text-3xl font-bold text-purple-600">{importStats.symptoms}</p>
                      <p className="text-sm text-purple-700">Symptoms</p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-3xl font-bold text-blue-600">{importStats.moods}</p>
                      <p className="text-sm text-blue-700">Moods</p>
                    </div>
                    <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                      <p className="text-3xl font-bold text-red-600">{importStats.errors}</p>
                      <p className="text-sm text-red-700">Errors</p>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="font-medium text-red-900 mb-4">Import Errors:</h3>
                    <ul className="text-sm text-red-800 space-y-2">
                      {errors.slice(0, 5).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {errors.length > 5 && (
                        <li>• ... and {errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <p className="text-green-800">
                    <strong>Success!</strong> Your data has been imported and is now available in your dashboard and analytics.
                    You may need to refresh the page to see all updates.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          {step !== 'importing' && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-between items-center max-w-4xl mx-auto">
                <button
                  onClick={() => {
                    if (step === 'select') {
                      onBack();
                    } else if (step === 'preview') {
                      setStep('select');
                    } else if (step === 'complete') {
                      onSuccess();
                      onBack();
                    }
                  }}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {step === 'complete' ? 'Continue to Dashboard' : step === 'select' ? 'Cancel' : 'Back'}
                </button>

                {step === 'preview' && (
                  <button
                    onClick={importData}
                    className="px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center space-x-2"
                  >
                    <span>Import Data</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportDataPage;
// Analytics.tsx
import React, { useState, useEffect, useRef } from 'react';

const Analytics = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('descriptive');
  
  // Chart refs
  const chartRefs = {
    attendance: useRef(null),
    trend: useRef(null),
    turnover: useRef(null),
    productivity: useRef(null),
    payroll: useRef(null),
    leave: useRef(null),
    comparative: useRef(null),
    salaryProjection: useRef(null),
    historical: useRef(null),
    stability: useRef(null)
  };

  useEffect(() => {
    // Initialize charts
    initializeCharts();
    
    // Theme setup
    const savedTheme = localStorage.getItem('ih_theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(savedTheme ? savedTheme === 'dark' : systemDark);
    
    // Clock update
    const clockInterval = setInterval(updateClock, 1000);
    
    return () => clearInterval(clockInterval);
  }, []);

  const initializeCharts = () => {
    // Chart initialization logic would go here
    // Using Chart.js or similar library
  };

  const updateClock = () => {
    // Clock update logic
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('ih_theme', !isDark ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen font-inter transition-colors duration-300 ${
      isDark ? 'dark bg-slate-950 text-gray-100' : 'bg-gray-50/60 text-gray-800'
    }`}>
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -z-10 inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-40 gradient-accent animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-500 to-indigo-500 animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="min-h-screen flex">
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {/* Analytics Type Navigation */}
          <div className="glass rounded-3xl p-6 shadow-lg">
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { id: 'descriptive', label: '📊 Descriptive Analytics', desc: 'What Happened?' },
                { id: 'diagnostic', label: '🔍 Diagnostic Analytics', desc: 'Why Did It Happen?' },
                { id: 'predictive', label: '🔮 Predictive Analytics', desc: 'What Will Happen?' },
                { id: 'prescriptive', label: '💡 Prescriptive Analytics', desc: 'What Should We Do?' },
                { id: 'cognitive', label: '🧠 Cognitive Analytics', desc: 'AI-Level Intelligence' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'gradient-accent text-white shadow-glow' 
                      : 'glass hover:shadow-lg'
                  }`}
                >
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs opacity-80">{tab.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Section */}
          <header className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 shadow-lg">
            <div className="absolute inset-0 opacity-40 animate-shine"></div>
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {activeTab === 'descriptive' && 'Descriptive Analytics'}
                  {activeTab === 'diagnostic' && 'Diagnostic Analytics'}
                  {activeTab === 'predictive' && 'Predictive Analytics'}
                  {activeTab === 'prescriptive' && 'Prescriptive Analytics'}
                  {activeTab === 'cognitive' && 'Cognitive Analytics'}
                </h1>
                <p className="mt-1 text-sm md:text-base opacity-70">
                  {activeTab === 'descriptive' && 'Historical workforce data summaries and trends'}
                  {activeTab === 'diagnostic' && 'Root cause analysis and correlation insights'}
                  {activeTab === 'predictive' && 'Machine learning forecasts and predictions'}
                  {activeTab === 'prescriptive' && 'AI-generated recommendations and optimizations'}
                  {activeTab === 'cognitive' && 'Advanced AI reasoning and behavioral intelligence'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl glass text-xs">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span>Online</span>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-xl glass hover:shadow-lg transition"
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </header>

          {/* Analytics Content */}
          <div className="space-y-6">
            {/* DESCRIPTIVE ANALYTICS */}
            {activeTab === 'descriptive' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Key Metrics */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Workforce Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <p className="text-sm opacity-70">Avg. Attendance</p>
                      <p className="text-2xl font-bold">94.2%</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                      <p className="text-sm opacity-70">Productivity</p>
                      <p className="text-2xl font-bold">88.7%</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                      <p className="text-sm opacity-70">Overtime Hours</p>
                      <p className="text-2xl font-bold">247</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                      <p className="text-sm opacity-70">Late Arrivals</p>
                      <p className="text-2xl font-bold">23</p>
                    </div>
                  </div>
                </div>

                {/* Attendance Trends */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Attendance Trends</h3>
                  <div className="h-64">
                    <canvas ref={chartRefs.attendance}></canvas>
                  </div>
                </div>

                {/* Department Comparison */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Department Comparison</h3>
                  <div className="h-64">
                    <canvas ref={chartRefs.comparative}></canvas>
                  </div>
                </div>

                {/* Leave Pattern Analytics */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Leave Pattern Analytics</h3>
                  <div className="h-64">
                    <canvas ref={chartRefs.leave}></canvas>
                  </div>
                </div>
              </div>
            )}

            {/* DIAGNOSTIC ANALYTICS */}
            {activeTab === 'diagnostic' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Root Cause Analysis */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Absenteeism Root Cause Analysis</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🌧️</span>
                        <div>
                          <p className="font-medium">Weather Impact</p>
                          <p className="text-sm opacity-70">23% higher absenteeism on rainy days</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <p className="font-medium">Schedule Mismatch</p>
                          <p className="text-sm opacity-70">Monday shifts show 45% higher lateness</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💼</span>
                        <div>
                          <p className="font-medium">Workload Correlation</p>
                          <p className="text-sm opacity-70">High workload days = 18% more early exits</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Correlation Matrix */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Behavioral Correlation Matrix</h3>
                  <div className="h-64">
                    {/* Correlation heatmap would go here */}
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <p className="text-lg font-semibold">Behavior Pattern Clusters</p>
                        <p className="text-sm opacity-70 mt-2">High lateness + High productivity = Flexible schedule candidates</p>
                        <p className="text-sm opacity-70">Low attendance + High overtime = Burnout risk</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Productivity Drop Analysis */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Productivity Drop Diagnostics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Shift Duration Impact</span>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Team Size Effect</span>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{width: '42%'}}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Workload Distribution</span>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PREDICTIVE ANALYTICS */}
            {activeTab === 'predictive' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Turnover Prediction */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Employee Turnover Prediction</h3>
                  <div className="h-64">
                    <canvas ref={chartRefs.turnover}></canvas>
                  </div>
                </div>

                {/* Attendance Forecasting */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Attendance Forecasting (Next 30 Days)</h3>
                  <div className="h-64">
                    <canvas ref={chartRefs.trend}></canvas>
                  </div>
                </div>

                {/* Payroll Cost Projection */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Payroll Cost Forecasting</h3>
                  <div className="h-64">
                    <canvas ref={chartRefs.payroll}></canvas>
                  </div>
                </div>

                {/* Shift Demand Prediction */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Shift Demand Prediction</h3>
                  <div className="h-64">
                    <canvas ref={chartRefs.salaryProjection}></canvas>
                  </div>
                </div>
              </div>
            )}

            {/* PRESCRIPTIVE ANALYTICS */}
            {activeTab === 'prescriptive' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* AI Scheduling Recommendations */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">AI Shift Scheduling Recommendations</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                      <p className="font-medium">✅ Recommended Action</p>
                      <p className="text-sm opacity-70 mt-1">Add 2 staff to morning shift on Tuesday/Thursday</p>
                      <p className="text-xs opacity-50 mt-2">Expected impact: 12% reduction in overtime costs</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <p className="font-medium">🔄 Schedule Optimization</p>
                      <p className="text-sm opacity-70 mt-1">Implement flexible hours for high-productivity latecomers</p>
                      <p className="text-xs opacity-50 mt-2">Expected: 8% productivity increase</p>
                    </div>
                  </div>
                </div>

                {/* Workforce Allocation */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Optimal Workforce Allocation</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <span>Sales → Marketing</span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">+15% efficiency</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <span>Engineering AM → PM shift</span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">+22% output</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                      <span>Cross-train HR staff</span>
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded-full">Backup coverage</span>
                    </div>
                  </div>
                </div>

                {/* Cost Optimization */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Payroll Cost Optimization</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl text-center">
                      <p className="text-2xl font-bold">$12.4K</p>
                      <p className="text-sm opacity-70">Monthly savings possible</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-center">
                      <p className="text-2xl font-bold">18%</p>
                      <p className="text-sm opacity-70">Overtime reduction</p>
                    </div>
                  </div>
                </div>

                {/* Intervention Strategies */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Absenteeism Intervention Strategies</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                      <p className="font-medium">High Risk Employees (3)</p>
                      <p className="text-sm opacity-70">Recommend: Reduced weekend shifts + wellness check</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                      <p className="font-medium">Medium Risk Department</p>
                      <p className="text-sm opacity-70">Recommend: Flexible scheduling + workload review</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COGNITIVE ANALYTICS - AI-LEVEL INTELLIGENCE */}
            {activeTab === 'cognitive' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* AI HR Assistant */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">AI HR Conversational Assistant</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <p className="font-medium">💬 "Why is payroll high this week?"</p>
                      <p className="text-sm opacity-70 mt-2">AI: Overtime increased by 23% in Sales due to project deadlines. 3 employees exceeded 10 hrs overtime.</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                      <p className="font-medium">💬 "Who might resign soon?"</p>
                      <p className="text-sm opacity-70 mt-2">AI: 2 high-risk employees identified. Michael Chen (85% probability) - shows declining attendance and engagement.</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                      <p className="font-medium">💬 "Optimize next week's schedule"</p>
                      <p className="text-sm opacity-70 mt-2">AI: Recommended schedule reduces overtime by 15% while maintaining 98% coverage. 3 shift swaps suggested.</p>
                    </div>
                  </div>
                </div>

                {/* Behavioral Clustering */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Employee Behavioral Clustering</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                      <p className="font-medium">🎯 Cluster A: High Performers (12 employees)</p>
                      <p className="text-sm opacity-70">Characteristics: Consistent attendance, high productivity, adaptable to schedule changes</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                      <p className="font-medium">⚡ Cluster B: Flexible Stars (8 employees)</p>
                      <p className="text-sm opacity-70">Characteristics: Occasionally late but high output, thrive with flexible hours</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl">
                      <p className="font-medium">🚨 Cluster C: Burnout Risk (5 employees)</p>
                      <p className="text-sm opacity-70">Characteristics: High overtime, declining productivity, frequent late arrivals</p>
                    </div>
                  </div>
                </div>

                {/* Early Warning System */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">AI Early Warning System</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border-l-4 border-red-500">
                      <p className="font-medium">🚨 CRITICAL: Department Understaffing</p>
                      <p className="text-sm opacity-70">Sales team approaching 40% capacity next week</p>
                      <p className="text-xs opacity-50 mt-1">Recommend: Temporary staffing + shift reassignments</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl border-l-4 border-amber-500">
                      <p className="font-medium">⚠️ WARNING: Burnout Patterns</p>
                      <p className="text-sm opacity-70">3 employees showing consistent overtime + productivity decline</p>
                      <p className="text-xs opacity-50 mt-1">Recommend: Workload review + mandatory time off</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-l-4 border-blue-500">
                      <p className="font-medium">ℹ️ NOTICE: Attendance Pattern Shift</p>
                      <p className="text-sm opacity-70">Friday absences increased by 28% over last month</p>
                      <p className="text-xs opacity-50 mt-1">Recommend: Investigate causes + consider 4-day week trial</p>
                    </div>
                  </div>
                </div>

                {/* Explainable AI */}
                <div className="glass rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Explainable AI Decisions</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <p className="font-medium">Why is Michael Chen high turnover risk?</p>
                      <ul className="text-sm opacity-70 mt-2 list-disc list-inside space-y-1">
                        <li>Attendance dropped from 95% to 78% in 3 months</li>
                        <li>Productivity decreased by 22% while overtime increased</li>
                        <li>Schedule mismatch with personal commitments</li>
                        <li>Peers in similar roles show 45% higher satisfaction</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Workforce Simulation */}
                <div className="glass rounded-3xl p-6 shadow-lg col-span-1 xl:col-span-2">
                  <h3 className="text-xl font-bold mb-4">AI Workforce Simulation Engine</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl text-center">
                      <p className="text-2xl font-bold">4-Day Work Week</p>
                      <p className="text-sm opacity-70 mt-2">Simulation Result:</p>
                      <p className="text-lg font-semibold text-green-600">+12% Productivity</p>
                      <p className="text-sm opacity-70">-8% Overtime Costs</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-center">
                      <p className="text-2xl font-bold">Flexible Hours</p>
                      <p className="text-sm opacity-70 mt-2">Simulation Result:</p>
                      <p className="text-lg font-semibold text-blue-600">+18% Satisfaction</p>
                      <p className="text-sm opacity-70">-15% Late Arrivals</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-center">
                      <p className="text-2xl font-bold">Team Restructure</p>
                      <p className="text-sm opacity-70 mt-2">Simulation Result:</p>
                      <p className="text-lg font-semibold text-purple-600">+25% Efficiency</p>
                      <p className="text-sm opacity-70">-20% Workload Imbalance</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className="pb-8 pt-2 text-xs opacity-70 text-center">
            © IntelliHRTrack • AI Workforce Analytics Dashboard
          </footer>
        </main>
      </div>
    </div>
  );
};

// CSS Styles (should be in your global CSS or styled-components)
const styles = `
.glass {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.dark .glass {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
}

.gradient-accent {
  background-image: linear-gradient(135deg, #14b8a6, #0ea5a0);
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-shine {
  animation: shine 2.5s linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes shine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.shadow-glow {
  box-shadow: 0 10px 30px -5px rgba(16, 185, 129, 0.35), 0 8px 16px -8px rgba(59, 130, 246, 0.25);
}
`;

export default Analytics;
"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { 
  Cpu, 
  Clock, 
  Users, 
  BarChart3, 
  Timer, 
  AlertTriangle, 
  ArrowRight,
  Monitor,
  Zap,
  Database,
  Play,
  Pause,
  RotateCcw,
  Plus
} from 'lucide-react';

// Define spaceColors array (for backward compatibility)
const spaceColors = [
  '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', 
  '#fb923c', '#f87171', '#9ca3af', '#10b981', '#ef4444'
];

const AnimatedSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const ConceptCard = ({ icon: Icon, title, description, color }) => (
  <motion.div
    className={`bg-white/5 p-6 rounded-xl border border-${color}-500/30 hover:border-${color}-400/50 transition-all duration-300`}
    whileHover={{ y: -5, scale: 1.02 }}
  >
    <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center mb-4`}>
      <Icon className={`w-6 h-6 text-${color}-400`} />
    </div>
    <h3 className={`text-xl font-bold text-${color}-300 mb-3`}>{title}</h3>
    <p className="text-purple-200/80 leading-relaxed">{description}</p>
  </motion.div>
);

const SchedulingAlgorithmDemo = () => {
  const [currentAlgorithm, setCurrentAlgorithm] = useState(0);
  const algorithms = [
    { name: 'FCFS', color: 'bg-blue-500', desc: 'First Come, First Served' },
    { name: 'SJF', color: 'bg-green-500', desc: 'Shortest Job First' },
    { name: 'RR', color: 'bg-purple-500', desc: 'Round Robin' },
    { name: 'Priority', color: 'bg-amber-500', desc: 'Priority Scheduling' }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAlgorithm((prev) => (prev + 1) % algorithms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-32 bg-slate-800 rounded-lg overflow-hidden p-4">
      <div className="text-center mb-2">
        <h4 className="text-lg font-bold text-white">
          {algorithms[currentAlgorithm].name} - {algorithms[currentAlgorithm].desc}
        </h4>
      </div>
      
      <div className="flex justify-center items-center space-x-2">
        {/* CPU */}
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
          <Cpu className="w-8 h-8 text-white" />
        </div>
        
        {/* Process Queue */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-8 h-8 rounded ${algorithms[currentAlgorithm].color} flex items-center justify-center text-xs font-bold`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 }}
            >
              P{i + 1}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-purple-300 text-center">
          Different algorithms, different execution orders
        </p>
      </div>
    </div>
  );
};

const ProcessStateVisualization = () => {
  return (
    <div className="relative h-32 bg-slate-800 rounded-lg overflow-hidden p-4">
      <div className="flex justify-between items-center h-full">
        {/* Process States */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <motion.div 
            className="bg-blue-500 h-8 rounded flex items-center justify-center text-xs font-bold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            New
          </motion.div>
          <motion.div 
            className="bg-green-500 h-8 rounded flex items-center justify-center text-xs font-bold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            Ready
          </motion.div>
          <motion.div 
            className="bg-purple-500 h-8 rounded flex items-center justify-center text-xs font-bold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            Running
          </motion.div>
          <motion.div 
            className="bg-amber-500 h-8 rounded flex items-center justify-center text-xs font-bold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            Waiting
          </motion.div>
          <motion.div 
            className="bg-gray-500 h-8 rounded flex items-center justify-center text-xs font-bold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
          >
            Terminated
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const InteractiveVisualization = ({ onBackToIntroduction }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-purple-300">Interactive CPU Scheduling Simulation</h1>
          <button
            onClick={onBackToIntroduction}
            className="border-none outline-none px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            ← Back to Introduction
          </button>
        </div>
        
        <div className="text-center mt-20">
          <h2 className="text-2xl font-bold text-purple-200 mb-4">
            CPU Scheduling Simulation Coming Soon!
          </h2>
          <p className="text-purple-300 mb-8">
            This will feature interactive process creation, algorithm selection, and real-time Gantt chart visualization.
          </p>
        </div>
      </div>
    </div>
  );
};

const CPUSchedulingVisualization = ({ onBackToExplainer }) => {
  const [currentView, setCurrentView] = useState('introduction');

  const handleLaunchVisualization = () => {
    setCurrentView('visualization');
  };

  const handleBackToIntroduction = () => {
    setCurrentView('introduction');
  };

  if (currentView === 'visualization') {
    return <InteractiveVisualization onBackToIntroduction={handleBackToIntroduction} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Hero Section */}
        <AnimatedSection>
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-purple-300 mb-6">
              CPU Scheduling
            </h1>
            <p className="text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed">
              Discover how operating systems decide which process gets to use the CPU next, 
              optimizing for performance, fairness, and responsiveness.
            </p>
          </div>
        </AnimatedSection>

        {/* The Challenge Section */}
        <AnimatedSection delay={0.2}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h2 className="text-4xl font-bold text-red-300">The Challenge</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  Modern computers run dozens of processes simultaneously, but there's usually only one CPU core available. 
                  The <strong className="text-red-200">CPU scheduler</strong> must decide which process runs next.
                </p>
                <p>
                  <strong className="text-red-200">Poor scheduling</strong> can lead to some processes waiting forever, 
                  system unresponsiveness, or inefficient CPU utilization. The wrong choice can make your computer feel sluggish.
                </p>
                <p>
                  Without fair scheduling, critical system processes might be starved while less important tasks hog the CPU.
                </p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-center font-semibold text-white mb-4">Scheduling Chaos</h3>
              <div className="relative h-32 bg-slate-800 rounded-md overflow-hidden">
                <motion.div 
                  className="absolute h-8 bg-blue-500 rounded m-2 flex items-center justify-center text-xs font-bold"
                  animate={{ 
                    x: [0, 150, 0],
                    opacity: [1, 0.3, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Process A
                </motion.div>
                <motion.div 
                  className="absolute h-8 bg-green-500 rounded m-2 mt-12 flex items-center justify-center text-xs font-bold"
                  animate={{ 
                    x: [200, 50, 200],
                    scale: [1, 0.5, 1]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Process B
                </motion.div>
                <motion.div 
                  className="absolute h-8 bg-amber-500 rounded m-2 mt-20 flex items-center justify-center text-xs font-bold"
                  animate={{ 
                    x: [100, 0, 150],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Process C
                </motion.div>
                <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
              </div>
              <p className="text-xs text-red-400 mt-3 text-center">
                ⚠️ Random scheduling leads to poor performance
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Scheduling Algorithms Solution */}
        <AnimatedSection delay={0.3}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="bg-white/5 p-6 rounded-xl border border-cyan-500/30">
                <h3 className="text-center font-semibold text-white mb-4">Smart Scheduling Algorithms</h3>
                <SchedulingAlgorithmDemo />
                <p className="text-xs text-cyan-400 mt-3 text-center">
                  Different algorithms optimize for different goals
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <Clock className="w-8 h-8 text-cyan-400" />
                <h2 className="text-4xl font-bold text-cyan-300">Scheduling Algorithms</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  The OS uses sophisticated <strong className="text-cyan-200">scheduling algorithms</strong> to determine 
                  which process should run next. Each algorithm has different goals and trade-offs.
                </p>
                <p>
                  <strong className="text-cyan-200">First Come First Served (FCFS)</strong> is simple but can cause long waits. 
                  <strong className="text-cyan-200"> Shortest Job First (SJF)</strong> minimizes waiting time but requires prediction.
                </p>
                <p>
                  <strong className="text-cyan-200">Round Robin</strong> gives each process a fair time slice, 
                  while <strong className="text-cyan-200">Priority Scheduling</strong> ensures important tasks run first.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Process States */}
        <AnimatedSection delay={0.4}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Users className="w-8 h-8 text-purple-400" />
                <h2 className="text-4xl font-bold text-purple-300">Process States</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  Every process goes through different <strong className="text-purple-200">states</strong> during its lifetime. 
                  Understanding these states is crucial for effective scheduling.
                </p>
                <p>
                  A process starts in the <strong className="text-purple-200">New</strong> state, moves to <strong className="text-purple-200">Ready</strong> 
                  when loaded into memory, becomes <strong className="text-purple-200">Running</strong> when scheduled by the CPU.
                </p>
                <p>
                  It can go to <strong className="text-purple-200">Waiting</strong> for I/O operations, 
                  and finally reaches the <strong className="text-purple-200">Terminated</strong> state when complete.
                </p>
              </div>
            </div>
            <div>
              <div className="bg-white/5 p-6 rounded-xl border border-purple-500/30">
                <h3 className="text-center font-semibold text-white mb-4">Process State Transitions</h3>
                <ProcessStateVisualization />
                <p className="text-xs text-purple-400 mt-3 text-center">
                  Processes transition between these states
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Key Concepts Grid */}
        <AnimatedSection delay={0.5}>
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-purple-300 text-center mb-12">
              Core Concepts You'll Explore
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <ConceptCard
                icon={Timer}
                title="Time Quantum"
                description="The fixed time slice each process gets in Round Robin scheduling. Too long causes poor responsiveness, too short increases overhead."
                color="blue"
              />
              <ConceptCard
                icon={BarChart3}
                title="Performance Metrics"
                description="Measure scheduler effectiveness using turnaround time, waiting time, response time, and CPU utilization."
                color="green"
              />
              <ConceptCard
                icon={Zap}
                title="Preemption"
                description="The ability to interrupt a running process to switch to another. Essential for responsive systems and fair scheduling."
                color="amber"
              />
            </div>
          </div>
        </AnimatedSection>

        {/* Interactive Launch Section */}
        <AnimatedSection delay={0.6}>
          <div className="text-center bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-12 rounded-2xl border border-purple-500/30">
            <h2 className="text-4xl font-bold text-purple-300 mb-6">
              Ready to Schedule?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Experience CPU scheduling firsthand! Create processes, choose algorithms, and watch as the scheduler 
              orchestrates the dance of computation with interactive Gantt charts and real-time metrics.
            </p>
            <motion.button
              onClick={handleLaunchVisualization}
              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl shadow-purple-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3">
                <span>Launch Interactive Simulation</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
            
            {onBackToExplainer && (
              <div className="mt-4">
                <button
                  onClick={onBackToExplainer}
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  ← Back to Overview
                </button>
              </div>
            )}
          </div>
        </AnimatedSection>

      </div>
    </div>
  );
};

export default CPUSchedulingVisualization;
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Cpu, HardDrive, Zap } from 'lucide-react';

const MemoryManagementPrelude = ({ onLaunchSimulation }) => {
  const storySteps = [
    {
      icon: Cpu,
      title: "The Hungry Processes",
      description: "In the digital cosmos, processes are born constantly, each demanding their slice of memory space.",
      delay: 0
    },
    {
      icon: HardDrive,
      title: "Finite Physical Memory",
      description: "But physical RAM is limited—a cosmic constraint that threatens system harmony.",
      delay: 0.5
    },
    {
      icon: Zap,
      title: "The OS Solution",
      description: "Enter the Operating System's elegant solution: virtual memory and intelligent paging.",
      delay: 1
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Memory Management
          </h1>
          <p className="text-xl text-purple-200">
            Journey through the cosmos of virtual memory
          </p>
        </motion.div>

        {/* Story Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {storySteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: step.delay }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-6 mx-auto">
                <step.icon className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                {step.title}
              </h3>
              <p className="text-purple-200 text-center leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Animated Visualization Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 mb-12 border border-purple-500/20"
        >
          <div className="flex items-center justify-center space-x-8">
            {/* Process Representations */}
            <div className="flex flex-col items-center space-y-4">
              <h4 className="text-purple-200 font-medium">Active Processes</h4>
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity
                    }}
                    className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold"
                  >
                    P{i}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-purple-400"
            >
              <div className="w-16 h-0.5 bg-purple-400 relative">
                <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-purple-400 border-t-2 border-b-2 border-t-transparent border-b-transparent transform -translate-y-1.5"></div>
              </div>
            </motion.div>

            {/* Memory Grid */}
            <div className="flex flex-col items-center space-y-4">
              <h4 className="text-purple-200 font-medium">Physical Memory</h4>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      backgroundColor: i < 8 ? ['#7c3aed', '#a855f7', '#7c3aed'] : ['#374151', '#4b5563', '#374151']
                    }}
                    transition={{ 
                      duration: 2,
                      delay: (i % 4) * 0.1,
                      repeat: Infinity
                    }}
                    className="w-6 h-6 rounded border border-purple-400/30"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Launch Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="text-center"
        >
          <button
            onClick={onLaunchSimulation}
            className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            <div className="flex items-center space-x-3">
              <Play className="w-6 h-6 group-hover:animate-pulse" />
              <span>Launch Interactive Simulation</span>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default MemoryManagementPrelude;

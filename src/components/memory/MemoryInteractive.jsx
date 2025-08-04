import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const MemoryInteractive = ({ onBackToIntroduction }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-300">Interactive Memory Sandbox</h1>
          <button 
            onClick={onBackToIntroduction} 
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Introduction
          </button>
        </div>
        
        <div className="text-center py-20 bg-white/5 rounded-xl">
          <h2 className="text-2xl text-purple-200">New Interactive Visualization Coming Soon!</h2>
          <p className="text-purple-300/80 mt-2">This is where the new, dynamic memory simulation will live.</p>
        </div>

      </div>
    </div>
  );
};

export default MemoryInteractive;

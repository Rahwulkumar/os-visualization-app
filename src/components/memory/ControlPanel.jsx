import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock } from 'lucide-react';

const ControlPanel = ({ nextStep, prevStep, reset, currentStep, totalSteps, queueLength }) => {
  const canGoForward = currentStep < totalSteps - 1 || queueLength > 0;
  const canGoBack = currentStep > 0;

  return (
    <div className="h-full flex flex-col justify-between">
      <h3 className="text-center font-bold text-lg text-purple-200">Controls</h3>
      
      {/* Status Display */}
      <div className="text-center text-xs text-purple-300 space-y-1">
        <div className="flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Step: {currentStep} / {Math.max(totalSteps - 1, 0)}</span>
        </div>
        {queueLength > 0 && (
          <div className="text-amber-300">Queue: {queueLength} actions</div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-around items-center">
        <button 
          onClick={prevStep} 
          disabled={!canGoBack} 
          className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Step"
        >
          <SkipBack className="w-6 h-6" />
        </button>
        
        <button 
          onClick={nextStep} 
          disabled={!canGoForward} 
          className="p-4 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors text-white shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
          title={queueLength > 0 ? "Execute Next Action" : canGoForward ? "Next Step" : "No More Actions"}
        >
          <SkipForward className="w-8 h-8" />
        </button>
        
        <button 
          onClick={reset} 
          className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          title="Reset Simulation"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center text-xs text-purple-200/60">
        {!canGoForward && queueLength === 0 
          ? "Create a process to continue" 
          : "Click next to advance simulation"
        }
      </div>
    </div>
  );
};

export default ControlPanel;

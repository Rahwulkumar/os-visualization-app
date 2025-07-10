/**
 * Simple Step-by-Step Simulation Controls
 * Clean, intuitive controls for step-by-step simulation
 */

import React, { useState } from 'react';
import { SpaceCard, SpaceButton, SpaceTooltip } from '@/themes/spaceTheme';

const SimpleSimulationControls = ({ 
  engine, 
  isRunning = false, 
  isPaused = false,
  canStep = true,
  onModeChange = () => {}
}) => {
  const [mode, setMode] = useState('step'); // 'step' or 'auto'
  const [speed, setSpeed] = useState(1000);

  const handleStart = () => {
    if (engine) {
      if (mode === 'step') {
        engine.setStepMode(true);
      } else {
        engine.setStepMode(false);
        engine.setSpeed(speed);
      }
      engine.start();
    }
  };

  const handlePause = () => {
    if (engine) {
      engine.pause();
    }
  };

  const handleResume = () => {
    if (engine) {
      engine.resume();
    }
  };

  const handleStop = () => {
    if (engine) {
      engine.stop();
    }
  };

  const handleReset = () => {
    if (engine) {
      engine.reset();
    }
  };

  const handleStep = () => {
    if (engine) {
      engine.step();
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    onModeChange(newMode);
  };

  return (
    <SpaceCard className="bg-gray-800 border-2 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">🎮 Simulation Controls</h3>
        <div className="text-sm text-gray-400">
          Mode: {mode === 'step' ? '👆 Step-by-Step' : '🔄 Auto Run'}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
          <SpaceButton
            onClick={() => handleModeChange('step')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              mode === 'step' 
                ? 'bg-blue-600 text-white' 
                : 'bg-transparent text-gray-300 hover:bg-gray-600'
            }`}
          >
            👆 Step Mode
          </SpaceButton>
          <SpaceButton
            onClick={() => handleModeChange('auto')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              mode === 'auto' 
                ? 'bg-blue-600 text-white' 
                : 'bg-transparent text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔄 Auto Mode
          </SpaceButton>
        </div>
      </div>

      {/* Speed Control for Auto Mode */}
      {mode === 'auto' && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ⚡ Speed Control
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Slow</span>
            <input
              type="range"
              min="500"
              max="3000"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-400">Fast</span>
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">
            {speed}ms per step
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Step Mode Controls */}
        {mode === 'step' && (
          <>
            <SpaceButton
              onClick={handleStep}
              disabled={!canStep}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3"
            >
              <span className="text-xl">⏭️</span>
              <span className="font-medium">Next Step</span>
            </SpaceButton>
            <SpaceButton
              onClick={handleReset}
              className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 py-3"
            >
              <span className="text-xl">🔄</span>
              <span className="font-medium">Reset</span>
            </SpaceButton>
          </>
        )}

        {/* Auto Mode Controls */}
        {mode === 'auto' && (
          <>
            {!isRunning ? (
              <SpaceButton
                onClick={handleStart}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 py-3"
              >
                <span className="text-xl">▶️</span>
                <span className="font-medium">Start</span>
              </SpaceButton>
            ) : (
              <>
                {isPaused ? (
                  <SpaceButton
                    onClick={handleResume}
                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 py-3"
                  >
                    <span className="text-xl">▶️</span>
                    <span className="font-medium">Resume</span>
                  </SpaceButton>
                ) : (
                  <SpaceButton
                    onClick={handlePause}
                    className="flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 py-3"
                  >
                    <span className="text-xl">⏸️</span>
                    <span className="font-medium">Pause</span>
                  </SpaceButton>
                )}
              </>
            )}
            
            <SpaceButton
              onClick={handleStop}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 py-3"
            >
              <span className="text-xl">⏹️</span>
              <span className="font-medium">Stop</span>
            </SpaceButton>
          </>
        )}
      </div>

      {/* Additional Controls */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <SpaceButton
          onClick={handleReset}
          className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 py-2"
        >
          <span className="text-lg">🔄</span>
          <span className="font-medium">Reset Simulation</span>
        </SpaceButton>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <span>💡</span>
          <span>
            {mode === 'step' 
              ? 'Click "Next Step" to advance the simulation one step at a time'
              : 'Use Auto Mode to run the simulation continuously'
            }
          </span>
        </div>
      </div>
    </SpaceCard>
  );
};

export default SimpleSimulationControls;

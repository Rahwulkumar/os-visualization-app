/**
 * Simulation Controls Component
 * Provides controls for starting, pausing, stepping, and adjusting simulation speed
 */

import React, { useState } from 'react';
import { SpaceCard, GradientText, SpaceButton } from '@/themes/spaceTheme';

const SimulationControls = ({ 
  engine = null, 
  isRunning = false, 
  isPaused = false, 
  onSpeedChange = () => {}, 
  currentSpeed = 1000,
  userMode = 'beginner' 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(currentSpeed || 1000);

  const handleStart = () => {
    if (engine) {
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

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (engine) {
      engine.setSpeed(newSpeed);
    }
    if (onSpeedChange) {
      onSpeedChange(newSpeed);
    }
  };

  const speedOptions = [
    { value: 2000, label: 'Slow (2s)', icon: '🐌' },
    { value: 1000, label: 'Normal (1s)', icon: '🚶' },
    { value: 500, label: 'Fast (0.5s)', icon: '🏃' },
    { value: 200, label: 'Very Fast (0.2s)', icon: '🏃‍♂️' }
  ];

  const ControlButton = ({ onClick, disabled, icon, label, variant = 'primary' }) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-600 hover:bg-gray-700 text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white"
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]}`}
      >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Simulation Controls
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-lg">📊</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Main Controls */}
        <div className="flex flex-wrap gap-3">
          {!isRunning ? (
            <ControlButton
              onClick={handleStart}
              icon="▶️"
              label="Start"
              variant="primary"
            />
          ) : (
            <>
              {isPaused ? (
                <ControlButton
                  onClick={handleResume}
                  icon="▶️"
                  label="Resume"
                  variant="primary"
                />
              ) : (
                <ControlButton
                  onClick={handlePause}
                  icon="⏸️"
                  label="Pause"
                  variant="secondary"
                />
              )}
              <ControlButton
                onClick={handleStop}
                icon="⏹️"
                label="Stop"
                variant="danger"
              />
            </>
          )}
          
          <ControlButton
            onClick={handleReset}
            icon="🔄"
            label="Reset"
            variant="secondary"
          />
          
          {(userMode !== 'beginner' || isPaused) && (
            <ControlButton
              onClick={handleStep}
              disabled={isRunning && !isPaused}
              icon="⏭️"
              label="Step"
              variant="secondary"
            />
          )}
        </div>

        {/* Speed Control */}
        {showSettings && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <span className="text-lg">⏩</span>
              Simulation Speed
            </h4>
            <div className="space-y-3">
              {speedOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="speed"
                    value={option.value}
                    checked={speed === option.value}
                    onChange={() => handleSpeedChange(option.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <span>{option.icon}</span>
                    {option.label}
                  </span>
                </label>
              ))}
              
              {userMode === 'advanced' && (
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <label className="block text-sm text-gray-300 mb-2">
                    Custom Speed (ms)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    value={speed}
                    onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>100ms</span>
                    <span>{speed}ms</span>
                    <span>3000ms</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Display */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Status</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">State:</span>
              <span className={`font-medium ${
                isRunning 
                  ? (isPaused ? 'text-yellow-400' : 'text-green-400')
                  : 'text-gray-400'
              }`}>
                {isRunning ? (isPaused ? 'PAUSED' : 'RUNNING') : 'STOPPED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Speed:</span>
              <span className="text-blue-400 font-medium">
                {speed}ms
              </span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        {userMode === 'beginner' && (
          <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-700">
            <h4 className="text-sm font-medium text-blue-400 mb-2">Controls Help</h4>
            <div className="text-xs text-blue-300 space-y-1">
              <div>• <strong>Start:</strong> Begin the simulation</div>
              <div>• <strong>Pause:</strong> Temporarily stop execution</div>
              <div>• <strong>Reset:</strong> Return to initial state</div>
              <div>• <strong>Step:</strong> Execute one time unit manually</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationControls;

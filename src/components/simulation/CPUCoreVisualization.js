/**
 * CPU Core Visualization Component
 * Shows the current state of the CPU core with the running process
 */

import React from 'react';
import { SpaceCard, GradientText } from '@/themes/spaceTheme';

const CPUCoreVisualization = ({ runningProcess = null, currentTime = 0, userMode = 'beginner' }) => {
  const getProcessColor = (processId) => {
    const colors = [
      'from-blue-500 to-blue-700', 'from-green-500 to-green-700', 
      'from-yellow-500 to-yellow-700', 'from-red-500 to-red-700',
      'from-purple-500 to-purple-700', 'from-indigo-500 to-indigo-700', 
      'from-pink-500 to-pink-700', 'from-teal-500 to-teal-700'
    ];
    return colors[processId % colors.length];
  };

  const getStateColor = () => {
    if (runningProcess) {
      return 'from-green-500 to-green-700';
    }
    return 'from-gray-500 to-gray-700';
  };

  const getStateText = () => {
    if (runningProcess) {
      return 'RUNNING';
    }
    return 'IDLE';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🖥️</span>
          CPU Core
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-lg">📊</span>
          <span>Time: {currentTime}</span>
        </div>
      </div>

      <div className="relative">
        {/* CPU Core Visual */}
        <div className="relative mx-auto w-48 h-48 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-600 flex items-center justify-center">
          {/* Core rings */}
          <div className="absolute inset-4 rounded-full border-2 border-gray-600 opacity-50"></div>
          <div className="absolute inset-8 rounded-full border-2 border-gray-600 opacity-30"></div>
          
          {/* Center content */}
          <div className="text-center">
            <div className={`
              w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center
              bg-gradient-to-br ${getStateColor()}
              ${runningProcess ? 'animate-pulse' : ''}
            `}>
              {runningProcess ? (
                <span className="text-white font-bold text-xl">
                  {runningProcess.name.charAt(0)}
                </span>
              ) : (
                <span className="text-3xl opacity-50">⚡</span>
              )}
            </div>
            <div className="text-white font-medium">
              {getStateText()}
            </div>
            {runningProcess && (
              <div className="text-xs text-gray-400 mt-1">
                {runningProcess.name}
              </div>
            )}
          </div>

          {/* Activity indicators */}
          {runningProcess && (
            <>
              <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
            </>
          )}
        </div>

        {/* Process details */}
        {runningProcess && userMode !== 'beginner' && (
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-400">Process ID</div>
                <div className="text-white font-medium">{runningProcess.id}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-400">Remaining Time</div>
                <div className="text-white font-medium">{runningProcess.remainingTime}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-400">Priority</div>
                <div className="text-white font-medium">{runningProcess.priority}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-400">State</div>
                <div className="text-green-400 font-medium">{runningProcess.state.toUpperCase()}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">
                  {runningProcess.burstTime - runningProcess.remainingTime} / {runningProcess.burstTime}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getProcessColor(runningProcess.id)}`}
                  style={{
                    width: `${((runningProcess.burstTime - runningProcess.remainingTime) / runningProcess.burstTime) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Idle state message */}
        {!runningProcess && (
          <div className="mt-6 text-center">
            <div className="text-gray-400 text-sm">
              CPU is idle - no processes to execute
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CPUCoreVisualization;

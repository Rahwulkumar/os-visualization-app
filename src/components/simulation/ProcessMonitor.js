/**
 * Process Monitor Component
 * 
 * Displays detailed information about all processes in the simulation,
 * including their current state, progress, and statistics.
 */

import React from 'react';
import { SpaceCard, GradientText, spaceColors } from '@/themes/spaceTheme';

const ProcessMonitor = ({ 
  processes = [], 
  runningProcess = null, 
  currentTime = 0, 
  userMode = 'intermediate' 
}) => {
  const getProcessState = (process) => {
    if (runningProcess && runningProcess.id === process.id) {
      return { state: 'Running', color: 'text-green-400', icon: '🏃' };
    }
    if (process.completedTime !== undefined) {
      return { state: 'Completed', color: 'text-blue-400', icon: '✅' };
    }
    if (process.arrivalTime > currentTime) {
      return { state: 'Not Arrived', color: 'text-gray-400', icon: '⏰' };
    }
    if (process.blockedUntil && process.blockedUntil > currentTime) {
      return { state: 'Blocked', color: 'text-red-400', icon: '🚫' };
    }
    return { state: 'Ready', color: 'text-yellow-400', icon: '⏳' };
  };

  const getProgressPercentage = (process) => {
    if (!process.totalBurstTime) return 0;
    const executed = process.totalBurstTime - (process.remainingTime || process.burstTime);
    return Math.min(100, (executed / process.totalBurstTime) * 100);
  };

  const calculateWaitingTime = (process) => {
    if (process.completedTime !== undefined) {
      return process.completedTime - process.arrivalTime - process.totalBurstTime;
    }
    if (process.arrivalTime <= currentTime) {
      const executedTime = process.totalBurstTime - (process.remainingTime || process.burstTime);
      return currentTime - process.arrivalTime - executedTime;
    }
    return 0;
  };

  const calculateTurnaroundTime = (process) => {
    if (process.completedTime !== undefined) {
      return process.completedTime - process.arrivalTime;
    }
    return currentTime - process.arrivalTime;
  };

  return (
    <SpaceCard className="border-gray-600 h-full">
      <div className="p-4">
        <h3 className="text-lg font-bold mb-4">
          <GradientText gradient="from-blue-400 to-purple-400">
            Process Monitor
          </GradientText>
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {processes.map((process) => {
            const state = getProcessState(process);
            const progress = getProgressPercentage(process);
            const waitingTime = calculateWaitingTime(process);
            const turnaroundTime = calculateTurnaroundTime(process);
            
            return (
              <div 
                key={process.id}
                className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: process.color }}
                    />
                    <span className="font-semibold text-white">{process.name}</span>
                    <span className="text-xs text-gray-400">PID: {process.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{state.icon}</span>
                    <span className={`text-sm font-medium ${state.color}`}>
                      {state.state}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                {/* Process Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Arrival:</span>
                    <span className="text-white ml-1">{process.arrivalTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Burst:</span>
                    <span className="text-white ml-1">{process.burstTime}</span>
                  </div>
                  {process.priority !== undefined && (
                    <div>
                      <span className="text-gray-400">Priority:</span>
                      <span className="text-white ml-1">{process.priority}</span>
                    </div>
                  )}
                  {process.remainingTime !== undefined && (
                    <div>
                      <span className="text-gray-400">Remaining:</span>
                      <span className="text-white ml-1">{process.remainingTime}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Waiting:</span>
                    <span className="text-yellow-400 ml-1">{waitingTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Turnaround:</span>
                    <span className="text-green-400 ml-1">{turnaroundTime}</span>
                  </div>
                </div>
                
                {/* Advanced Mode Details */}
                {userMode === 'advanced' && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {process.startTime !== undefined && (
                        <div>
                          <span className="text-gray-400">Started:</span>
                          <span className="text-white ml-1">{process.startTime}</span>
                        </div>
                      )}
                      {process.completedTime !== undefined && (
                        <div>
                          <span className="text-gray-400">Completed:</span>
                          <span className="text-white ml-1">{process.completedTime}</span>
                        </div>
                      )}
                      {process.contextSwitches !== undefined && (
                        <div>
                          <span className="text-gray-400">Switches:</span>
                          <span className="text-white ml-1">{process.contextSwitches}</span>
                        </div>
                      )}
                      {process.memoryUsage !== undefined && (
                        <div>
                          <span className="text-gray-400">Memory:</span>
                          <span className="text-white ml-1">{process.memoryUsage}MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {processes.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <div>No processes to monitor</div>
          </div>
        )}
      </div>
    </SpaceCard>
  );
};

export default ProcessMonitor;

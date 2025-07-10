/**
 * Timeline Visualization Component
 * Shows the execution timeline with process states over time
 */

import React from 'react';
import { SpaceCard, GradientText } from '@/themes/spaceTheme';

const TimelineVisualization = ({ timeline = [], currentTime = 0, processes = [], userMode = 'beginner' }) => {
  const getProcessColor = (processId) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    return colors[processId % colors.length];
  };

  const getProcessName = (processId) => {
    const process = Array.isArray(processes) ? processes.find(p => p.id === processId) : null;
    return process ? process.name : `P${processId}`;
  };

  const visibleTimeline = Array.isArray(timeline) ? timeline.slice(-20) : []; // Show last 20 time units

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">⏰</span>
          Timeline Visualization
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Current Time: {currentTime}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* CPU Timeline */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">CPU Execution</h4>
          <div className="flex items-center gap-1 overflow-x-auto">
            {visibleTimeline.map((timePoint, index) => (
              <div
                key={index}
                className={`
                  w-8 h-8 rounded flex items-center justify-center text-xs font-medium
                  ${timePoint.runningProcess !== null 
                    ? `${getProcessColor(timePoint.runningProcess)} text-white` 
                    : 'bg-gray-600 text-gray-300'
                  }
                  ${timePoint.time === currentTime ? 'ring-2 ring-blue-400' : ''}
                `}
                title={`Time ${timePoint.time}: ${
                  timePoint.runningProcess !== null 
                    ? getProcessName(timePoint.runningProcess) 
                    : 'IDLE'
                }`}
              >
                {timePoint.runningProcess !== null 
                  ? getProcessName(timePoint.runningProcess).charAt(0)
                  : 'I'
                }
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            {visibleTimeline.map((timePoint, index) => (
              <div key={index} className="w-8 text-center">
                {timePoint.time}
              </div>
            ))}
          </div>
        </div>

        {/* Ready Queue Timeline */}
        {userMode !== 'beginner' && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Ready Queue</h4>
            <div className="flex items-center gap-1 overflow-x-auto">
              {visibleTimeline.map((timePoint, index) => {
                const readyQueueLength = timePoint.readyQueue ? timePoint.readyQueue.length : 0;
                return (
                  <div
                    key={index}
                    className={`
                      w-8 h-8 rounded flex items-center justify-center text-xs font-medium
                      bg-gray-700 text-gray-300 border
                      ${timePoint.time === currentTime ? 'border-blue-400' : 'border-gray-600'}
                    `}
                    title={`Time ${timePoint.time}: ${readyQueueLength} processes in queue`}
                  >
                    {readyQueueLength}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-gray-400">IDLE</span>
          </div>
          {processes.map((process) => (
            <div key={process.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${getProcessColor(process.id)} rounded`}></div>
              <span className="text-gray-400">{process.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineVisualization;

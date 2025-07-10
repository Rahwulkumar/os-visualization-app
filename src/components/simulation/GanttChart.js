/**
 * Gantt Chart Component
 * Shows the execution timeline in a traditional Gantt chart format
 */

import React from 'react';
import { SpaceCard, GradientText } from '@/themes/spaceTheme';

const GanttChart = ({ ganttChart = [], processes = [], userMode = 'beginner' }) => {
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

  // Group consecutive entries by process
  const groupedChart = Array.isArray(ganttChart) ? ganttChart.reduce((acc, entry) => {
    const last = acc[acc.length - 1];
    if (last && last.process === entry.process) {
      last.endTime = entry.time + 1;
    } else {
      acc.push({
        process: entry.process,
        processName: entry.processName,
        startTime: entry.time,
        endTime: entry.time + 1,
        type: entry.type
      });
    }
    return acc;
  }, []) : [];

  const maxTime = Array.isArray(ganttChart) && ganttChart.length > 0 
    ? Math.max(...ganttChart.map(entry => entry.time), 0) 
    : 0;
  const visibleChart = groupedChart.slice(-20); // Show last 20 entries

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-xl">📊</span>
          Gantt Chart
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-lg">📅</span>
          <span>Execution Timeline</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Chart */}
        <div className="relative overflow-x-auto">
          <div className="min-w-full">
            {/* Time scale */}
            <div className="flex items-center mb-2">
              <div className="w-20 text-xs text-gray-400">Time</div>
              <div className="flex-1 flex">
                {Array.from({ length: Math.min(maxTime + 1, 50) }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 text-xs text-gray-400 text-center border-l border-gray-700 px-1"
                    style={{ minWidth: '20px' }}
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>

            {/* CPU Timeline */}
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-300 font-medium">CPU</div>
              <div className="flex-1 flex relative h-8 bg-gray-800 rounded border border-gray-700">
                {visibleChart.map((entry, index) => {
                  const width = ((entry.endTime - entry.startTime) / Math.max(maxTime, 1)) * 100;
                  const left = (entry.startTime / Math.max(maxTime, 1)) * 100;
                  
                  return (
                    <div
                      key={index}
                      className={`
                        absolute h-full flex items-center justify-center text-xs font-medium text-white
                        ${entry.process !== null 
                          ? getProcessColor(entry.process) 
                          : 'bg-gray-600'
                        }
                        border-r border-gray-800
                      `}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        minWidth: '20px'
                      }}
                      title={`${entry.startTime}-${entry.endTime}: ${
                        entry.process !== null 
                          ? getProcessName(entry.process) 
                          : 'IDLE'
                      }`}
                    >
                      {entry.process !== null 
                        ? getProcessName(entry.process).charAt(0)
                        : 'I'
                      }
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Process timelines (Advanced mode) */}
            {userMode === 'advanced' && (
              <div className="mt-4 space-y-1">
                {processes.map((process) => {
                  const processEntries = visibleChart.filter(entry => entry.process === process.id);
                  
                  return (
                    <div key={process.id} className="flex items-center">
                      <div className="w-20 text-sm text-gray-300">{process.name}</div>
                      <div className="flex-1 flex relative h-6 bg-gray-800 rounded border border-gray-700">
                        {processEntries.map((entry, index) => {
                          const width = ((entry.endTime - entry.startTime) / Math.max(maxTime, 1)) * 100;
                          const left = (entry.startTime / Math.max(maxTime, 1)) * 100;
                          
                          return (
                            <div
                              key={index}
                              className={`
                                absolute h-full flex items-center justify-center text-xs font-medium text-white
                                ${getProcessColor(process.id)}
                                border-r border-gray-800
                              `}
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                minWidth: '10px'
                              }}
                              title={`${entry.startTime}-${entry.endTime}: ${process.name}`}
                            >
                              {width > 2 && '■'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap gap-4 text-xs pt-4 border-t border-gray-700">
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

        {/* Statistics */}
        {userMode !== 'beginner' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Execution Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Time:</span>
                  <span className="text-white">{maxTime + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Idle Time:</span>
                  <span className="text-gray-300">
                    {Array.isArray(ganttChart) ? ganttChart.filter(entry => entry.process === null).length : 0}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Time:</span>
                  <span className="text-green-400">
                    {Array.isArray(ganttChart) ? ganttChart.filter(entry => entry.process !== null).length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Efficiency:</span>
                  <span className="text-blue-400">
                    {Array.isArray(ganttChart) && ganttChart.length > 0 
                      ? ((ganttChart.filter(entry => entry.process !== null).length / ganttChart.length) * 100).toFixed(1)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChart;

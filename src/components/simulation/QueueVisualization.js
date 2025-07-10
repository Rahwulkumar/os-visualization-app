/**
 * Queue Visualization Component
 * Shows ready queue, blocked processes, and completed processes
 */

import React from 'react';
import { SpaceCard, GradientText } from '@/themes/spaceTheme';

const QueueVisualization = ({ readyQueue = [], blockedProcesses = [], completedProcesses = [], userMode = 'beginner' }) => {
  // Ensure all arrays are defined
  const safeReadyQueue = Array.isArray(readyQueue) ? readyQueue : [];
  const safeBlockedProcesses = Array.isArray(blockedProcesses) ? blockedProcesses : [];
  const safeCompletedProcesses = Array.isArray(completedProcesses) ? completedProcesses : [];
  const getProcessColor = (processId) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    return colors[processId % colors.length];
  };

  const ProcessCard = ({ process, state, showDetails = false }) => (
    <div className={`
      relative p-3 rounded-lg border transition-all duration-200
      ${state === 'ready' ? 'bg-blue-900 border-blue-500' : 
        state === 'blocked' ? 'bg-red-900 border-red-500' : 
        'bg-green-900 border-green-500'}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getProcessColor(process.id)}`}></div>
          <span className="text-white font-medium">{process.name}</span>
        </div>
        {showDetails && userMode !== 'beginner' && (
          <div className="text-xs text-gray-400">
            {state === 'ready' && `Wait: ${process.waitingTime}`}
            {state === 'blocked' && `I/O`}
            {state === 'completed' && `Done: ${process.completionTime}`}
          </div>
        )}
      </div>
      
      {showDetails && userMode === 'advanced' && (
        <div className="mt-2 text-xs text-gray-400 space-y-1">
          <div>Burst: {process.burstTime}</div>
          <div>Remaining: {process.remainingTime}</div>
          {process.priority !== undefined && <div>Priority: {process.priority}</div>}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-xl">📋</span>
          Process Queues
        </h3>
      </div>

      <div className="space-y-6">
        {/* Ready Queue */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⏰</span>
            <h4 className="text-sm font-medium text-blue-400">
              Ready Queue ({safeReadyQueue.length})
            </h4>
          </div>
          
          {safeReadyQueue.length > 0 ? (
            <div className="space-y-2">
              {safeReadyQueue.map((process, index) => (
                <div key={process.id} className="flex items-center gap-2">
                  <div className="text-xs text-gray-400 w-8 text-center">
                    {index + 1}
                  </div>
                  <ProcessCard process={process} state="ready" showDetails={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic p-4 bg-gray-800 rounded-lg">
              No processes in ready queue
            </div>
          )}
        </div>

        {/* Blocked Processes */}
        {(safeBlockedProcesses.length > 0 || userMode !== 'beginner') && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⏸️</span>
              <h4 className="text-sm font-medium text-red-400">
                Blocked Processes ({safeBlockedProcesses.length})
              </h4>
            </div>
            
            {safeBlockedProcesses.length > 0 ? (
              <div className="space-y-2">
                {safeBlockedProcesses.map((process) => (
                  <ProcessCard key={process.id} process={process} state="blocked" showDetails={true} />
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm italic p-4 bg-gray-800 rounded-lg">
                No blocked processes
              </div>
            )}
          </div>
        )}

        {/* Completed Processes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✅</span>
            <h4 className="text-sm font-medium text-green-400">
              Completed Processes ({safeCompletedProcesses.length})
            </h4>
          </div>
          
          {safeCompletedProcesses.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {safeCompletedProcesses.map((process) => (
                <ProcessCard key={process.id} process={process} state="completed" showDetails={true} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic p-4 bg-gray-800 rounded-lg">
              No completed processes
            </div>
          )}
        </div>
      </div>

      {/* Queue Statistics */}
      {userMode !== 'beginner' && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Queue Statistics</h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="text-blue-400 font-medium">{safeReadyQueue.length}</div>
              <div className="text-gray-400">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-medium">{safeBlockedProcesses.length}</div>
              <div className="text-gray-400">Blocked</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-medium">{safeCompletedProcesses.length}</div>
              <div className="text-gray-400">Completed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueVisualization;

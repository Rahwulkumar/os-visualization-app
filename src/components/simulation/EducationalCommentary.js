/**
 * Educational Commentary Component
 * Provides real-time explanations and insights about the scheduling algorithm
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SpaceCard, GradientText, SpaceButton } from '@/themes/spaceTheme';

const EducationalCommentary = ({ 
  algorithm = 'FCFS', 
  currentState = {}, 
  recentEvent = null, 
  userMode = 'beginner' 
}) => {
  const [commentary, setCommentary] = useState('');
  const [insights, setInsights] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // Generate commentary based on current state and events
  const generateCommentary = useCallback(() => {
    if (!currentState) return;

    const { runningProcess, readyQueue = [], currentTime } = currentState;
    const safeReadyQueue = Array.isArray(readyQueue) ? readyQueue : [];
    let newCommentary = '';
    let newInsights = [];

    // Algorithm-specific commentary
    switch (algorithm) {
      case 'FCFS':
        if (runningProcess) {
          newCommentary = `FCFS is executing ${runningProcess.name}. This algorithm runs processes in arrival order - simple but can cause convoy effect.`;
          if (safeReadyQueue.length > 0) {
            newInsights.push(`${safeReadyQueue.length} process(es) waiting. They must wait until ${runningProcess.name} completes.`);
          }
        } else if (safeReadyQueue.length > 0) {
          newCommentary = `CPU is idle. Next process ${safeReadyQueue[0].name} will start execution.`;
        } else {
          newCommentary = `No processes ready. FCFS waits for new arrivals.`;
        }
        break;

      case 'SJF':
        if (runningProcess) {
          newCommentary = `SJF selected ${runningProcess.name} (burst: ${runningProcess.burstTime}) as it has the shortest job time.`;
          if (safeReadyQueue.length > 0) {
            const nextShortest = safeReadyQueue[0];
            newInsights.push(`Next shortest job: ${nextShortest.name} (burst: ${nextShortest.burstTime})`);
          }
        } else {
          newCommentary = `SJF algorithm looks for the shortest job among ready processes.`;
        }
        break;

      case 'SRTF':
        if (runningProcess) {
          newCommentary = `SRTF is executing ${runningProcess.name} (remaining: ${runningProcess.remainingTime}).`;
          if (safeReadyQueue.length > 0 && safeReadyQueue[0].remainingTime < runningProcess.remainingTime) {
            newInsights.push(`${safeReadyQueue[0].name} could preempt (remaining: ${safeReadyQueue[0].remainingTime})`);
          }
        } else {
          newCommentary = `SRTF selects the process with shortest remaining time.`;
        }
        break;

      case 'PRIORITY':
        if (runningProcess) {
          newCommentary = `Priority scheduling is executing ${runningProcess.name} (priority: ${runningProcess.priority}).`;
          if (safeReadyQueue.length > 0) {
            newInsights.push(`Highest priority in queue: ${safeReadyQueue[0].name} (priority: ${safeReadyQueue[0].priority})`);
          }
        } else {
          newCommentary = `Priority scheduling selects the highest priority process.`;
        }
        break;

      case 'RR':
        if (runningProcess) {
          const timeSlice = runningProcess.timeSlice || 0;
          newCommentary = `Round Robin is executing ${runningProcess.name}. Time slice: ${timeSlice}/${2}.`;
          if (timeSlice >= 1) {
            newInsights.push(`Process will be preempted soon if time slice expires.`);
          }
          if (safeReadyQueue.length > 0) {
            newInsights.push(`${safeReadyQueue.length} process(es) waiting for their turn.`);
          }
        } else {
          newCommentary = `Round Robin gives each process a fair time slice.`;
        }
        break;

      default:
        newCommentary = `Observing ${algorithm} scheduling behavior.`;
    }

    // Add recent event commentary
    if (recentEvent) {
      newInsights.push(`Event: ${recentEvent.description}`);
    }

    // Add general insights based on user mode
    if (userMode !== 'beginner') {
      if (runningProcess) {
        newInsights.push(`CPU utilization: Active`);
      } else {
        newInsights.push(`CPU utilization: Idle`);
      }
    }

    setCommentary(newCommentary);
    setInsights(newInsights);
  }, [currentState, recentEvent, algorithm, userMode]);

  useEffect(() => {
    generateCommentary();
  }, [generateCommentary]);

  const getAlgorithmExplanation = () => {
    const explanations = {
      'FCFS': {
        title: 'First-Come-First-Served (FCFS)',
        description: 'Processes are executed in the order they arrive.',
        advantages: [
          'Simple to implement',
          'Fair - no starvation',
          'Low overhead'
        ],
        disadvantages: [
          'Poor average waiting time',
          'Convoy effect with long processes',
          'No preemption'
        ]
      },
      'SJF': {
        title: 'Shortest Job First (SJF)',
        description: 'Selects the process with the shortest burst time.',
        advantages: [
          'Optimal average waiting time',
          'Good for batch systems',
          'Minimizes total completion time'
        ],
        disadvantages: [
          'Starvation of long processes',
          'Requires knowledge of burst times',
          'Not practical for interactive systems'
        ]
      },
      'SRTF': {
        title: 'Shortest Remaining Time First (SRTF)',
        description: 'Preemptive version of SJF - switches to shorter remaining time.',
        advantages: [
          'Better response time than SJF',
          'Optimal for minimizing average waiting time',
          'Good for time-sharing systems'
        ],
        disadvantages: [
          'High overhead due to frequent context switches',
          'Starvation of long processes',
          'Requires burst time prediction'
        ]
      },
      'PRIORITY': {
        title: 'Priority Scheduling',
        description: 'Processes are scheduled based on priority levels.',
        advantages: [
          'Important processes get CPU first',
          'Flexible - can be preemptive or non-preemptive',
          'Good for real-time systems'
        ],
        disadvantages: [
          'Starvation of low-priority processes',
          'Priority inversion problem',
          'Requires priority assignment strategy'
        ]
      },
      'RR': {
        title: 'Round Robin (RR)',
        description: 'Each process gets a fixed time slice in circular order.',
        advantages: [
          'Fair allocation of CPU time',
          'Good response time',
          'No starvation'
        ],
        disadvantages: [
          'Higher average waiting time',
          'Context switch overhead',
          'Time quantum selection is critical'
        ]
      }
    };

    return explanations[algorithm] || explanations['FCFS'];
  };

  if (userMode === 'beginner' && !commentary) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-xl">🎓</span>
          Educational Commentary
        </h3>
        {userMode !== 'beginner' && (
          <SpaceButton
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm bg-gray-700 hover:bg-gray-600"
          >
            {showDetails ? '📚 Hide Details' : '📖 Show Details'}
          </SpaceButton>
        )}
      </div>

      {/* Current Commentary */}
      {commentary && (
        <div className="mb-4 p-4 bg-blue-900 rounded-lg border border-blue-700">
          <div className="text-blue-200">
            {commentary}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-4 space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <span className="text-yellow-400 mt-1">💡</span>
              <span className="text-gray-300">{insight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Algorithm Explanation */}
      {showDetails && userMode !== 'beginner' && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                {getAlgorithmExplanation().title}
              </h4>
              <p className="text-gray-300 text-sm">
                {getAlgorithmExplanation().description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold text-green-400 mb-2">✅ Advantages:</h5>
                <ul className="text-xs space-y-1">
                  {getAlgorithmExplanation().advantages.map((advantage, index) => (
                    <li key={index} className="text-gray-300">
                      • {advantage}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-red-400 mb-2">❌ Disadvantages:</h5>
                <ul className="text-xs space-y-1">
                  {getAlgorithmExplanation().disadvantages.map((disadvantage, index) => (
                    <li key={index} className="text-gray-300">
                      • {disadvantage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Tips */}
      {userMode === 'beginner' && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-300">
            <strong className="text-yellow-400">💡 Tip:</strong> Watch how processes move between queues and observe the order in which they get CPU time.
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalCommentary;

/**
 * Step-by-Step CPU Scheduling Visualization
 * A clean, intuitive visualization that shows one step at a time
 */

import React, { useState, useEffect } from 'react';
import { SpaceCard, GradientText, SpaceButton } from '@/themes/spaceTheme';

const StepByStepVisualization = ({ 
  engine, 
  processes = [], 
  currentStep = 0, 
  onStepChange,
  algorithm = 'FCFS' 
}) => {
  const [currentState, setCurrentState] = useState({
    currentTime: 0,
    runningProcess: null,
    readyQueue: [],
    waitingQueue: [],
    completedProcesses: [],
    ganttChart: []
  });

  const [explanation, setExplanation] = useState('');
  const [nextAction, setNextAction] = useState('');

  // Update state when engine changes
  useEffect(() => {
    if (engine) {
      const state = engine.getState();
      setCurrentState(state);
      generateExplanation(state);
    }
  }, [engine, currentStep]);

  const generateExplanation = (state) => {
    const { currentTime, runningProcess, readyQueue, completedProcesses } = state;
    
    if (completedProcesses.length === processes.length) {
      setExplanation(`✅ All processes completed! Simulation finished at time ${currentTime}.`);
      setNextAction('');
      return;
    }

    if (runningProcess) {
      setExplanation(
        `🔄 Time ${currentTime}: Process ${runningProcess.name} is running on CPU. 
         Remaining time: ${runningProcess.remainingTime}/${runningProcess.originalBurstTime}`
      );
      setNextAction('CPU is executing the current process');
    } else if (readyQueue.length > 0) {
      const nextProcess = readyQueue[0];
      setExplanation(
        `⏳ Time ${currentTime}: CPU is idle. Next process to run: ${nextProcess.name}`
      );
      setNextAction('Schedule the next process from ready queue');
    } else {
      setExplanation(`⏸️ Time ${currentTime}: CPU is idle. No processes ready to run.`);
      setNextAction('Wait for processes to arrive');
    }
  };

  const ProcessBlock = ({ process, isRunning = false, isInQueue = false }) => {
    const getStatusColor = () => {
      if (isRunning) return 'bg-green-500';
      if (isInQueue) return 'bg-yellow-500';
      return 'bg-gray-500';
    };

    const getStatusText = () => {
      if (isRunning) return 'RUNNING';
      if (isInQueue) return 'READY';
      return 'WAITING';
    };

    return (
      <div className={`${getStatusColor()} rounded-lg p-4 text-white shadow-lg transform transition-all duration-500 ${isRunning ? 'scale-110' : ''}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">{process.icon || '⚡'}</div>
          <div className="font-bold text-lg">{process.name}</div>
          <div className="text-sm opacity-90">PID: {process.id}</div>
          <div className="text-xs mt-1">
            <div>Burst: {process.remainingTime}/{process.originalBurstTime}</div>
            <div>Status: {getStatusText()}</div>
          </div>
        </div>
      </div>
    );
  };

  const CPUVisualization = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500">
        <div className="text-center mb-4">
          <GradientText className="text-2xl font-bold">🖥️ CPU Core</GradientText>
          <div className="text-sm text-gray-400 mt-1">
            Time: {currentState.currentTime} | Algorithm: {algorithm}
          </div>
        </div>
        
        <div className="flex justify-center items-center h-32">
          {currentState.runningProcess ? (
            <ProcessBlock process={currentState.runningProcess} isRunning={true} />
          ) : (
            <div className="bg-gray-700 rounded-lg p-4 text-gray-400 text-center">
              <div className="text-4xl mb-2">💤</div>
              <div className="font-bold">CPU IDLE</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const QueueVisualization = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ready Queue */}
        <SpaceCard>
          <h3 className="text-lg font-bold mb-4 text-green-400">
            📋 Ready Queue ({currentState.readyQueue.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentState.readyQueue.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                <div className="text-2xl">📭</div>
                <div>No processes waiting</div>
              </div>
            ) : (
              currentState.readyQueue.map((process, index) => (
                <div key={process.id} className="flex items-center space-x-2">
                  <div className="text-sm text-gray-400 w-8">#{index + 1}</div>
                  <div className="flex-1">
                    <ProcessBlock process={process} isInQueue={true} />
                  </div>
                </div>
              ))
            )}
          </div>
        </SpaceCard>

        {/* Completed Processes */}
        <SpaceCard>
          <h3 className="text-lg font-bold mb-4 text-blue-400">
            ✅ Completed ({currentState.completedProcesses.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentState.completedProcesses.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                <div className="text-2xl">⏳</div>
                <div>No processes completed</div>
              </div>
            ) : (
              currentState.completedProcesses.map((process) => (
                <div key={process.id} className="bg-green-700 rounded-lg p-3 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-lg">{process.icon || '✅'}</div>
                      <div>
                        <div className="font-bold">{process.name}</div>
                        <div className="text-xs text-green-200">
                          Completed at time {process.completionTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-green-200">
                      <div>Turnaround: {process.turnaroundTime}</div>
                      <div>Waiting: {process.waitingTime}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SpaceCard>
      </div>
    );
  };

  const StepExplanation = () => {
    return (
      <SpaceCard>
        <h3 className="text-lg font-bold mb-4 text-yellow-400">
          📝 Current Step Explanation
        </h3>
        <div className="space-y-3">
          <div className="bg-blue-900 rounded-lg p-4">
            <div className="text-blue-200 text-sm font-semibold mb-2">What's happening:</div>
            <div className="text-white">{explanation}</div>
          </div>
          
          {nextAction && (
            <div className="bg-purple-900 rounded-lg p-4">
              <div className="text-purple-200 text-sm font-semibold mb-2">Next action:</div>
              <div className="text-white">{nextAction}</div>
            </div>
          )}
        </div>
      </SpaceCard>
    );
  };

  const SimpleGanttChart = () => {
    const maxTime = Math.max(currentState.currentTime, 20); // Show at least 20 time units
    
    return (
      <SpaceCard>
        <h3 className="text-lg font-bold mb-4 text-purple-400">
          📊 Execution Timeline
        </h3>
        <div className="overflow-x-auto">
          <div className="flex items-center space-x-1 min-w-full">
            {Array.from({ length: maxTime }, (_, i) => {
              const entry = currentState.ganttChart.find(g => g.time === i);
              const process = entry?.process ? 
                processes.find(p => p.id === entry.process) : null;
              
              return (
                <div
                  key={i}
                  className={`w-8 h-8 rounded text-xs flex items-center justify-center font-bold border-2 ${
                    i === currentState.currentTime 
                      ? 'border-yellow-400 ring-2 ring-yellow-400' 
                      : 'border-gray-600'
                  } ${
                    process 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}
                  title={`Time ${i}: ${process ? process.name : 'Idle'}`}
                >
                  {process ? process.name.charAt(process.name.length - 1) : '-'}
                </div>
              );
            })}
          </div>
          <div className="flex items-center space-x-1 mt-1">
            {Array.from({ length: maxTime }, (_, i) => (
              <div key={i} className="w-8 text-xs text-center text-gray-400">
                {i}
              </div>
            ))}
          </div>
        </div>
      </SpaceCard>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main CPU Visualization */}
      <CPUVisualization />
      
      {/* Step Explanation */}
      <StepExplanation />
      
      {/* Process Queues */}
      <QueueVisualization />
      
      {/* Timeline */}
      <SimpleGanttChart />
    </div>
  );
};

export default StepByStepVisualization;

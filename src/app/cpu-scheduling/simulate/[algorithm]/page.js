"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  StarField,
  NebulaBackground,
  SpaceCard,
  GradientText,
  SpaceButton,
  MouseGlow
} from '@/themes/spaceTheme';

// Import the simulation engine
import CPUSchedulingEngine from '@/engines/CPUSchedulingEngine';

// Simple Step-by-Step Visualization Component
const SimpleVisualization = ({ engine, processes, currentTime }) => {
  const [state, setState] = useState({
    runningProcess: null,
    readyQueue: [],
    completedProcesses: [],
    ganttChart: []
  });

  useEffect(() => {
    if (engine) {
      const currentState = engine.getState();
      setState(currentState);
    }
  }, [engine, currentTime]);

  const ProcessCard = ({ process, isRunning = false }) => (
    <div className={`p-4 rounded-lg border-2 ${
      isRunning ? 'bg-green-600 border-green-400' : 'bg-gray-700 border-gray-500'
    }`}>
      <div className="text-center text-white">
        <div className="text-2xl mb-2">{process.icon || '⚡'}</div>
        <div className="font-bold">{process.name}</div>
        <div className="text-sm">
          {isRunning ? 'RUNNING' : 'WAITING'}
        </div>
        <div className="text-xs mt-1">
          Remaining: {process.remainingTime}/{process.originalBurstTime}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* CPU Status */}
      <SpaceCard>
        <h3 className="text-xl font-bold text-white mb-4">🖥️ CPU Status</h3>
        <div className="text-center">
          <div className="text-lg text-gray-400 mb-2">Time: {currentTime}</div>
          <div className="flex justify-center">
            {state.runningProcess ? (
              <ProcessCard process={state.runningProcess} isRunning={true} />
            ) : (
              <div className="p-4 bg-gray-800 rounded-lg border-2 border-gray-600">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">💤</div>
                  <div className="font-bold">CPU IDLE</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SpaceCard>

      {/* Ready Queue */}
      <SpaceCard>
        <h3 className="text-xl font-bold text-white mb-4">📋 Ready Queue</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {state.readyQueue.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">
              <div className="text-2xl mb-2">📭</div>
              <div>No processes waiting</div>
            </div>
          ) : (
            state.readyQueue.map((process) => (
              <ProcessCard key={process.id} process={process} />
            ))
          )}
        </div>
      </SpaceCard>

      {/* Completed Processes */}
      <SpaceCard>
        <h3 className="text-xl font-bold text-white mb-4">✅ Completed Processes</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {state.completedProcesses.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">
              <div className="text-2xl mb-2">⏳</div>
              <div>No processes completed</div>
            </div>
          ) : (
            state.completedProcesses.map((process) => (
              <div key={process.id} className="p-4 bg-green-700 rounded-lg border-2 border-green-500">
                <div className="text-center text-white">
                  <div className="text-2xl mb-2">{process.icon || '✅'}</div>
                  <div className="font-bold">{process.name}</div>
                  <div className="text-sm">COMPLETED</div>
                  <div className="text-xs mt-1">
                    Completed at: {process.completionTime}
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

// Simple Controls Component
const SimpleControls = ({ engine, isRunning, isPaused, onStep }) => (
  <SpaceCard>
    <h3 className="text-xl font-bold text-white mb-4">🎮 Controls</h3>
    <div className="flex flex-wrap gap-3">
      <SpaceButton
        onClick={onStep}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
      >
        ⏭️ Next Step
      </SpaceButton>
      <SpaceButton
        onClick={() => engine && engine.reset()}
        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3"
      >
        🔄 Reset
      </SpaceButton>
    </div>
  </SpaceCard>
);

// Algorithm configuration
const ALGORITHM_CONFIG = {
  fcfs: { name: 'First-Come-First-Served' },
  sjf: { name: 'Shortest Job First' },
  srtf: { name: 'Shortest Remaining Time First' },
  rr: { name: 'Round Robin' },
  priority: { name: 'Priority Scheduling' }
};

export default function SimulationPage() {
  const router = useRouter();
  const params = useParams();
  
  const algorithm = params.algorithm?.toUpperCase() || 'FCFS';
  const algorithmConfig = ALGORITHM_CONFIG[algorithm.toLowerCase()];
  
  const [engine, setEngine] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentEvent, setCurrentEvent] = useState('');

  // Default processes for testing
  const defaultProcesses = [
    { id: 1, name: 'Process A', arrivalTime: 0, burstTime: 7, priority: 2, icon: '🔵' },
    { id: 2, name: 'Process B', arrivalTime: 2, burstTime: 4, priority: 1, icon: '🟢' },
    { id: 3, name: 'Process C', arrivalTime: 4, burstTime: 1, priority: 4, icon: '🟡' },
    { id: 4, name: 'Process D', arrivalTime: 5, burstTime: 3, priority: 3, icon: '🔴' }
  ];

  // Initialize engine
  useEffect(() => {
    try {
      const newEngine = new CPUSchedulingEngine();
      newEngine.initialize(defaultProcesses, algorithm);
      
      // Set up event listeners
      newEngine.on('stateUpdate', (state) => {
        setCurrentTime(state.currentTime);
        setIsRunning(state.isRunning);
        setIsPaused(state.isPaused);
        setProcesses(state.processes);
      });

      newEngine.on('processScheduled', (data) => {
        setCurrentEvent(`Process ${data.process.name} started at time ${data.time}`);
      });

      newEngine.on('processCompleted', (data) => {
        setCurrentEvent(`Process ${data.process.name} completed at time ${data.time}`);
      });

      newEngine.on('simulationComplete', () => {
        setCurrentEvent('Simulation completed!');
      });

      setEngine(newEngine);
      setProcesses(defaultProcesses);
    } catch (error) {
      console.error('Error initializing engine:', error);
    }
  }, [algorithm]);

  const handleStep = useCallback(() => {
    if (engine) {
      engine.step();
    }
  }, [engine]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NebulaBackground />
      <StarField />
      <MouseGlow />
      
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SpaceButton 
                onClick={() => router.push('/cpu-scheduling')}
                className="bg-gray-800 hover:bg-gray-700"
              >
                ← Back
              </SpaceButton>
              <div>
                <GradientText className="text-2xl font-bold">
                  {algorithmConfig?.name || 'CPU Scheduling'} Simulation
                </GradientText>
                <div className="text-sm text-gray-400">
                  Step-by-step visualization
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Current Time:</div>
              <div className="text-xl font-bold text-white">{currentTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Event */}
      {currentEvent && (
        <div className="relative z-10 p-3 bg-blue-900 border-b border-blue-800">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-blue-200">
              ℹ️ {currentEvent}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visualization */}
            <div className="lg:col-span-2">
              <SimpleVisualization
                engine={engine}
                processes={processes}
                currentTime={currentTime}
              />
            </div>

            {/* Controls */}
            <div className="lg:col-span-1">
              <SimpleControls
                engine={engine}
                isRunning={isRunning}
                isPaused={isPaused}
                onStep={handleStep}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
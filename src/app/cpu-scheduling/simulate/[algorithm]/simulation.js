'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

// Import the simulation engine
import CPUSchedulingEngine from '../../../../engines/CPUSchedulingEngine';

// Import simulation components
import {
  TimelineVisualization,
  CPUCoreVisualization,
  QueueVisualization,
  MetricsDashboard,
  GanttChart,
  EducationalCommentary,
  SimulationControls
} from '../../../../components/simulation';

const NewSimulationDashboard = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const algorithm = params.algorithm?.toUpperCase() || 'FCFS';
  const userMode = searchParams.get('mode') || 'beginner';
  const processesParam = searchParams.get('processes');
  const optionsParam = searchParams.get('options');
  
  const [processes, setProcesses] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [simulationState, setSimulationState] = useState({
    runningProcess: null,
    readyQueue: [],
    blockedProcesses: [],
    completedProcesses: [],
    timeline: [],
    ganttChart: [],
    metrics: {}
  });
  const [recentEvent, setRecentEvent] = useState(null);
  const [speed, setSpeed] = useState(1000);
  
  const engineRef = useRef(null);

  useEffect(() => {
    // Parse processes and options from URL params
    if (processesParam) {
      try {
        const parsedProcesses = JSON.parse(decodeURIComponent(processesParam));
        setProcesses(parsedProcesses);
        
        // Initialize simulation engine
        const engine = new CPUSchedulingEngine();
        engineRef.current = engine;
        
        // Parse algorithm options
        let options = {};
        if (optionsParam) {
          try {
            options = JSON.parse(decodeURIComponent(optionsParam));
          } catch (error) {
            console.error('Error parsing options:', error);
          }
        }
        
        // Set up event listeners
        engine.on('initialized', (data) => {
          console.log('Simulation initialized:', data);
        });
        
        engine.on('stateUpdate', (state) => {
          setSimulationState(state);
          setCurrentTime(state.currentTime);
        });
        
        engine.on('started', () => {
          setIsRunning(true);
          setIsPaused(false);
        });
        
        engine.on('paused', () => {
          setIsPaused(true);
        });
        
        engine.on('resumed', () => {
          setIsPaused(false);
        });
        
        engine.on('stopped', () => {
          setIsRunning(false);
          setIsPaused(false);
        });
        
        engine.on('reset', () => {
          setIsRunning(false);
          setIsPaused(false);
          setCurrentTime(0);
          setRecentEvent(null);
        });
        
        engine.on('completed', (data) => {
          setIsRunning(false);
          setIsPaused(false);
          console.log('Simulation completed:', data);
        });
        
        // Event listeners for educational commentary
        engine.on('processArrived', (data) => {
          setRecentEvent({ type: 'processArrived', ...data });
        });
        
        engine.on('processCompleted', (data) => {
          setRecentEvent({ type: 'processCompleted', ...data });
        });
        
        engine.on('processPreempted', (data) => {
          setRecentEvent({ type: 'processPreempted', ...data });
        });
        
        engine.on('timeSliceExpired', (data) => {
          setRecentEvent({ type: 'timeSliceExpired', ...data });
        });
        
        engine.on('speedChanged', (data) => {
          setSpeed(data.speed);
        });
        
        // Initialize the simulation
        engine.initialize(parsedProcesses, algorithm, options);
        
      } catch (error) {
        console.error('Error initializing simulation:', error);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [processesParam, optionsParam, algorithm]);

  const handleBack = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    router.push(`/cpu-scheduling/setup/${algorithm.toLowerCase()}?mode=${userMode}`);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  const algorithmNames = {
    'FCFS': 'First Come First Serve',
    'SJF': 'Shortest Job First',
    'SRTF': 'Shortest Remaining Time First',
    'PRIORITY': 'Priority Scheduling',
    'RR': 'Round Robin'
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Setup</span>
              </button>
              <div>
                <h1 className="text-xl font-bold">{algorithmNames[algorithm]} Simulation</h1>
                <p className="text-sm text-gray-400">
                  Mode: {userMode.charAt(0).toUpperCase() + userMode.slice(1)} | 
                  Processes: {processes.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Time: {currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls and CPU */}
          <div className="space-y-6">
            {/* Simulation Controls */}
            <SimulationControls
              engine={engineRef.current}
              isRunning={isRunning}
              isPaused={isPaused}
              onSpeedChange={handleSpeedChange}
              currentSpeed={speed}
              userMode={userMode}
            />

            {/* CPU Core Visualization */}
            <CPUCoreVisualization
              runningProcess={simulationState.runningProcess}
              currentTime={currentTime}
              userMode={userMode}
            />
          </div>

          {/* Center Column - Timeline and Queues */}
          <div className="space-y-6">
            {/* Timeline Visualization */}
            <TimelineVisualization
              timeline={simulationState.timeline}
              currentTime={currentTime}
              processes={processes}
              userMode={userMode}
            />

            {/* Process Queues */}
            <QueueVisualization
              readyQueue={simulationState.readyQueue}
              blockedProcesses={simulationState.blockedProcesses}
              completedProcesses={simulationState.completedProcesses}
              userMode={userMode}
            />
          </div>

          {/* Right Column - Metrics and Commentary */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <MetricsDashboard
              metrics={simulationState.metrics}
              userMode={userMode}
            />

            {/* Educational Commentary */}
            <EducationalCommentary
              algorithm={algorithm}
              currentState={simulationState}
              recentEvent={recentEvent}
              userMode={userMode}
            />
          </div>
        </div>

        {/* Bottom Section - Gantt Chart */}
        <div className="mt-8">
          <GanttChart
            ganttChart={simulationState.ganttChart}
            processes={processes}
            userMode={userMode}
          />
        </div>
      </div>
    </div>
  );
};

export default NewSimulationDashboard;

"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  StarField,
  NebulaBackground,
  SpaceCard,
  GradientText,
  SpaceButton,
  SpaceTooltip,
  MouseGlow
} from '@/themes/spaceTheme';

const ProcessSetup = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const algorithm = params.algorithm;
  const userMode = searchParams.get('mode');
  
  const [processes, setProcesses] = useState([
    { id: 1, name: 'Process A', arrivalTime: 0, burstTime: 7, priority: 2, color: '#60a5fa' },
    { id: 2, name: 'Process B', arrivalTime: 2, burstTime: 4, priority: 1, color: '#34d399' },
    { id: 3, name: 'Process C', arrivalTime: 4, burstTime: 1, priority: 4, color: '#fbbf24' },
  ]);
  
  const [algorithmParams, setAlgorithmParams] = useState({
    timeQuantum: 4,
    priorityLevels: 5,
    agingFactor: 1,
    feedbackQueues: 3
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  // Algorithm configuration
  const algorithmConfigs = {
    'fcfs': {
      name: 'First-Come, First-Served',
      icon: '📋',
      needsPriority: false,
      needsQuantum: false,
      description: 'Processes execute in arrival order'
    },
    'sjf': {
      name: 'Shortest Job First',
      icon: '⚡',
      needsPriority: false,
      needsQuantum: false,
      description: 'Shortest burst time processes execute first'
    },
    'srtf': {
      name: 'Shortest Remaining Time First',
      icon: '🔄',
      needsPriority: false,
      needsQuantum: false,
      description: 'Preemptive SJF with remaining time consideration'
    },
    'round-robin': {
      name: 'Round Robin',
      icon: '🔁',
      needsPriority: false,
      needsQuantum: true,
      description: 'Each process gets equal time slices'
    },
    'priority': {
      name: 'Priority Scheduling',
      icon: '🎯',
      needsPriority: true,
      needsQuantum: false,
      description: 'Higher priority processes execute first'
    },
    'mlfq': {
      name: 'Multi-Level Feedback Queue',
      icon: '🏗️',
      needsPriority: true,
      needsQuantum: true,
      description: 'Multiple queues with feedback mechanisms'
    },
    'cfs': {
      name: 'Completely Fair Scheduler',
      icon: '⚖️',
      needsPriority: false,
      needsQuantum: false,
      description: 'Fair distribution using virtual runtime'
    },
    'lottery': {
      name: 'Lottery Scheduling',
      icon: '🎲',
      needsPriority: false,
      needsQuantum: false,
      description: 'Probabilistic scheduling with tickets'
    }
  };

  const currentAlgorithm = algorithmConfigs[algorithm] || algorithmConfigs['fcfs'];

  // Process templates for quick setup
  const processTemplates = {
    'cpu-intensive': [
      { name: 'Video Encoder', arrivalTime: 0, burstTime: 12, priority: 2, color: '#ef4444' },
      { name: 'Image Processor', arrivalTime: 1, burstTime: 8, priority: 3, color: '#f97316' },
      { name: 'Compiler', arrivalTime: 3, burstTime: 10, priority: 2, color: '#eab308' }
    ],
    'io-intensive': [
      { name: 'File Scanner', arrivalTime: 0, burstTime: 3, priority: 4, color: '#22c55e' },
      { name: 'Database Query', arrivalTime: 1, burstTime: 2, priority: 1, color: '#06b6d4' },
      { name: 'Network Request', arrivalTime: 2, burstTime: 1, priority: 5, color: '#8b5cf6' }
    ],
    'mixed-workload': [
      { name: 'Web Server', arrivalTime: 0, burstTime: 5, priority: 1, color: '#ec4899' },
      { name: 'Background Sync', arrivalTime: 1, burstTime: 8, priority: 4, color: '#64748b' },
      { name: 'User Interface', arrivalTime: 2, burstTime: 3, priority: 2, color: '#14b8a6' },
      { name: 'System Monitor', arrivalTime: 4, burstTime: 6, priority: 3, color: '#f59e0b' }
    ]
  };

  const addProcess = () => {
    const newId = Math.max(...processes.map(p => p.id)) + 1;
    const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb7185'];
    const newProcess = {
      id: newId,
      name: `Process ${String.fromCharCode(64 + newId)}`,
      arrivalTime: 0,
      burstTime: 5,
      priority: 3,
      color: colors[newId % colors.length]
    };
    setProcesses([...processes, newProcess]);
  };

  const removeProcess = (id) => {
    if (processes.length > 1) {
      setProcesses(processes.filter(p => p.id !== id));
    }
  };

  const updateProcess = (id, field, value) => {
    setProcesses(processes.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const loadTemplate = (templateKey) => {
    const template = processTemplates[templateKey];
    const processesWithIds = template.map((proc, idx) => ({
      ...proc,
      id: idx + 1
    }));
    setProcesses(processesWithIds);
  };

  const generateRandomProcesses = () => {
    const count = 4 + Math.floor(Math.random() * 3); // 4-6 processes
    const names = ['WebBrowser', 'VideoPlayer', 'TextEditor', 'FileManager', 'Calculator', 'MusicPlayer', 'ImageViewer', 'Terminal'];
    const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb7185', '#06b6d4', '#84cc16'];
    
    const newProcesses = Array.from({ length: count }, (_, idx) => ({
      id: idx + 1,
      name: names[idx % names.length],
      arrivalTime: Math.floor(Math.random() * 8),
      burstTime: 1 + Math.floor(Math.random() * 12),
      priority: 1 + Math.floor(Math.random() * 5),
      color: colors[idx % colors.length]
    }));
    
    setProcesses(newProcesses);
  };

  const validateConfiguration = () => {
    const errors = {};
    
    // Validate processes
    processes.forEach(proc => {
      if (proc.burstTime <= 0) {
        errors[`burst-${proc.id}`] = 'Burst time must be positive';
      }
      if (proc.arrivalTime < 0) {
        errors[`arrival-${proc.id}`] = 'Arrival time cannot be negative';
      }
      if (currentAlgorithm.needsPriority && (proc.priority < 1 || proc.priority > algorithmParams.priorityLevels)) {
        errors[`priority-${proc.id}`] = `Priority must be between 1 and ${algorithmParams.priorityLevels}`;
      }
    });
    
    // Validate algorithm parameters
    if (currentAlgorithm.needsQuantum && algorithmParams.timeQuantum <= 0) {
      errors.timeQuantum = 'Time quantum must be positive';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startSimulation = () => {
    if (validateConfiguration()) {
      const config = {
        algorithm,
        userMode,
        processes,
        algorithmParams
      };
      
      // Store configuration in localStorage for the simulation
      localStorage.setItem('simulationConfig', JSON.stringify(config));
      
      // Navigate to simulation
      router.push(`/cpu-scheduling/simulate/${algorithm}?mode=${userMode}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans">
      <StarField starCount={100} speed={0.2} />
      <NebulaBackground opacity={0.2} />
      <MouseGlow color="green-500" />
      
      <div className="relative z-20 p-6 lg:p-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href={`/cpu-scheduling/algorithms?mode=${userMode}`} className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
            ← Back to Algorithm Selection
          </Link>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <GradientText gradient="from-green-400 via-blue-500 to-purple-500">
              Configure Simulation
            </GradientText>
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <span className="text-4xl">{currentAlgorithm.icon}</span>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-white">{currentAlgorithm.name}</h2>
                <p className="text-gray-300">{currentAlgorithm.description}</p>
              </div>
            </div>
            
            {userMode && (
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2">
                <span className="text-blue-400">Mode:</span>
                <span className="font-semibold text-white capitalize">{userMode}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Process Configuration */}
          <div className="xl:col-span-2">
            <SpaceCard className="border-gray-600">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">
                    <GradientText gradient="from-blue-500 to-cyan-500">
                      Process Configuration
                    </GradientText>
                  </h3>
                  
                  <div className="flex space-x-2">
                    <SpaceButton
                      onClick={addProcess}
                      className="px-4 py-2 text-sm bg-green-500/20 border border-green-500/30 hover:bg-green-500/30"
                    >
                      + Add Process
                    </SpaceButton>
                    <SpaceButton
                      onClick={generateRandomProcesses}
                      className="px-4 py-2 text-sm bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30"
                    >
                      🎲 Random
                    </SpaceButton>
                  </div>
                </div>

                {/* Process Templates */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-gray-200">Quick Templates:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(processTemplates).map(([key, template]) => (
                      <SpaceButton
                        key={key}
                        onClick={() => loadTemplate(key)}
                        className="px-4 py-2 text-sm bg-gray-800/50 border border-gray-600 hover:border-blue-400 text-left"
                      >
                        <div className="font-semibold text-white capitalize">{key.replace('-', ' ')}</div>
                        <div className="text-xs text-gray-400">{template.length} processes</div>
                      </SpaceButton>
                    ))}
                  </div>
                </div>

                {/* Process Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3 text-gray-400">Process</th>
                        <th className="text-left p-3 text-gray-400">Arrival Time</th>
                        <th className="text-left p-3 text-gray-400">Burst Time</th>
                        {currentAlgorithm.needsPriority && (
                          <th className="text-left p-3 text-gray-400">Priority</th>
                        )}
                        <th className="text-left p-3 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processes.map((process) => (
                        <tr key={process.id} className="border-b border-gray-800">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: process.color }}
                              />
                              <input
                                type="text"
                                value={process.name}
                                onChange={(e) => updateProcess(process.id, 'name', e.target.value)}
                                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              />
                            </div>
                          </td>
                          
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              value={process.arrivalTime}
                              onChange={(e) => updateProcess(process.id, 'arrivalTime', parseInt(e.target.value) || 0)}
                              className={`bg-gray-800 border rounded px-2 py-1 text-white text-sm w-20 ${
                                validationErrors[`arrival-${process.id}`] ? 'border-red-500' : 'border-gray-600'
                              }`}
                            />
                            {validationErrors[`arrival-${process.id}`] && (
                              <div className="text-red-400 text-xs mt-1">{validationErrors[`arrival-${process.id}`]}</div>
                            )}
                          </td>
                          
                          <td className="p-3">
                            <input
                              type="number"
                              min="1"
                              value={process.burstTime}
                              onChange={(e) => updateProcess(process.id, 'burstTime', parseInt(e.target.value) || 1)}
                              className={`bg-gray-800 border rounded px-2 py-1 text-white text-sm w-20 ${
                                validationErrors[`burst-${process.id}`] ? 'border-red-500' : 'border-gray-600'
                              }`}
                            />
                            {validationErrors[`burst-${process.id}`] && (
                              <div className="text-red-400 text-xs mt-1">{validationErrors[`burst-${process.id}`]}</div>
                            )}
                          </td>
                          
                          {currentAlgorithm.needsPriority && (
                            <td className="p-3">
                              <input
                                type="number"
                                min="1"
                                max={algorithmParams.priorityLevels}
                                value={process.priority}
                                onChange={(e) => updateProcess(process.id, 'priority', parseInt(e.target.value) || 1)}
                                className={`bg-gray-800 border rounded px-2 py-1 text-white text-sm w-20 ${
                                  validationErrors[`priority-${process.id}`] ? 'border-red-500' : 'border-gray-600'
                                }`}
                              />
                              {validationErrors[`priority-${process.id}`] && (
                                <div className="text-red-400 text-xs mt-1">{validationErrors[`priority-${process.id}`]}</div>
                              )}
                            </td>
                          )}
                          
                          <td className="p-3">
                            {processes.length > 1 && (
                              <button
                                onClick={() => removeProcess(process.id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </SpaceCard>
          </div>

          {/* Algorithm Parameters & Preview */}
          <div className="space-y-6">
            {/* Algorithm Parameters */}
            <SpaceCard className="border-gray-600">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  <GradientText gradient="from-purple-500 to-pink-500">
                    Algorithm Parameters
                  </GradientText>
                </h3>

                <div className="space-y-4">
                  {currentAlgorithm.needsQuantum && (
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Time Quantum (ms)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={algorithmParams.timeQuantum}
                        onChange={(e) => setAlgorithmParams({
                          ...algorithmParams,
                          timeQuantum: parseInt(e.target.value) || 1
                        })}
                        className={`w-full bg-gray-800 border rounded px-3 py-2 text-white ${
                          validationErrors.timeQuantum ? 'border-red-500' : 'border-gray-600'
                        }`}
                      />
                      {validationErrors.timeQuantum && (
                        <div className="text-red-400 text-xs mt-1">{validationErrors.timeQuantum}</div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Time slice for each process before preemption
                      </p>
                    </div>
                  )}

                  {currentAlgorithm.needsPriority && (
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Priority Levels
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={algorithmParams.priorityLevels}
                        onChange={(e) => setAlgorithmParams({
                          ...algorithmParams,
                          priorityLevels: parseInt(e.target.value) || 5
                        })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Number of priority levels (1 = highest)
                      </p>
                    </div>
                  )}

                  {algorithm === 'mlfq' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Feedback Queues
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="5"
                        value={algorithmParams.feedbackQueues}
                        onChange={(e) => setAlgorithmParams({
                          ...algorithmParams,
                          feedbackQueues: parseInt(e.target.value) || 3
                        })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Number of feedback queue levels
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </SpaceCard>

            {/* Preview */}
            <SpaceCard className="border-gray-600">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  <GradientText gradient="from-cyan-500 to-blue-500">
                    Preview
                  </GradientText>
                </h3>

                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-400">Processes:</span>
                    <span className="text-white ml-2 font-semibold">{processes.length}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-400">Total Burst Time:</span>
                    <span className="text-white ml-2 font-semibold">
                      {processes.reduce((sum, p) => sum + p.burstTime, 0)}ms
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-400">Avg. Arrival Time:</span>
                    <span className="text-white ml-2 font-semibold">
                      {(processes.reduce((sum, p) => sum + p.arrivalTime, 0) / processes.length).toFixed(1)}ms
                    </span>
                  </div>

                  {currentAlgorithm.needsQuantum && (
                    <div className="text-sm">
                      <span className="text-gray-400">Time Quantum:</span>
                      <span className="text-white ml-2 font-semibold">{algorithmParams.timeQuantum}ms</span>
                    </div>
                  )}
                </div>

                {/* Process Timeline Preview */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">Process Timeline:</h4>
                  <div className="space-y-1">
                    {processes
                      .sort((a, b) => a.arrivalTime - b.arrivalTime)
                      .slice(0, 5)
                      .map((process) => (
                        <div key={process.id} className="flex items-center text-xs">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: process.color }}
                          />
                          <span className="text-gray-300">
                            {process.name} arrives at {process.arrivalTime}ms
                          </span>
                        </div>
                      ))
                    }
                    {processes.length > 5 && (
                      <div className="text-xs text-gray-400">
                        +{processes.length - 5} more processes...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SpaceCard>

            {/* Start Simulation */}
            <div className="text-center">
              <SpaceButton
                onClick={startSimulation}
                className="w-full px-6 py-4 text-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                🚀 Start Simulation
              </SpaceButton>
              
              {Object.keys(validationErrors).length > 0 && (
                <div className="mt-2 text-red-400 text-sm">
                  Please fix validation errors before starting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessSetup;

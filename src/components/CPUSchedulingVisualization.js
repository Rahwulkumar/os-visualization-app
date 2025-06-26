'use client'
import React, { useState, useEffect, useRef } from 'react';
import { 
  StarField, 
  NebulaBackground, 
  SpaceCard,
  GradientText,
  spaceColors,
  MouseGlow
} from '../themes/spaceTheme';

// Process states
const ProcessState = {
  READY: 'READY',
  RUNNING: 'RUNNING',
  WAITING: 'WAITING',
  TERMINATED: 'TERMINATED'
};

// Windows priority levels
const PriorityLevel = {
  IDLE: { min: 0, max: 3, label: 'Idle', color: '#4a5568' },
  NORMAL: { min: 4, max: 7, label: 'Normal', color: '#60a5fa' },
  NORMAL_HIGH: { min: 8, max: 15, label: 'Normal High', color: '#a78bfa' },
  REALTIME: { min: 16, max: 31, label: 'Real-time', color: '#f472b6' }
};

// Available applications
const applications = [
  { id: 'chrome', name: 'Chrome', icon: '🌐', priority: 6, cpuBound: false, quantumMs: 20 },
  { id: 'game', name: 'Game', icon: '🎮', priority: 10, cpuBound: true, quantumMs: 40 },
  { id: 'video', name: 'Video Player', icon: '🎬', priority: 12, cpuBound: false, quantumMs: 30 },
  { id: 'vscode', name: 'VS Code', icon: '💻', priority: 6, cpuBound: false, quantumMs: 20 },
  { id: 'spotify', name: 'Spotify', icon: '🎵', priority: 8, cpuBound: false, quantumMs: 20 },
  { id: 'explorer', name: 'File Explorer', icon: '📁', priority: 5, cpuBound: false, quantumMs: 15 },
];

const CPUSchedulingVisualization = () => {
  const [processes, setProcesses] = useState([]);
  const [cpuCores, setCpuCores] = useState([null, null, null, null]); // 4 cores
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [contextSwitches, setContextSwitches] = useState(0);
  const [currentEvent, setCurrentEvent] = useState('');
  const [executionHistory, setExecutionHistory] = useState([]);
  const animationRef = useRef();
  const lastTimeRef = useRef(0);
  const processIdCounter = useRef(1);

  // Create a new process
  const launchApplication = (app) => {
    const newProcess = {
      id: processIdCounter.current++,
      ...app,
      state: ProcessState.READY,
      cpuTime: 0,
      waitTime: 0,
      remainingQuantum: app.quantumMs,
      createdAt: timeElapsed,
      lastRunTime: 0,
      ioWaitTime: 0,
      contextSwitchCount: 0
    };
    
    setProcesses(prev => [...prev, newProcess]);
    setCurrentEvent(`Launched ${app.name} (PID: ${newProcess.id}, Priority: ${app.priority})`);
  };

  // Windows scheduling algorithm
  const scheduleProcesses = () => {
    if (isPaused) return;

    // Group processes by priority
    const readyProcesses = processes.filter(p => p.state === ProcessState.READY);
    const waitingProcesses = processes.filter(p => p.state === ProcessState.WAITING);
    
    // Handle I/O completion for waiting processes
    waitingProcesses.forEach(process => {
      process.ioWaitTime += simulationSpeed;
      if (process.ioWaitTime >= 50) { // I/O completes after 50ms
        process.state = ProcessState.READY;
        process.ioWaitTime = 0;
        setCurrentEvent(`${process.name} completed I/O operation`);
      }
    });

    // Schedule processes on available cores
    const newCpuCores = [...cpuCores];
    
    for (let coreId = 0; coreId < cpuCores.length; coreId++) {
      const currentProcess = cpuCores[coreId];
      
      // Check if current process should continue or be preempted
      if (currentProcess) {
        // Quantum expiration
        if (currentProcess.remainingQuantum <= 0) {
          currentProcess.state = ProcessState.READY;
          currentProcess.remainingQuantum = currentProcess.quantumMs;
          currentProcess.contextSwitchCount++;
          setContextSwitches(prev => prev + 1);
          setCurrentEvent(`${currentProcess.name} quantum expired on Core ${coreId}`);
          newCpuCores[coreId] = null;
        }
        // I/O request (simulate for non-CPU bound processes)
        else if (!currentProcess.cpuBound && Math.random() < 0.02 * simulationSpeed) {
          currentProcess.state = ProcessState.WAITING;
          currentProcess.ioWaitTime = 0;
          currentProcess.contextSwitchCount++;
          setContextSwitches(prev => prev + 1);
          setCurrentEvent(`${currentProcess.name} waiting for I/O`);
          newCpuCores[coreId] = null;
        }
        // Check for preemption by higher priority
        else {
          const higherPriorityProcess = readyProcesses.find(p => p.priority > currentProcess.priority);
          if (higherPriorityProcess) {
            currentProcess.state = ProcessState.READY;
            currentProcess.contextSwitchCount++;
            setContextSwitches(prev => prev + 1);
            setCurrentEvent(`${currentProcess.name} preempted by ${higherPriorityProcess.name}`);
            newCpuCores[coreId] = null;
          }
        }
      }
      
      // If core is now free, schedule next process
      if (!newCpuCores[coreId] && readyProcesses.length > 0) {
        // Windows priority-based selection
        const sortedReady = readyProcesses.sort((a, b) => b.priority - a.priority);
        const nextProcess = sortedReady[0];
        
        if (nextProcess) {
          nextProcess.state = ProcessState.RUNNING;
          nextProcess.lastRunTime = timeElapsed;
          newCpuCores[coreId] = nextProcess;
          setCurrentEvent(`Scheduled ${nextProcess.name} on Core ${coreId}`);
          
          // Add to execution history
          setExecutionHistory(prev => [...prev, {
            processId: nextProcess.id,
            processName: nextProcess.name,
            coreId,
            startTime: timeElapsed,
            priority: nextProcess.priority
          }]);
        }
      }
    }
    
    setCpuCores(newCpuCores);
  };

  // Update process statistics
  const updateProcessStats = (deltaTime) => {
    setProcesses(prev => prev.map(process => {
      const updated = { ...process };
      
      if (process.state === ProcessState.RUNNING) {
        updated.cpuTime += deltaTime;
        updated.remainingQuantum -= deltaTime;
      } else if (process.state === ProcessState.READY) {
        updated.waitTime += deltaTime;
      }
      
      return updated;
    }));
  };

  // Animation loop
  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min((timestamp - lastTimeRef.current) * simulationSpeed, 100);
      lastTimeRef.current = timestamp;

      if (!isPaused) {
        setTimeElapsed(prev => prev + deltaTime);
        updateProcessStats(deltaTime);
        scheduleProcesses();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused, simulationSpeed, processes, cpuCores]);

  // Calculate CPU utilization
  const cpuUtilization = (cpuCores.filter(core => core !== null).length / cpuCores.length) * 100;

  // Group processes by priority level
  const getProcessesByPriority = () => {
    const grouped = {
      realtime: processes.filter(p => p.priority >= PriorityLevel.REALTIME.min),
      high: processes.filter(p => p.priority >= PriorityLevel.NORMAL_HIGH.min && p.priority < PriorityLevel.REALTIME.min),
      normal: processes.filter(p => p.priority >= PriorityLevel.NORMAL.min && p.priority < PriorityLevel.NORMAL_HIGH.min),
      idle: processes.filter(p => p.priority < PriorityLevel.NORMAL.min)
    };
    return grouped;
  };

  const priorityGroups = getProcessesByPriority();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <StarField starCount={100} speed={0.2} />
      <NebulaBackground />
      
      {/* Header */}
      <div className="relative z-20 p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText gradient={spaceColors.gradient.cosmic}>
              Windows CPU Scheduling Visualization
            </GradientText>
          </h1>
          <p className="text-gray-300">
            Experience how Windows manages multiple processes across CPU cores
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Application Launcher */}
          <SpaceCard className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">
              <GradientText gradient={spaceColors.gradient.stellar}>
                Launch Applications
              </GradientText>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {applications.map(app => (
                <button
                  key={app.id}
                  onClick={() => launchApplication(app)}
                  className="p-4 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-3xl mb-2">{app.icon}</div>
                  <div className="text-sm text-gray-300">{app.name}</div>
                  <div className="text-xs text-gray-500">Priority: {app.priority}</div>
                </button>
              ))}
            </div>
          </SpaceCard>

          {/* CPU Cores Visualization */}
          <SpaceCard className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">
              <GradientText gradient={spaceColors.gradient.nebula}>
                CPU Cores
              </GradientText>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {cpuCores.map((process, coreId) => (
                <div
                  key={coreId}
                  className="relative p-4 rounded-lg bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-white/20"
                >
                  <div className="text-xs text-gray-400 mb-2">Core {coreId}</div>
                  {process ? (
                    <div className="text-center">
                      <div className="text-2xl mb-1">{process.icon}</div>
                      <div className="text-sm font-medium text-white">{process.name}</div>
                      <div className="text-xs text-gray-400">PID: {process.id}</div>
                      <div className="mt-2">
                        <div className="text-xs text-gray-400 mb-1">Quantum</div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${(process.remainingQuantum / process.quantumMs) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="text-2xl mb-1">💤</div>
                      <div className="text-sm">Idle</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* CPU Utilization */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">CPU Utilization</span>
                <span className="text-white font-medium">{cpuUtilization.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${cpuUtilization}%` }}
                />
              </div>
            </div>
          </SpaceCard>

          {/* Priority Queues */}
          <SpaceCard className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">
              <GradientText gradient={spaceColors.gradient.cosmic}>
                Priority Queues
              </GradientText>
            </h2>
            <div className="space-y-4">
              {/* Real-time Priority */}
              <div>
                <div className="text-sm font-medium text-pink-400 mb-2">Real-time (16-31)</div>
                <div className="space-y-1">
                  {priorityGroups.realtime.map(process => (
                    <ProcessQueueItem key={process.id} process={process} />
                  ))}
                  {priorityGroups.realtime.length === 0 && (
                    <div className="text-xs text-gray-500 italic">Empty</div>
                  )}
                </div>
              </div>

              {/* High Priority */}
              <div>
                <div className="text-sm font-medium text-purple-400 mb-2">High (8-15)</div>
                <div className="space-y-1">
                  {priorityGroups.high.map(process => (
                    <ProcessQueueItem key={process.id} process={process} />
                  ))}
                  {priorityGroups.high.length === 0 && (
                    <div className="text-xs text-gray-500 italic">Empty</div>
                  )}
                </div>
              </div>

              {/* Normal Priority */}
              <div>
                <div className="text-sm font-medium text-blue-400 mb-2">Normal (4-7)</div>
                <div className="space-y-1">
                  {priorityGroups.normal.map(process => (
                    <ProcessQueueItem key={process.id} process={process} />
                  ))}
                  {priorityGroups.normal.length === 0 && (
                    <div className="text-xs text-gray-500 italic">Empty</div>
                  )}
                </div>
              </div>

              {/* Idle Priority */}
              <div>
                <div className="text-sm font-medium text-gray-400 mb-2">Idle (0-3)</div>
                <div className="space-y-1">
                  {priorityGroups.idle.map(process => (
                    <ProcessQueueItem key={process.id} process={process} />
                  ))}
                  {priorityGroups.idle.length === 0 && (
                    <div className="text-xs text-gray-500 italic">Empty</div>
                  )}
                </div>
              </div>
            </div>
          </SpaceCard>

          {/* Statistics & Events */}
          <SpaceCard className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">
              <GradientText gradient={spaceColors.gradient.stellar}>
                System Statistics
              </GradientText>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard 
                label="Time Elapsed" 
                value={`${(timeElapsed / 1000).toFixed(1)}s`}
                color="blue"
              />
              <StatCard 
                label="Context Switches" 
                value={contextSwitches}
                color="purple"
              />
              <StatCard 
                label="Processes" 
                value={processes.length}
                color="pink"
              />
              <StatCard 
                label="Avg Wait Time" 
                value={`${processes.length > 0 ? (processes.reduce((sum, p) => sum + p.waitTime, 0) / processes.length / 1000).toFixed(2) : 0}s`}
                color="cyan"
              />
            </div>

            {/* Current Event */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Current Event</h3>
              <div className="p-3 rounded-lg bg-white/5 border border-white/20">
                <p className="text-sm text-white">{currentEvent || 'System idle...'}</p>
              </div>
            </div>

            {/* Process Details */}
            {processes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Process Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-left">
                        <th className="p-2">Process</th>
                        <th className="p-2">State</th>
                        <th className="p-2">CPU Time</th>
                        <th className="p-2">Wait Time</th>
                        <th className="p-2">Switches</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processes.map(process => (
                        <tr key={process.id} className="border-t border-white/10">
                          <td className="p-2">
                            <span className="mr-2">{process.icon}</span>
                            {process.name}
                          </td>
                          <td className="p-2">
                            <ProcessStateBadge state={process.state} />
                          </td>
                          <td className="p-2">{(process.cpuTime / 1000).toFixed(2)}s</td>
                          <td className="p-2">{(process.waitTime / 1000).toFixed(2)}s</td>
                          <td className="p-2">{process.contextSwitchCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SpaceCard>
        </div>

        {/* Control Panel */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex items-center space-x-4 p-4 rounded-full bg-black/80 backdrop-blur-md border border-white/20">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:scale-105 transition-transform duration-300"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Speed:</span>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-white">{simulationSpeed.toFixed(1)}x</span>
            </div>
            
            <button
              onClick={() => {
                setProcesses([]);
                setCpuCores([null, null, null, null]);
                setTimeElapsed(0);
                setContextSwitches(0);
                setExecutionHistory([]);
                setCurrentEvent('');
              }}
              className="px-6 py-2 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const ProcessQueueItem = ({ process }) => {
  const stateColors = {
    [ProcessState.READY]: 'bg-yellow-500/20 border-yellow-500/40',
    [ProcessState.RUNNING]: 'bg-green-500/20 border-green-500/40',
    [ProcessState.WAITING]: 'bg-orange-500/20 border-orange-500/40',
    [ProcessState.TERMINATED]: 'bg-red-500/20 border-red-500/40'
  };

  return (
    <div className={`flex items-center space-x-2 p-2 rounded border ${stateColors[process.state]}`}>
      <span>{process.icon}</span>
      <span className="text-xs text-white flex-1">{process.name}</span>
      <span className="text-xs text-gray-400">P{process.priority}</span>
    </div>
  );
};

const ProcessStateBadge = ({ state }) => {
  const colors = {
    [ProcessState.READY]: 'text-yellow-400',
    [ProcessState.RUNNING]: 'text-green-400',
    [ProcessState.WAITING]: 'text-orange-400',
    [ProcessState.TERMINATED]: 'text-red-400'
  };

  return <span className={`font-medium ${colors[state]}`}>{state}</span>;
};

const StatCard = ({ label, value, color }) => {
  const gradients = {
    blue: 'from-blue-500/20 to-blue-600/20',
    purple: 'from-purple-500/20 to-purple-600/20',
    pink: 'from-pink-500/20 to-pink-600/20',
    cyan: 'from-cyan-500/20 to-cyan-600/20'
  };

  return (
    <div className={`p-3 rounded-lg bg-gradient-to-br ${gradients[color]} border border-white/10`}>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
};

export default CPUSchedulingVisualization;
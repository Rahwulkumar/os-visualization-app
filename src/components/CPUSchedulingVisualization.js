"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StarField,
  NebulaBackground,
  SpaceCard,
  GradientText,
  SpaceButton,
  SpaceTooltip,
  spaceColors,
  MouseGlow,
  PulseRing,
  ConnectionLine
} from '@/themes/spaceTheme';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Process states with visual properties
const ProcessState = {
  NEW: { name: 'NEW', color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.5)', description: 'The process is being created and initialized.' },
  READY: { name: 'READY', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)', description: 'The process is ready to run and waiting for CPU.' },
  RUNNING: { name: 'RUNNING', color: '#34d399', glow: 'rgba(52, 211, 153, 0.5)', description: 'The process is executing on a CPU core.' },
  WAITING: { name: 'WAITING', color: '#fb923c', glow: 'rgba(251, 146, 60, 0.5)', description: 'The process is waiting for I/O or another event.' },
  TERMINATED: { name: 'TERMINATED', color: '#f87171', glow: 'rgba(248, 113, 113, 0.5)', description: 'The process has finished and will be removed.' }
};

// Instruction types with assembly representation
const InstructionType = {
  ARITHMETIC: { color: '#60a5fa', icon: '🧮', asm: 'ADD AX, BX', description: 'Performs calculations (e.g., addition, multiplication).' },
  MEMORY: { color: '#a78bfa', icon: '💾', asm: 'MOV [AX], BX', description: 'Accesses or modifies memory (e.g., load/store data).' },
  IO: { color: '#f472b6', icon: '📡', asm: 'INT 0x80', description: 'Handles input/output operations (e.g., disk, network).' },
  CONTROL: { color: '#fbbf24', icon: '🔀', asm: 'JMP LABEL', description: 'Controls program flow (e.g., jumps, branches).' },
  SYSTEM: { color: '#34d399', icon: '⚙️', asm: 'SYSENTER', description: 'Calls the operating system (e.g., allocate memory, lock resources).' }
};

// Scheduling algorithms with extended properties
const SchedulingAlgorithms = {
  ROUND_ROBIN: { name: 'Round Robin', description: 'Each process gets a fixed time slice (quantum) to run.', color: '#60a5fa' },
  FCFS: { name: 'First-Come-First-Served', description: 'Processes run in the order they arrive.', color: '#a78bfa' },
  SJF: { name: 'Shortest Job First', description: 'The process with the shortest remaining time runs first.', color: '#f472b6' },
  PRIORITY: { name: 'Priority Scheduling', description: 'Higher-priority processes run first.', color: '#fbbf24' },
  DEADLINE: { name: 'Deadline Scheduling', description: 'Processes with the earliest deadlines run first.', color: '#10b981' }
};

// Application templates with thread support
const applicationTemplates = [
  {
    id: 'browser',
    name: 'Web Browser',
    icon: '🌐',
    priority: 8,
    memorySize: 256,
    cpuBound: false,
    deadline: null,
    threads: 2,
    cpuBurst: [30, 15, 45, 20],
    ioBurst: [50, 30, 40],
    instructions: [
      { type: 'SYSTEM', operation: 'ALLOCATE_MEMORY', size: 256 },
      { type: 'IO', operation: 'NETWORK_REQUEST', duration: 50 },
      { type: 'ARITHMETIC', operation: 'PARSE_HTML', cycles: 30 },
      { type: 'MEMORY', operation: 'CACHE_IMAGES', size: 64 },
      { type: 'IO', operation: 'RENDER_PAGE', duration: 30 }
    ]
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: '🧮',
    priority: 10,
    memorySize: 32,
    cpuBound: true,
    deadline: null,
    threads: 1,
    cpuBurst: [10, 5, 15],
    ioBurst: [5, 10],
    instructions: [
      { type: 'MEMORY', operation: 'LOAD_OPERANDS', size: 8 },
      { type: 'ARITHMETIC', operation: 'MULTIPLY', cycles: 10 },
      { type: 'ARITHMETIC', operation: 'ADD', cycles: 5 },
      { type: 'IO', operation: 'DISPLAY_RESULT', duration: 5 }
    ]
  },
  {
    id: 'texteditor',
    name: 'Text Editor',
    icon: '📝',
    priority: 7,
    memorySize: 128,
    cpuBound: false,
    deadline: null,
    threads: 1,
    cpuBurst: [20, 10, 25],
    ioBurst: [40, 20],
    instructions: [
      { type: 'SYSTEM', operation: 'CREATE_BUFFER', size: 128 },
      { type: 'IO', operation: 'READ_FILE', duration: 40 },
      { type: 'MEMORY', operation: 'LOAD_TEXT', size: 64 },
      { type: 'ARITHMETIC', operation: 'SYNTAX_HIGHLIGHT', cycles: 20 }
    ]
  },
  {
    id: 'game',
    name: 'Game Engine',
    icon: '🎮',
    priority: 15,
    memorySize: 512,
    cpuBound: true,
    deadline: null,
    threads: 3,
    cpuBurst: [50, 60, 40],
    ioBurst: [10, 15],
    instructions: [
      { type: 'MEMORY', operation: 'LOAD_ASSETS', size: 256 },
      { type: 'ARITHMETIC', operation: 'PHYSICS_CALC', cycles: 50 },
      { type: 'ARITHMETIC', operation: 'RENDER_FRAME', cycles: 60 },
      { type: 'IO', operation: 'CONTROLLER_INPUT', duration: 10 }
    ]
  }
];

const CPUSchedulingVisualization = () => {
  // Core state
  const [processes, setProcesses] = useState([]);
  const [cpuCores, setCpuCores] = useState([
    { id: 0, isExecuting: false, currentProcess: null, currentInstruction: null, registers: { AX: 0, BX: 0, CX: 0, DX: 0, PC: 0, SP: 4096, FLAGS: 0 }, cache: new Map(), pipeline: [] },
    { id: 1, isExecuting: false, currentProcess: null, currentInstruction: null, registers: { AX: 0, BX: 0, CX: 0, DX: 0, PC: 0, SP: 4096, FLAGS: 0 }, cache: new Map(), pipeline: [] }
  ]);
  const [readyQueue, setReadyQueue] = useState([]);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [newQueue, setNewQueue] = useState([]);
  const [terminatedList, setTerminatedList] = useState([]);
  const [systemClock, setSystemClock] = useState(0);
  const [quantumTimer, setQuantumTimer] = useState(20);
  const [currentQuantum, setCurrentQuantum] = useState([20, 20]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('ROUND_ROBIN');
  const [isRunning, setIsRunning] = useState(false);
  const [executionSpeed, setExecutionSpeed] = useState(1000);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [cpuUtilization, setCpuUtilization] = useState(0);
  const [pageTable, setPageTable] = useState(new Map());
  const [deadlocks, setDeadlocks] = useState([]);
  const [systemCalls, setSystemCalls] = useState([]);
  const [interrupts, setInterrupts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalProcesses: 0,
    avgWaitingTime: 0,
    avgTurnaroundTime: 0,
    throughput: 0,
    contextSwitches: 0,
    cpuIdleTime: 0,
    pageFaults: 0
  });
  const [ganttData, setGanttData] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showMemoryMap, setShowMemoryMap] = useState(false);
  const [showGanttChart, setShowGanttChart] = useState(true);
  const [contextSwitchAnimation, setContextSwitchAnimation] = useState(null);
  const [interruptAnimation, setInterruptAnimation] = useState(null);
  const processRefs = useRef({});
  const cpuRefs = useRef([null, null]);
  const threeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);

  // 3D CPU Visualization
  useEffect(() => {
    const mount = threeRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // CPU core geometry
    const coreGeometry = new THREE.BoxGeometry(2, 2, 2);
    const coreMaterial = new THREE.MeshPhongMaterial({ color: 0x60a5fa, emissive: 0x1e3a8a });
    const cores = cpuCores.map((_, i) => {
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.position.set(i * 3 - 1.5, 0, 0);
      scene.add(core);
      return core;
    });

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(0, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x606060));

    camera.position.z = 6;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const animate3D = () => {
      cpuCores.forEach((core, i) => {
        if (core.isExecuting) {
          cores[i].rotation.y += 0.03;
          cores[i].material.emissive.setHex(0x34d399);
        } else {
          cores[i].material.emissive.setHex(0x1e3a8a);
        }
      });
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate3D);
    };
    animate3D();
    setIsThreeLoaded(true);

    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, [cpuCores]);

  // Calculate non-overlapping positions for processes
  const calculateProcessPosition = (state, index) => {
    const containerWidth = 600; // Fixed width for consistency
    const zoneWidth = containerWidth / 5; // 5 states
    const stateMapping = { NEW: 0, READY: 1, RUNNING: 2, WAITING: 3, TERMINATED: 4 };
    const baseX = zoneWidth * stateMapping[state];
    const ySpacing = 80;
    const maxProcessesPerColumn = 4; // Prevent too many stacked processes
    
    return {
      x: Math.max(20, baseX + (zoneWidth / 2) - 30),
      y: Math.max(20, 60 + (index % maxProcessesPerColumn) * ySpacing)
    };
  };

  // Create a new process
  const createProcess = (template) => {
    const newProcess = {
      pid: Date.now() + Math.random(),
      ...template,
      state: 'NEW',
      arrivalTime: systemClock,
      startTime: null,
      completionTime: null,
      waitingTime: 0,
      turnaroundTime: 0,
      responseTime: null,
      currentBurstIndex: 0,
      currentInstructionIndex: 0,
      remainingBurst: template.cpuBurst[0],
      allocatedMemory: null,
      pageTable: [],
      openFiles: [],
      position: calculateProcessPosition('NEW', newQueue.length),
      targetPosition: calculateProcessPosition('NEW', newQueue.length),
      threads: Array.from({ length: template.threads }, (_, i) => ({
        tid: i,
        state: 'NEW',
        registers: { AX: 0, BX: 0, CX: 0, DX: 0, PC: 0, SP: 4096, FLAGS: 0 }
      })),
      resources: new Set(),
      mutexes: new Map(),
      stateHistory: [{ time: systemClock, state: 'NEW' }]
    };

    // Allocate memory with paging
    const pages = Math.ceil(template.memorySize / 4);
    const pageTableEntries = Array.from({ length: pages }, (_, i) => ({
      virtualPage: i,
      physicalPage: Math.floor(Math.random() * 256),
      valid: true
    }));
    setPageTable(prev => new Map(prev).set(newProcess.pid, pageTableEntries));
    setMemoryUsage(prev => prev + template.memorySize);

    setNewQueue(prev => [...prev, newProcess.pid]);
    setProcesses(prev => [...prev, newProcess]);
    setMetrics(prev => ({ ...prev, totalProcesses: prev.totalProcesses + 1 }));
    setTimeout(() => moveProcessToReady(newProcess.pid), 1000);
  };

  // Move process to ready queue
  const moveProcessToReady = (pid) => {
    setNewQueue(prev => prev.filter(p => p !== pid));
    setProcesses(prev => prev.map(p => 
      p.pid === pid ? { 
        ...p, 
        state: 'READY', 
        targetPosition: calculateProcessPosition('READY', readyQueue.length), 
        threads: p.threads.map(t => ({ ...t, state: 'READY' })),
        stateHistory: [...p.stateHistory, { time: systemClock, state: 'READY' }]
      } : p
    ));
    setReadyQueue(prev => [...prev, pid]);
  };

  // Context switch
  const performContextSwitch = (coreId, fromProcess, toProcess) => {
    setContextSwitchAnimation(coreId);
    setTimeout(() => setContextSwitchAnimation(null), 500);

    if (fromProcess) {
      setProcesses(prev => prev.map(p => 
        p.pid === fromProcess.pid ? {
          ...p,
          savedRegisters: { ...cpuCores[coreId].registers },
          threads: p.threads.map(t => ({ ...t, savedRegisters: { ...cpuCores[coreId].registers } }))
        } : p
      ));
    }

    if (toProcess) {
      setCpuCores(prev => {
        const newCores = [...prev];
        newCores[coreId] = {
          ...newCores[coreId],
          isExecuting: true,
          currentProcess: toProcess.pid,
          registers: toProcess.threads[0].savedRegisters || { AX: 0, BX: 0, CX: 0, DX: 0, PC: 0, SP: 4096, FLAGS: 0 }
        };
        return newCores;
      });
      setProcesses(prev => prev.map(p => 
        p.pid === toProcess.pid ? {
          ...p,
          state: 'RUNNING',
          targetPosition: calculateProcessPosition('RUNNING', coreId),
          threads: p.threads.map(t => ({ ...t, state: 'RUNNING' })),
          stateHistory: [...p.stateHistory, { time: systemClock, state: 'RUNNING' }]
        } : p
      ));
    } else {
      setCpuCores(prev => {
        const newCores = [...prev];
        newCores[coreId] = { ...newCores[coreId], isExecuting: false, currentProcess: null, currentInstruction: null };
        return newCores;
      });
    }

    setMetrics(prev => ({ ...prev, contextSwitches: prev.contextSwitches + 1 }));
  };

  // Execute instruction
  const executeInstruction = (coreId) => {
    const core = cpuCores[coreId];
    if (!core.currentProcess) return;

    const process = processes.find(p => p.pid === core.currentProcess);
    if (!process || process.state !== 'RUNNING') return;

    const activeThread = process.threads[0]; // Execute first thread for simplicity
    const instruction = process.instructions[process.currentInstructionIndex];
    if (!instruction) return;

    // Check for page faults
    if (instruction.type === 'MEMORY' && Math.random() < 0.1) {
      setMetrics(prev => ({ ...prev, pageFaults: prev.pageFaults + 1 }));
      setInterruptAnimation({ coreId, type: 'PAGE_FAULT' });
      setTimeout(() => setInterruptAnimation(null), 300);
    }

    // Update CPU visualization
    setCpuCores(prev => {
      const newCores = [...prev];
      newCores[coreId] = {
        ...newCores[coreId],
        currentInstruction: instruction,
        pipeline: [...newCores[coreId].pipeline.slice(-2), instruction]
      };
      return newCores;
    });

    // Execute based on instruction type
    switch (instruction.type) {
      case 'ARITHMETIC':
        setCpuCores(prev => {
          const newCores = [...prev];
          newCores[coreId].registers = {
            ...newCores[coreId].registers,
            AX: newCores[coreId].registers.AX + Math.floor(Math.random() * 100),
            PC: newCores[coreId].registers.PC + 1
          };
          return newCores;
        });
        break;

      case 'MEMORY':
        setMemoryUsage(prev => Math.min(prev + (instruction.size || 10), 1024));
        break;

      case 'IO':
        moveProcessToWaiting(process.pid, instruction.duration || 20);
        return;

      case 'SYSTEM':
        setSystemCalls(prev => [...prev, { time: systemClock, type: instruction.operation }]);
        setInterruptAnimation({ coreId, type: 'SYSTEM_CALL' });
        setTimeout(() => setInterruptAnimation(null), 300);
        if (instruction.operation.includes('LOCK')) {
          process.resources.add(instruction.operation);
          checkDeadlock(process);
        }
        break;
    }

    // Check for priority inversion
    if (process.priority < 10 && Math.random() < 0.05) {
      setProcesses(prev => prev.map(p => 
        p.pid === process.pid ? { ...p, priority: p.priority + 1 } : p
      ));
    }

    // Update process state
    setProcesses(prev => prev.map(p => 
      p.pid === process.pid ? {
        ...p,
        currentInstructionIndex: (p.currentInstructionIndex + 1) % p.instructions.length,
        remainingBurst: p.remainingBurst - 1,
        threads: p.threads.map((t, i) => i === 0 ? { 
          ...t, 
          registers: { ...cpuCores[coreId].registers } 
        } : t)
      } : p
    ));

    // Check if burst completed
    if (process.remainingBurst <= 1) {
      if (process.currentBurstIndex >= process.cpuBurst.length - 1) {
        terminateProcess(process.pid);
      } else {
        moveProcessToWaiting(process.pid, process.ioBurst[process.currentBurstIndex] || 20);
      }
    }
  };

  // Check for deadlocks (simplified)
  const checkDeadlock = (process) => {
    // Simplified deadlock detection for better performance
    if (process.resources.size > 1) {
      setDeadlocks(prev => [...prev, { time: systemClock, processes: [process.pid] }]);
    }
  };

  // Move process to waiting queue
  const moveProcessToWaiting = (pid, duration) => {
    setProcesses(prev => prev.map(p => 
      p.pid === pid ? { 
        ...p, 
        state: 'WAITING',
        waitingDuration: duration,
        waitingStartTime: systemClock,
        targetPosition: calculateProcessPosition('WAITING', waitingQueue.length),
        threads: p.threads.map(t => ({ ...t, state: 'WAITING' })),
        stateHistory: [...p.stateHistory, { time: systemClock, state: 'WAITING' }]
      } : p
    ));
    setReadyQueue(prev => prev.filter(id => id !== pid));
    setWaitingQueue(prev => [...prev, pid]);
    setCpuCores(prev => prev.map(core => 
      core.currentProcess === pid ? { ...core, isExecuting: false, currentProcess: null, currentInstruction: null } : core
    ));
  };

  // Terminate process
  const terminateProcess = (pid) => {
    const process = processes.find(p => p.pid === pid);
    if (!process) return;

    setProcesses(prev => prev.map(p => 
      p.pid === pid ? { 
        ...p, 
        state: 'TERMINATED',
        completionTime: systemClock,
        turnaroundTime: systemClock - p.arrivalTime,
        targetPosition: calculateProcessPosition('TERMINATED', terminatedList.length),
        threads: p.threads.map(t => ({ ...t, state: 'TERMINATED' })),
        stateHistory: [...p.stateHistory, { time: systemClock, state: 'TERMINATED' }]
      } : p
    ));

    setReadyQueue(prev => prev.filter(id => id !== pid));
    setWaitingQueue(prev => prev.filter(id => id !== pid));
    setTerminatedList(prev => [...prev, pid]);
    setCpuCores(prev => prev.map(core => 
      core.currentProcess === pid ? { ...core, isExecuting: false, currentProcess: null, currentInstruction: null } : core
    ));

    setMemoryUsage(prev => Math.max(0, prev - process.memorySize));
    setPageTable(prev => {
      const newTable = new Map(prev);
      newTable.delete(pid);
      return newTable;
    });
  };

  // Scheduler with multi-core support
  const runScheduler = () => {
    cpuCores.forEach((core, coreId) => {
      if (core.currentProcess) {
        if (selectedAlgorithm === 'ROUND_ROBIN' && currentQuantum[coreId] <= 0) {
          const currentProc = processes.find(p => p.pid === core.currentProcess);
          if (currentProc && currentProc.state === 'RUNNING') {
            setProcesses(prev => prev.map(p => 
              p.pid === currentProc.pid ? { 
                ...p, 
                state: 'READY', 
                threads: p.threads.map(t => ({ ...t, state: 'READY' })),
                stateHistory: [...p.stateHistory, { time: systemClock, state: 'READY' }]
              } : p
            ));
            setReadyQueue(prev => [...prev, currentProc.pid]);
            performContextSwitch(coreId, currentProc, null);
          }
        }
        return;
      }

      let nextPid = null;
      switch (selectedAlgorithm) {
        case 'ROUND_ROBIN':
        case 'FCFS':
          nextPid = readyQueue[0];
          setCurrentQuantum(prev => {
            const newQuantum = [...prev];
            newQuantum[coreId] = quantumTimer;
            return newQuantum;
          });
          break;

        case 'SJF':
          const readyProcesses = processes.filter(p => readyQueue.includes(p.pid));
          const shortest = readyProcesses.reduce((min, p) => 
            p.remainingBurst < (min?.remainingBurst || Infinity) ? p : min, null
          );
          nextPid = shortest?.pid;
          break;

        case 'PRIORITY':
          const priorityProcesses = processes.filter(p => readyQueue.includes(p.pid));
          const highest = priorityProcesses.reduce((max, p) => 
            p.priority > (max?.priority || -1) ? p : max, null
          );
          nextPid = highest?.pid;
          break;

        case 'DEADLINE':
          const deadlineProcesses = processes.filter(p => readyQueue.includes(p.pid) && p.deadline);
          const earliest = deadlineProcesses.reduce((min, p) => 
            p.deadline < (min?.deadline || Infinity) ? p : min, null
          );
          nextPid = earliest?.pid || readyQueue[0];
          break;
      }

      if (nextPid) {
        const process = processes.find(p => p.pid === nextPid);
        setReadyQueue(prev => prev.filter(id => id !== nextPid));
        performContextSwitch(coreId, null, process);

        setGanttData(prev => {
          const last = prev[prev.length - 1];
          if (last && last.pid === process.pid && last.coreId === coreId && last.endTime === systemClock) {
            return [...prev.slice(0, -1), { ...last, endTime: systemClock + 1 }];
          }
          return [...prev, {
            pid: nextPid,
            coreId,
            name: process.name,
            startTime: systemClock,
            endTime: systemClock + 1,
            color: process.icon
          }];
        });
      }
    });
  };

  // Check waiting processes
  const checkWaitingProcesses = () => {
    waitingQueue.forEach(pid => {
      const process = processes.find(p => p.pid === pid);
      if (process && systemClock - process.waitingStartTime >= process.waitingDuration) {
        setWaitingQueue(prev => prev.filter(id => id !== pid));
        setProcesses(prev => prev.map(p => 
          p.pid === pid ? { 
            ...p, 
            state: 'READY',
            currentBurstIndex: p.currentBurstIndex + 1,
            remainingBurst: p.cpuBurst[p.currentBurstIndex + 1] || 10,
            targetPosition: calculateProcessPosition('READY', readyQueue.length),
            threads: p.threads.map(t => ({ ...t, state: 'READY' })),
            stateHistory: [...p.stateHistory, { time: systemClock, state: 'READY' }]
          } : p
        ));
        setReadyQueue(prev => [...prev, pid]);
      }
    });
  };

  // Animation loop
  const animate = useCallback(() => {
    setProcesses(prev => prev.map(process => ({
      ...process,
      position: {
        x: process.position.x + (process.targetPosition.x - process.position.x) * 0.1,
        y: process.position.y + (process.targetPosition.y - process.position.y) * 0.1
      }
    })));
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Main execution loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Increment system clock first
      setSystemClock(prev => prev + 1);

      // Update process states and metrics
      setProcesses(prevProcesses => {
        const updatedProcesses = prevProcesses.map(p => ({
          ...p,
          waitingTime: ['READY', 'WAITING'].includes(p.state) ? p.waitingTime + 1 : p.waitingTime
        }));

        // Calculate metrics
        const activeProcesses = updatedProcesses.filter(p => p.state !== 'TERMINATED');
        const totalWaiting = activeProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
        const avgWaiting = activeProcesses.length > 0 ? totalWaiting / activeProcesses.length : 0;
        
        // Update metrics in next tick to avoid closure issues
        setTimeout(() => {
          setMetrics(prevMetrics => ({
            ...prevMetrics,
            avgWaitingTime: avgWaiting,
            avgTurnaroundTime: terminatedList.length > 0 
              ? updatedProcesses.filter(p => p.state === 'TERMINATED').reduce((sum, p) => sum + p.turnaroundTime, 0) / terminatedList.length 
              : 0,
            throughput: terminatedList.length / (systemClock + 1 || 1),
          }));
        }, 0);

        return updatedProcesses;
      });

      // Update CPU utilization
      setCpuUtilization(prev => {
        const activesCores = cpuCores.filter(c => c.currentProcess).length;
        return (activesCores / cpuCores.length) * 100;
      });

      // Update quantum for Round Robin
      if (selectedAlgorithm === 'ROUND_ROBIN') {
        setCurrentQuantum(prev => prev.map(q => Math.max(0, q - 1)));
      }

    }, executionSpeed);

    return () => clearInterval(interval);
  }, [isRunning, executionSpeed, selectedAlgorithm, systemClock]);

  // Separate effect for scheduler operations to avoid stale closures
  useEffect(() => {
    if (!isRunning) return;

    const schedulerInterval = setInterval(() => {
      // Execute instructions
      cpuCores.forEach((core, coreId) => {
        if (core.currentProcess) {
          executeInstruction(coreId);
        }
      });
      
      // Check waiting processes
      checkWaitingProcesses();
      
      // Run scheduler
      runScheduler();
      
    }, executionSpeed);

    return () => clearInterval(schedulerInterval);
  }, [isRunning, executionSpeed, processes, cpuCores, readyQueue, waitingQueue, selectedAlgorithm, currentQuantum]);

  useEffect(() => {
    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  // Process visualization component
  const ProcessNode = ({ process, index }) => {
    const stateInfo = ProcessState[process.state];
    const ref = useRef(null);
    processRefs.current[process.pid] = ref;

    // Calculate proper position within the state column
    const containerWidth = 600;
    const zoneWidth = containerWidth / 5;
    const stateMapping = { NEW: 0, READY: 1, RUNNING: 2, WAITING: 3, TERMINATED: 4 };
    const stateIndex = stateMapping[process.state];
    const processesInState = processes.filter(p => p.state === process.state);
    const positionInState = processesInState.findIndex(p => p.pid === process.pid);
    const maxPerColumn = 4;
    const column = Math.floor(positionInState / maxPerColumn);
    const row = positionInState % maxPerColumn;
    
    const x = Math.max(10, (stateIndex * zoneWidth) + (column * 65) + 20);
    const y = Math.max(20, 60 + (row * 85));

    const detailedTooltip = `
      🔍 Process Details: ${process.name}
      
      📊 State: ${process.state} - ${stateInfo.description}
      
      🆔 Process ID: ${process.pid}
      ⚡ Priority: ${process.priority} ${process.priority < 10 ? '(Low priority - may experience priority inversion)' : '(High priority - runs first)'}
      
      🧵 Threads: ${process.threads.length} total
      ${process.threads.map(t => `   • Thread ${t.tid}: ${t.state} (PC: ${t.registers.PC})`).join('\n')}
      
      💾 Memory: ${process.memorySize} MB allocated
      ${process.allocatedMemory ? `   • Physical Pages: ${process.pageTable.length}` : '   • Not yet allocated'}
      
      ⏱️ CPU Burst: ${process.remainingBurst}ms remaining of ${process.cpuBurst[process.currentBurstIndex]}ms
      📋 Instructions: ${process.currentInstructionIndex + 1}/${process.instructions.length}
      
      🔄 Current Instruction: ${process.instructions[process.currentInstructionIndex]?.type || 'None'}
      ${process.instructions[process.currentInstructionIndex] ? `   • ${InstructionType[process.instructions[process.currentInstructionIndex].type].description}` : ''}
      
      ⏲️ Timing:
      ${process.arrivalTime ? `   • Arrived: ${process.arrivalTime}ms` : ''}
      ${process.waitingTime ? `   • Waiting: ${process.waitingTime}ms` : ''}
      ${process.responseTime ? `   • Response: ${process.responseTime}ms` : ''}
      
      ${process.state === 'RUNNING' ? `🏃 Currently executing on CPU Core ${cpuCores.findIndex(c => c.currentProcess === process.pid)}` : ''}
      ${process.state === 'WAITING' ? `⏳ Waiting for I/O operation to complete (${process.waitingDuration || 0}ms remaining)` : ''}
      ${process.state === 'READY' ? `🎯 Ready to run - position ${readyQueue.findIndex(pid => pid === process.pid) + 1} in queue` : ''}
      
      💡 Click for detailed view
    `;

    return (
      <SpaceTooltip content={detailedTooltip}>
        <div
          ref={ref}
          className="absolute transition-all duration-500 ease-out z-10 hover:scale-105"
          style={{
            transform: `translate(${x}px, ${y}px)`,
            filter: `drop-shadow(0 0 8px ${stateInfo.glow})`
          }}
        >
          <div 
            className={`relative group cursor-pointer p-2 rounded-lg transition-all duration-300 ${
              process.state === 'RUNNING' 
                ? 'animate-pulse bg-green-500/30 border-2 border-green-400' 
                : 'bg-gray-800/80 border-2 border-gray-600 hover:border-blue-400'
            }`}
            onClick={() => setSelectedProcess(process)}
          >
            <div className="text-xl mb-1 select-none">{process.icon}</div>
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-center pointer-events-none">
              <div className="font-medium text-gray-200 bg-black/80 px-2 py-1 rounded mb-1">{process.name}</div>
              <div 
                className="text-xs px-2 py-1 rounded-full text-black font-medium" 
                style={{ backgroundColor: stateInfo.color }}
              >
                {process.state}
              </div>
            </div>
            {process.state === 'RUNNING' && <PulseRing color="green-500" />}
            {process.threads.length > 1 && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {process.threads.length}
              </div>
            )}
            {process.priority > 10 && (
              <div className="absolute -top-2 -left-2 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                !
              </div>
            )}
          </div>
        </div>
      </SpaceTooltip>
    );
  };

  // CPU Core visualization
  const CPUCoreVisualization = ({ core, coreId }) => {
    const currentProc = processes.find(p => p.pid === core.currentProcess);
    const ref = useRef(null);
    cpuRefs.current[coreId] = ref;

    const detailedTooltip = `
      🖥️ CPU Core ${coreId} Details
      
      📊 Status: ${core.isExecuting ? 'Executing' : 'Idle'}
      ${core.isExecuting ? '⚡ Currently processing instructions' : '💤 Waiting for work'}
      
      ${currentProc ? `
      🔄 Current Process: ${currentProc.name}
      🆔 PID: ${currentProc.pid}
      ⚡ Priority: ${currentProc.priority}
      
      📋 Current Instruction: ${core.currentInstruction ? InstructionType[core.currentInstruction.type].asm : 'None'}
      ${core.currentInstruction ? `💡 ${InstructionType[core.currentInstruction.type].description}` : ''}
      
      🔢 Registers:
      • AX (Accumulator): ${core.registers.AX}
      • BX (Base): ${core.registers.BX}
      • CX (Counter): ${core.registers.CX}
      • DX (Data): ${core.registers.DX}
      • PC (Program Counter): ${core.registers.PC}
      • SP (Stack Pointer): ${core.registers.SP}
      • FLAGS: ${core.registers.FLAGS.toString(2).padStart(8, '0')}
      
      🏃 Pipeline: ${core.pipeline.length} instructions queued
      ${core.pipeline.map((inst, i) => `   ${i + 1}. ${InstructionType[inst.type].asm}`).join('\n')}
      
      💾 Cache: ${core.cache.size} entries cached
      ` : ''}
      
      📈 Performance:
      • Context Switches: ${metrics.contextSwitches}
      • Utilization: ${cpuUtilization.toFixed(1)}%
      
      💡 This core uses ${selectedAlgorithm.toLowerCase().replace('_', ' ')} scheduling
    `;

    return (
      <SpaceTooltip content={detailedTooltip}>
        <SpaceCard className="relative h-80 bg-gradient-to-br from-blue-900/70 to-purple-900/70 border border-blue-500/50 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <h3 className="text-lg font-bold mb-3 sticky top-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90 p-2 -m-2">
              <GradientText gradient="from-blue-500 to-purple-500">
                CPU Core {coreId}
              </GradientText>
            </h3>
            
            <div className={`mb-4 p-3 rounded-lg transition-all duration-300 ${
              core.currentProcess 
                ? 'bg-green-500/30 border border-green-500/50 shadow-lg shadow-green-500/20' 
                : 'bg-gray-700/30 border border-gray-500/50'
            }`}>
              <div className="text-sm font-medium mb-2 text-gray-200">
                {core.currentProcess ? `🔄 Running: ${currentProc?.name}` : '💤 Idle'}
              </div>
              {core.currentInstruction && (
                <div className="text-xs text-gray-200 flex items-center space-x-2 bg-black/30 p-2 rounded mb-2">
                  <span className="text-lg">{InstructionType[core.currentInstruction.type].icon}</span>
                  <div className="flex-1">
                    <div className="font-mono text-blue-400">{InstructionType[core.currentInstruction.type].asm}</div>
                    <div className="text-gray-400 text-xs">{InstructionType[core.currentInstruction.type].description}</div>
                  </div>
                </div>
              )}
              {contextSwitchAnimation === coreId && (
                <div className="absolute inset-0 bg-yellow-500/20 animate-pulse rounded-lg flex items-center justify-center">
                  <div className="text-yellow-400 font-bold">⚡ Context Switch</div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-2">🔢 Registers</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(core.registers).map(([reg, val]) => (
                    <div key={reg} className="text-xs bg-gray-800/50 px-2 py-1 rounded flex justify-between">
                      <span className="text-blue-400 font-mono">{reg}:</span>
                      <span className="text-green-400 font-mono">{reg === 'FLAGS' ? val.toString(2).padStart(8, '0') : val}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {core.pipeline.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-200 mb-2">🏃 Pipeline</h4>
                  <div className="space-y-1">
                    {core.pipeline.slice(0, 3).map((inst, i) => (
                      <div key={i} className="text-xs bg-blue-500/20 px-2 py-1 rounded flex items-center space-x-2">
                        <span className="text-blue-400">{i + 1}.</span>
                        <span className="font-mono">{InstructionType[inst.type].asm}</span>
                      </div>
                    ))}
                    {core.pipeline.length > 3 && (
                      <div className="text-xs text-gray-400 px-2">...{core.pipeline.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-2">💾 Cache</h4>
                <div className="text-xs text-gray-400">
                  {core.cache.size > 0 ? `${core.cache.size} entries` : 'Empty'}
                </div>
              </div>
            </div>
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // Memory visualization with paging
  const MemoryVisualization = () => {
    const maxMemory = 1024;
    const memoryPercentage = (memoryUsage / maxMemory) * 100;

    const detailedTooltip = `
      💾 Memory Management System
      
      📊 Memory Usage:
      • Total Available: ${maxMemory} MB
      • Currently Used: ${memoryUsage} MB (${memoryPercentage.toFixed(1)}%)
      • Free Memory: ${maxMemory - memoryUsage} MB
      
      🗺️ Virtual Memory:
      • Page Table Entries: ${Array.from(pageTable.entries()).length}
      • Page Size: 4 KB (standard)
      • Page Faults: ${metrics.pageFaults}
      
      🔄 Memory Allocation:
      • Paging enabled for virtual memory
      • Process isolation through separate address spaces
      • Memory protection and access control
      
      📈 Performance:
      • Memory fragmentation handled by paging
      • Swap space available for overcommit
      • Page replacement algorithms active
      
      💡 Virtual memory allows processes to use more memory than physically available
    `;

    return (
      <SpaceTooltip content={detailedTooltip}>
        <SpaceCard className="h-80 bg-gradient-to-br from-purple-900/70 to-blue-900/70 border border-purple-500/50 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 sticky top-0 bg-gradient-to-r from-purple-900/90 to-blue-900/90 p-2 -m-2">
              <GradientText gradient="from-purple-500 to-blue-500">
                💾 Memory Usage
              </GradientText>
            </h3>
            
            <div className="mb-4">
              <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden mb-3 border border-gray-600">
                <div 
                  className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-full ${
                    memoryPercentage > 80 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                      : memoryPercentage > 60 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}
                  style={{ width: `${memoryPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                  {memoryPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="text-sm text-gray-200 text-center">
                {memoryUsage} MB / {maxMemory} MB
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-200 flex items-center">
                📊 Process Memory Allocation
              </h4>
              {processes.filter(p => p.state !== 'TERMINATED').length === 0 ? (
                <div className="text-xs text-gray-400 italic p-3 bg-white/5 rounded-lg text-center">
                  No active processes
                </div>
              ) : (
                processes.filter(p => p.state !== 'TERMINATED').map(process => (
                  <div key={process.pid} className="bg-white/10 p-3 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{process.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{process.name}</div>
                        <div className="text-xs text-gray-300">PID: {process.pid}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-300 font-mono">{process.memorySize}MB</span>
                        <div className="text-xs text-gray-400">{process.pageTable?.length || 0} pages</div>
                      </div>
                    </div>
                    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(process.memorySize / maxMemory) * 100}%`,
                          backgroundColor: ProcessState[process.state].color
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {showMemoryMap && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <h4 className="text-sm font-medium mb-3 text-gray-200 flex items-center">
                  🗺️ Page Table Mapping
                </h4>
                {Array.from(pageTable.entries()).length === 0 ? (
                  <div className="text-xs text-gray-400 italic p-2 bg-white/5 rounded">
                    No page mappings
                  </div>
                ) : (
                  Array.from(pageTable.entries()).map(([pid, pages]) => {
                    const process = processes.find(p => p.pid === pid);
                    return (
                      <div key={pid} className="mb-3 bg-white/5 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-200 mb-2 flex items-center space-x-2">
                          <span>{process?.icon}</span>
                          <span>{process?.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {pages.slice(0, 6).map(page => (
                            <div key={page.virtualPage} className="text-xs p-2 bg-white/10 rounded border border-white/20">
                              <div className="font-mono">VP {page.virtualPage} → PP {page.physicalPage}</div>
                            </div>
                          ))}
                          {pages.length > 6 && (
                            <div className="text-xs p-2 bg-white/5 rounded border border-white/10 text-center text-gray-400">
                              +{pages.length - 6} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{metrics.pageFaults}</div>
                  <div className="text-xs text-gray-400">Page Faults</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{maxMemory - memoryUsage}</div>
                  <div className="text-xs text-gray-400">Free MB</div>
                </div>
              </div>
            </div>
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // Queue visualization
  const QueueVisualization = ({ title, queue, queueType }) => {
    const queueProcesses = processes.filter(p => queue.includes(p.pid));
    const queueDescriptions = {
      ready: 'Processes ready to run, waiting for a CPU core to be assigned. These processes have all required resources and are waiting for the scheduler to give them CPU time.',
      waiting: 'Processes waiting for I/O operations (like disk reads, network requests) or other events (like locks, semaphores, or user input) to complete.',
      new: 'Newly created processes being initialized before moving to the ready queue. The OS is setting up memory, file descriptors, and other resources.'
    };

    const queueIcons = {
      ready: '⏳',
      waiting: '⏸️',
      new: '🆕'
    };

    const detailedTooltip = `
      ${queueIcons[queueType]} ${title} Queue
      
      📊 Current State:
      • Queue Length: ${queueProcesses.length} processes
      • Type: ${queueType.toUpperCase()}
      
      📝 Description:
      ${queueDescriptions[queueType]}
      
      🔄 Process Management:
      ${queueType === 'ready' ? `
      • Scheduling Algorithm: ${SchedulingAlgorithms[selectedAlgorithm].name}
      • Next to run: ${queueProcesses.length > 0 ? queueProcesses[0].name : 'None'}
      • Queue ordering: ${selectedAlgorithm === 'PRIORITY' ? 'By priority (highest first)' : 
                         selectedAlgorithm === 'SJF' ? 'By remaining time (shortest first)' : 
                         'First-come, first-served'}
      ` : ''}
      
      ${queueType === 'waiting' ? `
      • Waiting for: I/O operations, locks, or events
      • Will return to ready queue when unblocked
      • May involve disk, network, or user interaction
      ` : ''}
      
      ${queueType === 'new' ? `
      • Initialization phase before execution
      • Memory allocation and setup in progress
      • Will move to ready queue when initialized
      ` : ''}
      
      💡 ${queueType === 'ready' ? 'Ready processes compete for CPU time' : 
            queueType === 'waiting' ? 'Waiting processes do not consume CPU' : 
            'New processes are being prepared for execution'}
    `;

    return (
      <SpaceTooltip content={detailedTooltip}>
        <SpaceCard className="h-48 bg-gradient-to-br from-gray-900/70 to-blue-900/70 border border-blue-500/50 overflow-hidden">
          <div className="h-full flex flex-col">
            <h4 className="text-sm font-medium mb-3 text-gray-200 flex items-center space-x-2 border-b border-blue-500/30 pb-2">
              <span>{queueIcons[queueType]}</span>
              <span>{title}</span>
              <span className="text-xs bg-blue-500/20 px-2 py-1 rounded-full">{queueProcesses.length}</span>
            </h4>
            
            <div className="flex-1 overflow-hidden">
              {queueProcesses.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-2xl mb-2">📭</div>
                    <div className="text-xs italic">Queue is empty</div>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <div className="space-y-2 p-2">
                    {queueProcesses.map((process, index) => (
                      <div 
                        key={process.pid} 
                        className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedProcess(process)}
                      >
                        <div className="text-xs bg-blue-500/20 px-2 py-1 rounded-full font-mono min-w-[24px] text-center">
                          {index + 1}
                        </div>
                        <span className="text-lg">{process.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{process.name}</div>
                          <div className="text-xs text-gray-300">
                            PID: {process.pid} | P: {process.priority}
                            {queueType === 'waiting' && process.waitingDuration && (
                              <span> | Wait: {Math.max(0, process.waitingDuration - (systemClock - (process.waitingStartTime || 0)))}ms</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="text-gray-300">{process.remainingBurst}ms</div>
                          <div className="text-gray-400">{process.threads.length}T</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // Gantt Chart
  const GanttChart = () => {
    const chartWidth = Math.max(800, systemClock * 2);
    const chartHeight = 150;
    const scale = Math.max(2, chartWidth / Math.max(systemClock, 100));

    const detailedTooltip = `
      📊 CPU Scheduling Timeline (Gantt Chart)
      
      📈 Visualization Details:
      • Shows CPU core activity over time
      • Each colored bar represents a process running on a core
      • X-axis: Time in milliseconds (0 to ${systemClock}ms)
      • Y-axis: CPU Cores (${cpuCores.length} cores total)
      
      🎯 Interactive Features:
      • Click on any process bar to view details
      • Red line shows current system time
      • Grid lines mark 10ms intervals
      
      📊 Current Statistics:
      • Total Execution Time: ${systemClock}ms
      • Processes Executed: ${ganttData.length} entries
      • CPU Utilization: ${cpuUtilization.toFixed(1)}%
      
      💡 The timeline helps visualize scheduling efficiency and process distribution
    `;

    return (
      <SpaceTooltip content={detailedTooltip}>
        <SpaceCard className="bg-gradient-to-br from-blue-900/70 to-purple-900/70 border border-blue-500/50">
          <h3 className="text-lg font-bold mb-4">
            <GradientText gradient="from-blue-500 to-purple-500">
              📊 CPU Scheduling Timeline
            </GradientText>
          </h3>
          
          <div className="relative border border-gray-700 rounded-lg overflow-x-auto bg-gray-900/50 p-4">
            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Process Execution</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-600 rounded"></div>
                <span>CPU Idle</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-4 bg-red-500"></div>
                <span>Current Time</span>
              </div>
              <div className="text-xs text-gray-400 ml-auto">
                Timeline: 0 - {systemClock}ms | Scale: {scale.toFixed(1)}px/ms
              </div>
            </div>
            
            <div className="relative">
              <svg width={chartWidth} height={chartHeight} className="border border-gray-700 rounded bg-gray-800/50">
                {/* Time grid lines */}
                {Array.from({ length: Math.floor(systemClock / 10) + 1 }, (_, i) => (
                  <g key={i}>
                    <line
                      x1={i * 10 * scale}
                      y1={0}
                      x2={i * 10 * scale}
                      y2={chartHeight}
                      stroke="rgba(255,255,255,0.1)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={i * 10 * scale}
                      y={chartHeight - 5}
                      fill="rgba(255,255,255,0.6)"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {i * 10}
                    </text>
                  </g>
                ))}
                
                {/* CPU Core labels and idle background */}
                {cpuCores.map((core, coreId) => (
                  <g key={coreId}>
                    <rect
                      x={0}
                      y={15 + coreId * 50}
                      width={chartWidth}
                      height={35}
                      fill="rgba(107, 114, 128, 0.2)"
                      rx={3}
                    />
                    <text
                      x={5}
                      y={35 + coreId * 50}
                      fill="rgba(255,255,255,0.8)"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      Core {coreId}
                    </text>
                    <line
                      x1={0}
                      y1={50 + coreId * 50}
                      x2={chartWidth}
                      y2={50 + coreId * 50}
                      stroke="rgba(255,255,255,0.2)"
                    />
                  </g>
                ))}
                
                {/* Process execution bars */}
                {ganttData.map((entry, idx) => {
                  const process = processes.find(p => p.pid === entry.pid);
                  if (!process) return null;

                  const barWidth = Math.max(2, (entry.endTime - entry.startTime) * scale);
                  const barHeight = 35;
                  const yPosition = 15 + entry.coreId * 50;

                  return (
                    <g key={idx}>
                      <rect
                        x={entry.startTime * scale}
                        y={yPosition}
                        width={barWidth}
                        height={barHeight}
                        fill={ProcessState.RUNNING.color}
                        opacity={0.9}
                        rx={3}
                        className="hover:opacity-100 cursor-pointer transition-opacity"
                        onClick={() => setSelectedProcess(process)}
                      >
                        <title>
                          {`${process.name} (PID: ${process.pid})
Time: ${entry.startTime}ms - ${entry.endTime}ms
Duration: ${entry.endTime - entry.startTime}ms
Core: ${entry.coreId}`}
                        </title>
                      </rect>
                      {barWidth > 30 && (
                        <text
                          x={entry.startTime * scale + barWidth / 2}
                          y={yPosition + barHeight / 2 + 4}
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none"
                        >
                          {process.icon} {entry.name}
                        </text>
                      )}
                    </g>
                  );
                })}
                
                {/* Current time indicator */}
                <line
                  x1={systemClock * scale}
                  y1={0}
                  x2={systemClock * scale}
                  y2={chartHeight}
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity={0.8}
                />
                <text
                  x={systemClock * scale + 5}
                  y={15}
                  fill="#ef4444"
                  fontSize="12"
                  fontWeight="bold"
                >
                  Now
                </text>
              </svg>
            </div>
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // Legend Component
  const Legend = () => {
    return (
      <SpaceTooltip content="Explains the colors and icons used for process states and instructions.">
        <SpaceCard className="h-80 bg-gradient-to-br from-gray-900/70 to-blue-900/70 border border-blue-500/50 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 sticky top-0 bg-gradient-to-r from-gray-900/90 to-blue-900/90 p-2 -m-2">
              <GradientText gradient="from-blue-500 to-purple-500">
                🗂️ Legend
              </GradientText>
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
                  🔄 Process States
                </h4>
                <div className="space-y-2">
                  {Object.entries(ProcessState).map(([state, { name, color, description }]) => (
                    <SpaceTooltip key={state} content={description}>
                      <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <div 
                          className="w-4 h-4 rounded-full shadow-lg" 
                          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }} 
                        />
                        <span className="text-xs text-gray-200 font-medium flex-1">{name}</span>
                      </div>
                    </SpaceTooltip>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <h4 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
                  ⚡ Instruction Types
                </h4>
                <div className="space-y-2">
                  {Object.entries(InstructionType).map(([type, { icon, asm, color, description }]) => (
                    <SpaceTooltip key={type} content={description || `Instruction: ${asm}`}>
                      <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <div 
                          className="w-4 h-4 rounded-full shadow-lg" 
                          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }} 
                        />
                        <span className="text-lg">{icon}</span>
                        <span className="text-xs text-gray-200 font-medium flex-1">{type}</span>
                      </div>
                    </SpaceTooltip>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <h4 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
                  🖥️ CPU Status
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/40 animate-pulse" />
                    <span className="text-xs text-gray-200 font-medium">Core Active</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-gray-500 shadow-lg shadow-gray-500/40" />
                    <span className="text-xs text-gray-200 font-medium">Core Idle</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/40 animate-pulse" />
                    <span className="text-xs text-gray-200 font-medium">Context Switch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // Performance Metrics
  const PerformanceMetrics = () => {
    const activeProcesses = processes.filter(p => p.state !== 'TERMINATED').length;
    const runningProcesses = processes.filter(p => p.state === 'RUNNING').length;
    const waitingProcesses = processes.filter(p => p.state === 'WAITING').length;
    const readyProcesses = processes.filter(p => p.state === 'READY').length;

    const detailedTooltip = `
      📈 System Performance Metrics
      
      🖥️ CPU Performance:
      • Utilization: ${cpuUtilization.toFixed(1)}% (${cpuUtilization > 80 ? 'High' : cpuUtilization > 50 ? 'Moderate' : 'Low'})
      • Active Cores: ${runningProcesses}/${cpuCores.length}
      • Context Switches: ${metrics.contextSwitches} (${systemClock > 0 ? (metrics.contextSwitches / systemClock * 1000).toFixed(1) : 0}/sec)
      
      ⏱️ Process Timing:
      • Average Waiting Time: ${metrics.avgWaitingTime.toFixed(1)}ms
      • Average Turnaround Time: ${metrics.avgTurnaroundTime.toFixed(1)}ms
      • System Throughput: ${(metrics.throughput * 1000).toFixed(2)} processes/sec
      
      💾 Memory Performance:
      • Page Faults: ${metrics.pageFaults} (${systemClock > 0 ? (metrics.pageFaults / systemClock * 1000).toFixed(2) : 0}/sec)
      • Memory Utilization: ${((memoryUsage / 1024) * 100).toFixed(1)}%
      
      🔍 System Health:
      • Deadlocks: ${deadlocks.length} ${deadlocks.length > 0 ? '⚠️' : '✅'}
      • CPU Idle Time: ${metrics.cpuIdleTime}ms (${systemClock > 0 ? ((metrics.cpuIdleTime / systemClock) * 100).toFixed(1) : 0}%)
      
      📊 Process Distribution:
      • Active: ${activeProcesses} | Running: ${runningProcesses} | Ready: ${readyProcesses} | Waiting: ${waitingProcesses}
    `;

    return (
      <SpaceTooltip content={detailedTooltip}>
        <SpaceCard className="h-80 bg-gradient-to-br from-gray-900/70 to-blue-900/70 border border-blue-500/50 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 sticky top-0 bg-gradient-to-r from-gray-900/90 to-blue-900/90 p-2 -m-2">
              <GradientText gradient="from-blue-500 to-purple-500">
                📈 Performance Metrics
              </GradientText>
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Primary Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border transition-all duration-300 ${
                  cpuUtilization > 80 
                    ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30' 
                    : 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30'
                }`}>
                  <div className={`text-xs mb-1 font-medium ${cpuUtilization > 80 ? 'text-red-400' : 'text-green-400'}`}>
                    CPU Utilization
                  </div>
                  <div className={`text-2xl font-bold ${cpuUtilization > 80 ? 'text-red-300' : 'text-green-300'}`}>
                    {cpuUtilization.toFixed(1)}%
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        cpuUtilization > 80 
                          ? 'bg-gradient-to-r from-red-500 to-red-400' 
                          : 'bg-gradient-to-r from-green-500 to-green-400'
                      }`}
                      style={{ width: `${cpuUtilization}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {runningProcesses}/{cpuCores.length} cores active
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-3 rounded-lg border border-yellow-500/30">
                  <div className="text-xs text-yellow-400 mb-1 font-medium">Context Switches</div>
                  <div className="text-2xl font-bold text-yellow-300">{metrics.contextSwitches}</div>
                  <div className="text-xs text-yellow-400 mt-1">
                    Rate: {systemClock > 0 ? (metrics.contextSwitches / systemClock * 1000).toFixed(1) : 0}/sec
                  </div>
                </div>
              </div>
              
              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-3 rounded-lg border border-blue-500/30">
                  <div className="text-xs text-blue-400 mb-1 font-medium">Avg. Waiting Time</div>
                  <div className="text-lg font-bold text-blue-300">{metrics.avgWaitingTime.toFixed(1)}ms</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {metrics.avgWaitingTime < 50 ? 'Excellent' : metrics.avgWaitingTime < 100 ? 'Good' : 'Needs optimization'}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                  <div className="text-xs text-purple-400 mb-1 font-medium">Avg. Turnaround</div>
                  <div className="text-lg font-bold text-purple-300">{metrics.avgTurnaroundTime.toFixed(1)}ms</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Response efficiency
                  </div>
                </div>
              </div>
              
              {/* System Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border transition-all duration-300 ${
                  metrics.pageFaults > 10 
                    ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30' 
                    : 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30'
                }`}>
                  <div className={`text-xs mb-1 font-medium ${metrics.pageFaults > 10 ? 'text-red-400' : 'text-green-400'}`}>
                    Page Faults
                  </div>
                  <div className={`text-lg font-bold ${metrics.pageFaults > 10 ? 'text-red-300' : 'text-green-300'}`}>
                    {metrics.pageFaults}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {systemClock > 0 ? (metrics.pageFaults / systemClock * 1000).toFixed(2) : 0}/sec
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border transition-all duration-300 ${
                  deadlocks.length > 0 
                    ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 animate-pulse' 
                    : 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30'
                }`}>
                  <div className={`text-xs mb-1 font-medium ${deadlocks.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    Deadlocks
                  </div>
                  <div className={`text-lg font-bold ${deadlocks.length > 0 ? 'text-red-300' : 'text-green-300'}`}>
                    {deadlocks.length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {deadlocks.length > 0 ? '⚠️ System blocked!' : '✅ System healthy'}
                  </div>
                </div>
              </div>
              
              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 p-3 rounded-lg border border-cyan-500/30">
                  <div className="text-xs text-cyan-400 mb-1 font-medium">Throughput</div>
                  <div className="text-lg font-bold text-cyan-300">
                    {(metrics.throughput * 1000).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">processes/sec</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 p-3 rounded-lg border border-gray-500/30">
                  <div className="text-xs text-gray-400 mb-1 font-medium">CPU Idle Time</div>
                  <div className="text-lg font-bold text-gray-300">{metrics.cpuIdleTime}ms</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {systemClock > 0 ? ((metrics.cpuIdleTime / systemClock) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              
              {/* System Info */}
              <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 p-3 rounded-lg border border-indigo-500/30">
                <div className="text-xs text-indigo-400 mb-2 font-medium">System Status</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-300">
                    <span className="text-indigo-400">Clock:</span> {systemClock}ms
                  </div>
                  <div className="text-gray-300">
                    <span className="text-indigo-400">Processes:</span> {processes.length}
                  </div>
                  <div className="text-gray-300">
                    <span className="text-indigo-400">Active:</span> {activeProcesses}
                  </div>
                  <div className="text-gray-300">
                    <span className="text-indigo-400">Running:</span> {runningProcesses}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Algorithm: {SchedulingAlgorithms[selectedAlgorithm].name}
                </div>
              </div>
            </div>
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // System Call Trace
  const SystemCallTrace = () => {
    return (
      <SpaceTooltip content="Logs system calls (e.g., memory allocation, resource locks) made by processes.">
        <SpaceCard className="h-48 bg-gradient-to-br from-gray-900/70 to-blue-900/70 border border-blue-500/50 overflow-hidden">
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold mb-3 flex items-center space-x-2 border-b border-blue-500/30 pb-2">
              <span>📞</span>
              <GradientText gradient="from-blue-500 to-purple-500">
                System Call Trace
              </GradientText>
            </h3>
            
            <div className="flex-1 overflow-y-auto">
              {systemCalls.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-gray-400">
                  <div>
                    <div className="text-2xl mb-2">📋</div>
                    <div className="text-xs italic">No system calls yet</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {systemCalls.slice(-10).reverse().map((call, idx) => (
                    <div key={idx} className="text-xs p-2 bg-white/10 rounded border border-white/20 hover:bg-white/20 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-blue-400">{call.time}ms:</span>
                        <span className="text-gray-200 font-medium">{call.type}</span>
                      </div>
                    </div>
                  ))}
                  {systemCalls.length > 10 && (
                    <div className="text-xs text-gray-400 text-center italic pt-2 border-t border-white/20">
                      +{systemCalls.length - 10} more calls
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // Interrupt Timeline
  const InterruptTimeline = () => {
    return (
      <SpaceTooltip content="Shows interrupts like timer events, page faults, or system calls.">
        <SpaceCard className="h-40 bg-gradient-to-br from-gray-900/70 to-blue-900/70 border border-blue-500/50 overflow-y-auto">
          <h3 className="text-lg font-bold mb-3">
            <GradientText gradient="from-blue-500 to-purple-500">
              Interrupt Timeline
            </GradientText>
          </h3>
          <div className="space-y-1">
            {interrupts.map((interrupt, idx) => (
              <div key={idx} className="text-xs p-2 bg-white/10 rounded">
                {interrupt.time}ms: {interrupt.type}
              </div>
            ))}
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // Process State Timeline
  const ProcessStateTimeline = () => {
    return (
      <SpaceTooltip content="Shows the history of state changes for each process over time.">
        <SpaceCard className="h-40 bg-gradient-to-br from-gray-900/70 to-blue-900/70 border border-blue-500/50 overflow-y-auto">
          <h3 className="text-lg font-bold mb-3">
            <GradientText gradient="from-blue-500 to-purple-500">
              Process State Timeline
            </GradientText>
          </h3>
          <div className="space-y-2">
            {processes.map(process => (
              <div key={process.pid} className="flex items-center space-x-2">
                <span className="text-lg">{process.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-200">{process.name}</div>
                  <div className="flex space-x-1">
                    {process.stateHistory.map((entry, idx) => (
                      <div
                        key={idx}
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: ProcessState[entry.state].color }}
                        title={`${entry.time}ms: ${entry.state}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // Control Panel with additional controls
  const ControlPanel = () => {
    return (
      <SpaceTooltip content="Controls the simulation: start/stop, reset, adjust speed, or trigger interrupts.">
        <SpaceCard className="bg-gradient-to-br from-blue-900/70 to-purple-900/70 border border-blue-500/50">
          <h3 className="text-lg font-bold mb-3">
            <GradientText gradient="from-blue-500 to-purple-500">
              Simulation Controls
            </GradientText>
          </h3>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <SpaceButton onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? '⏸ Pause' : '▶ Play'}
              </SpaceButton>
              <SpaceButton onClick={() => {
                setProcesses([]);
                setReadyQueue([]);
                setWaitingQueue([]);
                setNewQueue([]);
                setTerminatedList([]);
                setSystemClock(0);
                setGanttData([]);
                setCpuCores(prev => prev.map(c => ({ ...c, currentProcess: null, isExecuting: false, currentInstruction: null })));
                setPageTable(new Map());
                setSystemCalls([]);
                setInterrupts([]);
                setDeadlocks([]);
                setMetrics({
                  totalProcesses: 0,
                  avgWaitingTime: 0,
                  avgTurnaroundTime: 0,
                  throughput: 0,
                  contextSwitches: 0,
                  cpuIdleTime: 0,
                  pageFaults: 0
                });
              }}>
                🔄 Reset
              </SpaceButton>
              <SpaceButton onClick={() => setInterrupts(prev => [...prev, { time: systemClock, type: 'MANUAL' }])}>
                ⚡ Interrupt
              </SpaceButton>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Execution Speed</label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={executionSpeed}
                onChange={(e) => setExecutionSpeed(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="text-xs text-gray-400 mt-1">{executionSpeed}ms per cycle</div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Scheduling Algorithm</label>
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-gray-200 rounded-lg"
              >
                {Object.entries(SchedulingAlgorithms).map(([key, algo]) => (
                  <option key={key} value={key}>{algo.name}</option>
                ))}
              </select>
            </div>
            {selectedAlgorithm === 'ROUND_ROBIN' && (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Time Quantum</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={quantumTimer}
                  onChange={(e) => setQuantumTimer(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="text-xs text-gray-400 mt-1">{quantumTimer}ms</div>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Show Visualizations</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showMemoryMap}
                    onChange={() => setShowMemoryMap(!showMemoryMap)}
                    className="accent-blue-500"
                  />
                  <span className="text-xs text-gray-400">Memory Map</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showGanttChart}
                    onChange={() => setShowGanttChart(!showGanttChart)}
                    className="accent-blue-500"
                  />
                  <span className="text-xs text-gray-400">Gantt Chart</span>
                </label>
              </div>
            </div>
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  // Process details modal
  const ProcessDetailsModal = () => {
    if (!selectedProcess) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedProcess(null)}
      >
        <div 
          className="bg-gray-900 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              <span className="text-2xl mr-2">{selectedProcess.icon}</span>
              {selectedProcess.name}
            </h3>
            <button
              onClick={() => setSelectedProcess(null)}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-2">Process Information</h4>
              <div className="space-y-1 text-sm text-gray-200">
                <div>PID: {selectedProcess.pid}</div>
                <div>State: <span style={{ color: ProcessState[selectedProcess.state].color }}>
                  {selectedProcess.state}
                </span></div>
                <div>Priority: {selectedProcess.priority}</div>
                <div>Memory: {selectedProcess.memorySize} MB</div>
                <div>Threads: {selectedProcess.threads.length}</div>
                <div>Type: {selectedProcess.cpuBound ? 'CPU-Bound' : 'I/O-Bound'}</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-2">Timing Information</h4>
              <div className="space-y-1 text-sm text-gray-200">
                <div>Arrival Time: {selectedProcess.arrivalTime}ms</div>
                <div>Waiting Time: {selectedProcess.waitingTime}ms</div>
                <div>Response Time: {selectedProcess.responseTime ?? 'N/A'}ms</div>
                <div>Turnaround Time: {selectedProcess.turnaroundTime || 'N/A'}ms</div>
                <div>Deadline: {selectedProcess.deadline || 'N/A'}</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-200 mb-2">Instructions</h4>
            <div className="space-y-1">
              {selectedProcess.instructions.map((inst, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center space-x-2 text-sm p-2 rounded ${
                    idx === selectedProcess.currentInstructionIndex 
                      ? 'bg-blue-500/20 border border-blue-500/40' 
                      : 'bg-white/10'
                  }`}
                >
                  <span>{InstructionType[inst.type].icon}</span>
                  <span>{InstructionType[inst.type].asm}</span>
                  {inst.cycles && <span className="text-gray-400">({inst.cycles} cycles)</span>}
                  {inst.duration && <span className="text-gray-400">({inst.duration}ms I/O)</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-200 mb-2">Resources</h4>
            <div className="space-y-1 text-sm text-gray-200">
              {Array.from(selectedProcess.resources).map((res, idx) => (
                <div key={idx}>{res}</div>
              ))}
              {selectedProcess.resources.size === 0 && <div className="text-gray-400">No resources held</div>}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-200 mb-2">Threads</h4>
            <div className="space-y-1">
              {selectedProcess.threads.map((thread, idx) => (
                <div key={idx} className="text-sm p-2 bg-white/10 rounded">
                  Thread {thread.tid}: {thread.state} (Registers: AX={thread.registers.AX}, PC={thread.registers.PC})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Resource Monitor
  const ResourceMonitor = () => {
    return (
      <SpaceTooltip content="Monitors CPU and memory usage with heatmaps.">
        <SpaceCard className="h-40 bg-gradient-to-br from-gray-900/70 to-blue-900/70 border border-blue-500/50">
          <h3 className="text-lg font-bold mb-3">
            <GradientText gradient="from-blue-500 to-purple-500">
              Resource Monitor
            </GradientText>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">CPU Heatmap</span>
              <div className="flex-1 h-3 bg-gray-800 rounded">
                <div 
                  className="h-full rounded transition-all"
                  style={{ 
                    width: `${cpuUtilization}%`,
                    background: `linear-gradient(to right, #3b82f6, ${cpuUtilization > 80 ? '#ef4444' : '#eab308'})`
                  }}
                />
              </div>
              <span className="text-xs text-gray-200">{cpuUtilization.toFixed(1)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Memory Heatmap</span>
              <div className="flex-1 h-3 bg-gray-800 rounded">
                <div 
                  className="h-full rounded transition-all"
                  style={{ 
                    width: `${(memoryUsage / 1024) * 100}%`,
                    background: `linear-gradient(to right, #8b5cf6, ${(memoryUsage / 1024) > 0.8 ? '#ef4444' : '#3b82f6'})`
                  }}
                />
              </div>
              <span className="text-xs text-gray-200">{(memoryUsage / 1024 * 100).toFixed(1)}%</span>
            </div>
          </div>
        </SpaceCard>
      </SpaceTooltip>
    );
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans">
      <StarField starCount={300} speed={0.3} />
      <NebulaBackground opacity={0.2} />
      <MouseGlow color="blue-500" />
      
      <div className="relative z-20 p-4 lg:p-8 max-w-[1600px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <GradientText gradient="from-blue-500 to-purple-500">
              CPU Scheduling Visualization
            </GradientText>
          </h1>
          <p className="text-gray-300 text-lg">Explore operating system scheduling with this interactive simulator</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            <SpaceCard className="bg-gradient-to-br from-blue-900/70 to-purple-900/70 border border-blue-500/50 p-4">
              <h3 className="text-lg font-bold mb-4">
                <GradientText gradient="from-blue-500 to-purple-500">
                  🚀 Launch Applications
                </GradientText>
              </h3>
              <div className="space-y-2">
                {applicationTemplates.map(app => (
                  <SpaceTooltip key={app.id} content={`
                    ${app.name}
                    - Priority: ${app.priority} (Higher runs first in Priority Scheduling)
                    - Memory: ${app.memorySize} MB
                    - Threads: ${app.threads}
                    - Type: ${app.cpuBound ? 'CPU-Bound (needs more CPU time)' : 'I/O-Bound (needs more I/O time)'}
                    - Instructions: ${app.instructions.length} operations
                    - CPU Bursts: ${app.cpuBurst.join(', ')}ms
                    - I/O Bursts: ${app.ioBurst.join(', ')}ms
                  `}>
                    <SpaceButton
                      onClick={() => createProcess(app)}
                      disabled={isRunning && processes.length >= 8}
                      className="w-full flex items-center justify-start text-sm py-2 px-3 text-left hover:bg-blue-500/20 transition-colors"
                    >
                      <span className="text-lg mr-2">{app.icon}</span>
                      <span className="flex-1 text-left">{app.name}</span>
                      <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">P:{app.priority}</span>
                    </SpaceButton>
                  </SpaceTooltip>
                ))}
              </div>
            </SpaceCard>
            <ControlPanel />
            <div className="grid grid-cols-1 gap-4">
              <SystemCallTrace />
              <InterruptTimeline />
            </div>
          </div>
          
          {/* Main Visualization Area */}
          <div className="lg:col-span-6 space-y-4 lg:space-y-6">
            <SpaceCard className="relative h-[400px] lg:h-[500px] bg-gray-900/80 rounded-xl border border-blue-500/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-12 grid grid-cols-5 border-b border-blue-500/20 bg-gray-900/90 z-10">
                {['NEW', 'READY', 'RUNNING', 'WAITING', 'TERMINATED'].map((state, idx) => (
                  <div key={state} className="border-r border-blue-500/20 last:border-r-0 flex items-center justify-center p-2">
                    <SpaceTooltip content={ProcessState[state].description}>
                      <div className="text-sm text-gray-200 font-medium text-center">{state}</div>
                    </SpaceTooltip>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 pt-12 overflow-hidden">
                {processes.map((process, index) => (
                  <React.Fragment key={process.pid}>
                    <ProcessNode process={process} index={index} />
                    {process.state === 'RUNNING' && cpuCores.find(c => c.currentProcess === process.pid) && (
                      <ConnectionLine 
                        from={processRefs.current[process.pid]?.current}
                        to={cpuRefs.current[cpuCores.findIndex(c => c.currentProcess === process.pid)]?.current}
                        color="blue-500"
                        animated
                      />
                    )}
                  </React.Fragment>
                ))}
                {interruptAnimation && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    <div className="text-yellow-400 text-xl font-bold animate-ping bg-black/70 px-4 py-2 rounded">
                      ⚡ {interruptAnimation.type} ⚡
                    </div>
                  </div>
                )}
              </div>
            </SpaceCard>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QueueVisualization title="New Queue" queue={newQueue} queueType="new" />
              <QueueVisualization title="Ready Queue" queue={readyQueue} queueType="ready" />
              <QueueVisualization title="Waiting Queue" queue={waitingQueue} queueType="waiting" />
            </div>
            
            {showGanttChart && <GanttChart />}
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            <SpaceCard className="h-48 lg:h-60 rounded-xl border border-blue-500/50 overflow-hidden bg-gradient-to-br from-gray-900/70 to-blue-900/70">
              <h3 className="text-sm font-bold mb-2 p-3 border-b border-blue-500/30">
                <GradientText gradient="from-blue-500 to-purple-500">
                  🎛️ 3D CPU Visualization
                </GradientText>
              </h3>
              {isThreeLoaded ? (
                <div ref={threeRef} className="w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <div className="text-sm">Loading 3D Visualization...</div>
                  </div>
                </div>
              )}
            </SpaceCard>
            
            <div className="grid grid-cols-1 gap-4">
              {cpuCores.map((core, i) => (
                <CPUCoreVisualization key={i} core={core} coreId={i} />
              ))}
            </div>
            
            <MemoryVisualization />
            <PerformanceMetrics />
            <Legend />
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <SpaceTooltip content={SchedulingAlgorithms[selectedAlgorithm].description}>
            <div className="inline-flex items-center space-x-3 text-sm text-gray-200 bg-gray-900/70 px-6 py-3 rounded-lg border border-blue-500/30">
              <span className="text-lg">💡</span>
              <span>{SchedulingAlgorithms[selectedAlgorithm].description}</span>
            </div>
          </SpaceTooltip>
        </div>
      </div>
      
      <ProcessDetailsModal />
    </div>
  );
};

export default CPUSchedulingVisualization;
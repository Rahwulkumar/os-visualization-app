"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StarField, 
  NebulaBackground, 
  SpaceCard,
  GradientText,
  SpaceButton,
  SpaceTooltip,
  MouseGlow,
  PulseRing,
  ConnectionLine
} from '@/themes/spaceTheme';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Define spaceColors array
const spaceColors = [
  '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', 
  '#fb923c', '#f87171', '#9ca3af', '#10b981', '#ef4444'
];

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
  const [isPaused, setIsPaused] = useState(false);
  const [executionSpeed, setExecutionSpeed] = useState(1000);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [cpuUtilization, setCpuUtilization] = useState(0);
  const [pageTable, setPageTable] = useState(new Map());
  const [deadlocks, setDeadlocks] = useState([]);
  const [systemCalls, setSystemCalls] = useState([]);
  const [interrupts, setInterrupts] = useState([]);
  const [contextSwitches, setContextSwitches] = useState(0);
  const [currentEvent, setCurrentEvent] = useState('');
  const [executionHistory, setExecutionHistory] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
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
  const animationRef = useRef(null);
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
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [cpuCores]);

  // Calculate non-overlapping positions for processes
  const calculateProcessPosition = (state, index) => {
    const containerWidth = 600;
    const zoneWidth = containerWidth / 5;
    const stateMapping = { NEW: 0, READY: 1, RUNNING: 2, WAITING: 3, TERMINATED: 4 };
    const baseX = zoneWidth * stateMapping[state];
    const ySpacing = 80;
    const maxProcessesPerColumn = 4;
    
    return {
      x: Math.max(20, baseX + (zoneWidth / 2) - 30),
      y: Math.max(20, 60 + (index % maxProcessesPerColumn) * ySpacing)
    };
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

  // Create a new process
  const createProcess = (template) => {
    const newProcess = {
      pid: Date.now() + Math.random(),
      ...template,
      state: ProcessState.NEW.name,
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
      position: calculateProcessPosition(ProcessState.NEW.name, newQueue.length),
      targetPosition: calculateProcessPosition(ProcessState.NEW.name, newQueue.length),
      threads: Array.from({ length: template.threads }, (_, i) => ({
        tid: i,
        state: ProcessState.NEW.name,
        registers: { AX: 0, BX: 0, CX: 0, DX: 0, PC: 0, SP: 4096, FLAGS: 0 }
      })),
      resources: new Set(),
      mutexes: new Map(),
      stateHistory: [{ time: systemClock, state: ProcessState.NEW.name }]
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
        state: ProcessState.READY.name, 
        targetPosition: calculateProcessPosition(ProcessState.READY.name, readyQueue.length), 
        threads: p.threads.map(t => ({ ...t, state: ProcessState.READY.name })),
        stateHistory: [...p.stateHistory, { time: systemClock, state: ProcessState.READY.name }]
      } : p
    ));
    setReadyQueue(prev => [...prev, pid]);
  };

  // Check for deadlocks (simplified)
  const checkDeadlock = (process) => {
    if (process.resources.size > 1) {
      setDeadlocks(prev => [...prev, { time: systemClock, processes: [process.pid] }]);
    }
  };

  // Move process to waiting queue
  const moveProcessToWaiting = (pid, duration) => {
    setProcesses(prev => prev.map(p => 
      p.pid === pid ? { 
        ...p, 
        state: ProcessState.WAITING.name,
        waitingDuration: duration,
        waitingStartTime: systemClock,
        targetPosition: calculateProcessPosition(ProcessState.WAITING.name, waitingQueue.length),
        threads: p.threads.map(t => ({ ...t, state: ProcessState.WAITING.name })),
        stateHistory: [...p.stateHistory, { time: systemClock, state: ProcessState.WAITING.name }]
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
        state: ProcessState.TERMINATED.name,
        completionTime: systemClock,
        turnaroundTime: systemClock - p.arrivalTime,
        targetPosition: calculateProcessPosition(ProcessState.TERMINATED.name, terminatedList.length),
        threads: p.threads.map(t => ({ ...t, state: ProcessState.TERMINATED.name })),
        stateHistory: [...p.stateHistory, { time: systemClock, state: ProcessState.TERMINATED.name }]
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

  // Execute instruction - FIXED COMPLETE FUNCTION
  const executeInstruction = (coreId) => {
    const core = cpuCores[coreId];
    if (!core.currentProcess) return;

    const process = processes.find(p => p.pid === core.currentProcess);
    if (!process || process.state !== ProcessState.RUNNING.name) return;

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
        if (instruction.operation && instruction.operation.includes('LOCK')) {
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
        remainingBurst: Math.max(0, p.remainingBurst - 1),
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

  // Context switch - FIXED
  const performContextSwitch = useCallback((coreId, fromProcess, toProcess) => {
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
          state: ProcessState.RUNNING.name,
          targetPosition: calculateProcessPosition(ProcessState.RUNNING.name, coreId),
          threads: p.threads.map(t => ({ ...t, state: ProcessState.RUNNING.name })),
          stateHistory: [...p.stateHistory, { time: systemClock, state: ProcessState.RUNNING.name }]
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
  }, [cpuCores, systemClock]);

  // Scheduler with multi-core support - FIXED DEPENDENCIES
  const runScheduler = useCallback(() => {
    cpuCores.forEach((core, coreId) => {
      if (core.currentProcess) {
        if (selectedAlgorithm === 'ROUND_ROBIN' && currentQuantum[coreId] <= 0) {
          const currentProc = processes.find(p => p.pid === core.currentProcess);
          if (currentProc && currentProc.state === ProcessState.RUNNING.name) {
            setProcesses(prev => prev.map(p => 
              p.pid === currentProc.pid ? { 
                ...p, 
                state: ProcessState.READY.name, 
                threads: p.threads.map(t => ({ ...t, state: ProcessState.READY.name })),
                stateHistory: [...p.stateHistory, { time: systemClock, state: ProcessState.READY.name }]
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
  }, [cpuCores, processes, readyQueue, selectedAlgorithm, currentQuantum, quantumTimer, systemClock, performContextSwitch]);

  // Check waiting processes
  const checkWaitingProcesses = useCallback(() => {
    waitingQueue.forEach(pid => {
      const process = processes.find(p => p.pid === pid);
      if (process && systemClock - (process.waitingStartTime || 0) >= (process.waitingDuration || 0)) {
        setWaitingQueue(prev => prev.filter(id => id !== pid));
        setProcesses(prev => prev.map(p => 
          p.pid === pid ? { 
            ...p, 
            state: ProcessState.READY.name,
            currentBurstIndex: p.currentBurstIndex + 1,
            remainingBurst: p.cpuBurst[p.currentBurstIndex + 1] || 10,
            targetPosition: calculateProcessPosition(ProcessState.READY.name, readyQueue.length),
            threads: p.threads.map(t => ({ ...t, state: ProcessState.READY.name })),
            stateHistory: [...p.stateHistory, { time: systemClock, state: ProcessState.READY.name }]
          } : p
        ));
        setReadyQueue(prev => [...prev, pid]);
      }
    });
  }, [waitingQueue, processes, systemClock, readyQueue]);

  // Main execution loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSystemClock(prev => prev + 1);
      setTimeElapsed(prev => prev + 1);

      setProcesses(prevProcesses => {
        const updatedProcesses = prevProcesses.map(p => ({
          ...p,
          waitingTime: [ProcessState.READY.name, ProcessState.WAITING.name].includes(p.state) ? p.waitingTime + 1 : p.waitingTime
        }));

        const activeProcesses = updatedProcesses.filter(p => p.state !== ProcessState.TERMINATED.name);
        const totalWaiting = activeProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
        const avgWaiting = activeProcesses.length > 0 ? totalWaiting / activeProcesses.length : 0;
        
        setTimeout(() => {
          setMetrics(prevMetrics => ({
            ...prevMetrics,
            avgWaitingTime: avgWaiting,
            avgTurnaroundTime: terminatedList.length > 0 
              ? updatedProcesses.filter(p => p.state === ProcessState.TERMINATED.name).reduce((sum, p) => sum + p.turnaroundTime, 0) / terminatedList.length 
              : 0,
            throughput: terminatedList.length / (systemClock + 1 || 1),
          }));
        }, 0);

        return updatedProcesses;
      });

      setCpuUtilization(() => {
        const activeCores = cpuCores.filter(c => c.currentProcess).length;
        return (activeCores / cpuCores.length) * 100;
      });

      if (selectedAlgorithm === 'ROUND_ROBIN') {
        setCurrentQuantum(prev => prev.map(q => Math.max(0, q - 1)));
      }

    }, executionSpeed);

    return () => clearInterval(interval);
  }, [isRunning, executionSpeed, selectedAlgorithm, cpuCores, terminatedList]);

  // Separate effect for scheduler operations
  useEffect(() => {
    if (!isRunning) return;

    const schedulerInterval = setInterval(() => {
      cpuCores.forEach((core, coreId) => {
        if (core.currentProcess) {
          executeInstruction(coreId);
        }
      });
      
      checkWaitingProcesses();
      runScheduler();
      
    }, executionSpeed);

    return () => clearInterval(schedulerInterval);
  }, [isRunning, executionSpeed, cpuCores, checkWaitingProcesses, runScheduler]);

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

    const detailedTooltip = `Process Details: ${process.name} - State: ${process.state} - Priority: ${process.priority} - Memory: ${process.memorySize} MB`;

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

  // Memory visualization component - FIXED
  const MemoryVisualization = () => {
    const memorySize = 256; // 256 MB
    const pageSize = 4; // 4 MB per page
    const totalPages = memorySize / pageSize;

    return (
      <SpaceCard className="rounded-xl border border-blue-500/50 bg-gradient-to-br from-gray-900/70 to-blue-900/70 p-4">
        <h3 className="text-lg font-bold mb-3">
          <GradientText gradient="from-blue-500 to-purple-500">
            💾 Memory Visualization
          </GradientText>
        </h3>
        <div className="grid grid-cols-8 gap-2 text-xs font-mono">
          <div className="col-span-8 text-center text-gray-300 mb-2">
            <div className="font-medium">Physical Memory ({memoryUsage} MB used)</div>
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(memoryUsage / 1024) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="col-span-8 text-center text-gray-300">
            <div className="font-medium">Page Table Entries: {pageTable.size}</div>
            <div className="text-xs text-gray-400 mt-1">
              {Array.from(pageTable.entries()).map(([pid, pages]) => {
                const process = processes.find(p => p.pid === pid);
                return process ? `${process.name}: ${pages.length} pages` : '';
              }).filter(Boolean).join(' | ')}
            </div>
          </div>
        </div>
      </SpaceCard>
    );
  };

  // Queue visualization component - FIXED
  const QueueVisualization = ({ queue, title, queueType }) => {
    return (
      <SpaceCard className="rounded-xl border border-blue-500/50 bg-gradient-to-br from-gray-900/70 to-blue-900/70 p-4">
        <h3 className="text-lg font-bold mb-3">
          <GradientText gradient="from-blue-500 to-purple-500">
            {title} ({queue.length})
          </GradientText>
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {queue.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-4">
              <i>No processes in this queue</i>
            </div>
          ) : (
            queue.map(pid => {
              const process = processes.find(p => p.pid === pid);
              if (!process) return null;
              
              return (
                <div key={pid} className="flex items-center justify-between bg-gray-800/80 p-2 rounded-lg border border-gray-500/50">
                  <div className="flex items-center space-x-2">
                    <div className="text-lg">{process.icon}</div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-200">{process.name}</div>
                      <div className="text-gray-400 text-xs">
                        PID: {process.pid} • P: {process.priority}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {process.remainingBurst}ms
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SpaceCard>
    );
  };

  // Gantt chart component - FIXED
  const GanttChart = () => {
    const chartWidth = Math.max(600, systemClock * 3);
    const scale = 3;

    return (
      <SpaceCard className="rounded-xl border border-blue-500/50 bg-gradient-to-br from-gray-900/70 to-blue-900/70 p-4">
        <h3 className="text-lg font-bold mb-3">
          <GradientText gradient="from-blue-500 to-purple-500">
            📊 CPU Scheduling Timeline
          </GradientText>
        </h3>
        <div className="overflow-x-auto">
          <div className="relative" style={{ width: chartWidth, height: '120px' }}>
            {ganttData.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                <i>No scheduling events to display</i>
              </div>
            ) : (
              <svg width={chartWidth} height="120" className="border border-gray-700 rounded bg-gray-800/50">
                {/* Core labels */}
                {cpuCores.map((_, coreId) => (
                  <g key={coreId}>
                    <text
                      x={5}
                      y={20 + coreId * 30}
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      Core {coreId}
                    </text>
                    <line
                      x1={0}
                      y1={30 + coreId * 30}
                      x2={chartWidth}
                      y2={30 + coreId * 30}
                      stroke="rgba(255,255,255,0.2)"
                    />
                  </g>
                ))}
                
                {/* Process execution bars */}
                {ganttData.map((entry, idx) => {
                  const process = processes.find(p => p.pid === entry.pid);
                  if (!process) return null;

                  const barWidth = Math.max(2, (entry.endTime - entry.startTime) * scale);
                  const yPosition = 10 + entry.coreId * 30;

                  return (
                    <rect
                      key={idx}
                      x={entry.startTime * scale + 60}
                      y={yPosition}
                      width={barWidth}
                      height={20}
                      fill={ProcessState.RUNNING.color}
                      opacity={0.8}
                      rx={2}
                    >
                      <title>{`${process.name} (${entry.startTime}-${entry.endTime}ms)`}</title>
                    </rect>
                  );
                })}
                
                {/* Current time indicator */}
                <line
                  x1={systemClock * scale + 60}
                  y1={0}
                  x2={systemClock * scale + 60}
                  y2={120}
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity={0.8}
                />
              </svg>
            )}
          </div>
        </div>
      </SpaceCard>
    );
  };

  // Legend component - SIMPLIFIED
  const Legend = () => {
    return (
      <SpaceCard className="rounded-xl border border-blue-500/50 bg-gradient-to-br from-gray-900/70 to-blue-900/70 p-4">
        <h3 className="text-lg font-bold mb-3">
          <GradientText gradient="from-blue-500 to-purple-500">
            📚 Process States
          </GradientText>
        </h3>
        <div className="space-y-2 text-sm">
          {Object.entries(ProcessState).map(([key, state]) => (
            <div key={key} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: state.color }}
              />
              <span className="text-gray-200">{state.name}</span>
            </div>
          ))}
        </div>
      </SpaceCard>
    );
  };

  // Performance metrics component - FIXED
  const PerformanceMetrics = () => {
    return (
      <SpaceCard className="rounded-xl border border-blue-500/50 bg-gradient-to-br from-gray-900/70 to-blue-900/70 p-4">
        <h3 className="text-lg font-bold mb-3">
          <GradientText gradient="from-blue-500 to-purple-500">
            📈 Performance Metrics
          </GradientText>
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-200 mb-1">Total Processes</div>
            <div className="text-2xl font-bold text-blue-400">{metrics.totalProcesses}</div>
          </div>
          <div>
            <div className="font-medium text-gray-200 mb-1">Context Switches</div>
            <div className="text-2xl font-bold text-blue-400">{metrics.contextSwitches}</div>
          </div>
          <div>
            <div className="font-medium text-gray-200 mb-1">Avg. Waiting Time</div>
            <div className="text-2xl font-bold text-blue-400">{metrics.avgWaitingTime.toFixed(1)}ms</div>
          </div>
          <div>
            <div className="font-medium text-gray-200 mb-1">CPU Utilization</div>
            <div className="text-2xl font-bold text-blue-400">{cpuUtilization.toFixed(1)}%</div>
          </div>
          <div>
            <div className="font-medium text-gray-200 mb-1">Page Faults</div>
            <div className="text-2xl font-bold text-blue-400">{metrics.pageFaults}</div>
          </div>
          <div>
            <div className="font-medium text-gray-200 mb-1">System Clock</div>
            <div className="text-2xl font-bold text-blue-400">{systemClock}ms</div>
          </div>
        </div>
      </SpaceCard>
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
                  <SpaceTooltip key={app.id} content={`${app.name} - Priority: ${app.priority} - Memory: ${app.memorySize} MB`}>
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
            
            {/* Control Panel */}
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
                    setTimeElapsed(0);
                    setGanttData([]);
                    setCpuCores(prev => prev.map(c => ({ 
                      ...c, 
                      currentProcess: null, 
                      isExecuting: false, 
                      currentInstruction: null,
                      registers: { AX: 0, BX: 0, CX: 0, DX: 0, PC: 0, SP: 4096, FLAGS: 0 },
                      pipeline: []
                    })));
                    setPageTable(new Map());
                    setSystemCalls([]);
                    setInterrupts([]);
                    setDeadlocks([]);
                    setMemoryUsage(0);
                    setCpuUtilization(0);
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
                    className="w-full px-3 py-2 bg-gray-800 text-gray-200 rounded-lg border border-gray-600"
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
              </div>
            </SpaceCard>

            <PerformanceMetrics />
            <Legend />
          </div>
          
          {/* Main Visualization Area */}
          <div className="lg:col-span-6 space-y-4 lg:space-y-6">
            <SpaceCard className="relative h-[400px] lg:h-[500px] bg-gray-900/80 rounded-xl border border-blue-500/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-12 grid grid-cols-5 border-b border-blue-500/20 bg-gray-900/90 z-10">
                {['NEW', 'READY', 'RUNNING', 'WAITING', 'TERMINATED'].map((state) => (
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
              <QueueVisualization queue={newQueue} title="New Queue" queueType="new" />
              <QueueVisualization queue={readyQueue} title="Ready Queue" queueType="ready" />
              <QueueVisualization queue={waitingQueue} title="Waiting Queue" queueType="waiting" />
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
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-3 text-sm text-gray-300 bg-gray-900/70 px-6 py-3 rounded-lg border border-blue-500/30">
            <span className="text-lg">⚡</span>
            <span>Current Algorithm: {SchedulingAlgorithms[selectedAlgorithm].name}</span>
            <span className="text-gray-400">|</span>
            <span>System Clock: {systemClock}ms</span>
          </div>
        </div>
      </div>
      
      {selectedProcess && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProcess(null)}
        >
          <div 
            className="bg-gray-900 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto border border-blue-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                <span className="text-2xl mr-2">{selectedProcess.icon}</span>
                {selectedProcess.name}
              </h3>
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-gray-400 hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>Remaining Burst: {selectedProcess.remainingBurst}ms</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-200 mb-2">Instructions</h4>
              <div className="space-y-1">
                {selectedProcess.instructions.map((inst, idx) => (
                  <div 
                    key={idx}
                    className={`text-sm p-2 rounded border ${
                      idx === selectedProcess.currentInstructionIndex 
                        ? 'bg-blue-500/20 border-blue-500/40' 
                        : 'bg-gray-800/50 border-gray-600/50'
                    }`}
                  >
                    <span className="mr-2">{InstructionType[inst.type].icon}</span>
                    <span className="font-mono">{InstructionType[inst.type].asm}</span>
                    {idx === selectedProcess.currentInstructionIndex && (
                      <span className="ml-2 text-blue-400">← Current</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CPUSchedulingVisualization;
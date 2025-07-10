/**
 * CPU Scheduling Simulation Engine
 * A clean, working implementation of CPU scheduling algorithms
 */

class CPUSchedulingEngine {
  constructor() {
    this.processes = [];
    this.readyQueue = [];
    this.waitingQueue = [];
    this.completedProcesses = [];
    this.runningProcess = null;
    this.currentTime = 0;
    this.algorithm = 'FCFS';
    this.timeQuantum = 2;
    this.currentQuantum = 0; // Track current time quantum
    this.isRunning = false;
    this.isPaused = false;
    this.ganttChart = [];
    this.listeners = {};
    this.stepMode = false;
    this.speed = 1000; // milliseconds between steps
    this.intervalId = null;
  }

  // Event system for real-time updates
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Initialize the engine with processes and algorithm
  initialize(processes, algorithm = 'FCFS', options = {}) {
    this.processes = processes.map((p, index) => ({
      ...p,
      id: p.id || index + 1,
      originalBurstTime: p.burstTime,
      remainingTime: p.burstTime,
      waitingTime: 0,
      turnaroundTime: 0,
      responseTime: -1,
      startTime: -1,
      completionTime: -1,
      state: 'new'
    }));
    
    this.algorithm = algorithm.toUpperCase();
    this.timeQuantum = options.timeQuantum || 2;
    this.currentQuantum = 0; // Reset quantum counter
    this.currentTime = 0;
    this.readyQueue = [];
    this.waitingQueue = [];
    this.completedProcesses = [];
    this.runningProcess = null;
    this.ganttChart = [];
    
    this.emitStateUpdate();
  }

  // Get current state for visualization
  getState() {
    return {
      currentTime: this.currentTime,
      processes: this.processes,
      readyQueue: this.readyQueue,
      waitingQueue: this.waitingQueue,
      completedProcesses: this.completedProcesses,
      runningProcess: this.runningProcess,
      ganttChart: this.ganttChart,
      metrics: this.calculateMetrics(),
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      isComplete: this.isSimulationComplete()
    };
  }

  // Start the simulation
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    
    if (!this.stepMode) {
      this.intervalId = setInterval(() => {
        this.step();
      }, this.speed);
    }
    
    this.emit('simulationStarted', this.getState());
  }

  // Pause the simulation
  pause() {
    this.isPaused = true;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.emit('simulationPaused', this.getState());
  }

  // Resume the simulation
  resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    
    if (!this.stepMode) {
      this.intervalId = setInterval(() => {
        this.step();
      }, this.speed);
    }
    
    this.emit('simulationResumed', this.getState());
  }

  // Stop the simulation
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.emit('simulationStopped', this.getState());
  }

  // Reset the simulation
  reset() {
    this.stop();
    this.currentTime = 0;
    this.readyQueue = [];
    this.waitingQueue = [];
    this.completedProcesses = [];
    this.runningProcess = null;
    this.ganttChart = [];
    this.currentQuantum = 0; // Reset quantum counter
    
    // Reset all processes to initial state
    this.processes.forEach(process => {
      process.remainingTime = process.originalBurstTime;
      process.waitingTime = 0;
      process.turnaroundTime = 0;
      process.responseTime = -1;
      process.startTime = -1;
      process.completionTime = -1;
      process.state = 'new';
    });
    
    this.emitStateUpdate();
    this.emit('simulationReset', this.getState());
  }

  // Execute one simulation step
  step() {
    // Check for new arrivals
    this.checkNewArrivals();
    
    // Handle running process
    if (this.runningProcess) {
      this.executeCurrentProcess();
    }
    
    // Schedule next process if needed
    if (!this.runningProcess && this.readyQueue.length > 0) {
      this.scheduleNextProcess();
    }
    
    // Update waiting times for processes in ready queue
    this.updateWaitingTimes();
    
    // Record gantt chart entry
    this.recordGanttEntry();
    
    // Advance time
    this.currentTime++;
    
    // Check if simulation is complete
    if (this.isSimulationComplete()) {
      this.stop();
      this.emit('simulationComplete', this.getState());
    }
    
    this.emitStateUpdate();
  }

  // Check for processes arriving at current time
  checkNewArrivals() {
    this.processes.forEach(process => {
      if (process.arrivalTime === this.currentTime && process.state === 'new') {
        process.state = 'ready';
        this.readyQueue.push(process);
        this.emit('processArrived', { process, time: this.currentTime });
      }
    });
  }

  // Execute the currently running process
  executeCurrentProcess() {
    if (!this.runningProcess) return;

    // Set response time if this is the first execution
    if (this.runningProcess.responseTime === -1) {
      this.runningProcess.responseTime = this.currentTime - this.runningProcess.arrivalTime;
    }

    // Execute for one time unit
    this.runningProcess.remainingTime--;
    if (this.algorithm === 'RR') {
      this.currentQuantum++;
    }

    // Check if process is complete
    if (this.runningProcess.remainingTime === 0) {
      this.currentQuantum = 0;
      this.completeProcess();
    } else if (this.algorithm === 'RR' && this.currentQuantum >= this.timeQuantum) {
      // Quantum expired: preempt and rotate
      this.currentQuantum = 0;
      this.preemptProcess();
    } else if (this.shouldPreempt()) {
      this.preemptProcess();
    }
  }

  // Complete the current process
  completeProcess() {
    if (!this.runningProcess) return;
    
    const process = this.runningProcess;
    process.state = 'completed';
    process.completionTime = this.currentTime + 1;
    process.turnaroundTime = process.completionTime - process.arrivalTime;
    
    this.completedProcesses.push(process);
    this.runningProcess = null;
    
    this.emit('processCompleted', { process, time: this.currentTime + 1 });
  }

  // Preempt the current process
  preemptProcess() {
    if (!this.runningProcess) return;
    
    const process = this.runningProcess;
    process.state = 'ready';
    this.readyQueue.push(process);
    this.runningProcess = null;
    
    this.emit('processPreempted', { process, time: this.currentTime });
  }

  // Schedule the next process based on the algorithm
  scheduleNextProcess() {
    if (this.readyQueue.length === 0) return;

    let nextProcess;

    switch (this.algorithm) {
      case 'FCFS':
        nextProcess = this.readyQueue.shift();
        break;
      case 'SJF':
        const shortestIndex = this.findShortestJob();
        nextProcess = this.readyQueue.splice(shortestIndex, 1)[0];
        break;
      case 'SRTF':
        const shortestRemainingIndex = this.findShortestRemainingTime();
        nextProcess = this.readyQueue.splice(shortestRemainingIndex, 1)[0];
        break;
      case 'RR':
        nextProcess = this.readyQueue.shift();
        this.currentQuantum = 0; // Reset quantum for new process
        break;
      case 'PRIORITY':
        const highestPriorityIndex = this.findHighestPriority();
        nextProcess = this.readyQueue.splice(highestPriorityIndex, 1)[0];
        break;
      default:
        nextProcess = this.readyQueue.shift();
    }

    if (nextProcess) {
      nextProcess.state = 'running';
      if (nextProcess.startTime === -1) {
        nextProcess.startTime = this.currentTime;
      }
      this.runningProcess = nextProcess;
      this.emit('processScheduled', { process: nextProcess, time: this.currentTime });
    }
  }

  // Find shortest job in ready queue
  findShortestJob() {
    let shortestIndex = 0;
    for (let i = 1; i < this.readyQueue.length; i++) {
      if (this.readyQueue[i].originalBurstTime < this.readyQueue[shortestIndex].originalBurstTime) {
        shortestIndex = i;
      }
    }
    return shortestIndex;
  }

  // Find shortest remaining time in ready queue
  findShortestRemainingTime() {
    let shortestIndex = 0;
    for (let i = 1; i < this.readyQueue.length; i++) {
      if (this.readyQueue[i].remainingTime < this.readyQueue[shortestIndex].remainingTime) {
        shortestIndex = i;
      }
    }
    return shortestIndex;
  }

  // Find highest priority in ready queue
  findHighestPriority() {
    let highestIndex = 0;
    for (let i = 1; i < this.readyQueue.length; i++) {
      if (this.readyQueue[i].priority < this.readyQueue[highestIndex].priority) {
        highestIndex = i;
      }
    }
    return highestIndex;
  }

  // Check if current process should be preempted
  shouldPreempt() {
    if (this.algorithm === 'RR') {
      // Check if time quantum is exceeded (simplified - assumes 1 time unit per quantum)
      return false; // Will be handled by time quantum logic in a more complex implementation
    }
    
    if (this.algorithm === 'SRTF' && this.readyQueue.length > 0) {
      const shortestInQueue = this.readyQueue[this.findShortestRemainingTime()];
      return shortestInQueue.remainingTime < this.runningProcess.remainingTime;
    }
    
    return false;
  }

  // Update waiting times for processes in ready queue
  updateWaitingTimes() {
    this.readyQueue.forEach(process => {
      process.waitingTime++;
    });
  }

  // Record entry in gantt chart
  recordGanttEntry() {
    this.ganttChart.push({
      time: this.currentTime,
      process: this.runningProcess ? this.runningProcess.id : null,
      processName: this.runningProcess ? this.runningProcess.name : 'Idle'
    });
  }

  // Check if simulation is complete
  isSimulationComplete() {
    return this.completedProcesses.length === this.processes.length;
  }

  // Calculate performance metrics
  calculateMetrics() {
    if (this.completedProcesses.length === 0) {
      return {
        averageWaitingTime: 0,
        averageTurnaroundTime: 0,
        averageResponseTime: 0,
        cpuUtilization: 0,
        throughput: 0
      };
    }

    const totalWaitingTime = this.completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaroundTime = this.completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const totalResponseTime = this.completedProcesses.reduce((sum, p) => sum + (p.responseTime >= 0 ? p.responseTime : 0), 0);
    
    const busyTime = this.ganttChart.filter(entry => entry.process !== null).length;
    const cpuUtilization = this.currentTime > 0 ? (busyTime / this.currentTime) * 100 : 0;
    
    return {
      averageWaitingTime: totalWaitingTime / this.completedProcesses.length,
      averageTurnaroundTime: totalTurnaroundTime / this.completedProcesses.length,
      averageResponseTime: totalResponseTime / this.completedProcesses.length,
      cpuUtilization,
      throughput: this.completedProcesses.length / Math.max(this.currentTime, 1)
    };
  }

  // Emit state update to all listeners
  emitStateUpdate() {
    this.emit('stateUpdate', this.getState());
  }

  // Set simulation speed
  setSpeed(speed) {
    this.speed = speed;
    if (this.isRunning && !this.isPaused && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.step();
      }, this.speed);
    }
  }

  // Enable/disable step mode
  setStepMode(enabled) {
    this.stepMode = enabled;
    if (enabled && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Helper methods for accessing simulation state
  getProcesses() {
    return this.processes;
  }

  getCPUCores() {
    // Return CPU cores with current process information
    return [{
      id: 1,
      currentProcess: this.runningProcess,
      utilization: this.runningProcess ? 100 : 0,
      state: this.runningProcess ? 'busy' : 'idle'
    }];
  }

  getReadyQueue() {
    return this.readyQueue;
  }

  getWaitingQueue() {
    return this.waitingQueue;
  }

  getTerminatedQueue() {
    return this.completedProcesses;
  }

  getMetrics() {
    return this.calculateMetrics();
  }

  getGanttData() {
    return this.ganttChart;
  }

  // Cleanup
  cleanup() {
    this.stop();
    this.listeners = {};
  }
}

export default CPUSchedulingEngine;

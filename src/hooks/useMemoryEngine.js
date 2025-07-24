import { useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';

const TOTAL_FRAMES = 32;
const INITIAL_STATE = {
  processes: {},
  physicalMemory: Array(TOTAL_FRAMES).fill(null),
  freeFrameQueue: Array.from({ length: TOTAL_FRAMES }, (_, i) => i),
  simulationQueue: [],
  currentStep: 0,
  history: [],
  log: ["Simulation initialized. Create a process to begin."],
};

export const useMemoryEngine = () => {
  const [state, setState] = useState(INITIAL_STATE);

  const processColors = useMemo(() => {
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    return (processId) => {
      if (!processId) return '#374151';
      return colorScale(processId);
    };
  }, []);

  const createSnapshot = useCallback((newState) => {
    setState(prevState => {
      const currentHistory = prevState.history.slice(0, prevState.currentStep + 1);
      return { 
        ...newState, 
        history: [...currentHistory, newState], 
        currentStep: currentHistory.length 
      };
    });
  }, []);

  const addProcess = useCallback((size) => {
    setState(prevState => {
      const processCount = Object.keys(prevState.processes).length;
      const newProcessId = `P${processCount}`;
      const newLog = [...prevState.log, `[Queue] Process ${newProcessId} (${size} pages) requested.`];
      
      const allocationSteps = Array.from({ length: size }).map((_, i) => ({
        type: 'ALLOCATE_PAGE',
        processId: newProcessId,
        pageNum: i,
        size: size,
      }));

      return {
        ...prevState,
        simulationQueue: [...prevState.simulationQueue, ...allocationSteps],
        log: newLog,
      };
    });
  }, []);

  const nextStep = useCallback(() => {
    setState(prevState => {
      if (prevState.currentStep < prevState.history.length - 1) {
        // Redo
        const nextStepIndex = prevState.currentStep + 1;
        return { ...prevState.history[nextStepIndex], currentStep: nextStepIndex };
      }

      // Execute next step from queue
      const [nextAction, ...restOfQueue] = prevState.simulationQueue;
      if (!nextAction) {
        const newLog = [...prevState.log, "No more actions in the queue."];
        return { ...prevState, log: newLog };
      }

      let newState = { ...prevState, simulationQueue: restOfQueue };

      if (nextAction.type === 'ALLOCATE_PAGE') {
        const { processId, pageNum, size } = nextAction;

        if (!newState.processes[processId]) {
          newState.processes = {
            ...newState.processes,
            [processId]: { id: processId, size, pageTable: {} }
          };
          newState.log = [...newState.log, `[Start] Allocating memory for ${processId}.`];
        }

        if (newState.freeFrameQueue.length > 0) {
          const [frame, ...restOfFrames] = newState.freeFrameQueue;
          newState.physicalMemory = [...newState.physicalMemory];
          newState.physicalMemory[frame] = { processId, pageNum };
          newState.processes = {
            ...newState.processes,
            [processId]: {
              ...newState.processes[processId],
              pageTable: { ...newState.processes[processId].pageTable, [pageNum]: frame }
            }
          };
          newState.freeFrameQueue = restOfFrames;
          newState.log = [...newState.log, `[OK] Mapped ${processId} Page ${pageNum} to Physical Frame ${frame}.`];
        } else {
          newState.log = [...newState.log, `[FAIL] No free frames for ${processId} Page ${pageNum}. Page fault!`];
          newState.simulationQueue = newState.simulationQueue.filter(step => step.processId !== processId);
        }
      }
      
      // Create snapshot
      const currentHistory = prevState.history.slice(0, prevState.currentStep + 1);
      return { 
        ...newState, 
        history: [...currentHistory, newState], 
        currentStep: currentHistory.length 
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prevState => {
      if (prevState.currentStep > 0) {
        const prevStepIndex = prevState.currentStep - 1;
        return { ...prevState.history[prevStepIndex], currentStep: prevStepIndex };
      }
      return prevState;
    });
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    addProcess,
    nextStep,
    prevStep,
    reset,
    processColors,
  };
};

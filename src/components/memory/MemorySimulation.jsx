import React from 'react';
import ControlPanel from './ControlPanel';
import ProcessManager from './ProcessManager';
import MemoryCanvas from './MemoryCanvas';

const MemorySimulation = ({ engine, memoryEngine, onBackToExplainer }) => {
  // Use either engine or memoryEngine prop (for compatibility)
  const activeEngine = engine || memoryEngine;

  if (!activeEngine) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        <p>Loading simulation...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4 text-white">
      {/* Back button */}
      {onBackToExplainer && (
        <div className="mb-4">
          <button
            onClick={onBackToExplainer}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            ← Back to Overview
          </button>
        </div>
      )}

      {/* Top Row: Main Canvas and Process Manager */}
      <div className="flex-grow flex gap-4 overflow-hidden">
        <main className="flex-[3] bg-white/5 rounded-xl border border-purple-500/20 p-4 overflow-hidden">
          <MemoryCanvas engine={activeEngine} />
        </main>
        <aside className="flex-1 bg-white/5 rounded-xl border border-purple-500/20 p-4 flex flex-col">
          <ProcessManager addProcess={activeEngine.addProcess} processes={activeEngine.state.processes} />
        </aside>
      </div>

      {/* Bottom Row: Control Panel and Explanation */}
      <footer className="h-40 flex gap-4">
        <div className="flex-[2] bg-white/5 rounded-xl border border-purple-500/20 p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-purple-300 mb-2">Simulation Log</h3>
          <div className="text-purple-100 text-sm flex-grow overflow-y-auto pr-2 space-y-1">
            {activeEngine.state.log.map((entry, i) => (
              <p key={i} className="font-mono text-xs leading-relaxed">{`> ${entry}`}</p>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-white/5 rounded-xl border border-purple-500/20 p-4">
          <ControlPanel 
            nextStep={activeEngine.nextStep} 
            prevStep={activeEngine.prevStep} 
            reset={activeEngine.reset} 
            currentStep={activeEngine.state.currentStep}
            totalSteps={activeEngine.state.history.length}
            queueLength={activeEngine.state.simulationQueue.length}
          />
        </div>
      </footer>
    </div>
  );
};

export default MemorySimulation;

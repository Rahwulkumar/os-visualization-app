import React from 'react';
import MemoryGrid from './MemoryGrid';

const MemoryCanvas = ({ engine }) => {
  if (!engine || !engine.state) {
    return (
      <div className="h-full w-full flex items-center justify-center text-purple-200">
        <p>Loading memory visualization...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-purple-200 mb-2">Physical Memory</h3>
        <div className="flex justify-center space-x-6 text-sm text-purple-300">
          <span>Free: {engine.state.freeFrameQueue.length} frames</span>
          <span>Used: {32 - engine.state.freeFrameQueue.length} frames</span>
        </div>
      </div>

      {/* Memory Grid */}
      <div className="flex-grow flex items-center justify-center">
        <MemoryGrid 
          physicalMemory={engine.state.physicalMemory} 
          processColors={engine.processColors}
        />
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center text-xs text-purple-300/70">
        <p>Each frame represents 4KB of physical memory</p>
      </div>
    </div>
  );
};

export default MemoryCanvas;

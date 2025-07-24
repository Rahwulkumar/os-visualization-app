import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const ProcessManager = ({ addProcess, processes = {} }) => {
  const [size, setSize] = useState(4);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddProcess = async () => {
    if (size > 0 && !isCreating && addProcess) {
      setIsCreating(true);
      try {
        addProcess(size);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
      } catch (error) {
        console.error('Error creating process:', error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleSizeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 8) {
      setSize(value);
    }
  };

  const processArray = Object.values(processes || {});

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-center font-bold text-lg text-purple-200 mb-4">Process Hub</h3>
      
      <div className="flex flex-col gap-4 mb-4">
        <div>
          <label htmlFor="mem-size" className="block text-sm font-medium text-purple-300 mb-1">
            Memory Request (Pages)
          </label>
          <input
            type="number"
            id="mem-size"
            value={size}
            onChange={handleSizeChange}
            min="1"
            max="8"
            disabled={isCreating}
            className="w-full bg-slate-800 border border-purple-600 rounded-md p-2 text-white focus:border-purple-400 focus:outline-none disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleAddProcess}
          disabled={isCreating || size <= 0 || !addProcess}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{isCreating ? 'Creating...' : 'Create Process'}</span>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        <h4 className="text-md font-semibold text-purple-300 mb-2">Active Processes</h4>
        <ul className="space-y-2">
          {processArray.map(p => (
            <li key={p.id} className="bg-white/10 p-2 rounded-md text-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold">{p.id}</span>
                <span className="text-purple-300">Size: {p.size} pages</span>
              </div>
              {p.pageTable && Object.keys(p.pageTable).length > 0 && (
                <div className="text-xs text-purple-200/70 mt-1">
                  Allocated: {Object.keys(p.pageTable).length}/{p.size} pages
                </div>
              )}
            </li>
          ))}
          {processArray.length === 0 && (
            <p className="text-purple-200/70 text-xs italic">No active processes.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProcessManager;


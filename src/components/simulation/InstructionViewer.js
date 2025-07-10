/**
 * Instruction Viewer Component
 * 
 * Displays the instruction-level execution details of the currently running process,
 * showing program counter, instruction queue, and execution traces.
 */

import React, { useState, useEffect } from 'react';
import { SpaceCard, GradientText, SpaceButton } from '@/themes/spaceTheme';

const InstructionViewer = ({ 
  runningProcess = null, 
  currentTime = 0, 
  userMode = 'intermediate',
  algorithmType = 'fcfs' 
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructionHistory, setInstructionHistory] = useState([]);

  // Generate synthetic instructions for demonstration
  const generateInstructions = (process) => {
    if (!process) return [];
    
    const instructions = [];
    const types = ['LOAD', 'STORE', 'ADD', 'SUB', 'MUL', 'DIV', 'CMP', 'JMP', 'CALL', 'RET'];
    const registers = ['R1', 'R2', 'R3', 'R4', 'AX', 'BX', 'CX', 'DX'];
    
    for (let i = 0; i < process.burstTime * 2; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const reg1 = registers[Math.floor(Math.random() * registers.length)];
      const reg2 = registers[Math.floor(Math.random() * registers.length)];
      
      let instruction = '';
      switch (type) {
        case 'LOAD':
          instruction = `${type} ${reg1}, [${Math.floor(Math.random() * 1000)}]`;
          break;
        case 'STORE':
          instruction = `${type} [${Math.floor(Math.random() * 1000)}], ${reg1}`;
          break;
        case 'ADD':
        case 'SUB':
        case 'MUL':
        case 'DIV':
        case 'CMP':
          instruction = `${type} ${reg1}, ${reg2}`;
          break;
        case 'JMP':
          instruction = `${type} ${Math.floor(Math.random() * 100)}`;
          break;
        case 'CALL':
          instruction = `${type} FUNC_${Math.floor(Math.random() * 10)}`;
          break;
        case 'RET':
          instruction = `${type}`;
          break;
        default:
          instruction = `${type} ${reg1}`;
      }
      
      instructions.push({
        id: i,
        address: `0x${(i * 4).toString(16).padStart(4, '0')}`,
        instruction: instruction,
        cycles: Math.floor(Math.random() * 3) + 1,
        executed: false,
        executionTime: null
      });
    }
    
    return instructions;
  };

  const [instructions, setInstructions] = useState([]);
  const [currentPC, setCurrentPC] = useState(0);

  useEffect(() => {
    if (runningProcess) {
      const newInstructions = generateInstructions(runningProcess);
      setInstructions(newInstructions);
      setCurrentPC(0);
    }
  }, [runningProcess]);

  useEffect(() => {
    if (runningProcess && instructions.length > 0) {
      const executedInstructions = Math.floor(
        (runningProcess.totalBurstTime - (runningProcess.remainingTime || runningProcess.burstTime)) * 2
      );
      
      setCurrentPC(Math.min(executedInstructions, instructions.length - 1));
      
      // Update instruction execution status only if needed
      setInstructions(prevInstructions => 
        prevInstructions.map((inst, index) => ({
          ...inst,
          executed: index < executedInstructions,
          executionTime: index < executedInstructions ? currentTime - (executedInstructions - index) : null
        }))
      );
    }
  }, [runningProcess, currentTime]); // Remove instructions.length from dependencies

  const getCurrentInstruction = () => {
    if (!runningProcess || !instructions.length) return null;
    return instructions[currentPC];
  };

  const getExecutionPhase = () => {
    if (!runningProcess) return 'No Process';
    
    const progress = runningProcess.totalBurstTime - (runningProcess.remainingTime || runningProcess.burstTime);
    const total = runningProcess.totalBurstTime;
    
    if (progress === 0) return 'Starting';
    if (progress >= total) return 'Completed';
    
    const phases = ['Fetch', 'Decode', 'Execute', 'Store'];
    return phases[Math.floor(progress * 4 / total)];
  };

  return (
    <SpaceCard className="border-gray-600 h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            <GradientText gradient="from-green-400 to-blue-400">
              Instruction Viewer
            </GradientText>
          </h3>
          <SpaceButton
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-xs px-2 py-1"
          >
            {showInstructions ? 'Hide' : 'Show'} Instructions
          </SpaceButton>
        </div>
        
        {!runningProcess ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">💻</div>
            <div>No process currently running</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Process Info */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: runningProcess.color }}
                  />
                  <span className="font-semibold text-white">{runningProcess.name}</span>
                </div>
                <span className="text-sm text-green-400 font-medium">
                  {getExecutionPhase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">PC:</span>
                  <span className="text-white ml-1 font-mono">
                    {instructions[currentPC]?.address || '0x0000'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Instruction:</span>
                  <span className="text-yellow-400 ml-1 font-mono">
                    {currentPC + 1}/{instructions.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Remaining:</span>
                  <span className="text-white ml-1">
                    {runningProcess.remainingTime || runningProcess.burstTime}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Phase:</span>
                  <span className="text-blue-400 ml-1">{getExecutionPhase()}</span>
                </div>
              </div>
            </div>

            {/* Current Instruction */}
            {getCurrentInstruction() && (
              <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
                <div className="text-sm text-green-400 font-semibold mb-1">
                  Currently Executing:
                </div>
                <div className="font-mono text-white text-sm">
                  {getCurrentInstruction().address}: {getCurrentInstruction().instruction}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Cycles: {getCurrentInstruction().cycles}
                </div>
              </div>
            )}

            {/* Instruction List */}
            {showInstructions && (
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <div className="text-sm text-gray-300 font-semibold mb-2">
                  Instruction Queue:
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {instructions.slice(Math.max(0, currentPC - 2), currentPC + 5).map((inst, index) => {
                    const globalIndex = Math.max(0, currentPC - 2) + index;
                    const isCurrent = globalIndex === currentPC;
                    const isExecuted = inst.executed;
                    
                    return (
                      <div
                        key={inst.id}
                        className={`flex items-center space-x-2 p-2 rounded text-xs font-mono ${
                          isCurrent 
                            ? 'bg-green-500/20 border border-green-500/50' 
                            : isExecuted 
                              ? 'bg-blue-500/10 text-blue-300' 
                              : 'text-gray-400'
                        }`}
                      >
                        <span className="text-gray-500 w-12">{inst.address}</span>
                        <span className={isCurrent ? 'text-white font-bold' : ''}>
                          {inst.instruction}
                        </span>
                        {isCurrent && (
                          <span className="text-green-400 text-xs">← PC</span>
                        )}
                        {isExecuted && !isCurrent && (
                          <span className="text-blue-400 text-xs">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Advanced Mode: CPU State */}
            {userMode === 'advanced' && (
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <div className="text-sm text-gray-300 font-semibold mb-2">
                  CPU State:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Cache Hits:</span>
                    <span className="text-green-400 ml-1">
                      {Math.floor(Math.random() * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Pipeline:</span>
                    <span className="text-blue-400 ml-1">
                      {Math.floor(Math.random() * 4) + 1}/4
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Branch Pred:</span>
                    <span className="text-yellow-400 ml-1">
                      {Math.floor(Math.random() * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">IPC:</span>
                    <span className="text-purple-400 ml-1">
                      {(Math.random() * 2 + 1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SpaceCard>
  );
};

export default InstructionViewer;

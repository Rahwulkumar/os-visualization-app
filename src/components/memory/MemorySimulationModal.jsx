import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import MemoryExplainer from './MemoryExplainer';
import MemorySimulation from './MemorySimulation';
import { useMemoryEngine } from '../../hooks/useMemoryEngine';

const MemorySimulationModal = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState('explainer'); // 'explainer' | 'simulation'
  const memoryEngine = useMemoryEngine();

  const handleStartSimulation = useCallback(() => {
    setPhase('simulation');
  }, []);

  const handleClose = useCallback(() => {
    setPhase('explainer');
    memoryEngine.reset();
    onClose();
  }, [onClose, memoryEngine]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Content */}
          <div className="h-full overflow-hidden">
            <AnimatePresence mode="wait">
              {phase === 'explainer' ? (
                <motion.div
                  key="explainer"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="h-full"
                >
                  <MemoryExplainer onStartSimulation={handleStartSimulation} />
                </motion.div>
              ) : (
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="h-full"
                >
                  <MemorySimulation 
                    memoryEngine={memoryEngine}
                    onBackToExplainer={() => setPhase('explainer')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MemorySimulationModal;

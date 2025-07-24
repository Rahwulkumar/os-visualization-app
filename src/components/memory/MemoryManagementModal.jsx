import React, { useState, useCallback, Fragment, useEffect } from 'react';
import MemoryExplainer from './MemoryExplainer';
import MemorySimulation from './MemorySimulation';
import { useMemoryEngine } from '../../hooks/useMemoryEngine';

const MemoryManagementModal = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState('explainer');
  const [motionComponents, setMotionComponents] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const memoryEngine = useMemoryEngine();

  // Dynamically load framer-motion if available
  useEffect(() => {
    let isMounted = true;
    
    const loadFramerMotion = async () => {
      try {
        const framerMotion = await import('framer-motion');
        if (isMounted) {
          setMotionComponents({
            motion: framerMotion.motion,
            AnimatePresence: framerMotion.AnimatePresence
          });
        }
      } catch (error) {
        console.warn('framer-motion not available, using fallback components');
        if (isMounted) {
          setMotionComponents({
            motion: null,
            AnimatePresence: null
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadFramerMotion();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Safe fallback components
  const createFallbackDiv = () => {
    const FallbackDiv = ({ children, className, ...props }) => {
      // Filter out motion-specific props
      const { initial, animate, exit, transition, ...divProps } = props;
      return <div className={className} {...divProps}>{children}</div>;
    };
    return FallbackDiv;
  };

  const createFallbackPresence = () => {
    const FallbackPresence = ({ children, ...props }) => {
      return <Fragment>{children}</Fragment>;
    };
    return FallbackPresence;
  };

  const MotionDiv = motionComponents?.motion?.div || createFallbackDiv();
  const AnimatePresence = motionComponents?.AnimatePresence || createFallbackPresence();

  const handleStartSimulation = useCallback(() => {
    memoryEngine.reset();
    setPhase('simulation');
  }, [memoryEngine]);

  const handleClose = useCallback(() => {
    setPhase('explainer');
    memoryEngine.reset();
    onClose();
  }, [onClose, memoryEngine]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-8">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading simulation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/80 border border-purple-500/30 w-[95vw] h-[95vh] rounded-2xl shadow-2xl shadow-purple-500/10 flex flex-col"
      >
        <header className="p-4 border-b border-purple-500/20 flex justify-between items-center">
          <h2 className="text-xl font-bold text-purple-200">Memory Management Explorer</h2>
          <button 
            onClick={handleClose} 
            className="text-purple-200 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-purple-500/20"
          >
            Close
          </button>
        </header>
        <main className="flex-grow overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === 'explainer' ? (
              <MotionDiv
                key="explainer"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <MemoryExplainer onStartSimulation={handleStartSimulation} />
              </MotionDiv>
            ) : (
              <MotionDiv
                key="simulation"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <MemorySimulation 
                  engine={memoryEngine}
                />
              </MotionDiv>
            )}
          </AnimatePresence>
        </main>
      </MotionDiv>
    </div>
  );
};

export default MemoryManagementModal;
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  Lock, 
  ShieldCheck, 
  Code, 
  XCircle, 
  KeyRound, 
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Unlock
} from 'lucide-react';

const AnimatedSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const ConceptCard = ({ icon: Icon, title, description, color }) => (
  <motion.div
    className={`bg-white/5 p-6 rounded-xl border border-${color}-500/30 hover:border-${color}-400/50 transition-all duration-300 h-full`}
    whileHover={{ y: -5, scale: 1.02 }}
  >
    <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center mb-4`}>
      <Icon className={`w-6 h-6 text-${color}-400`} />
    </div>
    <h3 className={`text-xl font-bold text-${color}-300 mb-3`}>{title}</h3>
    <p className="text-purple-200/80 leading-relaxed">{description}</p>
  </motion.div>
);

const ThreadComponent = ({ id, status, operation, localValue, progress }) => {
  const statusColors = {
    idle: 'bg-slate-600',
    running: 'bg-blue-500',
    waiting: 'bg-yellow-500',
    critical: 'bg-green-500',
    done: 'bg-gray-500',
  };
  const statusText = {
    idle: 'Idle',
    running: 'Running',
    waiting: 'Waiting for Lock',
    critical: 'In Critical Section',
    done: 'Finished',
  };

  return (
    <div className="bg-white/5 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-lg text-purple-200">Thread {id}</h4>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>{statusText[status]}</span>
      </div>
      <div className="space-y-2 text-sm">
        <p>Operation: <span className="font-mono text-cyan-300">{operation}</span></p>
        <p>Local Value: <span className="font-mono text-amber-300">{localValue === null ? 'N/A' : `$${localValue}`}</span></p>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <motion.div
            className="bg-purple-500 h-2.5 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

const InteractiveConcurrencyViz = ({ onBack }) => {
  const [balance, setBalance] = useState(500);
  const [threads, setThreads] = useState([
    { id: 'A', status: 'idle', operation: 'Deposit $100', amount: 100, step: 0, localValue: null, progress: 0 },
    { id: 'B', status: 'idle', operation: 'Deposit $100', amount: 100, step: 0, localValue: null, progress: 0 },
  ]);
  const [useMutex, setUseMutex] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState([]);
  const intervalRef = useRef(null);

  const addLog = (message) => setLogs(prev => [{ id: Date.now() + Math.random(), message }, ...prev.slice(0, 10)]);

  const reset = () => {
    setIsPlaying(false);
    setBalance(500);
    setThreads([
      { id: 'A', status: 'idle', operation: 'Deposit $100', amount: 100, step: 0, localValue: null, progress: 0 },
      { id: 'B', status: 'idle', operation: 'Deposit $100', amount: 100, step: 0, localValue: null, progress: 0 },
    ]);
    setIsLocked(false);
    setLockedBy(null);
    setLogs([]);
    addLog("Simulation reset.");
  };

  const simulationStep = () => {
    const activeThreads = threads.filter(t => t.status !== 'done');
    if (activeThreads.length === 0) {
      setIsPlaying(false);
      const finalBalance = threads.reduce((acc, t) => acc + t.amount, 500);
      addLog(`All threads finished. Expected balance: $${finalBalance}. Actual balance: $${balance}.`);
      return;
    }

    const threadIndex = Math.floor(Math.random() * activeThreads.length);
    const thread = activeThreads[threadIndex];

    setThreads(prevThreads => prevThreads.map(t => {
      if (t.id !== thread.id) return t;

      let newThread = { ...t };
      
      // Thread logic
      switch (newThread.step) {
        case 0: // Try to enter critical section
          if (useMutex) {
            if (!isLocked) {
              setIsLocked(true);
              setLockedBy(newThread.id);
              newThread.status = 'critical';
              newThread.step = 1;
              addLog(`Thread ${newThread.id} acquired the lock.`);
            } else {
              newThread.status = 'waiting';
              addLog(`Thread ${newThread.id} is waiting for the lock.`);
            }
          } else {
            newThread.status = 'running';
            newThread.step = 1;
          }
          break;
        case 1: // Read balance
          newThread.localValue = balance;
          newThread.step = 2;
          newThread.progress = 33;
          addLog(`Thread ${newThread.id} reads balance: $${balance}.`);
          break;
        case 2: // Perform calculation
          newThread.localValue += newThread.amount;
          newThread.step = 3;
          newThread.progress = 66;
          addLog(`Thread ${newThread.id} calculates new balance: $${newThread.localValue}.`);
          break;
        case 3: // Write balance
          setBalance(newThread.localValue);
          newThread.step = 4;
          newThread.progress = 100;
          addLog(`Thread ${newThread.id} writes new balance: $${newThread.localValue}.`);
          break;
        case 4: // Exit critical section
          if (useMutex) {
            setIsLocked(false);
            setLockedBy(null);
            addLog(`Thread ${newThread.id} released the lock.`);
          }
          newThread.status = 'done';
          break;
      }
      return newThread;
    }));
  };
  
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(simulationStep, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, threads, balance, isLocked, useMutex]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-300">Interactive Concurrency Simulation</h1>
          <button onClick={onBack} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            ← Back to Introduction
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Threads */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {threads.map(thread => <ThreadComponent key={thread.id} {...thread} />)}
          </div>

          {/* Shared Resource & Controls */}
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold text-green-300 mb-2">Shared Bank Account</h3>
              <p className="text-5xl font-bold tracking-tighter">${balance}</p>
              <div className="mt-4 flex justify-center items-center gap-2 h-8">
                {isLocked ? (
                  <>
                    <Lock className="w-6 h-6 text-red-400" />
                    <span className="text-red-300">Locked by Thread {lockedBy}</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-6 h-6 text-green-400" />
                    <span className="text-green-300">Unlocked</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-purple-200 mb-4">Controls</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-800 p-2 rounded-lg">
                  <span className="font-semibold text-cyan-300">Use Mutex</span>
                  <button onClick={() => setUseMutex(!useMutex)} className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${useMutex ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'}`}>
                    <motion.div layout className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button onClick={reset} className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg"><RotateCcw size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="mt-8 bg-black/20 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-300 mb-2">Event Log</h3>
          <div className="text-sm text-purple-200/80 space-y-1 h-32 overflow-y-auto">
            {logs.map(log => <p key={log.id} className="font-mono">{log.message}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
};


const ConcurrencySimulation = ({ onBackToExplainer }) => {
  const [currentView, setCurrentView] = useState('introduction');

  const handleLaunchVisualization = () => {
    setCurrentView('visualization');
  };

  if (currentView === 'visualization') {
    return <InteractiveConcurrencyViz onBack={() => setCurrentView('introduction')} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        <AnimatedSection>
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-purple-300 mb-6">
              Concurrency & Synchronization
            </h1>
            <p className="text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed">
              Explore the art of managing multiple tasks at once and the mechanisms that prevent digital chaos.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h2 className="text-4xl font-bold text-red-300">The Challenge: Race Conditions</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  Concurrency allows multiple threads to access shared resources, like a bank account balance. Without control, this leads to a <strong className="text-red-200">race condition</strong>.
                </p>
                <p>
                  Imagine two threads trying to deposit $100 into an account with a $500 balance. Both might read $500, calculate $600, and write it back. The final balance is $600, not the correct $700. One deposit is lost!
                </p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-center font-semibold text-white mb-4">Race Condition Example</h3>
              <div className="relative h-40 bg-slate-800 rounded-md p-4 text-center">
                <div className="text-2xl font-bold mb-4">Balance: $<span className="text-green-400">500</span></div>
                <div className="flex justify-around">
                  <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }}>
                    <div className="text-center">
                      <p>Thread A</p>
                      <p className="text-sm text-blue-300">Deposit $100</p>
                    </div>
                  </motion.div>
                  <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                    <div className="text-center">
                      <p>Thread B</p>
                      <p className="text-sm text-amber-300">Deposit $100</p>
                    </div>
                  </motion.div>
                </div>
                <div className="absolute bottom-4 left-0 right-0">
                  <p className="text-red-400 font-bold text-lg">Final Balance: $600 😱</p>
                </div>
              </div>
              <p className="text-xs text-red-400 mt-3 text-center">
                ⚠️ Uncontrolled access leads to data corruption.
              </p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="bg-white/5 p-6 rounded-xl border border-cyan-500/30">
                <h3 className="text-center font-semibold text-white mb-4">Solution: Using a Mutex</h3>
                <div className="relative h-40 bg-slate-800 rounded-md p-4 flex flex-col items-center justify-center">
                    <Lock className="w-8 h-8 text-cyan-400 mb-2" />
                    <div className="font-mono p-2 bg-black/20 rounded">
                        <p><span className="text-cyan-300">lock.acquire()</span>;</p>
                        <p className="pl-4">balance += amount;</p>
                        <p><span className="text-cyan-300">lock.release()</span>;</p>
                    </div>
                    <p className="text-green-400 font-bold text-lg mt-4">Final Balance: $700 👍</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                <h2 className="text-4xl font-bold text-cyan-300">The Solution: Synchronization</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  To prevent race conditions, we use <strong className="text-cyan-200">synchronization primitives</strong>. The most common is a <strong className="text-cyan-200">Mutex</strong> (Mutual Exclusion lock).
                </p>
                <p>
                  A mutex ensures that only one thread can execute a <strong className="text-cyan-200">critical section</strong> of code at a time. Other threads must wait until the lock is released.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-purple-300 text-center mb-12">
              Core Concepts You'll Explore
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <ConceptCard
                icon={Code}
                title="Critical Section"
                description="A piece of code that accesses a shared resource and must not be concurrently executed by more than one thread."
                color="blue"
              />
              <ConceptCard
                icon={XCircle}
                title="Deadlock"
                description="A state where two or more threads are blocked forever, each waiting for the other to release a resource."
                color="red"
              />
              <ConceptCard
                icon={KeyRound}
                title="Semaphores & Mutexes"
                description="Synchronization tools to control access. A mutex is for exclusive access, while a semaphore can allow a certain number of threads access."
                color="amber"
              />
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.5}>
          <div className="text-center bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-12 rounded-2xl border border-purple-500/30">
            <h2 className="text-4xl font-bold text-purple-300 mb-6">
              See It in Action
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Ready to tame the chaos? Launch our interactive simulation to visualize race conditions, deadlocks, and the power of synchronization.
            </p>
            <motion.button
              onClick={handleLaunchVisualization}
              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl shadow-purple-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3">
                <span>Launch Interactive Simulation</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
            
            {onBackToExplainer && (
              <div className="mt-4">
                <button
                  onClick={onBackToExplainer}
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  ← Back to Overview
                </button>
              </div>
            )}
          </div>
        </AnimatedSection>

      </div>
    </div>
  );
};

export default ConcurrencySimulation;

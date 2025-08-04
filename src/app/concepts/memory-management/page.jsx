'use client';
import React, { useState, useEffect } from 'react';
import { Play, Cpu, HardDrive, Zap } from 'lucide-react';
import MemorySimulation from '@/components/memory/MemorySimulation';

const MemoryManagementPage = () => {
  const [showSimulation, setShowSimulation] = useState(false);
  const [motionComponents, setMotionComponents] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          setMotionComponents(null);
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

  const handleOpenSimulation = () => setShowSimulation(true);
  const handleCloseSimulation = () => setShowSimulation(false);

  // Fallback component that ignores motion props
  const FallbackDiv = ({ children, className, initial, animate, transition, delay, ...props }) => 
    <div className={className} {...props}>{children}</div>;

  const MotionDiv = motionComponents?.motion?.div || FallbackDiv;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading Memory Management...</p>
        </div>
      </div>
    );
  }

  if (showSimulation) {
    return <MemorySimulation onBackToExplainer={handleCloseSimulation} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <MotionDiv
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-purple-300 mb-4">Memory Management</h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-24">
            Explore how an operating system orchestrates the complex dance of memory allocation, virtualization, and optimization that makes modern computing possible.
          </p>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-24"
        >
          <button
            onClick={handleOpenSimulation}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full overflow-hidden transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
            <Play className="w-6 h-6 mr-3" />
            Launch Interactive Simulation
          </button>
        </MotionDiv>

        {/* Detailed Explanation Sections */}
        <div className="space-y-20">
          {/* Section 1: Why Memory Management Exists */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <MotionDiv initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-cyan-300 mb-4">A Finite Resource</h2>
              <p className="text-purple-200/80 leading-relaxed space-y-4">
                <span>
                  Your computer's RAM is a finite, high-speed workspace. Every application you run—your browser, your game, your code editor—demands a piece of it. As programs become more powerful, their appetite for memory grows. Without a coordinator, this shared space quickly descends into a battle for resources, leading to slowdowns, instability, and crashes.
                </span>
                <span>
                  This fundamental conflict—many processes, limited memory—is why OS memory management is essential. The operating system must act as a referee, ensuring fair allocation while maintaining system stability and security.
                </span>
              </p>
            </MotionDiv>
            <MotionDiv initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
              <p className="text-center font-semibold text-white mb-2">Physical RAM</p>
              <div className="relative w-full h-10 bg-slate-800 rounded-md overflow-hidden">
                <MotionDiv className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-700" initial={{ width: 0 }} whileInView={{ width: '40%' }} transition={{ delay: 0.5, duration: 0.5 }} viewport={{ once: true }}><span className="absolute left-2 top-2 text-xs">OS</span></MotionDiv>
                <MotionDiv className="absolute h-full bg-gradient-to-r from-green-500 to-green-600" initial={{ width: 0, left: '40%' }} whileInView={{ width: '30%' }} transition={{ delay: 0.8, duration: 0.5 }} viewport={{ once: true }}><span className="absolute left-2 top-2 text-xs">Chrome</span></MotionDiv>
                <MotionDiv className="absolute h-full bg-gradient-to-r from-amber-500 to-amber-600" initial={{ width: 0, left: '70%' }} whileInView={{ width: '25%' }} transition={{ delay: 1.1, duration: 0.5 }} viewport={{ once: true }}><span className="absolute left-2 top-2 text-xs">Figma</span></MotionDiv>
                <MotionDiv className="absolute h-full bg-red-500 flex items-center justify-center" initial={{ width: 0, left: '95%' }} whileInView={{ width: '20%' }} transition={{ delay: 1.4, duration: 0.5 }} viewport={{ once: true }}><span className="text-xs font-bold">CRASH!</span></MotionDiv>
              </div>
              <p className="text-xs text-purple-300/70 mt-2 text-center">Apps compete for limited space, risking system failure.</p>
            </MotionDiv>
          </div>

          {/* Section 2: Virtual Memory */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <MotionDiv initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="p-4 bg-white/5 rounded-lg border border-purple-500/20 order-last md:order-first">
              <p className="text-center font-semibold text-white mb-2">Virtual Memory Spaces</p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-cyan-300 mb-1">Process A sees:</p>
                  <div className="h-6 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded flex items-center justify-between px-2 text-xs"><span>0x0000</span><span>Entire Address Space</span><span>0xFFFF</span></div>
                </div>
                <div>
                  <p className="text-sm text-teal-300 mb-1">Process B sees:</p>
                  <div className="h-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded flex items-center justify-between px-2 text-xs"><span>0x0000</span><span>Entire Address Space</span><span>0xFFFF</span></div>
                </div>
              </div>
              <p className="text-xs text-green-400/80 mt-3 text-center">Each process believes it owns all memory, ensuring isolation.</p>
            </MotionDiv>
            <MotionDiv initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-green-300 mb-4">The Grand Illusion</h2>
              <p className="text-purple-200/80 leading-relaxed space-y-4">
                <span>
                  The OS solves this with a powerful abstraction: <strong className="text-green-200">Virtual Memory</strong>. It gives every process its own private, seemingly unlimited address space. From the process's perspective, it has exclusive access to a clean, linear memory layout starting from address 0.
                </span>
                <span>
                  This provides complete <strong className="text-green-200">isolation</strong>. Process A cannot see or touch Process B's memory, which is fundamental for security and stability. It also simplifies programming, as developers no longer need to worry about where their code will physically be placed in RAM.
                </span>
              </p>
            </MotionDiv>
          </div>

          {/* Section 3: Paging Mechanism */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <MotionDiv initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-amber-300 mb-4">The Mechanism: Paging</h2>
              <p className="text-purple-200/80 leading-relaxed space-y-4">
                <span>
                  This illusion is achieved through <strong className="text-amber-200">Paging</strong>. The OS divides virtual address spaces into fixed-size blocks called <strong className="text-amber-200">pages</strong> (typically 4KB). Physical RAM is similarly divided into same-sized <strong className="text-amber-200">frames</strong>.
                </span>
                <span>
                  A per-process <strong className="text-amber-200">page table</strong>, managed by the OS, acts as a translator. It maps each virtual page to a physical frame. This allows a process's memory to be scattered throughout physical RAM non-contiguously, maximizing efficiency and eliminating fragmentation.
                </span>
              </p>
            </MotionDiv>
            <MotionDiv initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
              <p className="text-center font-semibold text-white mb-3">Page Translation</p>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-amber-300 mb-2">Virtual Pages</p>
                  <div className="space-y-1">
                    <div className="h-6 w-12 bg-cyan-600 rounded flex items-center justify-center text-xs font-bold">P0</div>
                    <div className="h-6 w-12 bg-cyan-600 rounded flex items-center justify-center text-xs font-bold">P1</div>
                  </div>
                </div>
                <div className="text-amber-400 font-mono text-xl">→</div>
                <div className="text-center">
                  <p className="text-xs text-amber-300 mb-2">Physical Frames</p>
                  <div className="space-y-1">
                    <div className="h-6 w-12 bg-green-600 rounded flex items-center justify-center text-xs font-bold">F7</div>
                    <div className="h-6 w-12 bg-green-600 rounded flex items-center justify-center text-xs font-bold">F2</div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryManagementPage;

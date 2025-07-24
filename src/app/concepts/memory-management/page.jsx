'use client';
import React, { useState, useEffect } from 'react';
import { Play, Cpu, HardDrive, Zap } from 'lucide-react';
import MemoryManagementModal from '@/components/memory/MemoryManagementModal';

const MemoryManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white p-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          <MotionDiv
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-purple-300 mb-4">The Memory Challenge</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-24">
              Why does an operating system need to manage memory at all? Let's explore the fundamental problem that every modern computer must solve.
            </p>
          </MotionDiv>

          {/* Detailed Explanation Sections */}
          <div className="space-y-24">

            {/* Section 1: "Why Memory Management Exists" */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <MotionDiv initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <h2 className="text-3xl font-bold text-cyan-300 mb-4">A Finite Resource</h2>
                <p className="text-purple-200/80 leading-relaxed">
                  Your computer's RAM is a finite, high-speed workspace. Every application you run—your browser, your game, your code editor—demands a piece of it. As programs become more powerful, their appetite for memory grows. Without a coordinator, this shared space quickly descends into a battle for resources, leading to slowdowns, instability, and crashes.
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

            {/* Section 2: "The Chaos of Unmanaged Memory" */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <MotionDiv initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="p-4 bg-white/5 rounded-lg border border-purple-500/20 order-last md:order-first">
                <p className="text-center font-semibold text-white mb-2">Unmanaged Memory</p>
                <div className="relative w-full h-16 bg-slate-800 rounded-md">
                  <MotionDiv className="absolute top-2 h-10 w-1/2 bg-blue-500 rounded" whileInView={{ x: [0, 20, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} viewport={{ once: true }}><span className="p-2 text-xs">Process A</span></MotionDiv>
                  <MotionDiv className="absolute top-6 h-10 w-1/2 bg-green-500 rounded left-1/4" whileInView={{ x: [0, -15, 10, 0], opacity: [1, 0.5, 1] }} transition={{ duration: 2.5, repeat: Infinity }} viewport={{ once: true }}><span className="p-2 text-xs">Process B</span></MotionDiv>
                  <MotionDiv className="absolute top-4 h-10 w-1/2 bg-amber-500 rounded left-1/2" whileInView={{ x: [0, 10, -20, 0] }} transition={{ duration: 3, repeat: Infinity }} viewport={{ once: true }}><span className="p-2 text-xs">Process C</span></MotionDiv>
                </div>
                <p className="text-xs text-red-400/80 mt-2 text-center">Without isolation, processes can overwrite each other's data, causing corruption and security risks.</p>
              </MotionDiv>
              <MotionDiv initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <h2 className="text-3xl font-bold text-red-400 mb-4">The Chaos of Anarchy</h2>
                <p className="text-purple-200/80 leading-relaxed">
                  In a system without memory management, there are no boundaries. A poorly written application could accidentally write data into memory being used by another program, or even the operating system itself. This leads to unpredictable behavior, corrupted data, and critical security vulnerabilities. There is no stability and no security.
                </p>
              </MotionDiv>
            </div>

            {/* Section 3: "Enter the Operating System" */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <MotionDiv initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <h2 className="text-3xl font-bold text-green-300 mb-4">The OS as the Arbitrator</h2>
                <p className="text-purple-200/80 leading-relaxed">
                  The Operating System intervenes with a powerful abstraction: <strong className="text-green-200">Virtual Memory</strong>. It creates a private, isolated memory map for each process. The OS then uses a technique called <strong className="text-green-200">Paging</strong> to divide this virtual map into fixed-size blocks, which are then cleverly mapped to physical RAM. This system brings order to the chaos, ensuring stability and security for all.
                </p>
              </MotionDiv>
              <MotionDiv initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
                <p className="text-center font-semibold text-white mb-2">OS-Managed Memory</p>
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <MotionDiv key={i} className="h-8 rounded border border-purple-400/30"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      viewport={{ once: true }}
                    ></MotionDiv>
                  ))}
                </div>
                <p className="text-xs text-green-300/80 mt-2 text-center">The OS divides physical memory into clean, fixed-size frames.</p>
              </MotionDiv>
            </div>

            {/* Section 4: "Your Mission: Understand the Magic" */}
            <div className="text-center py-16">
              <MotionDiv initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <h2 className="text-4xl font-bold text-purple-300 mb-4">Your Mission: Understand the Magic</h2>
                <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-12">
                  Now that you understand the problem, it's time to explore the solution. In this interactive simulation, you will take control of the OS memory manager. You will create processes, watch them get divided into pages, and see how the OS translates virtual addresses into physical locations.
                </p>
                <div className="flex justify-center items-center gap-8">
                  <div className="p-6 bg-white/5 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                    <p className="font-bold text-cyan-300">Virtual Memory</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-xl border border-green-500/30 shadow-lg shadow-green-500/10">
                    <p className="font-bold text-green-300">Physical Frames</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/10">
                    <p className="font-bold text-amber-300">Page Tables</p>
                  </div>
                </div>
              </MotionDiv>
            </div>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <button
                onClick={handleOpenModal}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full overflow-hidden transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                <Play className="w-6 h-6 mr-3" />
                Launch Interactive Simulation
              </button>
            </MotionDiv>

          </div>
        </div>
      </div>
      <MemoryManagementModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default MemoryManagementPage;


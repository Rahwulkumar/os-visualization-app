'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  AlertTriangle, 
  ArrowRight,
  Monitor,
  Zap,
  Database
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
    className={`bg-white/5 p-6 rounded-xl border border-${color}-500/30 hover:border-${color}-400/50 transition-all duration-300`}
    whileHover={{ y: -5, scale: 1.02 }}
  >
    <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center mb-4`}>
      <Icon className={`w-6 h-6 text-${color}-400`} />
    </div>
    <h3 className={`text-xl font-bold text-${color}-300 mb-3`}>{title}</h3>
    <p className="text-purple-200/80 leading-relaxed">{description}</p>
  </motion.div>
);

const MemoryIntroduction = ({ onLaunchVisualization }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Hero Section */}
        <AnimatedSection>
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-purple-300 mb-6">
              Memory Management
            </h1>
            <p className="text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed">
              Discover how operating systems orchestrate the complex dance of memory allocation, 
              virtualization, and optimization that makes modern computing possible.
            </p>
          </div>
        </AnimatedSection>

        {/* The Challenge Section */}
        <AnimatedSection delay={0.2}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h2 className="text-4xl font-bold text-red-300">The Challenge</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  Imagine dozens of applications running simultaneously on your computer—each one believing 
                  it has unlimited access to memory. Without coordination, this would be catastrophic.
                </p>
                <p>
                  <strong className="text-red-200">Physical RAM is finite.</strong> When Chrome needs 2GB, 
                  your game wants 4GB, and your development tools require another 3GB, something has to give.
                </p>
                <p>
                  Without memory management, programs would overwrite each other's data, leading to crashes, 
                  data corruption, and security vulnerabilities.
                </p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-center font-semibold text-white mb-4">Chaos Without Management</h3>
              <div className="relative h-32 bg-slate-800 rounded-md overflow-hidden">
                <motion.div 
                  className="absolute h-8 bg-blue-500 rounded m-2 flex items-center justify-center text-xs font-bold"
                  animate={{ 
                    x: [0, 100, 0],
                    width: [80, 120, 80]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Chrome
                </motion.div>
                <motion.div 
                  className="absolute h-8 bg-green-500 rounded m-2 mt-12 flex items-center justify-center text-xs font-bold"
                  animate={{ 
                    x: [200, 50, 200],
                    opacity: [1, 0.3, 1]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Game
                </motion.div>
                <motion.div 
                  className="absolute h-8 bg-amber-500 rounded m-2 mt-20 flex items-center justify-center text-xs font-bold"
                  animate={{ 
                    x: [100, 0, 150],
                    scale: [1, 0.8, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Editor
                </motion.div>
                <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
              </div>
              <p className="text-xs text-red-400 mt-3 text-center">
                ⚠️ Memory conflicts cause system instability
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Virtual Memory Solution */}
        <AnimatedSection delay={0.3}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="bg-white/5 p-6 rounded-xl border border-cyan-500/30">
                <h3 className="text-center font-semibold text-white mb-4">Virtual Memory Illusion</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-cyan-300 font-medium">Process A sees:</p>
                    <div className="h-6 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded flex items-center justify-between px-3 text-xs font-mono">
                      <span>0x00000000</span>
                      <span>Full Address Space</span>
                      <span>0xFFFFFFFF</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-teal-300 font-medium">Process B sees:</p>
                    <div className="h-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded flex items-center justify-between px-3 text-xs font-mono">
                      <span>0x00000000</span>
                      <span>Full Address Space</span>
                      <span>0xFFFFFFFF</span>
                    </div>
                  </div>
                  <div className="text-center py-2">
                    <ShieldCheck className="w-6 h-6 text-green-400 mx-auto" />
                    <p className="text-xs text-green-400 mt-1">Each process is isolated and protected</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                <h2 className="text-4xl font-bold text-cyan-300">Virtual Memory</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  The operating system's master stroke: <strong className="text-cyan-200">Virtual Memory</strong>. 
                  Every process gets its own private, seemingly unlimited address space.
                </p>
                <p>
                  From a program's perspective, it has exclusive access to a clean, linear memory layout 
                  starting from address 0. It never knows that other processes exist.
                </p>
                <p>
                  This provides <strong className="text-cyan-200">complete isolation</strong>—no process 
                  can accidentally (or maliciously) interfere with another's memory.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Paging Mechanism */}
        <AnimatedSection delay={0.4}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Layers className="w-8 h-8 text-green-400" />
                <h2 className="text-4xl font-bold text-green-300">Paging System</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  The magic happens through <strong className="text-green-200">Paging</strong>. 
                  Virtual memory is divided into fixed-size chunks called <strong>Pages</strong> 
                  (typically 4KB each).
                </p>
                <p>
                  Physical RAM is similarly divided into <strong className="text-green-200">Frames</strong> 
                  of the same size. A <strong className="text-green-200">Page Table</strong> maps 
                  each virtual page to its corresponding physical frame.
                </p>
                <p>
                  This allows a process's memory to be scattered throughout physical RAM 
                  non-contiguously, maximizing efficiency and eliminating fragmentation.
                </p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-center font-semibold text-white mb-4">Page Translation</h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-sm text-green-300 mb-2">Virtual Pages</p>
                  <div className="space-y-1">
                    {['P0', 'P1', 'P2', 'P3'].map((page, i) => (
                      <motion.div
                        key={page}
                        className="h-8 w-16 bg-cyan-600 rounded flex items-center justify-center text-sm font-bold"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                      >
                        {page}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <Database className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-xs text-amber-300">Page Table</p>
                  <motion.div 
                    className="text-green-400 font-mono text-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-300 mb-2">Physical Frames</p>
                  <div className="space-y-1">
                    {['F7', 'F2', 'F15', 'F9'].map((frame, i) => (
                      <motion.div
                        key={frame}
                        className="h-8 w-16 bg-green-600 rounded flex items-center justify-center text-sm font-bold"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                      >
                        {frame}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Demand Paging */}
        <AnimatedSection delay={0.5}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="bg-white/5 p-6 rounded-xl border border-amber-500/30">
                <h3 className="text-center font-semibold text-white mb-4">Page Fault Handling</h3>
                <div className="flex items-center justify-around py-4">
                  <div className="text-center">
                    <Cpu className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs">CPU Access</p>
                  </div>
                  <motion.div 
                    className="text-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="text-amber-400 font-bold text-lg">
                      <Zap className="w-8 h-8 mx-auto" />
                      <p className="text-sm">PAGE FAULT</p>
                    </div>
                  </motion.div>
                  <div className="text-center">
                    <HardDrive className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs">Load from Disk</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 rounded border border-amber-500/30">
                  <p className="text-xs text-amber-200 text-center">
                    OS loads missing page from storage and updates page table
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <BookOpen className="w-8 h-8 text-amber-400" />
                <h2 className="text-4xl font-bold text-amber-300">Demand Paging</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  Not all program code and data needs to be in RAM simultaneously. 
                  <strong className="text-amber-200"> Demand Paging</strong> loads pages only when they're actually needed.
                </p>
                <p>
                  When a process accesses a page that isn't in physical memory, the hardware triggers a 
                  <strong className="text-amber-200"> Page Fault</strong>—not an error, but a signal to the OS.
                </p>
                <p>
                  The OS seamlessly loads the required page from disk, finds an available frame 
                  (evicting another page if necessary), and resumes execution. This enables running 
                  programs much larger than available RAM.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Key Concepts Grid */}
        <AnimatedSection delay={0.6}>
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-purple-300 text-center mb-12">
              Core Concepts You'll Explore
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <ConceptCard
                icon={Monitor}
                title="Address Translation"
                description="See how virtual addresses are mapped to physical memory locations through page tables and the Memory Management Unit (MMU)."
                color="blue"
              />
              <ConceptCard
                icon={Layers}
                title="Memory Allocation"
                description="Understand different allocation strategies like First Fit, Best Fit, and Buddy System, and their impact on fragmentation."
                color="green"
              />
              <ConceptCard
                icon={Zap}
                title="Page Replacement"
                description="Explore algorithms like LRU, FIFO, and Clock that determine which pages to evict when memory is full."
                color="amber"
              />
            </div>
          </div>
        </AnimatedSection>

        {/* Interactive Launch Section */}
        <AnimatedSection delay={0.7}>
          <div className="text-center bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-12 rounded-2xl border border-purple-500/30">
            <h2 className="text-4xl font-bold text-purple-300 mb-6">
              Ready to Explore?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Experience these concepts firsthand with our interactive memory management visualization. 
              Create processes, watch memory allocation in real-time, and see how the OS handles page faults.
            </p>
            <motion.button
              onClick={onLaunchVisualization}
              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl shadow-purple-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3">
                <span>Launch Interactive Visualization</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </AnimatedSection>

      </div>
    </div>
  );
};

export default MemoryIntroduction;

'use client'

import React, { useState, useEffect } from 'react';
import { 
  StarField, 
  NebulaBackground, 
  SpaceCard, 
  MouseGlow,
  GradientText,
  spaceColors 
} from '../themes/spaceTheme';

const OSDashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // OS Concepts data
  const osConceptsData = [
    {
      id: 1,
      title: "File Systems",
      category: "storage",
      description: "Explore how operating systems organize and manage files through hierarchical structures and allocation methods.",
      icon: "📁",
      color: "blue",
      gradient: spaceColors.gradient.cosmic,
      features: ["Directory Trees", "File Allocation", "Permissions", "Storage Management"],
      href: "/concepts/file-systems"
    },
    {
      id: 2,
      title: "Process Management",
      category: "execution",
      description: "Understand how OS creates, schedules, and manages processes throughout their lifecycle.",
      icon: "⚙️",
      color: "purple",
      gradient: spaceColors.gradient.nebula,
      features: ["Process States", "Context Switching", "PCB", "Fork & Exec"],
      href: "/concepts/process-management"
    },
    {
      id: 3,
      title: "CPU Scheduling",
      category: "execution",
      description: "Visualize different scheduling algorithms and how the OS allocates CPU time to processes.",
      icon: "⏱️",
      color: "pink",
      gradient: spaceColors.gradient.stellar,
      features: ["FCFS", "Round Robin", "Priority Scheduling", "Gantt Charts"],
      href: "/concepts/cpu-scheduling"
    },
    {
      id: 4,
      title: "Memory Management",
      category: "storage",
      description: "See how virtual memory, paging, and segmentation work to efficiently manage system memory.",
      icon: "💾",
      color: "blue",
      gradient: spaceColors.gradient.cosmic,
      features: ["Virtual Memory", "Paging", "Segmentation", "Memory Allocation"],
      href: "/concepts/memory-management"
    },
    {
      id: 5,
      title: "Interrupts & System Calls",
      category: "communication",
      description: "Learn how the OS handles hardware interrupts and provides services through system calls.",
      icon: "🔔",
      color: "purple",
      gradient: spaceColors.gradient.nebula,
      features: ["Interrupt Handling", "System Call Interface", "Kernel Mode", "User Mode"],
      href: "/concepts/interrupts-syscalls"
    },
    {
      id: 6,
      title: "Concurrency & Synchronization",
      category: "execution",
      description: "Master synchronization primitives and solve classic concurrency problems interactively.",
      icon: "🔄",
      color: "pink",
      gradient: spaceColors.gradient.stellar,
      features: ["Mutexes", "Semaphores", "Deadlocks", "Race Conditions"],
      href: "/concepts/concurrency"
    }
  ];

  const categories = [
    { id: 'all', label: 'All Concepts', icon: '🌌' },
    { id: 'storage', label: 'Storage', icon: '💿' },
    { id: 'execution', label: 'Execution', icon: '🚀' },
    { id: 'communication', label: 'Communication', icon: '📡' }
  ];

  const filteredConcepts = selectedCategory === 'all' 
    ? osConceptsData 
    : osConceptsData.filter(concept => concept.category === selectedCategory);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Effects */}
      <StarField starCount={150} speed={0.3} />
      <NebulaBackground />
      <MouseGlow size={300} />
      
      {/* Navigation Header */}
      <nav className="relative z-30 border-b border-white/10 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3">
              <span className="text-2xl">🌌</span>
              <GradientText gradient={spaceColors.gradient.cosmic} className="text-2xl font-bold">
                OS Visualization
              </GradientText>
            </a>
            <div className="flex items-center space-x-6">
              <a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="/docs" className="text-gray-300 hover:text-white transition-colors">Documentation</a>
              <a href="/help" className="text-gray-300 hover:text-white transition-colors">Help</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <GradientText gradient={spaceColors.gradient.cosmic}>
              Explore OS Concepts
            </GradientText>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
            Select a concept below to begin your interactive journey through operating system fundamentals. 
            Each module features real-time visualizations and hands-on simulations.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-6 py-3 rounded-full border transition-all duration-300
                ${selectedCategory === category.id 
                  ? 'bg-white/20 border-white/40 text-white' 
                  : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                }
              `}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Concept Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredConcepts.map((concept, index) => (
            <div
              key={concept.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards', opacity: 0 }}
              onMouseEnter={() => setHoveredCard(concept.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <a href={concept.href} className="block h-full">
                <SpaceCard 
                  glowColor={concept.color}
                  className="h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{concept.icon}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      {concept.category}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-2xl font-bold mb-3">
                    <GradientText gradient={concept.gradient}>
                      {concept.title}
                    </GradientText>
                  </h3>

                  {/* Card Description */}
                  <p className="text-gray-300 text-sm mb-6 flex-grow">
                    {concept.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {concept.features.map((feature, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center space-x-2 text-sm text-gray-400"
                      >
                        <span className="text-blue-400">▸</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Action */}
                  <div className={`
                    flex items-center justify-between pt-4 border-t border-white/10
                    transition-all duration-300
                    ${hoveredCard === concept.id ? 'border-white/20' : ''}
                  `}>
                    <span className="text-sm text-gray-400">Interactive Module</span>
                    <div className={`
                      flex items-center space-x-1 text-white
                      transition-transform duration-300
                      ${hoveredCard === concept.id ? 'translate-x-1' : ''}
                    `}>
                      <span className="text-sm">Explore</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </SpaceCard>
              </a>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center py-12 animate-fadeIn" style={{ animationDelay: '0.8s', animationFillMode: 'forwards', opacity: 0 }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            <GradientText gradient={spaceColors.gradient.stellar}>
              Ready to Start Learning?
            </GradientText>
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Each module includes interactive visualizations, step-by-step explanations, 
            and hands-on exercises to master operating system concepts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/getting-started"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:scale-105 transition-transform duration-300"
            >
              Getting Started Guide
            </a>
            <a
              href="/sandbox"
              className="px-8 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300"
            >
              Open Sandbox
            </a>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed bottom-6 right-6 z-30">
        <button className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group">
          <svg className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OSDashboard;
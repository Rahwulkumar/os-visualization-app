"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  StarField,
  NebulaBackground,
  SpaceCard,
  GradientText,
  SpaceButton,
  MouseGlow
} from '@/themes/spaceTheme';

const CPUSchedulingLanding = () => {
  const router = useRouter();
  const [userMode, setUserMode] = useState('');

  const userModes = [
    {
      id: 'beginner',
      name: 'Beginner',
      icon: '🌱',
      description: 'Step-by-step guidance with detailed explanations',
      features: ['Slower simulation speed', 'Detailed tooltips', 'Commentary explanations', 'Guided tour']
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      icon: '⚡',
      description: 'Balanced view with essential metrics and standard controls',
      features: ['Standard simulation speed', 'Essential metrics', 'Interactive exploration', 'Moderate detail level']
    },
    {
      id: 'advanced',
      name: 'Advanced',
      icon: '🚀',
      description: 'Technical details and high-speed simulations for experts',
      features: ['High-speed options', 'Technical internals', 'Advanced metrics', 'Performance profiling']
    }
  ];

  const algorithmCategories = [
    {
      title: 'Classic Algorithms',
      description: 'Fundamental scheduling algorithms taught in operating systems courses',
      algorithms: ['FCFS', 'SJF', 'SRTF', 'Round Robin', 'Priority Scheduling']
    },
    {
      title: 'Modern Algorithms',
      description: 'Advanced algorithms used in real-world operating systems',
      algorithms: ['CFS (Linux)', 'MLFQ', 'Lottery Scheduling', 'Rate Monotonic']
    },
    {
      title: 'Educational Algorithms',
      description: 'Algorithms designed to illustrate specific concepts',
      algorithms: ['LJF', 'LRTF', 'Hybrid Algorithms']
    }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      <StarField starCount={200} speed={0.2} />
      <NebulaBackground opacity={0.3} />
      <MouseGlow color="blue-500" />
      
      <div className="relative z-20 p-6 lg:p-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            <GradientText gradient="from-blue-400 via-purple-500 to-pink-500">
              CPU Scheduling Visualizer
            </GradientText>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Experience real-time CPU scheduling algorithms with immersive visualizations. 
            Watch processes move through queues, see cores work, and understand scheduling decisions as they happen.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">12+</div>
              <div className="text-sm text-gray-400">Algorithms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">Real-time</div>
              <div className="text-sm text-gray-400">Visualization</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">3 Modes</div>
              <div className="text-sm text-gray-400">User Levels</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">Interactive</div>
              <div className="text-sm text-gray-400">Learning</div>
            </div>
          </div>
        </div>

        {/* User Mode Selection */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            <GradientText gradient="from-blue-500 to-purple-500">
              Choose Your Experience Level
            </GradientText>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {userModes.map((mode) => (
              <SpaceCard
                key={mode.id}
                className={`cursor-pointer transition-all duration-300 ${
                  userMode === mode.id 
                    ? 'border-blue-500 bg-blue-500/10 scale-105' 
                    : 'border-gray-600 hover:border-blue-400 hover:scale-102'
                }`}
                onClick={() => {
                  console.log('User mode selected:', mode.id);
                  setUserMode(mode.id);
                }}
              >
                <div className="text-center p-6">
                  <div className="text-6xl mb-4">{mode.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{mode.name}</h3>
                  <p className="text-gray-300 mb-4">{mode.description}</p>
                  
                  <div className="space-y-2">
                    {mode.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-center text-sm text-gray-400">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  {userMode === mode.id && (
                    <div className="mt-4 text-blue-400 font-semibold">
                      ✨ Selected
                    </div>
                  )}
                </div>
              </SpaceCard>
            ))}
          </div>
        </div>

        {/* Algorithm Categories Preview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            <GradientText gradient="from-purple-500 to-pink-500">
              Scheduling Algorithms
            </GradientText>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {algorithmCategories.map((category, idx) => (
              <SpaceCard key={idx} className="border-gray-600">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-white">{category.title}</h3>
                  <p className="text-gray-300 mb-4 text-sm">{category.description}</p>
                  
                  <div className="space-y-2">
                    {category.algorithms.map((algo, algoIdx) => (
                      <div key={algoIdx} className="flex items-center text-sm">
                        <span className="text-blue-400 mr-2">•</span>
                        <span className="text-gray-200">{algo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SpaceCard>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-6">
          {userMode ? (
            <div className="space-y-4">
              <SpaceButton 
                onClick={() => {
                  console.log('Navigating to algorithms with mode:', userMode);
                  router.push(`/cpu-scheduling/algorithms?mode=${userMode}`);
                }}
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                🚀 Explore Algorithms
              </SpaceButton>
              
              <div className="text-sm text-gray-400">
                Selected mode: <span className="text-blue-400 font-semibold">{userModes.find(m => m.id === userMode)?.name}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">
              Please select your experience level to continue
            </div>
          )}
          
          <div className="pt-8 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">What makes this different?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="text-blue-400 font-semibold">Real-time Simulation</div>
                <div className="text-gray-400">Watch scheduling happen live</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-purple-400 font-semibold">Interactive Learning</div>
                <div className="text-gray-400">Click, explore, and understand</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-pink-400 font-semibold">Multiple Views</div>
                <div className="text-gray-400">Queues, timelines, and metrics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔬</div>
                <div className="text-green-400 font-semibold">Deep Analysis</div>
                <div className="text-gray-400">Performance insights and comparisons</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPUSchedulingLanding;

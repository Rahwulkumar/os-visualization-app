"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  StarField,
  NebulaBackground,
  SpaceCard,
  GradientText,
  SpaceButton,
  SpaceTooltip,
  MouseGlow
} from '@/themes/spaceTheme';

const AlgorithmSelection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userMode, setUserMode] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode) {
      setUserMode(mode);
    }
  }, [searchParams]);

  const algorithms = [
    {
      id: 'fcfs',
      name: 'First-Come, First-Served (FCFS)',
      icon: '📋',
      category: 'Classic',
      difficulty: 'Beginner',
      description: 'Processes are executed in the order they arrive. Simple but can cause convoy effect.',
      realWorldUsage: 'Early batch processing systems, print queues',
      pros: ['Simple to implement', 'Fair in arrival order', 'No starvation'],
      cons: ['Poor average waiting time', 'Convoy effect with long processes'],
      complexity: 'O(1)',
      preemptive: false,
      timeComplexity: 'O(n)',
      visualFeatures: ['Process arrival animation', 'Queue progression', 'Convoy effect demonstration']
    },
    {
      id: 'sjf',
      name: 'Shortest Job First (SJF)',
      icon: '⚡',
      category: 'Classic',
      difficulty: 'Beginner',
      description: 'Selects the process with the smallest execution time. Optimal for average waiting time.',
      realWorldUsage: 'Batch systems with known job times, some embedded systems',
      pros: ['Optimal average waiting time', 'Minimal average turnaround time'],
      cons: ['Starvation of long processes', 'Requires knowledge of burst times'],
      complexity: 'O(n log n)',
      preemptive: false,
      timeComplexity: 'O(n log n)',
      visualFeatures: ['Burst time comparison', 'Optimal scheduling demonstration', 'Starvation visualization']
    },
    {
      id: 'srtf',
      name: 'Shortest Remaining Time First (SRTF)',
      icon: '🔄',
      category: 'Classic',
      difficulty: 'Intermediate',
      description: 'Preemptive version of SJF. Currently running process can be preempted by shorter jobs.',
      realWorldUsage: 'Real-time systems with known execution times',
      pros: ['Better response time than SJF', 'Optimal for average waiting time'],
      cons: ['High context switching overhead', 'Starvation possible', 'Complex implementation'],
      complexity: 'O(n log n)',
      preemptive: true,
      timeComplexity: 'O(n log n)',
      visualFeatures: ['Preemption animation', 'Context switch visualization', 'Remaining time tracking']
    },
    {
      id: 'round-robin',
      name: 'Round Robin (RR)',
      icon: '🔁',
      category: 'Classic',
      difficulty: 'Beginner',
      description: 'Each process gets a fixed time slice (quantum) in circular order. Fair and responsive.',
      realWorldUsage: 'Time-sharing systems, Windows (part of multilevel), Unix-like systems',
      pros: ['Fair CPU allocation', 'Good response time', 'No starvation'],
      cons: ['High context switching overhead', 'Performance depends on quantum size'],
      complexity: 'O(1)',
      preemptive: true,
      timeComplexity: 'O(n)',
      visualFeatures: ['Circular queue animation', 'Time quantum countdown', 'Fair distribution visualization']
    },
    {
      id: 'priority',
      name: 'Priority Scheduling',
      icon: '🎯',
      category: 'Classic',
      difficulty: 'Intermediate',
      description: 'Processes are scheduled based on priority levels. Higher priority processes run first.',
      realWorldUsage: 'Windows NT/XP/Vista/7/8/10/11, real-time systems, embedded systems',
      pros: ['Important processes get preference', 'Flexible system design'],
      cons: ['Starvation of low priority processes', 'Priority inversion possible'],
      complexity: 'O(n)',
      preemptive: true,
      timeComplexity: 'O(n)',
      visualFeatures: ['Priority ladder visualization', 'Priority inversion detection', 'Aging mechanism']
    },
    {
      id: 'mlfq',
      name: 'Multi-Level Feedback Queue (MLFQ)',
      icon: '🏗️',
      category: 'Advanced',
      difficulty: 'Advanced',
      description: 'Multiple queues with different priorities and time quantums. Processes move between queues.',
      realWorldUsage: 'Traditional Unix systems, older Windows versions',
      pros: ['Adapts to process behavior', 'Good for mixed workloads', 'Prevents starvation'],
      cons: ['Complex to implement', 'Many parameters to tune', 'Overhead of queue management'],
      complexity: 'O(n)',
      preemptive: true,
      timeComplexity: 'O(n)',
      visualFeatures: ['Multi-queue visualization', 'Process migration animation', 'Feedback mechanism display']
    },
    {
      id: 'cfs',
      name: 'Completely Fair Scheduler (CFS)',
      icon: '⚖️',
      category: 'Modern',
      difficulty: 'Advanced',
      description: 'Linux default scheduler using virtual runtime to ensure fairness. Based on red-black tree.',
      realWorldUsage: 'Linux kernel 2.6.23+, Android systems',
      pros: ['Perfect fairness', 'Good scalability', 'Handles thousands of processes'],
      cons: ['Complex implementation', 'Overhead of tree operations'],
      complexity: 'O(log n)',
      preemptive: true,
      timeComplexity: 'O(log n)',
      visualFeatures: ['Red-black tree visualization', 'Virtual runtime tracking', 'Fairness meter display']
    },
    {
      id: 'lottery',
      name: 'Lottery Scheduling',
      icon: '🎲',
      category: 'Research',
      difficulty: 'Advanced',
      description: 'Processes hold lottery tickets. Random lottery determines which process runs next.',
      realWorldUsage: 'Research systems, some experimental operating systems',
      pros: ['Proportional fairness', 'Starvation-free', 'Simple concept'],
      cons: ['Unpredictable scheduling', 'May not be optimal for real-time'],
      complexity: 'O(n)',
      preemptive: true,
      timeComplexity: 'O(n)',
      visualFeatures: ['Lottery ticket visualization', 'Random selection animation', 'Proportional share display']
    }
  ];

  const getModeConfig = () => {
    switch (userMode) {
      case 'beginner':
        return {
          showDifficulty: true,
          showComplexity: false,
          showRealtimeUsage: true,
          filterAlgorithms: algorithms.filter(a => a.difficulty === 'Beginner' || a.difficulty === 'Intermediate')
        };
      case 'intermediate':
        return {
          showDifficulty: true,
          showComplexity: true,
          showRealtimeUsage: true,
          filterAlgorithms: algorithms
        };
      case 'advanced':
        return {
          showDifficulty: false,
          showComplexity: true,
          showRealtimeUsage: true,
          filterAlgorithms: algorithms
        };
      default:
        return {
          showDifficulty: true,
          showComplexity: false,
          showRealtimeUsage: true,
          filterAlgorithms: algorithms
        };
    }
  };

  const config = getModeConfig();
  const displayAlgorithms = config.filterAlgorithms;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Classic': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Advanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Modern': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Research': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans">
      <StarField starCount={150} speed={0.2} />
      <NebulaBackground opacity={0.2} />
      <MouseGlow color="purple-500" />
      
      <div className="relative z-20 p-6 lg:p-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/cpu-scheduling" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
            ← Back to CPU Scheduling
          </Link>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <GradientText gradient="from-purple-400 via-blue-500 to-cyan-500">
              Choose Your Algorithm
            </GradientText>
          </h1>
          
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-lg text-gray-300 mb-4">
              Select a CPU scheduling algorithm to explore with interactive visualizations
            </p>
            {userMode && (
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2">
                <span className="text-blue-400">Mode:</span>
                <span className="font-semibold text-white capitalize">{userMode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Algorithm Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {displayAlgorithms.map((algorithm) => (
            <SpaceCard
              key={algorithm.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedAlgorithm === algorithm.id 
                  ? 'border-cyan-500 bg-cyan-500/10' 
                  : 'border-gray-600 hover:border-cyan-400'
              }`}
              onClick={() => {
                console.log('Algorithm selected:', algorithm.id);
                setSelectedAlgorithm(algorithm.id);
              }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{algorithm.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{algorithm.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(algorithm.category)}`}>
                          {algorithm.category}
                        </span>
                        {config.showDifficulty && (
                          <span className={`text-xs ${getDifficultyColor(algorithm.difficulty)}`}>
                            {algorithm.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedAlgorithm === algorithm.id && (
                    <div className="text-cyan-400">
                      <span className="text-xl">✓</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {algorithm.description}
                </p>

                {/* Properties */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Preemptive:</span>
                    <span className={algorithm.preemptive ? 'text-green-400' : 'text-red-400'}>
                      {algorithm.preemptive ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  {config.showComplexity && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Time Complexity:</span>
                      <span className="text-blue-400 font-mono">{algorithm.timeComplexity}</span>
                    </div>
                  )}
                </div>

                {/* Real World Usage */}
                {config.showRealtimeUsage && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Used in:</h4>
                    <p className="text-xs text-gray-300">{algorithm.realWorldUsage}</p>
                  </div>
                )}

                {/* Pros & Cons Preview */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <h4 className="text-green-400 font-semibold mb-1">Pros:</h4>
                    <ul className="space-y-1">
                      {algorithm.pros.slice(0, 2).map((pro, idx) => (
                        <li key={idx} className="text-gray-300 flex items-start">
                          <span className="text-green-400 mr-1">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">Cons:</h4>
                    <ul className="space-y-1">
                      {algorithm.cons.slice(0, 2).map((con, idx) => (
                        <li key={idx} className="text-gray-300 flex items-start">
                          <span className="text-red-400 mr-1">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Visual Features */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-xs font-semibold text-purple-400 mb-2">Visualization Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {algorithm.visualFeatures.slice(0, 2).map((feature, idx) => (
                      <span key={idx} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                    {algorithm.visualFeatures.length > 2 && (
                      <span className="text-xs text-gray-400">+{algorithm.visualFeatures.length - 2} more</span>
                    )}
                  </div>
                </div>
              </div>
            </SpaceCard>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          {selectedAlgorithm ? (
            <div className="space-y-4">
              <SpaceButton 
                onClick={() => {
                  console.log('Navigating to setup with algorithm:', selectedAlgorithm, 'mode:', userMode);
                  router.push(`/cpu-scheduling/setup/${selectedAlgorithm}?mode=${userMode}`);
                }}
                className="px-8 py-4 text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                🚀 Configure Simulation
              </SpaceButton>
              
              <div className="text-sm text-gray-400">
                Selected: <span className="text-cyan-400 font-semibold">
                  {algorithms.find(a => a.id === selectedAlgorithm)?.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">
              Select an algorithm to continue
            </div>
          )}
        </div>

        {/* Quick Comparison */}
        <div className="mt-16 pt-12 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-8">
            <GradientText gradient="from-blue-500 to-purple-500">
              Quick Comparison
            </GradientText>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-gray-400">Algorithm</th>
                  <th className="text-left p-3 text-gray-400">Preemptive</th>
                  <th className="text-left p-3 text-gray-400">Complexity</th>
                  <th className="text-left p-3 text-gray-400">Best For</th>
                </tr>
              </thead>
              <tbody>
                {displayAlgorithms.slice(0, 6).map((algo) => (
                  <tr key={algo.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span>{algo.icon}</span>
                        <span className="text-white">{algo.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={algo.preemptive ? 'text-green-400' : 'text-red-400'}>
                        {algo.preemptive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-blue-400">{algo.timeComplexity}</span>
                    </td>
                    <td className="p-3 text-gray-300">
                      {algo.pros[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmSelection;

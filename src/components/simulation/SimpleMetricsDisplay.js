/**
 * Simple Metrics Display
 * Clean visualization of CPU scheduling metrics
 */

import React from 'react';
import { SpaceCard, GradientText } from '@/themes/spaceTheme';

const SimpleMetricsDisplay = ({ metrics = {}, processes = [], algorithm = 'FCFS' }) => {
  const {
    averageWaitingTime = 0,
    averageTurnaroundTime = 0,
    averageResponseTime = 0,
    cpuUtilization = 0,
    throughput = 0
  } = metrics;

  const MetricCard = ({ title, value, unit, icon, color = 'blue' }) => {
    const colors = {
      blue: 'bg-blue-900 border-blue-500',
      green: 'bg-green-900 border-green-500',
      yellow: 'bg-yellow-900 border-yellow-500',
      purple: 'bg-purple-900 border-purple-500',
      red: 'bg-red-900 border-red-500'
    };

    return (
      <div className={`${colors[color]} border-2 rounded-lg p-4 text-center`}>
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-2xl font-bold text-white">
          {typeof value === 'number' ? value.toFixed(2) : value}
          <span className="text-sm font-normal text-gray-300 ml-1">{unit}</span>
        </div>
        <div className="text-sm text-gray-300 mt-1">{title}</div>
      </div>
    );
  };

  const ProcessTable = () => {
    const completedProcesses = processes.filter(p => p.completionTime !== undefined && p.completionTime > 0);
    
    if (completedProcesses.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">⏳</div>
          <div>No processes completed yet</div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-gray-300">Process</th>
              <th className="text-right py-2 px-3 text-gray-300">Arrival</th>
              <th className="text-right py-2 px-3 text-gray-300">Burst</th>
              <th className="text-right py-2 px-3 text-gray-300">Completion</th>
              <th className="text-right py-2 px-3 text-gray-300">Turnaround</th>
              <th className="text-right py-2 px-3 text-gray-300">Waiting</th>
              <th className="text-right py-2 px-3 text-gray-300">Response</th>
            </tr>
          </thead>
          <tbody>
            {completedProcesses.map((process) => (
              <tr key={process.id} className="border-b border-gray-800">
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{process.icon || '⚡'}</span>
                    <span className="text-white font-medium">{process.name}</span>
                  </div>
                </td>
                <td className="text-right py-2 px-3 text-gray-300">{process.arrivalTime}</td>
                <td className="text-right py-2 px-3 text-gray-300">{process.originalBurstTime}</td>
                <td className="text-right py-2 px-3 text-green-400">{process.completionTime}</td>
                <td className="text-right py-2 px-3 text-blue-400">{process.turnaroundTime}</td>
                <td className="text-right py-2 px-3 text-yellow-400">{process.waitingTime}</td>
                <td className="text-right py-2 px-3 text-purple-400">{process.responseTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Algorithm Info */}
      <SpaceCard>
        <div className="text-center">
          <GradientText className="text-2xl font-bold mb-2">
            📊 Performance Metrics
          </GradientText>
          <div className="text-gray-400">
            Algorithm: <span className="text-white font-semibold">{algorithm}</span>
          </div>
        </div>
      </SpaceCard>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Avg Waiting Time"
          value={averageWaitingTime}
          unit="ms"
          icon="⏱️"
          color="yellow"
        />
        <MetricCard
          title="Avg Turnaround Time"
          value={averageTurnaroundTime}
          unit="ms"
          icon="🔄"
          color="blue"
        />
        <MetricCard
          title="Avg Response Time"
          value={averageResponseTime}
          unit="ms"
          icon="⚡"
          color="purple"
        />
        <MetricCard
          title="CPU Utilization"
          value={cpuUtilization}
          unit="%"
          icon="💻"
          color="green"
        />
        <MetricCard
          title="Throughput"
          value={throughput}
          unit="proc/ms"
          icon="🚀"
          color="red"
        />
      </div>

      {/* Process Details Table */}
      <SpaceCard>
        <h3 className="text-lg font-bold mb-4 text-white">
          📋 Process Details
        </h3>
        <ProcessTable />
      </SpaceCard>

      {/* Algorithm Explanation */}
      <SpaceCard>
        <h3 className="text-lg font-bold mb-4 text-white">
          ℹ️ Algorithm Information
        </h3>
        <div className="space-y-2 text-gray-300 text-sm">
          {algorithm === 'FCFS' && (
            <div>
              <strong>First-Come-First-Served:</strong> Processes are executed in the order they arrive. 
              Simple but can cause long waiting times for short processes.
            </div>
          )}
          {algorithm === 'SJF' && (
            <div>
              <strong>Shortest Job First:</strong> Process with shortest burst time executes first. 
              Optimal for minimizing average waiting time.
            </div>
          )}
          {algorithm === 'SRTF' && (
            <div>
              <strong>Shortest Remaining Time First:</strong> Preemptive version of SJF. 
              If a shorter process arrives, it preempts the current process.
            </div>
          )}
          {algorithm === 'RR' && (
            <div>
              <strong>Round Robin:</strong> Each process gets a fixed time quantum. 
              Fair scheduling but may have higher turnaround times.
            </div>
          )}
          {algorithm === 'PRIORITY' && (
            <div>
              <strong>Priority Scheduling:</strong> Processes are executed based on priority. 
              Higher priority processes execute first.
            </div>
          )}
        </div>
      </SpaceCard>
    </div>
  );
};

export default SimpleMetricsDisplay;

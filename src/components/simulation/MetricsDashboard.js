/**
 * Metrics Dashboard Component
 * Shows real-time performance metrics and statistics
 */

import React from 'react';
import { SpaceCard, GradientText } from '@/themes/spaceTheme';

const MetricsDashboard = ({ metrics = {}, userMode = 'beginner' }) => {
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return typeof num === 'number' ? num.toFixed(2) : num;
  };

  const formatPercent = (num) => {
    if (num === undefined || num === null) return '0%';
    return `${(typeof num === 'number' ? num : 0).toFixed(1)}%`;
  };

  const MetricCard = ({ icon, title, value, color, description }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h4 className="text-sm font-medium text-gray-300">{title}</h4>
        </div>
      </div>
      <div className={`text-2xl font-bold ${color} mb-1`}>
        {value}
      </div>
      {description && (
        <div className="text-xs text-gray-400">{description}</div>
      )}
    </div>
  );

  const ProgressBar = ({ label, current, total, color }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{current} / {total}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${color}`}
          style={{
            width: `${total > 0 ? (current / total) * 100 : 0}%`
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-xl">📊</span>
          Performance Metrics
        </h3>
      </div>

      <div className="space-y-6">
        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            icon="⏰"
            title="Avg Turnaround Time"
            value={formatNumber(metrics.averageTurnaroundTime)}
            color="text-blue-400"
            description="Time from arrival to completion"
          />
          <MetricCard
            icon="🎯"
            title="Avg Waiting Time"
            value={formatNumber(metrics.averageWaitingTime)}
            color="text-yellow-400"
            description="Time spent waiting in ready queue"
          />
          
          {userMode !== 'beginner' && (
            <>
              <MetricCard
                icon="⚡"
                title="Avg Response Time"
                value={formatNumber(metrics.averageResponseTime)}
                color="text-green-400"
                description="Time from arrival to first execution"
              />
              <MetricCard
                icon="📊"
                title="CPU Utilization"
                value={formatPercent(metrics.cpuUtilization)}
                color="text-purple-400"
                description="Percentage of time CPU is busy"
              />
            </>
          )}
        </div>

        {/* Advanced Metrics */}
        {userMode === 'advanced' && (
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon="📈"
              title="Throughput"
              value={formatNumber(metrics.throughput)}
              color="text-indigo-400"
              description="Processes completed per time unit"
            />
            <MetricCard
              icon="🔄"
              title="Context Switches"
              value={metrics.contextSwitches || 0}
              color="text-red-400"
              description="Number of process switches"
            />
          </div>
        )}

        {/* Progress Tracking */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-4">Simulation Progress</h4>
          <ProgressBar
            label="Processes Completed"
            current={metrics.completedProcesses || 0}
            total={metrics.totalProcesses || 0}
            color="from-green-500 to-green-600"
          />
        </div>

        {/* Metric Explanations for Beginners */}
        {userMode === 'beginner' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">What do these metrics mean?</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div>
                <strong className="text-blue-400">Turnaround Time:</strong> How long each process takes from start to finish
              </div>
              <div>
                <strong className="text-yellow-400">Waiting Time:</strong> How long processes wait before getting CPU time
              </div>
              <div className="text-gray-500">
                Lower values are generally better for system performance
              </div>
            </div>
          </div>
        )}

        {/* Real-time Statistics */}
        {userMode !== 'beginner' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Real-time Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Turnaround:</span>
                  <span className="text-green-400">{formatNumber(metrics.bestTurnaroundTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Worst Turnaround:</span>
                  <span className="text-red-400">{formatNumber(metrics.worstTurnaroundTime)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Waiting:</span>
                  <span className="text-green-400">{formatNumber(metrics.bestWaitingTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Worst Waiting:</span>
                  <span className="text-red-400">{formatNumber(metrics.worstWaitingTime)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsDashboard;

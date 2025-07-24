import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const MemoryGrid = ({ physicalMemory, processColors }) => {
  const ref = useRef();

  useEffect(() => {
    if (!physicalMemory || !ref.current || !processColors) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const frameSize = 32;
    const framesPerRow = 8;
    const gap = 4;
    const width = framesPerRow * (frameSize + gap) - gap;
    const height = Math.ceil(physicalMemory.length / framesPerRow) * (frameSize + gap) - gap;

    svg.attr('width', width).attr('height', height);

    const frameGroups = svg.selectAll('g')
      .data(physicalMemory, (d, i) => `frame-${i}`);

    // ENTER
    const gEnter = frameGroups.enter()
      .append('g')
      .attr('class', 'memory-frame')
      .attr('transform', (d, i) => {
        const x = (i % framesPerRow) * (frameSize + gap);
        const y = Math.floor(i / framesPerRow) * (frameSize + gap);
        return `translate(${x}, ${y})`;
      });

    // Add frame rectangle
    gEnter.append('rect')
      .attr('width', frameSize)
      .attr('height', frameSize)
      .attr('rx', 4)
      .attr('stroke', '#a78bfa')
      .attr('stroke-width', 1)
      .attr('fill', '#374151');
    
    // Add frame number
    gEnter.append('text')
      .attr('class', 'frame-number')
      .attr('x', frameSize / 2)
      .attr('y', frameSize - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '8px')
      .text((d, i) => i);

    // Add process info text
    gEnter.append('text')
      .attr('class', 'process-info')
      .attr('x', frameSize / 2)
      .attr('y', frameSize / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold');

    // UPDATE
    const gUpdate = frameGroups.merge(gEnter);

    gUpdate.select('rect')
      .transition()
      .duration(300)
      .attr('fill', d => {
        if (!d || !d.processId) return '#374151';
        try {
          return processColors(d.processId);
        } catch (error) {
          console.warn('Error getting process color:', error);
          return '#7c3aed';
        }
      })
      .attr('stroke', d => d ? '#a78bfa' : '#4b5563');

    gUpdate.select('.process-info')
      .text(d => {
        if (!d || !d.processId) return '';
        return `${d.processId}:${d.pageNum}`;
      });

    // EXIT
    frameGroups.exit().remove();

  }, [physicalMemory, processColors]);

  if (!physicalMemory || !processColors) {
    return (
      <div className="flex items-center justify-center p-8 text-purple-200">
        <p>Loading memory grid...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg ref={ref} className="border border-purple-500/20 rounded-lg p-2 bg-slate-800/50"></svg>
      <div className="mt-4 text-xs text-purple-300 text-center">
        <p>Memory Frames (32 total)</p>
        <p className="text-purple-200/70">Gray: Free • Colored: Allocated</p>
      </div>
    </div>
  );
};

export default MemoryGrid;

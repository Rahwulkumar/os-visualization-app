import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ArrowRight } from 'lucide-react';

const MemoryExplainer = ({ onStartSimulation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [motionComponents, setMotionComponents] = useState(null);
  const svgRef = useRef();

  // Dynamically load framer-motion if available
  useEffect(() => {
    let isMounted = true;
    
    const loadFramerMotion = async () => {
      try {
        const framerMotion = await import('framer-motion');
        if (isMounted) {
          setMotionComponents({
            motion: framerMotion.motion
          });
        }
      } catch (error) {
        console.warn('framer-motion not available, using fallback components');
        if (isMounted) {
          setMotionComponents({
            motion: null
          });
        }
      }
    };
    
    loadFramerMotion();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Safe fallback component
  const createFallbackDiv = () => {
    const FallbackDiv = ({ children, className, ...props }) => {
      const { initial, animate, transition, ...divProps } = props;
      return <div className={className} {...divProps}>{children}</div>;
    };
    return FallbackDiv;
  };

  const MotionDiv = motionComponents?.motion?.div || createFallbackDiv();

  const steps = [
    {
      title: "Virtual Memory Overview",
      description: "Each process thinks it has access to all of memory, but the OS manages the reality behind the scenes."
    },
    {
      title: "Physical Memory Frames",
      description: "Real RAM is divided into fixed-size frames. The OS tracks which frames are free or occupied."
    },
    {
      title: "Address Translation",
      description: "The Memory Management Unit (MMU) translates virtual addresses to physical addresses using page tables."
    },
    {
      title: "Page Faults",
      description: "When a process accesses a page not in physical memory, the OS must handle the page fault and load the data."
    }
  ];

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 300;
    
    svg.attr('width', width).attr('height', height);
    svg.selectAll("*").remove();

    // Virtual Memory (show on step 0)
    if (currentStep >= 0) {
      const virtualGroup = svg.append("g")
        .attr("transform", `translate(50, 50)`);

      virtualGroup.append("rect")
        .attr("width", 120)
        .attr("height", 200)
        .attr("fill", "#3b82f6")
        .attr("opacity", 0.7)
        .attr("rx", 8);

      virtualGroup.append("text")
        .attr("x", 60)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text("Virtual");

      virtualGroup.append("text")
        .attr("x", 60)
        .attr("y", 45)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text("Memory");
    }

    // Physical Memory (show on step 1)
    if (currentStep >= 1) {
      const physicalGroup = svg.append("g")
        .attr("transform", `translate(430, 50)`);

      physicalGroup.append("rect")
        .attr("width", 120)
        .attr("height", 200)
        .attr("fill", "#10b981")
        .attr("opacity", 0.7)
        .attr("rx", 8);

      physicalGroup.append("text")
        .attr("x", 60)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text("Physical");

      physicalGroup.append("text")
        .attr("x", 60)
        .attr("y", 45)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text("Memory");
    }

    // Arrow (show on step 2)
    if (currentStep >= 2) {
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("markerWidth", 10)
        .attr("markerHeight", 7)
        .attr("refX", 9)
        .attr("refY", 3.5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,0L10,3.5L0,7")
        .attr("fill", "#f59e0b");

      svg.append("line")
        .attr("x1", 170)
        .attr("y1", 150)
        .attr("x2", 430)
        .attr("y2", 150)
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrowhead)");
    }

    // MMU Box (show on step 3)
    if (currentStep >= 3) {
      const mmuGroup = svg.append("g")
        .attr("transform", `translate(${width/2 - 75}, ${height/2 - 50})`);

      mmuGroup.append("rect")
        .attr("width", 150)
        .attr("height", 100)
        .attr("rx", 8)
        .attr("fill", "#1e293b")
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 4");

      mmuGroup.append("text")
        .attr("x", 75)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .attr("fill", "#fbbf24")
        .attr("font-weight", "bold")
        .attr("font-size", "16px")
        .text("MMU");
    }

  }, [currentStep]);

  const handleNext = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  const handlePrev = () => setCurrentStep(s => Math.max(s - 1, 0));

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-8">
      <MotionDiv 
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 max-w-2xl"
      >
        <h2 className="text-3xl font-bold text-purple-300 mb-2">{steps[currentStep].title}</h2>
        <p className="text-lg text-purple-100">{steps[currentStep].description}</p>
      </MotionDiv>

      <div className="bg-white/5 rounded-xl border border-purple-500/20 p-4">
        <svg ref={svgRef}></svg>
      </div>

      <div className="flex items-center space-x-8 mt-8">
        <button onClick={handlePrev} disabled={currentStep === 0} className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50 transition-colors hover:bg-white/20">Previous</button>
        <div className="flex space-x-2">
          {steps.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i === currentStep ? 'bg-purple-400' : 'bg-white/20'}`}></div>
          ))}
        </div>
        <button onClick={handleNext} disabled={currentStep === steps.length - 1} className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50 transition-colors hover:bg-white/20">Next</button>
      </div>

      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: currentStep === steps.length - 1 ? 1 : 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <button
          onClick={onStartSimulation}
          className="group bg-gradient-to-r from-green-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-transform transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <ArrowRight className="w-5 h-5" />
            <span>Start Simulation</span>
          </div>
        </button>
      </MotionDiv>
    </div>
  );
};

export default MemoryExplainer;
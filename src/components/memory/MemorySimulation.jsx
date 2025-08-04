import React, { useState } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
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
  Database,
  Play,
  Pause,
  RotateCcw
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

const VirtualMemoryVisualization = () => {
  return (
    <div className="relative h-32 bg-slate-800 rounded-lg overflow-hidden">
      {/* Virtual Address Space */}
      <div className="absolute left-2 top-2 w-1/3 h-28">
        <div className="text-xs text-cyan-300 mb-1 font-semibold">Virtual Address Space</div>
        <div className="space-y-1">
          <motion.div 
            className="h-6 bg-cyan-500 rounded flex items-center justify-center text-xs font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Process A
          </motion.div>
          <motion.div 
            className="h-6 bg-green-500 rounded flex items-center justify-center text-xs font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            Process B
          </motion.div>
          <motion.div 
            className="h-6 bg-amber-500 rounded flex items-center justify-center text-xs font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            Process C
          </motion.div>
        </div>
      </div>

      {/* Translation Arrow */}
      <div className="absolute left-1/3 top-1/2 transform -translate-y-1/2">
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-purple-400 text-xl font-bold"
        >
          →
        </motion.div>
        <div className="text-xs text-purple-300 mt-1">MMU</div>
      </div>

      {/* Physical Memory */}
      <div className="absolute right-2 top-2 w-1/3 h-28">
        <div className="text-xs text-green-300 mb-1 font-semibold">Physical Memory</div>
        <div className="grid grid-cols-2 gap-1 h-24">
          <motion.div 
            className="bg-cyan-600 rounded flex items-center justify-center text-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            A
          </motion.div>
          <motion.div 
            className="bg-slate-600 rounded flex items-center justify-center text-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
          >
            Free
          </motion.div>
          <motion.div 
            className="bg-amber-600 rounded flex items-center justify-center text-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
          >
            C
          </motion.div>
          <motion.div 
            className="bg-green-600 rounded flex items-center justify-center text-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 }}
          >
            B
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const PageFaultVisualization = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { title: "Page Access", desc: "CPU tries to access page 5" },
    { title: "Page Fault", desc: "Page not in memory - interrupt!" },
    { title: "Load from Disk", desc: "OS loads page from storage" },
    { title: "Update Page Table", desc: "Page table entry updated" },
    { title: "Resume Execution", desc: "CPU continues execution" }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-32 bg-slate-800 rounded-lg overflow-hidden p-4">
      <div className="flex justify-between items-center h-full">
        {/* CPU */}
        <div className="text-center">
          <motion.div 
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
              currentStep === 0 || currentStep === 4 ? 'bg-blue-500' : 'bg-blue-500/50'
            }`}
            animate={{ scale: currentStep === 0 || currentStep === 4 ? 1.1 : 1 }}
          >
            CPU
          </motion.div>
          <div className="text-xs text-blue-300 mt-1">Processor</div>
        </div>

        {/* Memory */}
        <div className="text-center">
          <motion.div 
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
              currentStep === 1 || currentStep === 3 ? 'bg-red-500' : 'bg-green-500'
            }`}
            animate={{ scale: currentStep === 1 || currentStep === 3 ? 1.1 : 1 }}
          >
            RAM
          </motion.div>
          <div className="text-xs text-green-300 mt-1">Memory</div>
        </div>

        {/* Disk */}
        <div className="text-center">
          <motion.div 
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
              currentStep === 2 ? 'bg-amber-500' : 'bg-amber-500/50'
            }`}
            animate={{ scale: currentStep === 2 ? 1.1 : 1 }}
          >
            DISK
          </motion.div>
          <div className="text-xs text-amber-300 mt-1">Storage</div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
        <div className="text-xs text-purple-300 text-center">
          Step {currentStep + 1}: {steps[currentStep].title}
        </div>
      </div>

      {/* Loading indicator for disk access */}
      {currentStep === 2 && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full"></div>
        </motion.div>
      )}
    </div>
  );
};

const SimulationStep = ({ title, description, isActive }) => (
    <motion.div
        className={`flex items-start gap-4 p-3 rounded-lg transition-all ${isActive ? 'bg-purple-500/20' : ''}`}
        animate={{ scale: isActive ? 1.03 : 1 }}
    >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0 ${isActive ? 'bg-purple-500' : 'bg-slate-600'}`}>
            {isActive && <motion.div className="w-3 h-3 bg-white rounded-full" layoutId="active-step-indicator" />}
        </div>
        <div>
            <h4 className="font-bold text-purple-200">{title}</h4>
            <p className="text-sm text-purple-300/80">{description}</p>
        </div>
    </motion.div>
);

const AddressComponent = ({ title, items, type, highlightedIndex }) => (
    <div className="bg-white/5 rounded-xl p-4 h-full">
        <h3 className="text-xl font-bold text-cyan-300 mb-4 text-center">{title}</h3>
        <div className="space-y-1">
            {items.map((item, i) => (
                <motion.div
                    key={i}
                    className={`p-1.5 rounded text-xs flex justify-between items-center transition-all duration-300
                        ${type === 'vas' ? (item.inMemory ? 'bg-green-500/20' : 'bg-cyan-500/20') : ''}
                        ${type === 'page-table' ? 'bg-purple-500/10' : ''}
                        ${highlightedIndex === i ? 'ring-2 ring-yellow-400' : ''}
                    `}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    {type === 'vas' && <><span>Page {i}: {item.name}</span> {item.inMemory && <ShieldCheck className="w-3 h-3 text-green-400" />}</>}
                    {type === 'page-table' && <><span>VP {item.virtualPage} →</span> <span className="font-bold">{item.valid ? `PF ${item.physicalFrame}` : 'On Disk'}</span></>}
                </motion.div>
            ))}
        </div>
    </div>
);

const PhysicalMemoryGrid = ({ memory, highlightedFrame }) => (
    <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-xl font-bold text-green-300 mb-4 text-center">Physical RAM</h3>
        <div className="grid grid-cols-8 gap-2">
            {memory.map((frame, i) => (
                <motion.div
                    key={i}
                    className={`h-8 rounded flex items-center justify-center text-xs font-bold relative transition-all duration-300
                        ${frame.process === 'OS' ? 'bg-purple-600' : ''}
                        ${frame.process === 'Browser' ? 'bg-blue-500' : ''}
                        ${!frame.process ? 'bg-slate-700' : ''}
                        ${highlightedFrame === i ? 'ring-2 ring-yellow-400 scale-110 z-10' : ''}
                    `}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    title={`Frame ${i}: ${frame.process ? `Used by ${frame.process}` : 'Free'}`}
                >
                    {frame.process === 'OS' && 'OS'}
                    {frame.process === 'Browser' && `P${frame.pageNumber}`}
                </motion.div>
            ))}
        </div>
    </div>
);

const EventLog = ({ logs }) => (
    <div className="bg-black/20 rounded-xl p-4 mt-4">
        <h4 className="font-semibold text-amber-300 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Event Log</h4>
        <div className="text-xs text-amber-200/80 space-y-1 max-h-24 overflow-y-auto">
            <AnimatePresence initial={false}>
                {logs.map((log) => (
                    <motion.p
                        key={log.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {log.message}
                    </motion.p>
                ))}
            </AnimatePresence>
        </div>
    </div>
);

const InteractiveVisualization = ({ onBackToIntroduction }) => {
    const [simState, setSimState] = useState('idle'); // idle, running, fault, done
    const [currentStep, setCurrentStep] = useState(0);
    const [logs, setLogs] = useState([]);

    const BROWSER_PAGES = [
        { name: 'Core UI', essential: true }, { name: 'Renderer', essential: true },
        { name: 'Network Stack', essential: true }, { name: 'JavaScript Engine', essential: true },
        { name: 'Image Decoder' }, { name: 'Video Player' }, { name: 'Ad Blocker' },
        { name: 'History Service' }, { name: 'Bookmark Manager' }, { name: 'Tab 1 Data' },
        { name: 'Tab 2 Data' }, { name: 'Cache Manager' }
    ];

    const [virtualAddressSpace, setVirtualAddressSpace] = useState([]);
    const [pageTable, setPageTable] = useState([]);
    const [physicalMemory, setPhysicalMemory] = useState(() => 
        Array.from({ length: 64 }, (_, i) => ({ process: i < 8 ? 'OS' : null, pageNumber: null }))
    );
    const [highlighted, setHighlighted] = useState({ vas: null, table: null, ram: null });

    const addLog = (message) => setLogs(prev => [{ id: `${Date.now()}-${Math.random()}`, message }, ...prev.slice(0, 20)]);

    const resetSimulation = () => {
        setSimState('idle');
        setCurrentStep(0);
        setLogs([]);
        setVirtualAddressSpace([]);
        setPageTable([]);
        setPhysicalMemory(Array.from({ length: 64 }, (_, i) => ({ process: i < 8 ? 'OS' : null, pageNumber: null })));
        setHighlighted({ vas: null, table: null, ram: null });
        addLog("Simulation reset. Click 'Launch Browser' to start.");
    };

    React.useEffect(() => {
        addLog("Welcome! This simulation shows how memory is managed when you launch an app.");
    }, []);

    const runStep = (step) => {
        if (step > simulationSteps.length - 1) {
            setSimState('done');
            return;
        }
        setCurrentStep(step);
        simulationSteps[step].action();
    };

    const simulationSteps = [
        {
            title: "Launch Browser",
            description: "The user clicks the browser icon, telling the OS to start the application.",
            action: () => {
                addLog("User requests to launch the browser.");
                setTimeout(() => runStep(1), 1500);
            }
        },
        {
            title: "Create Virtual Address Space",
            description: "The OS creates a private, virtual memory space for the browser. This is just a logical map, no physical memory is used yet.",
            action: () => {
                addLog("OS creates a large Virtual Address Space for the browser.");
                setVirtualAddressSpace(BROWSER_PAGES.map(p => ({ ...p, inMemory: false })));
                setPageTable(BROWSER_PAGES.map((_, i) => ({ virtualPage: i, physicalFrame: null, valid: false })));
                setTimeout(() => runStep(2), 2000);
            }
        },
        {
            title: "Demand Paging",
            description: "To save time and memory, the OS only loads essential pages into RAM. This is called 'Demand Paging'.",
            action: () => {
                addLog("Using Demand Paging to load only essential browser components.");
                const essentials = BROWSER_PAGES.map((p, i) => ({...p, index: i})).filter(p => p.essential);
                
                let currentDelay = 0;
                essentials.forEach((page) => {
                    setTimeout(() => {
                        setPhysicalMemory(prevMem => {
                            const newMemory = [...prevMem];
                            const freeFrameIndex = newMemory.findIndex(f => !f.process);
                            if (freeFrameIndex !== -1) {
                                addLog(`Loading '${page.name}' (VP ${page.index}) into Physical Frame ${freeFrameIndex}.`);
                                newMemory[freeFrameIndex] = { process: 'Browser', pageNumber: page.index };
                                
                                setVirtualAddressSpace(prevVas => {
                                    const newVas = [...prevVas];
                                    if(newVas[page.index]) newVas[page.index].inMemory = true;
                                    return newVas;
                                });
                                setPageTable(prevTable => {
                                    const newTable = [...prevTable];
                                    if(newTable[page.index]) newTable[page.index] = { virtualPage: page.index, physicalFrame: freeFrameIndex, valid: true };
                                    return newTable;
                                });
                                setHighlighted({ vas: page.index, table: page.index, ram: freeFrameIndex });
                            }
                            return newMemory;
                        });
                    }, currentDelay);
                    currentDelay += 1000;
                });

                setTimeout(() => {
                    setHighlighted({ vas: null, table: null, ram: null });
                    addLog("Browser is running! Only essential parts are in RAM.");
                    setSimState('running');
                    runStep(3);
                }, currentDelay);
            }
        },
        {
            title: "Application Running",
            description: "The browser is now running. The user can interact with it. What happens when they do something that needs a non-loaded page?",
            action: () => {}
        },
        {
            title: "Page Fault",
            description: "The user tries to watch a video. The CPU needs the 'Video Player' page, but it's not in RAM. This triggers a 'Page Fault' interrupt.",
            action: () => {
                addLog("User action requires 'Video Player' page (VP 5).");
                const videoPageIdx = 5;
                setHighlighted({ vas: videoPageIdx, table: videoPageIdx, ram: null });
                addLog("CPU requests VP 5. Page table shows it's not valid. PAGE FAULT!");
                setTimeout(() => runStep(5), 2000);
            }
        },
        {
            title: "OS Handles Fault",
            description: "The OS takes over. It finds a free frame in RAM, loads the 'Video Player' page from the disk, and updates the page table.",
            action: () => {
                addLog("OS is handling the page fault.");
                const videoPageIdx = 5;

                setPhysicalMemory(prevMem => {
                    const newMemory = [...prevMem];
                    const freeFrame = newMemory.findIndex(f => !f.process);

                    if (freeFrame === -1) {
                        addLog("No free frames! Page replacement would be needed here.");
                        return prevMem;
                    }

                    addLog(`Found free Frame ${freeFrame}. Loading 'Video Player' from disk into RAM.`);
                    newMemory[freeFrame] = { process: 'Browser', pageNumber: videoPageIdx };

                    setVirtualAddressSpace(prevVas => {
                        const newVas = [...prevVas];
                        if(newVas[videoPageIdx]) newVas[videoPageIdx].inMemory = true;
                        return newVas;
                    });

                    setPageTable(prevTable => {
                        const newTable = [...prevTable];
                        if(newTable[videoPageIdx]) newTable[videoPageIdx] = { virtualPage: videoPageIdx, physicalFrame: freeFrame, valid: true };
                        return newTable;
                    });

                    setHighlighted({ vas: videoPageIdx, table: videoPageIdx, ram: freeFrame });

                    setTimeout(() => {
                        addLog("Page table updated. The instruction can now be completed.");
                        setHighlighted({ vas: null, table: null, ram: null });
                        setSimState('running');
                        runStep(6);
                    }, 2000);

                    return newMemory;
                });
            }
        },
        {
            title: "Simulation Complete",
            description: "You've seen how virtual memory, demand paging, and page faults work together to run applications efficiently!",
            action: () => {
                setSimState('done');
            }
        }
    ];

    const handlePrimaryAction = () => {
        if (simState === 'idle') {
            setSimState('running');
            runStep(0);
        } else if (simState === 'running' && currentStep === 3) {
            setSimState('fault');
            runStep(4);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-purple-300">A Beginner's Guide to Memory Management</h1>
                    <button onClick={onBackToIntroduction} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                        ← Back to Introduction
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Simulation Steps & Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/5 rounded-xl p-4">
                            <h3 className="text-xl font-bold text-purple-200 mb-4">Simulation Story: Launching a Browser</h3>
                            <div className="space-y-2">
                                {simulationSteps.map((step, i) => (
                                    <SimulationStep key={i} {...step} isActive={i === currentStep} />
                                ))}
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={handlePrimaryAction}
                                    disabled={simState !== 'idle' && !(simState === 'running' && currentStep === 3)}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                                >
                                    {simState === 'idle' && "Launch Browser"}
                                    {simState === 'running' && currentStep === 3 && "Watch Video (Trigger Fault)"}
                                    {simState === 'fault' && "Handling Fault..."}
                                    {simState === 'done' && "Finished!"}
                                </button>
                                <button onClick={resetSimulation} className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg"><RotateCcw className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Middle & Right Columns: Visualizations */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <AddressComponent title="Virtual Address Space" items={virtualAddressSpace} type="vas" highlightedIndex={highlighted.vas} />
                            <AddressComponent title="Page Table" items={pageTable} type="page-table" highlightedIndex={highlighted.table} />
                            <div className="md:col-span-3">
                                <PhysicalMemoryGrid memory={physicalMemory} highlightedFrame={highlighted.ram} />
                            </div>
                        </div>
                        <EventLog logs={logs} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MemorySimulation = ({ onBackToExplainer }) => {
  const [currentView, setCurrentView] = useState('introduction');

  const handleLaunchVisualization = () => {
    setCurrentView('visualization');
  };

  const handleBackToIntroduction = () => {
    setCurrentView('introduction');
  };

  if (currentView === 'visualization') {
    return <InteractiveVisualization onBackToIntroduction={handleBackToIntroduction} />;
  }

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
                <VirtualMemoryVisualization />
                <p className="text-xs text-cyan-400 mt-3 text-center">
                  Virtual addresses mapped to physical memory through MMU
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                <h2 className="text-4xl font-bold text-cyan-300">Virtual Memory</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  The OS solves this with a powerful abstraction: <strong className="text-cyan-200">Virtual Memory</strong>. 
                  It gives every process its own private, seemingly unlimited address space.
                </p>
                <p>
                  This provides complete <strong className="text-cyan-200">isolation</strong>. Process A cannot 
                  see or touch Process B's memory, which is fundamental for security and stability.
                </p>
                <p>
                  The Memory Management Unit (MMU) translates virtual addresses to physical addresses, 
                  allowing non-contiguous memory allocation while maintaining the illusion of linear memory.
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
                <BookOpen className="w-8 h-8 text-purple-400" />
                <h2 className="text-4xl font-bold text-purple-300">Paging Mechanism</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  This illusion is achieved through <strong className="text-purple-200">Paging</strong>. 
                  The OS divides virtual address spaces into fixed-size blocks called pages (typically 4KB).
                </p>
                <p>
                  A per-process <strong className="text-purple-200">page table</strong> acts as a translator, 
                  mapping each virtual page to a physical frame in memory.
                </p>
                <p>
                  This allows a process's memory to be scattered throughout physical RAM non-contiguously, 
                  maximizing efficiency and eliminating fragmentation.
                </p>
              </div>
            </div>
            <div>
              <div className="bg-white/5 p-6 rounded-xl border border-purple-500/30">
                <h3 className="text-center font-semibold text-white mb-4">Page Table Mapping</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-purple-300">
                    <div>Virtual Page</div>
                    <div>→</div>
                    <div>Physical Frame</div>
                  </div>
                  {[
                    { vPage: '0', pFrame: '3', valid: true },
                    { vPage: '1', pFrame: '7', valid: true },
                    { vPage: '2', pFrame: '-', valid: false },
                    { vPage: '3', pFrame: '1', valid: true },
                    { vPage: '4', pFrame: '5', valid: true }
                  ].map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className={`grid grid-cols-3 gap-2 text-center py-1 rounded ${
                        entry.valid ? 'bg-purple-600/20' : 'bg-red-600/20'
                      }`}
                    >
                      <div className="text-purple-200 text-sm">{entry.vPage}</div>
                      <div className="text-purple-400">→</div>
                      <div className={`text-sm ${entry.valid ? 'text-green-300' : 'text-red-300'}`}>
                        {entry.pFrame}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-purple-400 mt-3 text-center">
                  Page table translates virtual to physical addresses
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Demand Paging */}
        <AnimatedSection delay={0.5}>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Cpu className="w-8 h-8 text-green-400" />
                <h2 className="text-4xl font-bold text-green-300">Demand Paging</h2>
              </div>
              <div className="space-y-4 text-lg text-purple-200/90 leading-relaxed">
                <p>
                  Not all pages need to be in memory at once. <strong className="text-green-200">Demand paging</strong> 
                  loads pages only when they're accessed, maximizing memory efficiency.
                </p>
                <p>
                  When a process accesses a page that's not in memory, a <strong className="text-green-200">page fault</strong> 
                  occurs. The OS handles this by loading the required page from disk.
                </p>
                <p>
                  This mechanism allows running programs larger than available physical memory, 
                  creating the illusion of unlimited memory space.
                </p>
              </div>
            </div>
            <div>
              <div className="bg-white/5 p-6 rounded-xl border border-green-500/30">
                <h3 className="text-center font-semibold text-white mb-4">Page Fault Handling</h3>
                <PageFaultVisualization />
                <p className="text-xs text-green-400 mt-3 text-center">
                  OS loads missing pages from disk when needed
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
              onClick={handleLaunchVisualization}
              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl shadow-purple-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3">
                <span>Launch Interactive Visualization</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
            
            {onBackToExplainer && (
              <div className="mt-4">
                <button
                  onClick={onBackToExplainer}
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  ← Back to Overview
                </button>
              </div>
            )}
          </div>
        </AnimatedSection>

      </div>
    </div>
  );
};

export default MemorySimulation;

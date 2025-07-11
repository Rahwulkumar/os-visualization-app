import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SpaceCard, SpaceButton, GradientText, StarField, NebulaBackground } from '../themes/spaceTheme';
import { spaceColors } from '../themes/spaceTheme';

// Deletion Step Enumeration
const DeletionStep = {
  USER_REQUEST: 0,
  PERMISSION_CHECK: 1,
  LOCATE_INODE: 2,
  DEALLOCATE_BLOCKS: 3,
  UPDATE_DIRECTORY: 4,
  FREE_INODE: 5,
  UPDATE_SUPERBLOCK: 6,
  RESPONSE_TO_USER: 7
};

// Storage constants
const STORAGE_KEY = 'fsVisualization_files';
const DEFAULT_STORAGE_LIMIT = 2000;

// Utility functions for storage management
const getStoredData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      files: [],
      storageLimit: DEFAULT_STORAGE_LIMIT,
      totalUsed: 0
    };
  } catch (error) {
    return {
      files: [],
      storageLimit: DEFAULT_STORAGE_LIMIT,
      totalUsed: 0
    };
  }
};

const saveStoredData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// File system components data
const getInitialFileSystem = (storedFiles) => {
  const baseInodes = 3;
  const usedInodes = baseInodes + storedFiles.length;
  const baseBlocks = 4;
  const usedBlocks = baseBlocks + storedFiles.length;
  
  return {
    superblock: {
      totalInodes: 1000,
      freeInodes: 1000 - usedInodes,
      totalBlocks: 5000,
      freeBlocks: 5000 - usedBlocks,
      blockSize: 4096
    },
    inodeTable: [
      { id: 1, type: 'directory', permissions: '0755', size: 4096, blocks: [1], owner: 'root' },
      { id: 5, type: 'directory', permissions: '0755', size: 4096, blocks: [2], owner: 'user' },
      { id: 8, type: 'file', permissions: '0644', size: 2048, blocks: [3], owner: 'user' },
      ...storedFiles.map((file, index) => ({
        id: 10 + index,
        type: 'file',
        permissions: '0644',
        size: file.size * 1024,
        blocks: [4 + index],
        owner: 'user',
        name: file.name,
        created: file.created
      }))
    ],
    directoryTable: {
      '/': [{ name: 'home', inode: 5 }],
      '/home/user': [
        { name: 'document.txt', inode: 8 },
        ...storedFiles.map((file, index) => ({ name: file.name, inode: 10 + index }))
      ]
    },
    diskBlocks: Array(100).fill(null).map((_, i) => ({
      id: i,
      used: i < (4 + storedFiles.length),
      data: i < 4 ? 'system data' : (i < 4 + storedFiles.length ? `${storedFiles[i - 4]?.name} data` : null)
    }))
  };
};

const FileDeletionVisualization = ({ selectedFile, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(DeletionStep.USER_REQUEST);
  const [mode, setMode] = useState('beginner'); // 'beginner' or 'intermediate'
  const [fileSystem, setFileSystem] = useState(null);
  const [currentEvent, setCurrentEvent] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [fileDeletionComplete, setFileDeletionComplete] = useState(false);
  const [targetInode, setTargetInode] = useState(null);
  const [freedBlocks, setFreedBlocks] = useState([]);
  
  // Storage management state
  const [storedData, setStoredData] = useState(getStoredData());
  
  // Initialize file system with stored files
  useEffect(() => {
    const stored = getStoredData();
    setStoredData(stored);
    setFileSystem(getInitialFileSystem(stored.files));
  }, []);

  const [metrics, setMetrics] = useState({
    filesInFolder: 1 + storedData.files.length,
    diskSpaceUsed: `${((storedData.totalUsed / storedData.storageLimit) * 100).toFixed(2)}%`,
    inodeUsed: null,
    freeBlocks: 5000 - (4 + storedData.files.length),
    directoryLinkCount: 1 + storedData.files.length,
    storageUsed: storedData.totalUsed,
    storageLimit: storedData.storageLimit,
    fileToDelete: selectedFile
  });

  const stepDescriptions = useMemo(() => ([
    {
      title: "User Request",
      description: "User initiates file deletion",
      beginnerFeedback: `You requested to delete the file '${selectedFile?.name}' from the folder.`,
      intermediateFeedback: `The application issues unlink() system call to delete '${selectedFile?.name}'.`,
      realWorldContext: "This is like moving a file to the trash or recycle bin.",
      detailedExplanation: {
        beginner: `When you want to delete a file, you right-click and select delete, or press the delete key. This sends a request to the operating system to remove the file from the file system. The computer needs to carefully clean up all references to this file.`,
        intermediate: `The application calls the unlink() system call, which removes a directory entry and decreases the link count of the corresponding inode. If the link count reaches zero and no processes have the file open, the inode and its data blocks are freed. The system call transitions from user mode to kernel mode for processing.`
      }
    },
    {
      title: "Permission Check", 
      description: "OS verifies delete permissions",
      beginnerFeedback: "The system checks if you can delete files from this folder. Permission granted!",
      intermediateFeedback: "The OS checks the parent directory's inode (#5) for write permissions (rwx).",
      realWorldContext: "The system verifies you have permission to modify the folder contents.",
      detailedExplanation: {
        beginner: `Before deleting any file, the computer checks if you're allowed to remove files from that folder. It's like checking if you have permission to take something out of a room. The system looks at the folder's settings to see if you can modify its contents.`,
        intermediate: `The kernel examines the parent directory's inode to verify write permissions. Since deleting a file modifies the directory contents, write permission on the directory is required. The system checks the permission bits and compares them against the current user's credentials (UID/GID).`
      }
    },
    {
      title: "Locate Inode",
      description: "Find and examine the file's inode", 
      beginnerFeedback: `The system finds the file record for '${selectedFile?.name}' and prepares to remove it.`,
      intermediateFeedback: `The OS locates inode #${selectedFile ? 10 + storedData.files.findIndex(f => f.name === selectedFile.name) : 'X'} and reads its metadata.`,
      realWorldContext: "The system finds the file's information card to see what needs to be cleaned up.",
      detailedExplanation: {
        beginner: `The computer needs to find the file's "information card" (which contains details like size, location, and permissions) before it can delete the file. This card tells the system exactly what needs to be cleaned up and where the file's data is stored on the disk.`,
        intermediate: `The OS traverses the directory structure to locate the target inode. It reads the inode to determine the file's size, block pointers, and link count. This information is crucial for properly deallocating resources and ensuring no orphaned blocks remain after deletion.`
      }
    },
    {
      title: "Deallocate Data Blocks",
      description: "Free the file's storage space",
      beginnerFeedback: `The system marks the ${selectedFile?.size}KB of disk space used by '${selectedFile?.name}' as available for new files.`,
      intermediateFeedback: `The OS deallocates data blocks and updates the free block bitmap for ${selectedFile?.size}KB.`,
      realWorldContext: "The storage space is released and marked as available for reuse.",
      detailedExplanation: {
        beginner: `When a file is deleted, the space it was using on the hard drive needs to be made available for new files. The computer goes through each storage location the file was using and marks them as "free" so other files can use that space later. The actual data might still be there until overwritten.`,
        intermediate: `The OS iterates through the inode's block pointers and marks each referenced data block as free in the block bitmap. This process recovers ${selectedFile?.size}KB of storage space. The blocks are added to the free list for future allocation. Note that the actual data isn't immediately overwritten for performance reasons.`
      }
    },
    {
      title: "Update Directory",
      description: "Remove filename from directory listing",
      beginnerFeedback: `The file '${selectedFile?.name}' is removed from the folder's list of contents.`,
      intermediateFeedback: `The directory entry linking '${selectedFile?.name}' is removed from the directory table.`,
      realWorldContext: "The file disappears from the folder listing you see.",
      detailedExplanation: {
        beginner: `Now the computer removes the file's name from the folder's table of contents. This is like erasing the file name from the folder's list. After this step, when you look inside the folder, you won't see the deleted file anymore because its entry has been removed.`,
        intermediate: `The directory entry that maps the filename to the inode number is removed from the parent directory. This breaks the namespace link between the human-readable filename and the system's internal inode reference. The directory's modification time is also updated to reflect this change.`
      }
    },
    {
      title: "Free Inode",
      description: "Return the inode to the free pool",
      beginnerFeedback: "The file's information record is cleared and marked as available for new files.",
      intermediateFeedback: `Inode #${selectedFile ? 10 + storedData.files.findIndex(f => f.name === selectedFile.name) : 'X'} is zeroed and returned to the free inode pool.`,
      realWorldContext: "The file's information card is destroyed and made available for reuse.",
      detailedExplanation: {
        beginner: `The file's "information card" is now cleaned and put back in the pile of blank cards that can be used for new files. This ensures that when someone creates a new file later, there will be a clean information card available to store its details.`,
        intermediate: `The inode is zeroed out to clear any remaining metadata and marked as free in the inode bitmap. This makes the inode available for allocation to new files. The free inode count in the superblock is incremented to reflect this newly available resource.`
      }
    },
    {
      title: "Update Superblock", 
      description: "Update file system metadata",
      beginnerFeedback: "The system updates its records to reflect the freed storage space and available file slots.",
      intermediateFeedback: `The superblock updates: Free Inodes = ${fileSystem?.superblock.freeInodes + 1}, Free Blocks = ${fileSystem?.superblock.freeBlocks + 1}.`,
      realWorldContext: "The system updates its storage tracking to show more space is available.",
      detailedExplanation: {
        beginner: `The computer updates its master record to show that one more file slot is now available and that ${selectedFile?.size}KB more storage space can be used. It's like updating an inventory list after returning supplies to the storage room.`,
        intermediate: `The superblock, which contains critical file system metadata, is updated to reflect the freed resources. Free inode and block counts are incremented, and the modification timestamp is updated. This ensures file system consistency and provides accurate space utilization information.`
      }
    },
    {
      title: "Response to User",
      description: "Confirm file deletion success",
      beginnerFeedback: `The file '${selectedFile?.name}' has been successfully deleted!`,
      intermediateFeedback: "The OS returns success status, confirming file deletion completion.",
      realWorldContext: "The file is permanently removed and the space is available for new files!",
      detailedExplanation: {
        beginner: `The computer confirms that the file has been successfully deleted! The file no longer appears in your folder, and all the space it was using is now available for new files. The deletion process is complete and irreversible (unless you have backups).`,
        intermediate: `The kernel returns a success status to the calling process, confirming that the unlink() operation completed successfully. All file system structures have been updated consistently, the namespace entry is removed, and resources are properly freed. The system call completes and returns to user mode.`
      }
    }
  ]), [selectedFile, storedData, fileSystem]);

  // Update file system state based on current step
  useEffect(() => {
    if (!selectedFile || !fileSystem) return;

    const currentStepDesc = stepDescriptions[currentStep];
    if (currentStepDesc) {
      setCurrentEvent(mode === 'beginner' ? currentStepDesc.beginnerFeedback : currentStepDesc.intermediateFeedback);
    }

    // Simulate step-specific operations
    switch(currentStep) {
      case DeletionStep.LOCATE_INODE:
        if (!targetInode) {
          const fileIndex = storedData.files.findIndex(f => f.name === selectedFile.name);
          if (fileIndex !== -1) {
            setTargetInode({
              id: 10 + fileIndex,
              ...storedData.files[fileIndex]
            });
          }
        }
        break;

      case DeletionStep.DEALLOCATE_BLOCKS:
        if (!freedBlocks.length) {
          const fileIndex = storedData.files.findIndex(f => f.name === selectedFile.name);
          if (fileIndex !== -1) {
            setFreedBlocks([4 + fileIndex]); // Block that was used by this file
          }
        }
        break;

      case DeletionStep.RESPONSE_TO_USER:
        if (!fileDeletionComplete) {
          // Actually delete the file from storage
          const updatedFiles = storedData.files.filter(f => f.name !== selectedFile.name);
          const updatedData = {
            ...storedData,
            files: updatedFiles,
            totalUsed: storedData.totalUsed - selectedFile.size
          };
          
          setStoredData(updatedData);
          saveStoredData(updatedData);
          setFileDeletionComplete(true);
          
          // Update metrics
          setMetrics(prev => ({
            ...prev,
            filesInFolder: 1 + updatedFiles.length,
            diskSpaceUsed: `${((updatedData.totalUsed / updatedData.storageLimit) * 100).toFixed(2)}%`,
            freeBlocks: 5000 - (4 + updatedFiles.length),
            directoryLinkCount: 1 + updatedFiles.length,
            storageUsed: updatedData.totalUsed
          }));
          
          // Update file system
          setFileSystem(getInitialFileSystem(updatedFiles));
        }
        break;
    }
  }, [currentStep, mode, selectedFile, storedData, fileSystem, stepDescriptions, targetInode, freedBlocks, fileDeletionComplete]);

  const nextStep = () => {
    if (currentStep < DeletionStep.RESPONSE_TO_USER) {
      setCurrentStep(currentStep + 1);
      setShowError(false);
      setErrorDetails(null);
      setErrorType(null);
    }
  };

  const prevStep = () => {
    if (currentStep > DeletionStep.USER_REQUEST) {
      setCurrentStep(currentStep - 1);
      setShowError(false);
      setErrorDetails(null);
      setErrorType(null);
    }
  };

  const resetVisualization = () => {
    setCurrentStep(DeletionStep.USER_REQUEST);
    setTargetInode(null);
    setFreedBlocks([]);
    setFileDeletionComplete(false);
    setShowError(false);
  };

  const isCompleted = currentStep === DeletionStep.RESPONSE_TO_USER && fileDeletionComplete;

  if (!selectedFile) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <StarField starCount={150} speed={0.3} />
        <NebulaBackground colors={['red-600', 'orange-600', 'yellow-600']} />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">No File Selected</h1>
          <p className="text-gray-300 mb-6">Please select a file to delete from the file system visualization.</p>
          <SpaceButton onClick={onCancel} variant="primary">
            Go Back
          </SpaceButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <StarField starCount={150} speed={0.3} />
      <NebulaBackground colors={['red-600', 'orange-600', 'yellow-600']} />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6">
            <GradientText gradient="from-red-500 to-orange-500">
              File Deletion Visualization
            </GradientText>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Explore the step-by-step process of deleting "{selectedFile.name}" from the file system
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900/50 rounded-full p-2 border border-white/10">
            <button
              onClick={() => setMode('beginner')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                mode === 'beginner' 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Beginner Mode
            </button>
            <button
              onClick={() => setMode('intermediate')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                mode === 'intermediate' 
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Intermediate Mode
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
          <div className="bg-gray-900/50 border border-white/20 rounded-lg px-4 py-2 text-white">
            <span className="text-gray-400">Deleting:</span> {selectedFile.name} ({selectedFile.size}KB)
          </div>
          <div className="flex gap-2">
            <SpaceButton 
              onClick={prevStep} 
              variant="secondary"
              className={currentStep === DeletionStep.USER_REQUEST ? 'opacity-50 cursor-not-allowed' : ''}
            >
              ← Previous
            </SpaceButton>
            <SpaceButton 
              onClick={nextStep} 
              variant="primary"
              className={currentStep === DeletionStep.RESPONSE_TO_USER ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Next →
            </SpaceButton>
          </div>
          <SpaceButton onClick={resetVisualization} variant="secondary">
            🔄 Reset
          </SpaceButton>
          <SpaceButton onClick={onCancel} variant="secondary">
            ← Back to Files
          </SpaceButton>
        </div>

        {/* Timeline Slider */}
        <div className="max-w-6xl mx-auto mb-8">
          <SpaceCard className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Deletion Process Timeline</h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {stepDescriptions.map((step, index) => (
                  <div key={index} className="flex-shrink-0 min-w-[140px]">
                    <button
                      onClick={() => setCurrentStep(index)}
                      className={`w-full p-2 text-xs rounded transition-all duration-300 ${
                        index === currentStep
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                          : index < currentStep
                          ? 'bg-red-600/50 text-white'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                      }`}
                    >
                      {step.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((currentStep + 1) / stepDescriptions.length) * 100, 100)}%` }}
              />
            </div>
          </SpaceCard>
        </div>

        {/* Main Visualization Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* File System Tree */}
          <SpaceCard className="lg:col-span-1" glowColor="red">
            <h3 className="text-xl font-bold mb-4">
              <GradientText gradient="from-red-500 to-orange-500">File System Tree</GradientText>
            </h3>
            <div className="space-y-2">
              {mode === 'beginner' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📁</span>
                    <span className="text-white">/home/user</span>
                  </div>
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📄</span>
                      <span className="text-gray-300">document.txt</span>
                    </div>
                    {storedData.files.map((file, index) => (
                      <div key={index} className={`flex items-center gap-2 transition-all duration-500 ${
                        file.name === selectedFile.name 
                          ? currentStep >= DeletionStep.UPDATE_DIRECTORY 
                            ? 'opacity-30 line-through'
                            : currentStep >= DeletionStep.USER_REQUEST
                            ? 'bg-red-900/30 border border-red-500/30 rounded p-1 -m-1'
                            : ''
                          : ''
                      }`}>
                        <span className="text-xl">📄</span>
                        <span className={`${file.name === selectedFile.name ? 'text-red-300' : 'text-blue-300'}`}>
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">({file.size}KB)</span>
                        {file.name === selectedFile.name && currentStep >= DeletionStep.USER_REQUEST && (
                          <span className="text-red-400 text-xs">🗑️</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="font-mono text-sm space-y-2">
                  <div className="text-white">/ (inode #1)</div>
                  <div className="ml-4 text-gray-300">└── home/ (inode #5)</div>
                  <div className="ml-8 text-gray-300">└── user/</div>
                  <div className="ml-12 text-gray-300">├── document.txt (inode #8)</div>
                  {storedData.files.map((file, index) => (
                    <div key={index} className={`ml-12 transition-all duration-500 ${
                      file.name === selectedFile.name 
                        ? currentStep >= DeletionStep.UPDATE_DIRECTORY 
                          ? 'opacity-30 line-through text-gray-600'
                          : currentStep >= DeletionStep.USER_REQUEST
                          ? 'text-red-300 bg-red-900/20 rounded p-1 -m-1'
                          : 'text-blue-300'
                        : 'text-blue-300'
                    }`}>
                      ├── {file.name} (inode #{10 + index}) [{file.size}KB]
                      {file.name === selectedFile.name && currentStep >= DeletionStep.USER_REQUEST && (
                        <span className="text-red-400 ml-2">🗑️</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SpaceCard>

          {/* Inode Table */}
          <SpaceCard className="lg:col-span-1" glowColor="orange">
            <h3 className="text-xl font-bold mb-4">
              <GradientText gradient="from-orange-500 to-yellow-500">
                {mode === 'beginner' ? 'File Records' : 'Inode Table'}
              </GradientText>
            </h3>
            <div className="space-y-3">
              {mode === 'beginner' ? (
                <div className="space-y-3">
                  <div className="bg-gray-800/50 p-3 rounded border border-white/10">
                    <div className="font-bold text-white">document.txt</div>
                    <div className="text-sm text-gray-300">Size: 2KB, Owner: You</div>
                  </div>
                  {storedData.files.map((file, index) => (
                    <div key={index} className={`p-3 rounded border transition-all duration-500 ${
                      file.name === selectedFile.name 
                        ? currentStep >= DeletionStep.FREE_INODE
                          ? 'bg-gray-800/20 border-gray-600/30 opacity-30'
                          : currentStep >= DeletionStep.LOCATE_INODE
                          ? 'bg-red-900/50 border-red-400/30'
                          : 'bg-gray-800/50 border-white/10'
                        : 'bg-gray-800/50 border-white/10'
                    }`}>
                      <div className={`font-bold ${
                        file.name === selectedFile.name 
                          ? currentStep >= DeletionStep.FREE_INODE 
                            ? 'text-gray-600 line-through'
                            : 'text-red-400'
                          : 'text-white'
                      }`}>
                        {file.name}
                      </div>
                      <div className={`text-sm ${
                        file.name === selectedFile.name 
                          ? currentStep >= DeletionStep.FREE_INODE 
                            ? 'text-gray-600'
                            : 'text-red-300'
                          : 'text-gray-300'
                      }`}>
                        Size: {file.size}KB, Owner: You
                      </div>
                      {file.name === selectedFile.name && currentStep >= DeletionStep.LOCATE_INODE && currentStep < DeletionStep.FREE_INODE && (
                        <div className="text-xs text-red-400 mt-1">⚠️ Marked for deletion</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b border-white/10">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Perms</th>
                        <th className="text-left p-2">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="p-2 text-white">#1</td>
                        <td className="p-2 text-gray-300">dir</td>
                        <td className="p-2 text-gray-300">0755</td>
                        <td className="p-2 text-gray-300">4KB</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-2 text-white">#5</td>
                        <td className="p-2 text-gray-300">dir</td>
                        <td className="p-2 text-gray-300">0755</td>
                        <td className="p-2 text-gray-300">4KB</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-2 text-white">#8</td>
                        <td className="p-2 text-gray-300">file</td>
                        <td className="p-2 text-gray-300">0644</td>
                        <td className="p-2 text-gray-300">2KB</td>
                      </tr>
                      {storedData.files.map((file, index) => {
                        const isTarget = file.name === selectedFile.name;
                        return (
                          <tr key={index} className={`border-b transition-all duration-500 ${
                            isTarget 
                              ? currentStep >= DeletionStep.FREE_INODE
                                ? 'border-gray-600/30 bg-gray-800/20 opacity-30'
                                : currentStep >= DeletionStep.LOCATE_INODE
                                ? 'border-red-400/30 bg-red-900/20'
                                : 'border-white/5'
                              : 'border-white/5'
                          }`}>
                            <td className={`p-2 ${
                              isTarget 
                                ? currentStep >= DeletionStep.FREE_INODE 
                                  ? 'text-gray-600 line-through'
                                  : 'text-red-400 font-bold'
                                : 'text-white'
                            }`}>
                              #{10 + index}
                            </td>
                            <td className={`p-2 ${
                              isTarget 
                                ? currentStep >= DeletionStep.FREE_INODE 
                                  ? 'text-gray-600'
                                  : 'text-red-300'
                                : 'text-gray-300'
                            }`}>
                              file
                            </td>
                            <td className={`p-2 ${
                              isTarget 
                                ? currentStep >= DeletionStep.FREE_INODE 
                                  ? 'text-gray-600'
                                  : 'text-red-300'
                                : 'text-gray-300'
                            }`}>
                              0644
                            </td>
                            <td className={`p-2 ${
                              isTarget 
                                ? currentStep >= DeletionStep.FREE_INODE 
                                  ? 'text-gray-600'
                                  : 'text-red-300'
                                : 'text-gray-300'
                            }`}>
                              {file.size}KB
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </SpaceCard>

          {/* Disk Blocks / Superblock */}
          <SpaceCard className="lg:col-span-1" glowColor="yellow">
            <h3 className="text-xl font-bold mb-4">
              <GradientText gradient="from-yellow-500 to-red-500">
                {mode === 'beginner' ? 'Storage Status' : 'Superblock & Disk'}
              </GradientText>
            </h3>
            {mode === 'beginner' ? (
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-white font-bold">File Count</div>
                  <div className="text-2xl text-orange-400">{metrics.filesInFolder - (currentStep >= DeletionStep.RESPONSE_TO_USER ? 1 : 0)}</div>
                  {currentStep >= DeletionStep.UPDATE_DIRECTORY && (
                    <div className="text-xs text-green-400">-1 file</div>
                  )}
                </div>
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-white font-bold">Storage Used</div>
                  <div className="text-lg text-purple-400">
                    {metrics.storageUsed - (currentStep >= DeletionStep.DEALLOCATE_BLOCKS ? selectedFile.size : 0)} / {metrics.storageLimit} KB
                  </div>
                  {currentStep >= DeletionStep.DEALLOCATE_BLOCKS && (
                    <div className="text-xs text-green-400">+{selectedFile.size}KB freed</div>
                  )}
                </div>
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-white font-bold">File Being Deleted</div>
                  <div className="text-lg text-red-400">{selectedFile.name} ({selectedFile.size} KB)</div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(((metrics.storageUsed - (currentStep >= DeletionStep.DEALLOCATE_BLOCKS ? selectedFile.size : 0)) / metrics.storageLimit) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xs text-gray-400 mb-2">SUPERBLOCK</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Free Inodes:</span>
                      <span className="text-white ml-1">
                        {fileSystem?.superblock.freeInodes + (currentStep >= DeletionStep.FREE_INODE ? 1 : 0)}
                      </span>
                      {currentStep >= DeletionStep.FREE_INODE && (
                        <span className="text-green-400 ml-1">(+1)</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-400">Free Blocks:</span>
                      <span className="text-white ml-1">
                        {fileSystem?.superblock.freeBlocks + (currentStep >= DeletionStep.DEALLOCATE_BLOCKS ? 1 : 0)}
                      </span>
                      {currentStep >= DeletionStep.DEALLOCATE_BLOCKS && (
                        <span className="text-green-400 ml-1">(+1)</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xs text-gray-400 mb-2">DISK BLOCKS</div>
                  <div className="grid grid-cols-10 gap-1">
                    {fileSystem?.diskBlocks.slice(0, 50).map((block, index) => {
                      const isFreedBlock = freedBlocks.includes(index);
                      return (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded transition-all duration-300 ${
                            isFreedBlock && currentStep >= DeletionStep.DEALLOCATE_BLOCKS
                              ? 'bg-green-500 animate-pulse'
                              : block.used 
                              ? 'bg-orange-500'
                              : 'bg-gray-700'
                          }`}
                          title={`Block ${index}: ${
                            isFreedBlock && currentStep >= DeletionStep.DEALLOCATE_BLOCKS 
                              ? 'Freed' 
                              : block.used 
                              ? 'Used' 
                              : 'Free'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </SpaceCard>
        </div>

        {/* Current Event Display */}
        <div className="max-w-6xl mx-auto mt-8">
          <SpaceCard className="text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-3">
                <GradientText gradient="from-red-500 to-orange-500">
                  Step {currentStep + 1}: {stepDescriptions[currentStep]?.title}
                </GradientText>
              </h3>
              <p className="text-gray-300 text-lg">{stepDescriptions[currentStep]?.description}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Event */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
                <h4 className="text-lg font-bold text-red-400 mb-2">What's Happening</h4>
                <p className="text-white">{currentEvent}</p>
                {stepDescriptions[currentStep] && (
                  <p className="text-gray-400 text-sm mt-2">
                    💡 {stepDescriptions[currentStep].realWorldContext}
                  </p>
                )}
              </div>

              {/* Detailed Explanation */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
                <h4 className="text-lg font-bold text-orange-400 mb-2">Detailed Explanation</h4>
                <p className="text-white text-sm leading-relaxed">
                  {stepDescriptions[currentStep]?.detailedExplanation?.[mode]}
                </p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center gap-4 mt-6">
              <SpaceButton 
                onClick={prevStep} 
                variant="secondary"
                className={currentStep === DeletionStep.USER_REQUEST ? 'opacity-50 cursor-not-allowed' : ''}
              >
                ← Previous Step
              </SpaceButton>
              <SpaceButton 
                onClick={nextStep} 
                variant="primary"
                className={currentStep === DeletionStep.RESPONSE_TO_USER ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Next Step →
              </SpaceButton>
            </div>
          </SpaceCard>
        </div>

        {/* Completion Summary */}
        {isCompleted && (
          <div className="max-w-6xl mx-auto mt-8">
            <SpaceCard className="text-center">
              <div className="text-6xl mb-4">🗑️</div>
              <h3 className="text-2xl font-bold mb-4">
                <GradientText gradient="from-red-500 to-orange-500">File Deletion Complete!</GradientText>
              </h3>
              <p className="text-gray-300 mb-6">
                Successfully deleted "{selectedFile.name}" from the file system
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10 mb-6">
                <h4 className="text-lg font-bold text-green-400 mb-2">Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">File Deleted:</span>
                    <div className="text-white font-bold">{selectedFile.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Space Freed:</span>
                    <div className="text-white font-bold">{selectedFile.size}KB</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Inode Freed:</span>
                    <div className="text-white font-bold">#{targetInode?.id}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <SpaceButton onClick={onComplete} variant="primary">
                  ✓ Done - Back to Files
                </SpaceButton>
                <SpaceButton onClick={resetVisualization} variant="secondary">
                  🔄 Show Again
                </SpaceButton>
              </div>
            </SpaceCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDeletionVisualization;

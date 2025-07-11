'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import FileDeletionVisualization from './FileDeletionVisualization';
import { 
  StarField, 
  NebulaBackground, 
  SpaceCard,
  GradientText,
  spaceColors,
  SpaceButton,
  MouseGlow
} from '../themes/spaceTheme';

// File system visualization states
const VisualizationStep = {
  USER_REQUEST: 0,
  PERMISSION_CHECK: 1,
  INODE_ALLOCATION: 2,
  DIRECTORY_UPDATE: 3,
  DISK_BLOCK_ALLOCATION: 4,
  SUPERBLOCK_UPDATE: 5,
  RESPONSE_TO_USER: 6,
  COMPLETED: 7
};

// Storage management
const STORAGE_KEY = 'fileSystemVisualization';
const DEFAULT_STORAGE_LIMIT = 1024; // KB
const FILE_SIZE_RANGE = { min: 1, max: 50 }; // KB per file

// File validation utilities
const RESERVED_NAMES = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
const INVALID_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;
const MAX_FILENAME_LENGTH = 255;
const MAX_PATH_LENGTH = 4096;

const validateFileName = (fileName) => {
  const errors = [];
  const warnings = [];

  // Check if empty
  if (!fileName || fileName.trim() === '') {
    errors.push('Filename cannot be empty');
    return { isValid: false, errors, warnings, sanitized: '' };
  }

  const trimmedName = fileName.trim();
  let sanitized = trimmedName;

  // Sanitize: Remove invalid characters
  if (INVALID_CHARS.test(sanitized)) {
    const invalidChars = sanitized.match(INVALID_CHARS);
    errors.push(`Invalid characters found: ${[...new Set(invalidChars)].join(', ')}`);
    sanitized = sanitized.replace(INVALID_CHARS, '');
  }

  // Sanitize: Remove leading/trailing spaces and dots
  if (sanitized.startsWith(' ') || sanitized.endsWith(' ')) {
    warnings.push('Filename has leading or trailing spaces');
    sanitized = sanitized.trim();
  }
  if (sanitized.endsWith('.')) {
    warnings.push('Filename ends with a dot');
    sanitized = sanitized.replace(/\.+$/, '');
  }

  // Check length after sanitization
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    errors.push(`Filename too long (${sanitized.length} > ${MAX_FILENAME_LENGTH} characters)`);
    sanitized = sanitized.substring(0, MAX_FILENAME_LENGTH);
  }

  // Check for reserved names and handle them
  const nameWithoutExt = sanitized.split('.')[0].toUpperCase();
  if (RESERVED_NAMES.includes(nameWithoutExt)) {
    errors.push(`"${nameWithoutExt}" is a reserved system name`);
    // Sanitize by adding prefix
    const extension = sanitized.includes('.') ? '.' + sanitized.split('.').pop() : '';
    const baseName = sanitized.split('.')[0];
    sanitized = `file_${baseName}${extension}`;
  }

  // Check if sanitized filename is empty
  if (!sanitized || sanitized.trim() === '') {
    errors.push('Filename becomes empty after removing invalid characters');
    sanitized = 'file.txt'; // Default filename
  }

  // Add extension if missing
  if (!sanitized.includes('.') || sanitized.lastIndexOf('.') === 0) {
    warnings.push('No file extension specified');
    if (!sanitized.includes('.')) {
      sanitized += '.txt'; // Add default extension
    }
  }

  // Check for hidden file
  if (sanitized.startsWith('.') && sanitized !== '.' && sanitized !== '..') {
    warnings.push('Hidden file (starts with dot)');
  }

  // Check for multiple extensions
  const dots = (sanitized.match(/\./g) || []).length;
  if (dots > 1) {
    warnings.push('Multiple file extensions detected');
  }

  return { 
    isValid: errors.length === 0, 
    errors, 
    warnings,
    sanitized: sanitized
  };
};

const checkDuplicateFileName = (fileName, existingFiles) => {
  const normalizedName = fileName.toLowerCase().trim();
  return existingFiles.some(file => file.name.toLowerCase() === normalizedName);
};

const checkPathLength = (fileName) => {
  const fullPath = `/home/user/${fileName}`;
  return fullPath.length <= MAX_PATH_LENGTH;
};

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

const generateFileSize = () => {
  return Math.floor(Math.random() * (FILE_SIZE_RANGE.max - FILE_SIZE_RANGE.min + 1)) + FILE_SIZE_RANGE.min;
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

const FileSystemVisualization = () => {
  const [currentStep, setCurrentStep] = useState(VisualizationStep.USER_REQUEST);
  const [mode, setMode] = useState('beginner'); // 'beginner' or 'intermediate'
  const [fileName, setFileName] = useState('file.txt');
  const [fileSystem, setFileSystem] = useState(null);
  const [newInode, setNewInode] = useState(null);
  const [currentEvent, setCurrentEvent] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [fileCreated, setFileCreated] = useState(false); // Track if file was created for current session
  const [validationResult, setValidationResult] = useState(null);
  const [validationShownFor, setValidationShownFor] = useState(null); // Track which filename we've shown validation for
  const [userAcknowledgedValidation, setUserAcknowledgedValidation] = useState(false); // Track if user has acknowledged current validation error
  
  // File deletion state
  const [showDeletionVisualization, setShowDeletionVisualization] = useState(false);
  const [selectedFileForDeletion, setSelectedFileForDeletion] = useState(null);
  
  // Storage management state
  const [storedData, setStoredData] = useState(getStoredData());
  const [newFileSize, setNewFileSize] = useState(10); // Start with a default size
  const [showStorageSettings, setShowStorageSettings] = useState(false);
  const [tempStorageLimit, setTempStorageLimit] = useState(storedData.storageLimit);
  
  // Initialize file system with stored files
  useEffect(() => {
    const stored = getStoredData();
    setStoredData(stored);
    setFileSystem(getInitialFileSystem(stored.files));
    
    // Set a reasonable default file size
    setNewFileSize(10);
  }, []);

  const [metrics, setMetrics] = useState({
    filesInFolder: 1 + storedData.files.length,
    diskSpaceUsed: `${((storedData.totalUsed / storedData.storageLimit) * 100).toFixed(2)}%`,
    inodeUsed: null,
    freeBlocks: 5000 - (4 + storedData.files.length),
    directoryLinkCount: 1 + storedData.files.length,
    storageUsed: storedData.totalUsed,
    storageLimit: storedData.storageLimit,
    newFileSize: newFileSize
  });

  const stepDescriptions = useMemo(() => ([
    {
      title: "User Request",
      description: "User initiates file creation",
      beginnerFeedback: `You requested to create a file named '${fileName}' in the folder.`,
      intermediateFeedback: `The application issues open() with O_CREAT to create '${fileName}'.`,
      realWorldContext: "This is like saving a note in Google Docs.",
      detailedExplanation: {
        beginner: `When you want to create a new file, you type its name in a text editor or file manager. This sends a request to the operating system to create the file. Think of it like telling your computer "I want to make a new document called ${fileName}".`,
        intermediate: `The application calls the open() system call with the O_CREAT flag, which tells the kernel to create a new file if it doesn&apos;t exist. The system call transitions from user mode to kernel mode, where the OS handles the file creation process. Parameters include the filename, creation flags (O_CREAT | O_WRONLY), and permissions (0644).`
      }
    },
    {
      title: "Permission Check", 
      description: "OS verifies write permissions",
      beginnerFeedback: "The system checks if you can write to the folder. Permission granted!",
      intermediateFeedback: "The OS checks the directory's inode (#5) for write permissions (rwx).",
      realWorldContext: "The cloud app checks if you can save in the folder.",
      detailedExplanation: {
        beginner: `Before creating any file, the computer checks if you can add files to that folder. It&apos;s like checking if you have the key to a room before you can put something inside. The system looks at the folder&apos;s settings to see if you&apos;re allowed to write (add) files there.`,
        intermediate: `The kernel examines the target directory&apos;s inode to verify write permissions. It checks the permission bits (rwx for owner/group/others) and compares them against the current user&apos;s credentials (UID/GID). The directory must have write permission for the user to create new files. This security check prevents unauthorized file creation and maintains file system integrity.`
      }
    },
    {
      title: "Inode Allocation",
      description: "OS allocates inode for file metadata", 
      beginnerFeedback: `A new file record is created to store information about '${fileName}'.`,
      intermediateFeedback: `The OS allocates inode #10 for '${fileName}' with metadata (permissions: 0644, size: 0).`,
      realWorldContext: "The app reserves a file record with your file's details.",
      detailedExplanation: {
        beginner: `Every file needs a "file card" that stores information about it - like its size, when it was created, who owns it, and where its data is stored on the disk. The computer finds an empty file card and fills it out with details about your new file. This card is called an inode.`,
        intermediate: `The OS allocates a free inode from the inode bitmap and initializes it with file metadata. The inode contains essential information: file type (regular file), permissions (0644 = rw-r--r--), size (initially 0), timestamps (creation, modification, access), owner UID/GID, and pointers to data blocks. This inode serves as the file's control structure throughout its lifetime.`
      }
    },
    {
      title: "Directory Update",
      description: "Link filename to new inode",
      beginnerFeedback: `The file &apos;${fileName}&apos; is added to the folder&apos;s list.`,
      intermediateFeedback: `The directory table links '${fileName}' to inode #10, updating the directory's inode.`,
      realWorldContext: "Your file appears in the folder listing.",
      detailedExplanation: {
        beginner: `Now the computer adds your file&apos;s name to the folder&apos;s list of contents. It&apos;s like writing the file name on the folder&apos;s table of contents, so when you look inside the folder later, you can see your file listed there. The folder remembers both the name and where to find the actual file information.`,
        intermediate: `The directory is updated by adding a new directory entry that maps the filename to the allocated inode number. Directory entries contain the filename and corresponding inode number. The parent directory&apos;s inode is also updated to reflect the new size and modification time. This creates the namespace link between the human-readable filename and the system&apos;s internal inode reference.`
      }
    },
    {
      title: "Disk Block Allocation",
      description: "Reserve storage space (if needed)",
      beginnerFeedback: `The system reserves ${newFileSize}KB of space on the disk for the file&apos;s data.`,
      intermediateFeedback: `The OS allocates block #${100 + storedData.files.length} for file data (${newFileSize}KB) using SSTF scheduling.`,
      realWorldContext: "Storage space is reserved for your file content.",
      detailedExplanation: {
        beginner: `Your file needs ${newFileSize}KB of space to store its content. The computer finds an empty storage location on the hard drive and reserves it for your file. This is like claiming a parking spot - the space is now marked as belonging to your file so no other files can use it.`,
        intermediate: `The OS allocates ${newFileSize}KB worth of data blocks from the free block bitmap. Block allocation uses disk scheduling algorithms like SSTF (Shortest Seek Time First) to minimize disk head movement and optimize performance. The inode&apos;s block pointers are updated to reference these allocated blocks, establishing the link between file metadata and actual data storage.`
      }
    },
    {
      title: "Superblock Update", 
      description: "Update file system metadata",
      beginnerFeedback: "The system updates its records to track the new file.",
      intermediateFeedback: "The superblock updates: Free Inodes = 996, Free Blocks = 4996.",
      realWorldContext: "The system updates its storage tracking.",
      detailedExplanation: {
        beginner: `The computer keeps a master record of how much storage space is available and how many files can still be created. After creating your file, it updates this record to show that one less file slot is available and slightly less storage space remains. It&apos;s like updating an inventory list after using supplies.`,
        intermediate: `The superblock, which contains critical file system metadata, is updated to reflect the consumed resources. Free inode and block counts are decremented, and the modification timestamp is updated. This ensures file system consistency and provides accurate space utilization information. The superblock update may be cached in memory and written to disk periodically or immediately, depending on the file system's consistency guarantees.`
      }
    },
    {
      title: "Response to User",
      description: "Confirm file creation success",
      beginnerFeedback: `The file &apos;${fileName}&apos; is ready to use!`,
      intermediateFeedback: "The OS returns file descriptor #3, confirming file creation.",
      realWorldContext: "Your file is now saved and ready to edit!",
      detailedExplanation: {
        beginner: `The computer confirms that your file has been successfully created! You&apos;ll see it appear in your folder, and you can now open it, edit it, or share it. The file creation process is complete, and your new file is ready to use whenever you need it.`,
        intermediate: `The kernel returns a file descriptor (a small integer) to the calling process, confirming successful file creation. This file descriptor serves as a handle for subsequent file operations (read, write, close). The system call completes, transitioning back to user mode, and the application receives confirmation that the file is ready for use. All file system structures are now consistent and persistent.`
      }
    }
  ]), [fileName, newFileSize, storedData]);

  // Auto-play functionality - REMOVED for manual control

  // Update file system state based on current step
  useEffect(() => {
    const currentStepDesc = stepDescriptions[currentStep];
    if (currentStepDesc) {
      setCurrentEvent(mode === 'beginner' ? currentStepDesc.beginnerFeedback : currentStepDesc.intermediateFeedback);
    }

    // Validation checks at appropriate steps
    if (currentStep === VisualizationStep.USER_REQUEST && fileName && !showError) {
      const validation = validateFileName(fileName);
      setValidationResult(validation);
      
      // Only show error if validation failed and we haven't already shown it for this filename
      if (!validation.isValid && !showError && errorType !== 'validation' && validationShownFor !== fileName && !userAcknowledgedValidation) {
        setErrorType('validation');
        setErrorDetails({
          type: 'filename_invalid',
          errors: validation.errors,
          warnings: validation.warnings
        });
        setValidationShownFor(fileName); // Mark this filename as having been validated
        setShowError(true);
        return;
      }
    }

    if (currentStep === VisualizationStep.PERMISSION_CHECK && !showError) {
      // Simulate permission checks
      const hasWritePermission = true; // In real OS, this would check actual permissions
      if (!hasWritePermission) {
        setErrorType('permission');
        setErrorDetails({
          type: 'permission_denied',
          message: 'Write permission denied for target directory'
        });
        setShowError(true);
        return;
      }

      // Check path length
      if (!checkPathLength(fileName)) {
        setErrorType('validation');
        setErrorDetails({
          type: 'path_too_long',
          message: `Full path exceeds maximum length (${MAX_PATH_LENGTH} characters)`
        });
        setShowError(true);
        return;
      }
    }

    if (currentStep === VisualizationStep.INODE_ALLOCATION && !showError) {
      // Check if we have free inodes
      if (fileSystem && fileSystem.superblock.freeInodes <= 0) {
        setErrorType('inode_full');
        setErrorDetails({
          type: 'no_free_inodes',
          message: 'No free inodes available in file system'
        });
        setShowError(true);
        return;
      }
    }

    if (currentStep === VisualizationStep.DIRECTORY_UPDATE && !showError) {
      // Check for duplicate filenames
      if (checkDuplicateFileName(fileName, storedData.files) && errorType !== 'validation') {
        setErrorType('validation');
        setErrorDetails({
          type: 'duplicate_name',
          message: `File "${fileName}" already exists in this directory`
        });
        setShowError(true);
        return;
      }
    }

    // Check for storage full error at the disk block allocation step
    if (currentStep === VisualizationStep.DISK_BLOCK_ALLOCATION && !showError) {
      if (storedData.totalUsed + newFileSize > storedData.storageLimit) {
        setErrorType('storage_full');
        setErrorDetails({
          type: 'insufficient_space',
          requested: newFileSize,
          available: Math.max(0, storedData.storageLimit - storedData.totalUsed),
          total: storedData.storageLimit
        });
        setShowError(true);
        return;
      }

      // Check if we have free disk blocks
      if (fileSystem && fileSystem.superblock.freeBlocks <= 0) {
        setErrorType('disk_full');
        setErrorDetails({
          type: 'no_free_blocks',
          message: 'No free disk blocks available'
        });
        setShowError(true);
        return;
      }
    }

    // Update file system visualization based on step
    switch(currentStep) {
      case VisualizationStep.INODE_ALLOCATION:
        const nextInodeId = 10 + storedData.files.length;
        setNewInode({
          id: nextInodeId,
          type: 'file',
          permissions: '0644',
          size: newFileSize * 1024,
          blocks: [],
          owner: 'user'
        });
        setMetrics(prev => ({ ...prev, inodeUsed: `#${nextInodeId}` }));
        break;
      case VisualizationStep.DIRECTORY_UPDATE:
        setMetrics(prev => ({ 
          ...prev, 
          filesInFolder: prev.filesInFolder + 1,
          directoryLinkCount: prev.directoryLinkCount + 1
        }));
        break;
      case VisualizationStep.DISK_BLOCK_ALLOCATION:
        if (!showError) {
          setMetrics(prev => ({ 
            ...prev, 
            storageUsed: storedData.totalUsed + newFileSize,
            diskSpaceUsed: `${(((storedData.totalUsed + newFileSize) / storedData.storageLimit) * 100).toFixed(2)}%`
          }));
        }
        break;
      case VisualizationStep.SUPERBLOCK_UPDATE:
        if (!showError) {
          setFileSystem(prev => ({
            ...prev,
            superblock: {
              ...prev.superblock,
              freeInodes: prev.superblock.freeInodes - 1,
              freeBlocks: prev.superblock.freeBlocks - 1
            }
          }));
          setMetrics(prev => ({ 
            ...prev, 
            freeBlocks: prev.freeBlocks - 1
          }));
        }
        break;
      case VisualizationStep.RESPONSE_TO_USER:
        // Only create file once per session and if we haven't already created it
        if (!fileCreated) {
          if (!showError || errorType === 'storage_full') {
            // Normal file creation when there's enough space, or forced creation for demo
            const newFile = {
              name: fileName,
              size: newFileSize,
              created: new Date().toISOString(),
              inode: 10 + storedData.files.length,
              hasError: showError && errorType === 'storage_full'
            };
            
            const updatedData = {
              ...storedData,
              files: [...storedData.files, newFile],
              totalUsed: storedData.totalUsed + newFileSize
            };
            
            setStoredData(updatedData);
            saveStoredData(updatedData);
            setFileCreated(true); // Mark as created
            
            // Update metrics if there was a storage error
            if (showError && errorType === 'storage_full') {
              setMetrics(prev => ({ 
                ...prev, 
                storageUsed: updatedData.totalUsed,
                diskSpaceUsed: `${((updatedData.totalUsed / updatedData.storageLimit) * 100).toFixed(2)}%`
              }));
            }
          }
        }
        break;
    }
  }, [currentStep, mode, fileName, newFileSize, storedData, showError, stepDescriptions, fileSystem, userAcknowledgedValidation]);

  const handleStepChange = (step) => {
    setCurrentStep(step);
    setShowError(false); // Clear any errors when manually changing steps
    setErrorDetails(null);
    setValidationResult(null);
    setErrorType(null); // Also clear error type
    setValidationShownFor(null); // Clear validation tracking
    setUserAcknowledgedValidation(false); // Reset acknowledgment state
    // Reset file creation flag when going back to start a new process
    if (step === VisualizationStep.USER_REQUEST) {
      setFileCreated(false);
    }
  };

  const nextStep = () => {
    if (currentStep < VisualizationStep.RESPONSE_TO_USER) {
      setCurrentStep(currentStep + 1);
      setShowError(false);
      setErrorDetails(null);
      setErrorType(null); // Clear error type
      setUserAcknowledgedValidation(false); // Reset acknowledgment when navigating
    }
  };

  const prevStep = () => {
    if (currentStep > VisualizationStep.USER_REQUEST) {
      setCurrentStep(currentStep - 1);
      setShowError(false);
      setErrorDetails(null);
      setErrorType(null); // Clear error type
      setUserAcknowledgedValidation(false); // Reset acknowledgment when navigating
      // Reset file creation flag when going back from response step
      if (currentStep === VisualizationStep.RESPONSE_TO_USER) {
        setFileCreated(false);
      }
    }
  };

  const resetVisualization = () => {
    setCurrentStep(VisualizationStep.USER_REQUEST);
    setNewInode(null);
    setFileCreated(false); // Reset file creation flag
    const stored = getStoredData();
    // Keep the current file size instead of generating a new one
    setStoredData(stored);
    setFileSystem(getInitialFileSystem(stored.files));
    setMetrics({
      filesInFolder: 1 + stored.files.length,
      diskSpaceUsed: `${((stored.totalUsed / stored.storageLimit) * 100).toFixed(2)}%`,
      inodeUsed: null,
      freeBlocks: 5000 - (4 + stored.files.length),
      directoryLinkCount: 1 + stored.files.length,
      storageUsed: stored.totalUsed,
      storageLimit: stored.storageLimit,
      newFileSize: newFileSize // Keep current size
    });
    setShowError(false);
    setValidationShownFor(null); // Reset validation tracking
    setUserAcknowledgedValidation(false); // Reset acknowledgment state
  };

  const updateStorageLimit = (newLimit) => {
    const updatedData = {
      ...storedData,
      storageLimit: newLimit
    };
    setStoredData(updatedData);
    saveStoredData(updatedData);
    setTempStorageLimit(newLimit);
    setMetrics(prev => ({
      ...prev,
      storageLimit: newLimit,
      diskSpaceUsed: `${((updatedData.totalUsed / newLimit) * 100).toFixed(2)}%`
    }));
  };

  const deleteFile = (fileIndex) => {
    const fileToDelete = storedData.files[fileIndex];
    const updatedData = {
      ...storedData,
      files: storedData.files.filter((_, index) => index !== fileIndex),
      totalUsed: storedData.totalUsed - fileToDelete.size
    };
    setStoredData(updatedData);
    saveStoredData(updatedData);
    
    // Reset visualization to reflect changes
    setFileSystem(getInitialFileSystem(updatedData.files));
    setMetrics(prev => ({
      ...prev,
      filesInFolder: 1 + updatedData.files.length,
      diskSpaceUsed: `${((updatedData.totalUsed / updatedData.storageLimit) * 100).toFixed(2)}%`,
      freeBlocks: 5000 - (4 + updatedData.files.length),
      directoryLinkCount: 1 + updatedData.files.length,
      storageUsed: updatedData.totalUsed
    }));
  };

  // File deletion visualization handlers
  const startFileDeletion = (file) => {
    setSelectedFileForDeletion(file);
    setShowDeletionVisualization(true);
  };

  const completeDeletion = () => {
    setShowDeletionVisualization(false);
    setSelectedFileForDeletion(null);
    // Refresh the current file system data
    const stored = getStoredData();
    setStoredData(stored);
    setFileSystem(getInitialFileSystem(stored.files));
    setMetrics(prev => ({
      ...prev,
      filesInFolder: 1 + stored.files.length,
      diskSpaceUsed: `${((stored.totalUsed / stored.storageLimit) * 100).toFixed(2)}%`,
      freeBlocks: 5000 - (4 + stored.files.length),
      directoryLinkCount: 1 + stored.files.length,
      storageUsed: stored.totalUsed
    }));
  };

  const cancelDeletion = () => {
    setShowDeletionVisualization(false);
    setSelectedFileForDeletion(null);
  };

  const clearAllFiles = () => {
    const clearedData = {
      files: [],
      storageLimit: storedData.storageLimit,
      totalUsed: 0
    };
    setStoredData(clearedData);
    saveStoredData(clearedData);
    resetVisualization();
  };

  const simulateError = (type) => {
    setErrorType(type);
    
    switch (type) {
      case 'permission':
        setErrorDetails({
          type: 'permission_denied',
          message: 'Write permission denied for target directory'
        });
        break;
      case 'full':
        setErrorDetails({
          type: 'no_free_inodes',
          message: 'No free inodes available in file system'
        });
        break;
      case 'storage_full':
        setErrorDetails({
          type: 'insufficient_space',
          requested: newFileSize,
          available: Math.max(0, storedData.storageLimit - storedData.totalUsed),
          total: storedData.storageLimit
        });
        break;
      case 'validation':
        const validation = validateFileName('CON.txt'); // Example invalid name
        setErrorDetails({
          type: 'filename_invalid',
          errors: validation.errors,
          warnings: validation.warnings
        });
        break;
    }
    
    setShowError(true);
  };

  const isCompleted = currentStep === VisualizationStep.RESPONSE_TO_USER;

  // Show deletion visualization if in deletion mode
  if (showDeletionVisualization && selectedFileForDeletion) {
    return (
      <FileDeletionVisualization 
        selectedFile={selectedFileForDeletion}
        onComplete={completeDeletion}
        onCancel={cancelDeletion}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <StarField starCount={150} speed={0.3} />
      <NebulaBackground colors={['purple-600', 'blue-600', 'indigo-600']} />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6">
            <GradientText gradient={spaceColors.gradient.cosmic}>
              File System Visualization
            </GradientText>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Explore the step-by-step process of creating a file in a UNIX-like file system
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900/50 rounded-full p-2 border border-white/10">
            <button
              onClick={() => setMode('beginner')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                mode === 'beginner' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Beginner Mode
            </button>
            <button
              onClick={() => setMode('intermediate')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                mode === 'intermediate' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Intermediate Mode
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                setValidationShownFor(null); // Reset validation tracking when filename changes
                setUserAcknowledgedValidation(false); // Reset acknowledgment when filename changes
              }}
              className={`px-4 py-2 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 ${
                validationResult && !validationResult.isValid 
                  ? 'border-red-400/50' 
                  : validationResult && validationResult.warnings.length > 0
                  ? 'border-yellow-400/50'
                  : 'border-white/20'
              }`}
              placeholder="Enter filename"
            />
            {validationResult && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-gray-900/90 border border-white/20 rounded text-xs z-10 max-w-xs">
                {validationResult.errors.map((error, i) => (
                  <div key={i} className="text-red-400">❌ {error}</div>
                ))}
                {validationResult.warnings.map((warning, i) => (
                  <div key={i} className="text-yellow-400">⚠️ {warning}</div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-900/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-300 flex items-center gap-2">
              <label className="text-gray-400">Size:</label>
              <input
                type="number"
                min={FILE_SIZE_RANGE.min}
                max={FILE_SIZE_RANGE.max}
                value={newFileSize}
                onChange={(e) => {
                  const size = Math.max(FILE_SIZE_RANGE.min, Math.min(FILE_SIZE_RANGE.max, parseInt(e.target.value) || FILE_SIZE_RANGE.min));
                  setNewFileSize(size);
                  setMetrics(prev => ({ ...prev, newFileSize: size }));
                }}
                className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-center"
              />
              <span>KB</span>
              {storedData.totalUsed + newFileSize > storedData.storageLimit && (
                <span className="text-red-400 text-xs">⚠️ Won't fit!</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <SpaceButton 
              onClick={prevStep} 
              variant="secondary"
              className={currentStep === VisualizationStep.USER_REQUEST ? 'opacity-50 cursor-not-allowed' : ''}
            >
              ← Previous
            </SpaceButton>
            <SpaceButton 
              onClick={nextStep} 
              variant="primary"
              className={currentStep === VisualizationStep.RESPONSE_TO_USER ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Next →
            </SpaceButton>
          </div>
          <SpaceButton onClick={resetVisualization} variant="secondary">
            🔄 Reset
          </SpaceButton>
          <SpaceButton onClick={() => setShowStorageSettings(true)} variant="cosmic">
            ⚙️ Storage
          </SpaceButton>
        </div>

        {/* Timeline Slider */}
        <div className="max-w-6xl mx-auto mb-8">
          <SpaceCard className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Process Timeline</h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {stepDescriptions.map((step, index) => (
                  <div key={index} className="flex-shrink-0 min-w-[120px]">
                    <button
                      onClick={() => handleStepChange(index)}
                      className={`w-full p-2 text-xs rounded transition-all duration-300 ${
                        index === currentStep
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : index < currentStep
                          ? 'bg-green-600/50 text-white'
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
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((currentStep + 1) / stepDescriptions.length) * 100, 100)}%` }}
              />
            </div>
          </SpaceCard>
        </div>

        {/* Main Visualization Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* File System Tree */}
          <SpaceCard className="lg:col-span-1" glowColor="blue">
            <h3 className="text-xl font-bold mb-4">
              <GradientText>File System Tree</GradientText>
            </h3>
            <div className="space-y-2">
              {mode === 'beginner' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📁</span>
                    <span className="text-white">/home/user</span>
                    {currentStep >= VisualizationStep.PERMISSION_CHECK && (
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        showError && errorType === 'permission' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {showError && errorType === 'permission' ? '❌ Denied' : '✅ Write OK'}
                      </span>
                    )}
                  </div>
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📄</span>
                      <span className="text-gray-300">document.txt</span>
                    </div>
                    {storedData.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 group">
                        <span className="text-xl">📄</span>
                        <span className={`${file.hasError ? 'text-red-300' : 'text-blue-300'}`}>
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">({file.size}KB)</span>
                        {file.hasError && (
                          <span className="text-red-400 text-xs" title="Created with storage error">⚠️</span>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 ml-2 flex gap-1 transition-opacity">
                          <button
                            onClick={() => startFileDeletion(file)}
                            className="text-orange-400 hover:text-orange-300 text-xs"
                            title="Visualize deletion process"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => deleteFile(index)}
                            className="text-red-400 hover:text-red-300 text-xs"
                            title="Delete immediately"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                    {currentStep >= VisualizationStep.DIRECTORY_UPDATE && !showError && (
                      <div className={`flex items-center gap-2 transition-all duration-500 ${
                        currentStep >= VisualizationStep.DIRECTORY_UPDATE ? 'opacity-100 animate-pulse' : 'opacity-0'
                      }`}>
                        <span className="text-xl">📄</span>
                        <span className="text-green-400 font-bold">{fileName}</span>
                        <span className="text-xs text-green-500">({newFileSize}KB)</span>
                        {currentStep >= VisualizationStep.RESPONSE_TO_USER && (
                          <span className="text-green-400">✨</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="font-mono text-sm space-y-2">
                  <div className="text-white">/ (inode #1)</div>
                  <div className="ml-4 text-gray-300">└── home/ (inode #5)</div>
                  <div className="ml-8 text-gray-300">└── user/</div>
                  <div className="ml-12 text-gray-300">├── document.txt (inode #8)</div>
                  {storedData.files.map((file, index) => (
                    <div key={index} className="ml-12 text-blue-300 group flex items-center gap-2">
                      <span className={file.hasError ? 'text-red-300' : 'text-blue-300'}>
                        ├── {file.name} (inode #{file.inode}) [{file.size}KB]
                      </span>
                      {file.hasError && (
                        <span className="text-red-400 text-xs" title="Created with storage error">⚠️</span>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button
                          onClick={() => startFileDeletion(file)}
                          className="text-orange-400 hover:text-orange-300 text-xs"
                          title="Visualize deletion process"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => deleteFile(index)}
                          className="text-red-400 hover:text-red-300 text-xs"
                          title="Delete immediately"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {currentStep >= VisualizationStep.DIRECTORY_UPDATE && !showError && (
                    <div className={`ml-12 text-green-400 font-bold transition-all duration-500 ${
                      currentStep >= VisualizationStep.DIRECTORY_UPDATE ? 'opacity-100' : 'opacity-0'
                    }`}>
                      └── {fileName} (inode #{newInode?.id}) [{newFileSize}KB]
                    </div>
                  )}
                </div>
              )}
            </div>
          </SpaceCard>

          {/* Inode Table */}
          <SpaceCard className="lg:col-span-1" glowColor="purple">
            <h3 className="text-xl font-bold mb-4">
              <GradientText gradient={spaceColors.gradient.stellar}>
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
                  {currentStep >= VisualizationStep.INODE_ALLOCATION && !showError && (
                    <div className={`bg-green-900/50 p-3 rounded border border-green-400/30 transition-all duration-500 ${
                      currentStep >= VisualizationStep.INODE_ALLOCATION ? 'opacity-100 animate-pulse' : 'opacity-0'
                    }`}>
                      <div className="font-bold text-green-400">{fileName}</div>
                      <div className="text-sm text-green-300">Size: 0KB, Owner: You</div>
                    </div>
                  )}
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
                      {currentStep >= VisualizationStep.INODE_ALLOCATION && newInode && !showError && (
                        <tr className={`border-b border-green-400/30 bg-green-900/20 transition-all duration-500 ${
                          currentStep >= VisualizationStep.INODE_ALLOCATION ? 'opacity-100' : 'opacity-0'
                        }`}>
                          <td className="p-2 text-green-400 font-bold">#{newInode.id}</td>
                          <td className="p-2 text-green-300">file</td>
                          <td className="p-2 text-green-300">{newInode.permissions}</td>
                          <td className="p-2 text-green-300">{newInode.size}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </SpaceCard>

          {/* Disk Blocks / Superblock */}
          <SpaceCard className="lg:col-span-1" glowColor="pink">
            <h3 className="text-xl font-bold mb-4">
              <GradientText gradient={spaceColors.gradient.nebula}>
                {mode === 'beginner' ? 'Storage Status' : 'Superblock & Disk'}
              </GradientText>
            </h3>
            {mode === 'beginner' ? (
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-white font-bold">File Count</div>
                  <div className="text-2xl text-blue-400">{metrics.filesInFolder}</div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-white font-bold">Storage Used</div>
                  <div className={`text-lg ${metrics.storageUsed > metrics.storageLimit ? 'text-red-400' : 'text-purple-400'}`}>
                    {metrics.storageUsed} / {metrics.storageLimit} KB
                  </div>
                  <div className="text-sm text-gray-400">({metrics.diskSpaceUsed})</div>
                  {metrics.storageUsed > metrics.storageLimit && (
                    <div className="text-xs text-red-400 mt-1">
                      ⚠️ Storage exceeded by {metrics.storageUsed - metrics.storageLimit} KB
                    </div>
                  )}
                </div>
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-white font-bold">New File Size</div>
                  <div className="text-lg text-green-400">{newFileSize} KB</div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${
                      (metrics.storageUsed / metrics.storageLimit) > 1.0
                        ? 'bg-gradient-to-r from-red-600 to-red-700'
                        : (metrics.storageUsed / metrics.storageLimit) > 0.8 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min((metrics.storageUsed / metrics.storageLimit) * 100, 100)}%` }}
                  />
                  {/* Show overflow indicator */}
                  {(metrics.storageUsed / metrics.storageLimit) > 1.0 && (
                    <div className="mt-1 text-xs text-red-400 text-center">
                      Storage overflow: {((metrics.storageUsed / metrics.storageLimit) * 100 - 100).toFixed(1)}% over capacity
                    </div>
                  )}
                </div>
                {storedData.files.length > 0 && (
                  <div className="pt-2">
                    <SpaceButton onClick={clearAllFiles} variant="secondary" className="text-xs px-3 py-1">
                      🗑️ Clear All Files
                    </SpaceButton>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xs text-gray-400 mb-2">SUPERBLOCK</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Free Inodes:</span>
                      <span className="text-white ml-1">{fileSystem.superblock.freeInodes}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Free Blocks:</span>
                      <span className="text-white ml-1">{fileSystem.superblock.freeBlocks}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="text-xs text-gray-400 mb-2">DISK BLOCKS</div>
                  <div className="grid grid-cols-10 gap-1">
                    {fileSystem.diskBlocks.slice(0, 50).map((block, index) => (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded transition-all duration-300 ${
                          block.used 
                            ? (index === 4 && currentStep >= VisualizationStep.DISK_BLOCK_ALLOCATION && !showError)
                              ? 'bg-green-500 animate-pulse' 
                              : 'bg-blue-500'
                            : 'bg-gray-700'
                        }`}
                        title={`Block ${index}: ${block.used ? 'Used' : 'Free'}`}
                      />
                    ))}
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
                <GradientText gradient={spaceColors.gradient.nebula}>
                  Step {currentStep + 1}: {stepDescriptions[currentStep]?.title}
                </GradientText>
              </h3>
              <p className="text-gray-300 text-lg">{stepDescriptions[currentStep]?.description}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Event */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
                <h4 className="text-lg font-bold text-blue-400 mb-2">What's Happening</h4>
                <p className="text-white">{currentEvent}</p>
                {stepDescriptions[currentStep] && (
                  <p className="text-gray-400 text-sm mt-2">
                    💡 {stepDescriptions[currentStep].realWorldContext}
                  </p>
                )}
              </div>

              {/* Detailed Explanation */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
                <h4 className="text-lg font-bold text-purple-400 mb-2">Detailed Explanation</h4>
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
                className={currentStep === VisualizationStep.USER_REQUEST ? 'opacity-50 cursor-not-allowed' : ''}
              >
                ← Previous Step
              </SpaceButton>
              <SpaceButton 
                onClick={nextStep} 
                variant="primary"
                className={currentStep === VisualizationStep.RESPONSE_TO_USER ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Next Step →
              </SpaceButton>
            </div>
          </SpaceCard>
        </div>

        {/* Error Simulation */}
        {showError && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <SpaceCard className="max-w-lg w-full">
              <h3 className="text-xl font-bold text-red-400 mb-4">
                {errorType === 'validation' ? 'Validation Error' : 'System Error'}
              </h3>
              
              {/* Error Message */}
              <div className="mb-4">
                {errorType === 'permission' && (
                  <p className="text-white">Permission denied: Cannot write to directory</p>
                )}
                {errorType === 'full' && (
                  <p className="text-white">File system full: No free inodes available</p>
                )}
                {errorType === 'inode_full' && (
                  <p className="text-white">Inode allocation failed: No free inodes available</p>
                )}
                {errorType === 'disk_full' && (
                  <p className="text-white">Disk allocation failed: No free blocks available</p>
                )}
                {errorType === 'storage_full' && errorDetails && (
                  <p className="text-white">
                    Storage full: Cannot allocate {errorDetails.requested}KB. 
                    Available: {errorDetails.available}KB
                  </p>
                )}
                {errorType === 'validation' && errorDetails && (
                  <div className="space-y-2">
                    {errorDetails.type === 'filename_invalid' && (
                      <>
                        <p className="text-white">Invalid filename detected:</p>
                        <div className="bg-gray-800/50 p-3 rounded">
                          {errorDetails.errors.map((error, i) => (
                            <div key={i} className="text-red-400 text-sm">❌ {error}</div>
                          ))}
                          {errorDetails.warnings.map((warning, i) => (
                            <div key={i} className="text-yellow-400 text-sm">⚠️ {warning}</div>
                          ))}
                        </div>
                      </>
                    )}
                    {errorDetails.type === 'duplicate_name' && (
                      <p className="text-white">{errorDetails.message}</p>
                    )}
                    {errorDetails.type === 'path_too_long' && (
                      <p className="text-white">{errorDetails.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Error Context */}
              <div className="bg-gray-800/50 p-3 rounded mb-6">
                <p className="text-sm text-gray-300">
                  {errorType === 'validation' && errorDetails?.type === 'filename_invalid' && 
                    'This error occurs during the "User Request" step when the filename violates OS naming conventions. The OS checks for invalid characters, reserved names, and length limits.'
                  }
                  {errorType === 'validation' && errorDetails?.type === 'duplicate_name' && 
                    'This error occurs during the "Directory Update" step when a file with the same name already exists in the target directory.'
                  }
                  {errorType === 'validation' && errorDetails?.type === 'path_too_long' && 
                    'This error occurs during the "Permission Check" step when the full file path exceeds the maximum allowed length.'
                  }
                  {errorType === 'storage_full' && 
                    'This error occurs during the "Disk Block Allocation" step when the file system doesn\'t have enough free space. However, you can continue to see what happens when storage goes negative - this demonstrates poor error handling in some systems.'
                  }
                  {errorType === 'permission' && 
                    'This error occurs during the "Permission Check" step when the user doesn\'t have write access to the target directory.'
                  }
                  {(errorType === 'full' || errorType === 'inode_full') && 
                    'This error occurs during the "Inode Allocation" step when no free inodes are available for new files.'
                  }
                  {errorType === 'disk_full' && 
                    'This error occurs during the "Disk Block Allocation" step when no free disk blocks are available for storing file data.'
                  }
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {errorType === 'validation' && errorDetails?.type === 'filename_invalid' && (
                  <div className="flex gap-3">
                    <SpaceButton 
                      onClick={() => {
                        const validation = validateFileName(fileName);
                        if (validation.sanitized) {
                          setFileName(validation.sanitized);
                        }
                        setShowError(false);
                        setErrorDetails(null);
                        setErrorType(null);
                        setValidationResult(null);
                        setUserAcknowledgedValidation(true); // Mark that user has acknowledged the validation error
                      }} 
                      variant="cosmic"
                      className="flex-1 text-sm"
                    >
                      Auto-Fix
                    </SpaceButton>
                    <SpaceButton 
                      onClick={() => {
                        setShowError(false);
                        setErrorDetails(null);
                        setErrorType(null);
                        setValidationResult(null);
                        setUserAcknowledgedValidation(true); // Mark that user has acknowledged the validation error
                        setCurrentStep(VisualizationStep.USER_REQUEST);
                      }} 
                      variant="secondary"
                      className="flex-1 text-sm"
                    >
                      Fix Manually
                    </SpaceButton>
                  </div>
                )}
                
                {errorType === 'validation' && errorDetails?.type === 'duplicate_name' && (
                  <div className="flex gap-3">
                    <SpaceButton 
                      onClick={() => {
                        const baseName = fileName.split('.')[0];
                        const extension = fileName.includes('.') ? '.' + fileName.split('.').pop() : '';
                        let counter = 1;
                        let newName;
                        do {
                          newName = `${baseName}_${counter}${extension}`;
                          counter++;
                        } while (checkDuplicateFileName(newName, storedData.files));
                        setFileName(newName);
                        setShowError(false);
                        setErrorDetails(null);
                        setErrorType(null);
                        setValidationResult(null);
                        setUserAcknowledgedValidation(true); // Mark that user has acknowledged the validation error
                      }} 
                      variant="cosmic"
                      className="flex-1 text-sm"
                    >
                      Auto-Rename
                    </SpaceButton>
                    <SpaceButton 
                      onClick={() => {
                        setShowError(false);
                        setErrorDetails(null);
                        setErrorType(null);
                        setValidationResult(null);
                        setUserAcknowledgedValidation(true); // Mark that user has acknowledged the validation error
                        setCurrentStep(VisualizationStep.USER_REQUEST);
                      }} 
                      variant="secondary"
                      className="flex-1 text-sm"
                    >
                      Choose New Name
                    </SpaceButton>
                  </div>
                )}

                <SpaceButton 
                  onClick={() => {
                    setShowError(false);
                    setErrorDetails(null);
                    setErrorType(null);
                    setUserAcknowledgedValidation(true); // Mark that user has acknowledged the validation error
                    if (errorType === 'validation') {
                      setValidationResult(null);
                    }
                  }} 
                  variant="primary"
                  className="w-full"
                >
                  {errorType === 'storage_full' ? 'Continue Anyway' : 'Acknowledge'}
                </SpaceButton>
                
                {errorType === 'storage_full' && (
                  <div className="flex gap-3">
                    <SpaceButton 
                      onClick={() => {
                        setShowStorageSettings(true);
                      }} 
                      variant="secondary"
                      className="flex-1 text-sm"
                    >
                      Manage Storage
                    </SpaceButton>
                    <SpaceButton 
                      onClick={() => {
                        const availableSpace = storedData.storageLimit - storedData.totalUsed;
                        const newSize = Math.max(FILE_SIZE_RANGE.min, Math.min(availableSpace - 1, FILE_SIZE_RANGE.max));
                        
                        setFileCreated(false);
                        setNewFileSize(newSize);
                        setMetrics(prev => ({ ...prev, newFileSize: newSize }));
                        setShowError(false);
                        setErrorDetails(null);
                        setErrorType(null);
                        setCurrentStep(VisualizationStep.USER_REQUEST);
                      }} 
                      variant="cosmic"
                      className="flex-1 text-sm"
                    >
                      Try Smaller File
                    </SpaceButton>
                  </div>
                )}
              </div>
            </SpaceCard>
          </div>
        )}

        {/* Storage Settings Modal */}
        {showStorageSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <SpaceCard className="max-w-lg w-full mx-4">
              <h3 className="text-xl font-bold mb-4">
                <GradientText>Storage Management</GradientText>
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-bold text-blue-400 mb-2">Current Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Files:</span>
                      <div className="text-white font-bold">{storedData.files.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Used Space:</span>
                      <div className="text-white font-bold">{storedData.totalUsed} KB</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Storage Limit:</span>
                      <div className="text-white font-bold">{storedData.storageLimit} KB</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Available:</span>
                      <div className="text-white font-bold">{storedData.storageLimit - storedData.totalUsed} KB</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-lg font-bold text-purple-400 mb-2">Storage Limit</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={tempStorageLimit}
                      onChange={(e) => setTempStorageLimit(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-white font-bold w-20">{tempStorageLimit} KB</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Adjust the storage limit to simulate different storage scenarios
                  </div>
                </div>

                {storedData.files.length > 0 && (
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold text-green-400 mb-2">Stored Files</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {storedData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-white">{file.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">{file.size} KB</span>
                            <button
                              onClick={() => startFileDeletion(file)}
                              className="text-orange-400 hover:text-orange-300 transition-colors"
                              title="Visualize deletion process"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => deleteFile(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete immediately"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <SpaceButton 
                  onClick={() => setShowStorageSettings(false)} 
                  variant="secondary"
                >
                  Cancel
                </SpaceButton>
                <SpaceButton 
                  onClick={() => {
                    updateStorageLimit(tempStorageLimit);
                    setShowStorageSettings(false);
                  }} 
                  variant="primary"
                >
                  Apply Settings
                </SpaceButton>
                {storedData.files.length > 0 && (
                  <SpaceButton 
                    onClick={() => {
                      clearAllFiles();
                      setShowStorageSettings(false);
                    }} 
                    variant="secondary"
                    className="text-red-400"
                  >
                    Clear All Files
                  </SpaceButton>
                )}
              </div>
            </SpaceCard>
          </div>
        )}

        {/* Error Simulation Controls */}
        <div className="max-w-6xl mx-auto mt-8">
          <SpaceCard>
            <h3 className="text-xl font-bold mb-4">
              <GradientText>Error Scenarios</GradientText>
            </h3>
            <div className="flex gap-4 flex-wrap">
              <SpaceButton
                onClick={() => simulateError('permission')}
                variant="secondary"
                className="text-red-400 bg-red-600/20 border-red-400/30 hover:bg-red-600/30"
              >
                🚫 Permission Denied
              </SpaceButton>
              <SpaceButton
                onClick={() => simulateError('full')}
                variant="secondary"
                className="text-orange-400 bg-orange-600/20 border-orange-400/30 hover:bg-orange-600/30"
              >
                💾 Inode Full
              </SpaceButton>
              <SpaceButton
                onClick={() => simulateError('storage_full')}
                variant="secondary"
                className="text-yellow-400 bg-yellow-600/20 border-yellow-400/30 hover:bg-yellow-600/30"
              >
                💽 Storage Full
              </SpaceButton>
              <SpaceButton
                onClick={() => simulateError('validation')}
                variant="secondary"
                className="text-purple-400 bg-purple-600/20 border-purple-400/30 hover:bg-purple-600/30"
              >
                ⚠️ Invalid Filename
              </SpaceButton>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Test different error scenarios to understand when and why file creation can fail
            </p>
          </SpaceCard>
        </div>

        {/* Completion Summary */}
        {isCompleted && (
          <div className="max-w-6xl mx-auto mt-8">
            <SpaceCard className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-4">
                <GradientText>File Creation Complete!</GradientText>
              </h3>
              <p className="text-gray-300 mb-6">
                Successfully created &quot;{fileName}&quot; in the file system
              </p>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10 mb-6">
                <h4 className="text-lg font-bold text-green-400 mb-2">Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">File Created:</span>
                    <div className="text-white font-bold">{fileName}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Inode Allocated:</span>
                    <div className="text-white font-bold">#10</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Location:</span>
                    <div className="text-white font-bold">/home/user/</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <SpaceButton onClick={resetVisualization} variant="primary">
                  🔄 Create Another File
                </SpaceButton>
                <SpaceButton onClick={() => window.location.href = '/dashboard'} variant="secondary">
                  📊 Return to Dashboard
                </SpaceButton>
              </div>
            </SpaceCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileSystemVisualization;

# Operating System Visualization Web App: Project Documentation

## 1. Project Overview

### 1.1 Purpose

The Operating System Visualization Web App is an interactive educational tool designed for beginner and intermediate students (e.g., high school, early college, or university OS course learners) to understand core operating system (OS) concepts through dynamic, step-by-step visualizations. The app enables users to select from six OS modules (Process Management, CPU Scheduling, Memory Management, File Systems, Interrupts and System Calls, Concurrency and Synchronization), choose specific actions (e.g., Create a Process, Schedule Tasks, Create a File), and explore detailed visualizations of OS operations with user-controlled progression. The project emphasizes clarity, interactivity, and educational value, helping students grasp theoretical and practical aspects of OS functionality.

### 1.2 Objectives

- **Educational**: Teach six core OS concepts comprehensively, covering key operations and their real-world relevance.
- **Interactive**: Allow users to select modules and actions, control visualization steps, and observe real-time feedback.
- **Accessible**: Provide beginner-friendly (simplified) and intermediate (detailed) modes to cater to different skill levels.
- **Innovative**: Deliver a unique, action-driven visualization flow that explores OS operations at a granular level, surpassing static or limited-interactivity tools.
- **Practical**: Connect OS concepts to real-world scenarios (e.g., process management in multitasking, file creation in cloud storage) to highlight importance.

### 1.3 Scope

- **Core Functionalities**: All six OS modules (Process Management, CPU Scheduling, Memory Management, File Systems, Interrupts and System Calls, Concurrency and Synchronization) with selected actions for each.
- **Implementation**: Step-by-step visualizations for key actions in each module, with user control over progression.
- **Exclusions**: No AI integration (e.g., AI tutor), no metaphorical visualizations (e.g., "OS City"), no 3D graphics.
- **Future Expansion**: Add advanced actions (e.g., advanced scheduling algorithms, network operations) and gamified challenges.

### 1.4 Target Audience

- **Beginners**: High school or early college students new to OS concepts, needing simple visuals and explanations (e.g., process as a running program).
- **Intermediate Learners**: College students or self-taught learners with basic OS knowledge, seeking deeper insights (e.g., process control blocks, page tables).
- **Educators**: Instructors who can use the app as a teaching aid in OS courses.

## 2. Functionalities

The app visualizes six core OS functionalities, each with specific actions and step-by-step processes. Below is a detailed breakdown of each module, including concepts, actions, and visualization steps, based on real OS operations.

### 2.1 Process Management

- **Concepts**: Process creation, termination, states (New, Ready, Running, Waiting, Terminated), context switching.
- **Actions**:
    - Create a Process
    - Terminate a Process
- **Create a Process Steps**:
    1. **User Request**: Initiate process creation (e.g., launch a program like "notepad.exe").
    2. **System Call**: Issue fork() or exec() to create a process.
    3. **Process Control Block (PCB) Allocation**: Allocate a PCB with PID, state, and priority.
    4. **State Transition**: Move process to Ready state in the ready queue.
    5. **Response**: Return PID to the user.
- **Visualization**:
    - Process table showing new process entry.
    - State diagram with process moving to Ready (animation).
    - PCB table with fields (intermediate mode).
- **Beginner Mode**: Show process as a "program" icon appearing.
- **Intermediate Mode**: Display PCB details and system call code.
- **Example**: Simulate launching a browser, showing process creation.

### 2.2 CPU Scheduling

- **Concepts**: Scheduling algorithms (FCFS, SJF, Round Robin, Priority), preemption, starvation.
- **Actions**:
    - Schedule Processes
    - Adjust Scheduling Parameters
- **Schedule Processes Steps**:
    1. **Process Selection**: Select processes from the ready queue.
    2. **Algorithm Application**: Apply chosen algorithm (e.g., Round Robin with time quantum).
    3. **CPU Allocation**: Assign CPU to a process, showing execution.
    4. **Preemption (if applicable)**: Interrupt process if preempted.
    5. **Metrics Update**: Calculate wait time, turnaround time.
- **Visualization**:
    - Gantt chart showing process execution timeline.
    - Ready queue with processes moving to CPU.
    - Metrics table (wait time, throughput).
- **Beginner Mode**: Simple timeline of processes running.
- **Intermediate Mode**: Show algorithm logic and preemption details.
- **Example**: Simulate scheduling for a gaming app to show delays with poor algorithms.

### 2.3 Memory Management

- **Concepts**: Memory allocation, virtual memory, paging, segmentation, fragmentation.
- **Actions**:
    - Allocate Memory
    - Simulate Page Fault
- **Allocate Memory Steps**:
    1. **User Request**: Request memory for a process (e.g., 4MB).
    2. **Allocation Strategy**: Apply strategy (e.g., best-fit, first-fit).
    3. **Memory Update**: Reserve memory blocks, showing fragmentation.
    4. **Virtual Memory (if applicable)**: Map virtual to physical addresses.
    5. **Response**: Confirm allocation or trigger page fault.
- **Visualization**:
    - Memory grid showing allocated blocks and gaps (fragmentation).
    - Page table for virtual memory (intermediate mode).
    - Animation of blocks filling or page fault alerts.
- **Beginner Mode**: Show memory as a "space" filling up.
- **Intermediate Mode**: Display page tables and address mappings.
- **Example**: Simulate memory overload causing a page fault.

### 2.4 File Systems

- **Concepts**: File creation, deletion, organization (e.g., FAT, NTFS), permissions, disk scheduling.
- **Actions**:
    - Create a File
    - Delete a File
- **Create a File Steps**:
    1. **User Request**: Input file name (e.g., "file.txt").
    2. **System Call**: Issue open(file.txt, O_CREAT).
    3. **Permission Check**: Verify directory write permissions.
    4. **Inode Allocation**: Allocate inode for metadata.
    5. **Directory Update**: Add file name and inode to directory table.
    6. **Disk Allocation**: Reserve disk blocks (e.g., via SSTF).
    7. **Metadata Update**: Update superblock.
    8. **Response**: Return file descriptor.
- **Visualization**:
    - File system tree or table showing new file.
    - Inode table, directory table, disk grid updating.
    - Animations (file appearing, blocks filling).
- **Beginner Mode**: Show file added to tree.
- **Intermediate Mode**: Display inode structure, disk scheduling.
- **Example**: Simulate saving a text file in a cloud app.

### 2.5 Interrupts and System Calls

- **Concepts**: Hardware/software interrupts, system call handling, kernel-user mode transitions.
- **Actions**:
    - Trigger an Interrupt
    - Execute a System Call
- **Trigger an Interrupt Steps**:
    1. **Interrupt Event**: Simulate event (e.g., keyboard press).
    2. **Interrupt Handler**: Kernel processes interrupt via vector table.
    3. **Context Switch**: Save current process state, handle interrupt.
    4. **Response**: Resume process or switch to another.
- **Visualization**:
    - Timeline of interrupt handling.
    - Vector table and stack (intermediate mode).
    - Animation of process pause/resume.
- **Beginner Mode**: Show interrupt as an "alert" pausing a process.
- **Intermediate Mode**: Display kernel stack and mode transitions.
- **Example**: Simulate a USB plug-in triggering an interrupt.

### 2.6 Concurrency and Synchronization

- **Concepts**: Threads, deadlocks, race conditions, semaphores, monitors.
- **Actions**:
    - Simulate Thread Conflict
    - Apply Synchronization
- **Simulate Thread Conflict Steps**:
    1. **Thread Creation**: Create multiple threads accessing a resource.
    2. **Conflict Detection**: Show race condition or deadlock.
    3. **Synchronization**: Apply semaphore or monitor.
    4. **Resolution**: Show conflict resolved or persisting.
- **Visualization**:
    - Threads as parallel lines with collision points (race conditions).
    - Deadlock as stalled threads.
    - Semaphore as a gate (animation).
- **Beginner Mode**: Show threads "fighting" for a resource.
- **Intermediate Mode**: Display semaphore logic and thread states.
- **Example**: Simulate a banking app with concurrent transactions.

## 3. User Experience (UX) Flow

The app provides a modular, action-driven interface where users select a module, choose an action, and control step-by-step visualizations. Below is the UX flow for all modules, with examples from File Systems and Process Management.

### 3.1 Dashboard

- **Description**: Entry point displaying tiles for all six modules.
- **Visuals**: Grid layout with labeled tiles (e.g., "File Systems" with folder icon, "Process Management" with process icon). High-contrast, responsive design.
- **Interaction**: User clicks a module tile (e.g., File Systems) to enter.
- **Accessibility**: Keyboard navigation, screen reader support, clear labels.

### 3.2 Module Submenu

- **Description**: Submenu listing actions for the selected module (e.g., File Systems: Create a File, Delete a File; Process Management: Create a Process, Terminate a Process).
- **Visuals**: List or card layout with action descriptions and a preview pane (e.g., file system tree for File Systems, process table for Process Management).
- **Interaction**: User selects an action (e.g., Create a File) and inputs parameters (e.g., file name "file.txt" or process name "notepad.exe").
- **Accessibility**: Form fields with clear labels, tab navigation.

### 3.3 Step-by-Step Visualization

- **Description**: Visualization screen showing the selected action broken into steps.
- **Visuals**:
    - **Main Area**: Displays relevant structures (e.g., file system tree, process table, memory grid). Animations highlight changes (e.g., file appearing, process state change).
    - **Control Panel**: Buttons for "Next," "Back," "Pause," "Skip." Timeline slider for jumping to steps.
    - **Feedback Panel**: Shows metrics (e.g., disk space, CPU usage) and errors (e.g., "Permission denied").
    - **Beginner Mode**: Simplified visuals (e.g., file tree, process icon).
    - **Intermediate Mode**: Detailed tables (e.g., inode, PCB) and system call snippets.
- **Interaction**:
    - User clicks "Start," then "Next" to progress steps.
    - Toggle beginner/intermediate modes for detail level.
    - Simulate errors (e.g., disk full, deadlock) to see outcomes.
    - Use timeline slider to revisit steps.
- **Accessibility**: Keyboard controls (arrows for Next/Back), descriptive text for screen readers.

### 3.4 Completion and Navigation

- **Description**: After completing an action, users see a summary and options to continue.
- **Visuals**: Summary screen with success animation (e.g., file in tree, process running) and metrics. Buttons for "Repeat," "Try Another Action," or "Return to Dashboard."
- **Interaction**: User selects next action/module, with progress saved client-side.
- **Accessibility**: Clear button labels, focus management.

### 3.5 Example User Journeys

- **File Systems (Create a File)**:
    1. User clicks "File Systems" on dashboard.
    2. Selects "Create a File," enters "file.txt."
    3. Clicks "Start," progresses through steps (permission check → inode allocation → file in tree).
    4. Toggles intermediate mode to see inode table, rewinds to revisit steps.
    5. Completes action, tries "Delete a File."
- **Process Management (Create a Process)**:
    1. User clicks "Process Management."
    2. Selects "Create a Process," enters "notepad.exe."
    3. Progresses through steps (system call → PCB allocation → Ready state).
    4. Views PCB details (intermediate mode), simulates termination.
    5. Returns to dashboard to explore CPU Scheduling.

## 4. Technical Architecture

### 4.1 Tech Stack

- **Front-End Framework**: **Next.js**
    - **Reason**: Simplifies routing, supports SSR/SSG for fast loading, and provides API routes for lightweight simulation logic. Preferred over React for built-in optimizations, reducing setup time for routing and performance.
- **Visualization Library**: **D3.js**
    - **Reason**: Enables dynamic, interactive visualizations (e.g., file system trees, Gantt charts, memory grids) with precise control and accessibility support.
- **Simulation Logic**: **C++ with WebAssembly**
    - **Reason**: Offers high-performance simulation of OS operations (e.g., process scheduling, memory allocation) in the browser, mimicking real OS behavior.
- **Styling**: **Tailwind CSS**
    - **Reason**: Facilitates rapid, consistent, responsive styling for a clean UI, enhancing educational clarity.
- **Build Tool**: **Next.js built-in bundler**
    - **Note**: Using Next.js's built-in Turbopack for development and bundling instead of Vite for better integration.
- **Testing**: **Jest and Cypress**
    - **Reason**: Jest ensures component and simulation reliability; Cypress validates end-to-end user flows.

### 4.2 System Architecture

- **Client-Side**:
    - **UI Layer**: Next.js renders dashboard, submenus, and visualization screens. React components handle interactions (e.g., buttons, forms).
    - **Visualization Layer**: D3.js generates trees, tables, charts, and grids, updating based on simulation data.
    - **Simulation Layer**: WebAssembly (C++ code) simulates OS operations (e.g., inode allocation, scheduling), sending data to D3.js.
- **Server-Side (Optional)**:
    - Next.js API routes for saving progress or handling complex simulations if needed. Initially client-side for simplicity.
- **Data Flow**:
    - User selects action → Next.js triggers WebAssembly simulation → Simulation outputs state (e.g., file system tree) → D3.js renders visuals → User progresses steps.

### 4.3 Accessibility

- Keyboard navigation (tab for actions, arrows for steps).
- Screen reader support with descriptive text (e.g., "File.txt created").
- High-contrast, responsive design for mobile/tablet compatibility.

## 5. Implementation Plan

### 5.1 Development Roadmap

1. **Requirement Finalization (1 week, Completed)**:
    - Define scope for all six modules and key actions.
    - Confirm tech stack and UX flow.
2. **Project Setup (1 week, In Progress)**:
    - Initialize Next.js project with TypeScript
    - Configure Tailwind CSS for styling
    - Set up development environment and build tools
3. **UI Mockups (2-3 weeks)**:
    - Design dashboard, submenus, and visualization screens for all modules in Figma.
    - Validate with students/educators.
4. **Simulation Development (4-6 weeks)**:
    - Build C++ simulators for each module (e.g., process, scheduling, file system).
    - Compile to WebAssembly for browser integration.
5. **Visualization Prototypes (4-6 weeks)**:
    - Implement one action per module in Next.js/D3.js (e.g., Create a File, Schedule Processes).
    - Test animations and interactivity.
6. **Full Integration (4-6 weeks)**:
    - Combine UI, simulations, and visuals for all modules.
    - Add beginner/intermediate modes and timeline sliders.
7. **Testing and Iteration (2-3 weeks)**:
    - Jest for unit tests (components, simulations).
    - Cypress for end-to-end tests (user flows).
    - User testing with students to refine visuals/controls.
8. **Deployment (1 week)**:
    - Deploy to Vercel (optimized for Next.js).
    - Ensure cross-browser compatibility.

### 5.2 Milestones

- **Month 1**: Project setup, mockups and simulation prototypes for 2-3 modules.
- **Month 2-3**: Visualizations for all modules implemented.
- **Month 4**: Full integration, testing, and deployment.

### 5.3 Resource Requirements

- **Team**:
    - Front-End Developer: Next.js, D3.js, Tailwind CSS.
    - Back-End/Simulation Developer: C++, WebAssembly.
    - UX/UI Designer: Figma, accessibility.
    - QA Tester: Jest, Cypress, user testing.
- **Tools**:
    - Figma, VS Code, GitHub, Vercel.
- **Budget**: Minimal for open-source tools; consider student testing incentives.

## 6. Challenges and Mitigations

- **Challenge**: Balancing simplicity and depth across modules.
    - **Mitigation**: Toggleable beginner/intermediate modes.
- **Challenge**: Performance of real-time visualizations.
    - **Mitigation**: Optimize D3.js, use WebWorkers, test on low-end devices.
- **Challenge**: Ensuring accuracy of OS simulations.
    - **Mitigation**: Base on real OS behavior (e.g., Linux, Windows), validate with experts.
- **Challenge**: User engagement in step-by-step flows.
    - **Mitigation**: Add error scenarios and optional challenges (e.g., "Prevent a deadlock").

## 7. Future Enhancements

- Add advanced actions (e.g., priority scheduling, network interrupts).
- Introduce gamified challenges (e.g., "Optimize scheduling").
- Support offline mode via PWA features.
- Integrate with learning management systems (e.g., Canvas).

## 8. Conclusion

The Operating System Visualization Web App is a transformative educational tool that visualizes all six core OS functionalities through interactive, user-controlled steps. By enabling students to explore processes, scheduling, memory, files, interrupts, and concurrency, the app bridges theoretical and practical learning. The tech stack (Next.js, D3.js, C++ with WebAssembly, Tailwind CSS, Jest/Cypress) ensures performance and clarity, while the UX flow prioritizes accessibility and engagement. This project will empower students to master OS concepts with confidence.

---

## Project Structure (Current)

```
os-visualization-app/
├── README.md
├── PROJECT_CONTEXT.md          # This file
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs          # PostCSS configuration
├── .gitignore                  # Git ignore rules
├── .eslintrc.json             # ESLint configuration
├── src/
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── globals.css         # Global styles with Tailwind
│   │   ├── layout.tsx          # Root layout component
│   │   └── page.tsx            # Home page component
│   ├── components/             # React components (to be created)
│   ├── lib/                    # Utilities and shared logic (to be created)
│   ├── styles/                 # Additional styles (to be created)
│   └── wasm/                   # WebAssembly modules (to be created)
├── public/                     # Static assets
│   ├── next.svg               # Next.js logo
│   └── vercel.svg             # Vercel logo
├── tests/                      # Jest and Cypress tests (to be created)
└── docs/                       # Additional documentation (to be created)
```

## Current Development Status

- [x] Project setup and configuration
- [x] Next.js with TypeScript initialization
- [x] Tailwind CSS configuration
- [x] ESLint and PostCSS setup
- [ ] UI mockups and design system
- [ ] Simulation engine development
- [ ] Visualization components
- [ ] Module integration
- [ ] Testing and optimization
- [ ] Deployment

## Technical Setup Details

### Dependencies (Current)
- **Next.js**: 15.1.3 (Latest stable version)
- **React**: 19.0.0 (Latest version)
- **TypeScript**: Latest for type safety
- **Tailwind CSS**: 3.4.1 for styling
- **ESLint**: For code quality

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment
- **Node.js**: Required for development
- **Package Manager**: npm (package-lock.json present)
- **Development Server**: Next.js dev server on localhost:3000

## Next Steps
1. Set up component structure for the six OS modules
2. Create basic dashboard layout
3. Implement routing for module navigation
4. Add D3.js for visualizations
5. Begin simulation logic development
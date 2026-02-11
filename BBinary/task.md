# Automated Duty Planner - Task List

- [ ] **Project Setup & Scaffolding** <!-- id: 0 -->
    - [ ] Initialize repository with `pnpm` and `turbo`. <!-- id: 1 -->
    - [ ] Create `web-app` package using Vite + React + TypeScript. <!-- id: 2 -->
    - [ ] Install dependencies (`tailwindcss`, `lucide-react`, `clsx`, `tailwind-merge`, `zustand`, `@dnd-kit/core` (optional for drag-drop)). <!-- id: 3 -->
    - [ ] Setup base layout and routing. <!-- id: 4 -->

- [ ] **Core Logic & State Management** <!-- id: 5 -->
    - [ ] Define TypeScript interfaces (`Staff`, `Shift`, `Constraints`). <!-- id: 6 -->
    - [ ] Implement `useStore` (Zustand) with `persist` middleware for localStorage. <!-- id: 7 -->
    - [ ] Create mock data generator for testing. <!-- id: 8 -->

- [ ] **Scheduling Algorithm Implementation** <!-- id: 9 -->
    - [ ] Implement utility helpers (validity checks, fairness scoring). <!-- id: 10 -->
    - [ ] **Implement Core Scheduler Function**: `generateSchedule(startDate, endDate, staffList)`. <!-- id: 11 -->
    - [ ] Add Auto-retry/Backtracking logic for strict constraints. <!-- id: 12 -->
    - [ ] Unit test the algorithm with edge cases (min rest, max shifts). <!-- id: 13 -->

- [ ] **Staff Management UI** <!-- id: 14 -->
    - [ ] Create `StaffList` component (Add/Edit/Delete). <!-- id: 15 -->
    - [ ] Implement "Availability" and "Max Shifts" controls per staff. <!-- id: 16 -->

- [ ] **Calendar & Schedule UI** <!-- id: 17 -->
    - [ ] Create interactive Calendar Grid (Month View). <!-- id: 18 -->
    - [ ] Implement Shift Cells with Staff assignment. <!-- id: 19 -->
    - [ ] Add Drag-and-Drop capability for manual overrides. <!-- id: 20 -->
    - [ ] Add visual indicators for constraint violations (if manual override force). <!-- id: 21 -->

- [ ] **Export & Final Polish** <!-- id: 22 -->
    - [ ] Implement "Export to CSV". <!-- id: 23 -->
    - [ ] Implement "Export to PDF" (simple print view or jspdf). <!-- id: 24 -->
    - [ ] Review UI Aesthetics (Tailwind, animations). <!-- id: 25 -->

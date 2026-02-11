# Implementation Plan - Automated Duty Planner

# Goal Description
Build a local-first web application for automated duty scheduling. The app will allow users to manage staff, define availability/constraints, and auto-generate monthly schedules that ensure fairness and adhere to strict rules (like 12h rest periods). All data will be persisted locally using `localStorage`.

## User Review Required
> [!IMPORTANT]
> **Algorithm Complexity**: The scheduling algorithm uses a randomized greedy approach with scoring for fairness. While generally effective, it may not find a solution in highly constrained scenarios (e.g., too few staff). In such cases, it will leave slots "Unassigned" for manual resolution.

## Proposed Changes

### Architecture & Setup
- **Monorepo**: Use `pnpm` workspaces with `turbo` (following `gemini.md`).
- **App**: `apps/web-app` (Vite + React + TypeScript).
- **Styling**: Tailwind CSS + `lucide-react`.
- **State**: `zustand` with `persist` middleware (to `localStorage`).

### Data Models
```typescript
interface Staff {
  id: string;
  name: string;
  maxShiftsPerMonth: number;
  unavailableDates: string[]; // ISO Date strings or day patterns
}

interface Shift {
  id: string; // date_shiftType
  date: string; // '2023-10-27'
  type: 'Day' | 'Night' | 'Swing'; // Configurable later, fixed for now?
  assignedStaffId: string | null;
  isLocked: boolean; // Prevent overwrite during re-generation
}
```

### Scheduling Algorithm Logic
The core `generateSchedule` function will operate as follows:

1.  **Preparation**:
    *   Load all Staff and existing locked Shifts.
    *   Initialize a "load counter" for each staff member (count of shifts assigned) to track fairness.
    *   Identify all target slots (Date + Shift Type) needed for the month.

2.  **Constraint Checks** (`isValidAssignment(staff, date, previousShift, nextShift)`):
    *   **Availability**: Check if `date` is in `staff.unavailableDates`.
    *   **Max Shifts**: Check if `staff.currentShiftCount >= staff.maxShifts`.
    *   **Rest Period**:
        *   Check if staff worked the *previous day's night shift* (if assigning morning).
        *   Check if staff is working *another shift on the same day*.
        *   Enforce ~12h gap.

3.  **Efficiency/Fairness Heuristic** (Greedy Strategy with Noise):
    *   Iterate through each day/shift chronologically.
    *   For each slot:
        1.  **Filter**: Get list of all `isValidAssignment` staff.
        2.  **Score**: Sort candidates by `currentShiftCount` (Ascending). Low shift count = Higher priority.
        3.  **Select**: Pick the top candidate (lowest count).
            *   *Enhancement*: To avoid deterministic patterns (e.g., Staff A always gets the 1st of the month), add slight randomization or shuffle candidates with equal shift counts.
        4.  **Assign**: Update schedule and increment staff's shift count.
    *   If no candidate is found, mark slot as `UNASSIGNED`.

4.  **Output**:
    *   Return a list of new Shift objects.
    *   Update Global State.

### UI Components
#### `apps/web-app/src/features/scheduler`
*   `SchedulerControls.tsx`: Date range picker, "Generate" button.
*   `CalendarView.tsx`: Month view grid.
    *   **Drag & Drop**: Use `@dnd-kit` to drag a Staff chip onto a Shift slot.
    *   **Validation**: Highlight conflicts in real-time (red border if constraints violated).

#### `apps/web-app/src/features/staff`
*   `StaffManager.tsx`: List view with inline editing for Availability/Max Shifts.

## Verification Plan
### Automated Tests
Run via `pnpm test`:
- **Algorithm Unit Tests**:
    - `should not assign staff on unavailable date`
    - `should not assign staff back-to-back (no 12h rest)`
    - `should distribute shifts evenly (std dev of counts < threshold)`
    - `should respect max shifts limit`
- **UI Tests**:
    - Render Staff List.
    - Click "Generate" -> Check for populated grid.

### Manual Verification
1.  **Fairness Check**: Generate a schedule for 4 staff members over 30 days. Verify shifts are roughly 7-8 per person.
2.  **Constraint Check**: Mark "Staff A" unavailable on weekends. Regenerate. Verify NO weekend shifts for Staff A.
3.  **Persistence**: Refresh page. Ensure schedule remains.

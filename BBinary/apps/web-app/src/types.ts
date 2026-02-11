export type ShiftType = 'Day' | 'Night' | 'Swing';

export interface Staff {
    id: string;
    name: string;
    maxShiftsPerMonth: number;
    unavailableDates: string[];
    role?: string;
    shiftCount: number; // Transient state for current generation
}

export interface Shift {
    id: string; // Format: YYYY-MM-DD_ShiftType
    date: string; // ISO YYYY-MM-DD
    type: ShiftType;
    assignedStaffId: string | null;
    isLocked: boolean;
}

export interface ScheduleConfig {
    month: number; // 0-11
    year: number;
    requiredShiftsPerDay: ShiftType[];
}

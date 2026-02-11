import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Staff, Shift, ScheduleConfig } from '../types';
import { DEFAULT_SHIFTS_PER_DAY } from '../constants';

interface AppState {
    staffList: Staff[];
    shifts: Shift[];
    config: ScheduleConfig;

    // Actions
    addStaff: (staff: Staff) => void;
    updateStaff: (id: string, updates: Partial<Staff>) => void;
    removeStaff: (id: string) => void;

    setShifts: (shifts: Shift[]) => void;
    updateShift: (id: string, updates: Partial<Shift>) => void;
    clearSchedule: () => void;

    setConfig: (config: Partial<ScheduleConfig>) => void;
}

const INITIAL_CONFIG: ScheduleConfig = {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    requiredShiftsPerDay: [...DEFAULT_SHIFTS_PER_DAY]
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            staffList: [],
            shifts: [],
            config: INITIAL_CONFIG,

            addStaff: (staff) => set((state) => ({ staffList: [...state.staffList, staff] })),

            updateStaff: (id, updates) => set((state) => ({
                staffList: state.staffList.map((s) => (s.id === id ? { ...s, ...updates } : s))
            })),

            removeStaff: (id) => set((state) => ({
                staffList: state.staffList.filter((s) => s.id !== id)
            })),

            setShifts: (shifts) => set({ shifts }),

            updateShift: (id, updates) => set((state) => ({
                shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...updates } : s))
            })),

            clearSchedule: () => set({ shifts: [] }),

            setConfig: (updates) => set((state) => ({ config: { ...state.config, ...updates } })),
        }),
        {
            name: 'duty-planner-storage',
        }
    )
);

import type { Staff, Shift, ShiftType } from '../../types';
import { SHIFT_TYPES } from '../../constants';


export interface SchedulerContext {
    staffList: Staff[];
    existingShifts: Shift[];
}

export function isValidAssignment(
    staff: Staff,
    dateStr: string,
    shiftType: ShiftType,
    context: SchedulerContext
): boolean {
    if (isUnavailable(staff, dateStr)) return false;
    if (hasRestViolation(staff, dateStr, shiftType, context.existingShifts)) return false;
    if (isDoubleBooking(staff, dateStr, context.existingShifts)) return false;

    return true;
}

function isUnavailable(staff: Staff, date: string): boolean {
    return staff.unavailableDates.includes(date);
}

function hasRestViolation(
    staff: Staff,
    currentDateStr: string,
    currentType: ShiftType,
    shifts: Shift[]
): boolean {
    const prevDate = new Date(currentDateStr);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    // Rule: Cannot work Day shift if worked Night shift the previous day
    // (Assuming Night shift ends morning of current day)
    if (currentType === SHIFT_TYPES.DAY) {
        const workedNightYesterday = shifts.some(
            s => s.date === prevDateStr &&
                s.assignedStaffId === staff.id &&
                s.type === SHIFT_TYPES.NIGHT
        );
        if (workedNightYesterday) return true;
    }
    return false;
}

function isDoubleBooking(staff: Staff, date: string, shifts: Shift[]): boolean {
    return shifts.some(
        s => s.date === date && s.assignedStaffId === staff.id
    );
}

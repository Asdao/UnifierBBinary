import type { Staff, Shift, ShiftType } from '../../types';
import { SHIFT_TYPES } from '../../constants';
import { isValidAssignment } from './validator';

/**
 * Generates a fair schedule for the given month/year respecting constraints.
 * Fairness is achieved through:
 * 1. Even total shift distribution
 * 2. Balanced Day/Night shift distribution per person
 * 3. Spacing preference (avoid clustering shifts)
 */
export function generateSchedule(
    month: number,
    year: number,
    staffList: Staff[],
    currentShifts: Shift[],
    requiredShiftsPerDay: ShiftType[] = [SHIFT_TYPES.DAY, SHIFT_TYPES.NIGHT]
): Shift[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const generatedShifts: Shift[] = [];

    // Enhanced tracking for fairness
    const staffStats = new Map<string, StaffStats>();
    staffList.forEach(s => staffStats.set(s.id, {
        totalShifts: 0,
        dayShifts: 0,
        nightShifts: 0,
        lastShiftDate: null,
        consecutiveShifts: 0
    }));

    // Pre-process locked shifts
    currentShifts.forEach(s => {
        if (s.isLocked && s.assignedStaffId) {
            generatedShifts.push(s);
            updateStats(staffStats, s.assignedStaffId, s);
        }
    });

    // Iterate chronologically
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);

        // Alternate shift order each day to prevent one person always getting Day/Night
        const shiftOrder = day % 2 === 0
            ? [...requiredShiftsPerDay].reverse()
            : requiredShiftsPerDay;

        for (const shiftType of shiftOrder) {
            if (isSlotLocked(generatedShifts, dateStr, shiftType)) continue;

            const chosenStaff = findFairestCandidate(
                staffList,
                staffStats,
                dateStr,
                shiftType,
                generatedShifts
            );

            const newShift: Shift = {
                id: `${dateStr}_${shiftType}`,
                date: dateStr,
                type: shiftType,
                assignedStaffId: chosenStaff ? chosenStaff.id : null,
                isLocked: false
            };

            if (chosenStaff) {
                updateStats(staffStats, chosenStaff.id, newShift);
            }

            generatedShifts.push(newShift);
        }
    }

    return generatedShifts;
}

interface StaffStats {
    totalShifts: number;
    dayShifts: number;
    nightShifts: number;
    lastShiftDate: string | null;
    consecutiveShifts: number;
}

function formatDate(year: number, month: number, day: number): string {
    return new Date(year, month, day).toISOString().split('T')[0];
}

function isSlotLocked(shifts: Shift[], date: string, type: ShiftType): boolean {
    return shifts.some(s => s.date === date && s.type === type && s.isLocked);
}

function updateStats(stats: Map<string, StaffStats>, staffId: string, shift: Shift) {
    const s = stats.get(staffId);
    if (!s) return;

    s.totalShifts++;
    if (shift.type === SHIFT_TYPES.DAY) s.dayShifts++;
    if (shift.type === SHIFT_TYPES.NIGHT) s.nightShifts++;

    // Check if consecutive
    if (s.lastShiftDate) {
        const lastDate = new Date(s.lastShiftDate);
        const currentDate = new Date(shift.date);
        const diffDays = Math.abs((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        s.consecutiveShifts = diffDays <= 1 ? s.consecutiveShifts + 1 : 1;
    } else {
        s.consecutiveShifts = 1;
    }

    s.lastShiftDate = shift.date;
}

/**
 * Calculates a fairness score for a candidate. Lower is better.
 */
function calculateFairnessScore(
    _staff: Staff,
    stats: StaffStats,
    shiftType: ShiftType,
    currentDate: string
): number {
    let score = 0;

    // Factor 1: Total shift count (moderate weight)
    score += stats.totalShifts * 5;

    // Factor 2: Shift type imbalance (HIGH WEIGHT - key to fairness)
    // If they already have more of this type, strongly discourage assigning more
    const typeCount = shiftType === SHIFT_TYPES.DAY ? stats.dayShifts : stats.nightShifts;
    const otherTypeCount = shiftType === SHIFT_TYPES.DAY ? stats.nightShifts : stats.dayShifts;

    // Heavily penalize if this would worsen their Day/Night imbalance
    if (typeCount >= otherTypeCount) {
        score += (typeCount - otherTypeCount + 1) * 15;
    }

    // Factor 3: Spacing - prefer candidates who haven't worked recently
    if (stats.lastShiftDate) {
        const daysSinceLastShift = getDaysBetween(stats.lastShiftDate, currentDate);
        // Lower score for more days since last shift (encourage spacing)
        score -= Math.min(daysSinceLastShift, 5) * 2;
    }

    // Factor 4: Consecutive shift penalty
    if (stats.consecutiveShifts >= 2) {
        score += stats.consecutiveShifts * 5;
    }

    return score;
}

function getDaysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function findFairestCandidate(
    allStaff: Staff[],
    stats: Map<string, StaffStats>,
    date: string,
    type: ShiftType,
    currentShifts: Shift[]
): Staff | null {
    // Filter to valid candidates
    const candidates = allStaff.filter(staff => {
        const staffStat = stats.get(staff.id);
        if (!staffStat) return false;
        if (staffStat.totalShifts >= staff.maxShiftsPerMonth) return false;

        return isValidAssignment(staff, date, type, {
            staffList: allStaff,
            existingShifts: currentShifts
        });
    });

    if (candidates.length === 0) return null;

    // Score all candidates
    const scored = candidates.map(staff => ({
        staff,
        score: calculateFairnessScore(staff, stats.get(staff.id)!, type, date)
    }));

    // Sort by score (lowest = fairest)
    scored.sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        // Tie-breaker: slight randomness to prevent patterns
        return Math.random() - 0.5;
    });

    return scored[0].staff;
}

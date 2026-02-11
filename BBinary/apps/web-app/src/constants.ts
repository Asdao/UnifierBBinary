export const SHIFT_TYPES = {
    DAY: 'Day',
    NIGHT: 'Night',
    SWING: 'Swing',
} as const;

export const DEFAULT_SHIFTS_PER_DAY = [SHIFT_TYPES.DAY, SHIFT_TYPES.NIGHT];

export const MIN_REST_TIME_MS = 12 * 60 * 60 * 1000; // 12 hours

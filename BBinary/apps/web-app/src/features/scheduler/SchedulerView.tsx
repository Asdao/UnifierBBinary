import React from 'react';
import { useStore } from '../../store/useStore';
import { generateSchedule } from '../../lib/scheduler/generator';
import { RefreshCcw, Calendar as CalendarIcon, Download } from 'lucide-react';
import clsx from 'clsx';

// Helper to get days in month
const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
};

export const SchedulerView: React.FC = () => {
    const { staffList, shifts, config, setShifts, clearSchedule } = useStore();

    const handleGenerate = () => {
        try {
            const newShifts = generateSchedule(
                config.month,
                config.year,
                staffList,
                shifts,
                config.requiredShiftsPerDay
            );
            setShifts(newShifts);
        } catch (error) {
            console.error("Generation failed:", error);
            alert("Failed to generate schedule. Check console for details.");
        }
    };

    const handleExport = () => {
        if (shifts.length === 0) {
            alert("No schedule to export.");
            return;
        }

        // CSV Header
        const headers = ['Date', 'Day Shift', 'Night Shift'];
        const csvRows = [headers.join(',')];

        // Group shifts by date
        const shiftsByDate = new Map<string, { Day: string, Night: string }>();

        shifts.forEach(shift => {
            if (!shiftsByDate.has(shift.date)) {
                shiftsByDate.set(shift.date, { Day: '', Night: '' });
            }
            const assignedStaff = staffList.find(s => s.id === shift.assignedStaffId);
            const staffName = assignedStaff ? assignedStaff.name : 'Unassigned';

            if (shift.type === 'Day') shiftsByDate.get(shift.date)!.Day = staffName;
            if (shift.type === 'Night') shiftsByDate.get(shift.date)!.Night = staffName;
        });

        // Generate Rows
        Array.from(shiftsByDate.entries()).sort().forEach(([date, assigned]) => {
            csvRows.push([date, assigned.Day, assigned.Night].join(','));
        });

        // Trigger Download
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schedule_${config.year}_${config.month + 1}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const daysInMonth = getDaysInMonth(config.month, config.year);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Stats
    const getStaffShiftCount = (staffId: string) => shifts.filter(s => s.assignedStaffId === staffId).length;

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        {new Date(config.year, config.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    {/* TODO: Month Picker */}
                </div>
                <div className="flex gap-2">
                    <button onClick={clearSchedule} className="px-3 py-2 text-slate-600 hover:text-red-500 text-sm">
                        Clear
                    </button>
                    <button onClick={handleExport} className="btn-secondary flex items-center gap-2 px-3 py-2 border rounded hover:bg-slate-50">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button
                        onClick={handleGenerate}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                        disabled={staffList.length === 0}
                    >
                        <RefreshCcw className="w-4 h-4" /> Generate Schedule
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4">
                {staffList.map(staff => {
                    const count = getStaffShiftCount(staff.id);
                    return (
                        <div key={staff.id} className="bg-white p-3 rounded border text-sm">
                            <div className="font-medium">{staff.name}</div>
                            <div className={clsx(
                                "text-xs",
                                count > staff.maxShiftsPerMonth ? "text-red-500 font-bold" : "text-slate-500"
                            )}>
                                {count} / {staff.maxShiftsPerMonth} shifts
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-8 border-b bg-slate-50 text-xs font-semibold text-slate-600">
                    <div className="p-2 border-r">Date</div>
                    {/* Headers for Shift Types (Hardcoded for now based on config, usually Day/Night) */}
                    <div className="p-2 border-r text-center">Day Shift</div>
                    <div className="p-2 border-r text-center">Night Shift</div>
                    <div className="col-span-1 border-r text-center">Notes</div>
                    <div className="col-span-4"></div>
                </div>

                {days.map(day => {
                    const dateStr = new Date(config.year, config.month, day).toISOString().split('T')[0];
                    const dayShifts = shifts.filter(s => s.date === dateStr);

                    // Helper to render cell
                    const renderCell = (type: string) => {
                        const shift = dayShifts.find(s => s.type === type);
                        const assigned = staffList.find(s => s.id === shift?.assignedStaffId);

                        return (
                            <div className="p-2 border-r min-h-[3rem] relative group border-slate-100">
                                {assigned ? (
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                                        {assigned.name}
                                    </span>
                                ) : (
                                    shift ? <span className="text-red-400 text-xs italic">Unassigned</span> : <span className="text-slate-200">-</span>
                                )}
                            </div>
                        );
                    };

                    return (
                        <div key={day} className="grid grid-cols-8 border-b hover:bg-slate-50">
                            <div className="p-2 border-r font-medium text-slate-700">
                                {day} <span className="text-xs text-slate-400">{new Date(config.year, config.month, day).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            </div>
                            {renderCell('Day')}
                            {renderCell('Night')}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

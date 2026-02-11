import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Staff } from '../../types';
import { Trash2, UserPlus } from 'lucide-react';

export const StaffManager: React.FC = () => {
    const { staffList, addStaff, removeStaff } = useStore();
    const [newName, setNewName] = useState('');
    const [maxShifts, setMaxShifts] = useState(20);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;

        const newStaff: Staff = {
            id: Math.random().toString(36).substring(2, 9),
            name: newName,
            maxShiftsPerMonth: maxShifts,
            unavailableDates: [],
            shiftCount: 0
        };

        addStaff(newStaff);
        setNewName('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Staff Management
            </h2>

            {/* Add Form */}
            <form onSubmit={handleAdd} className="flex gap-4 mb-6 p-4 bg-slate-50 rounded-md">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="John Doe"
                    />
                </div>
                <div className="w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Shifts</label>
                    <input
                        type="number"
                        value={maxShifts}
                        onChange={e => setMaxShifts(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="space-y-2">
                {staffList.map(staff => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50">
                        <div>
                            <p className="font-medium text-slate-900">{staff.name}</p>
                            <p className="text-sm text-slate-500">Max Shifts: {staff.maxShiftsPerMonth}</p>
                        </div>
                        <button
                            onClick={() => removeStaff(staff.id)}
                            className="p-2 text-slate-400 hover:text-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {staffList.length === 0 && (
                    <p className="text-center text-slate-400 py-4">No staff added yet.</p>
                )}
            </div>
        </div>
    );
};

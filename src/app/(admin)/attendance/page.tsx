"use client"

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore, AttendanceStatus } from "@/lib/store";
import { Check, X, Clock, Save, Building2, Calendar as CalendarIcon, Activity, Phone } from "lucide-react";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

function AttendanceContent() {
    const searchParams = useSearchParams();
    const initialMeetingId = searchParams.get('meetingId');

    const { meetings, members, attendanceRecords, markAttendance } = useAppStore();
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>(initialMeetingId || "");

    // Local state for tracking attendance checks before saving
    const [currentAttendance, setCurrentAttendance] = useState<Record<string, AttendanceStatus>>({});

    const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

    // Filter members based on meeting type eligible for this meeting
    const eligibleMembers = selectedMeeting
        ? members.filter(m =>
            selectedMeeting.meetingType === 'Executive'
                ? true // Secretariat members are Executive members too, so include everyone
                : m.committeeType === 'Secretariat' // Only Secretariat can attend Secretariat meetings
        )
        : [];

    // Load existing records when meeting changes
    useEffect(() => {
        if (selectedMeeting) {
            const records = attendanceRecords.filter(r => r.meetingId === selectedMeeting.id);
            const attendanceMap: Record<string, AttendanceStatus> = {};
            records.forEach(r => {
                attendanceMap[r.memberId] = r.status;
            });
            // Pre-fill missing with Absent by default
            eligibleMembers.forEach(m => {
                if (!attendanceMap[m.id]) attendanceMap[m.id] = 'Absent';
            });
            setCurrentAttendance(attendanceMap);
        }
    }, [selectedMeetingId, meetings, attendanceRecords, members]); // Only run on meeting change or load

    const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
        setCurrentAttendance(prev => ({
            ...prev,
            [memberId]: status
        }));
    };

    const handleSave = () => {
        if (!selectedMeeting) return;

        const recordsToSave = Object.entries(currentAttendance).map(([memberId, status]) => ({
            meetingId: selectedMeeting.id,
            memberId,
            status
        }));

        markAttendance(recordsToSave);
        toast.success('Attendance saved successfully!');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-right" />
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mark Attendance</h1>
                <p className="text-slate-500 text-sm mt-1">Select meeting and mark members</p>
            </div>

            <div className="mb-8">
                <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-4">Select Scheduled Meeting</h2>
                {meetings.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 font-medium">No meetings scheduled yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {meetings.map(m => {
                            const isSelected = selectedMeetingId === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMeetingId(m.id)}
                                    className={`text-left p-5 rounded-2xl border transition-all duration-200 shadow-sm group relative overflow-hidden ${isSelected ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/20 text-white translate-y-0 scale-[1.02]' : 'bg-white border-slate-200/60 hover:border-blue-300 hover:shadow-md'}`}
                                >
                                    {isSelected && <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full pointer-events-none transition-all"></div>}
                                    <h3 className={`font-bold text-lg leading-tight mb-3 pr-4 tracking-tight ${isSelected ? 'text-white' : 'text-slate-800 group-hover:text-blue-600'}`}>
                                        {m.title}
                                    </h3>
                                    <div className={`space-y-1.5 text-xs font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-300' : 'text-slate-400'}`} />
                                            {format(new Date(m.date), "PPP")}
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-white/20">
                                            <div className="flex items-center gap-2">
                                                <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-300' : 'text-slate-400'}`} />
                                                {m.time}
                                            </div>
                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border ${isSelected ? 'bg-white/20 border-white/20 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                                {m.meetingType}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedMeeting && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                            <Activity className="w-4 h-4 text-slate-500" />
                            Eligible Members ({eligibleMembers.length})
                        </h2>
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                        >
                            <Save className="w-4 h-4" /> Save Attendance
                        </button>
                    </div>

                    {eligibleMembers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 md:px-6 py-4">Member Info</th>
                                        <th className="px-4 md:px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {eligibleMembers.map(member => {
                                        const status = currentAttendance[member.id] || 'Absent';
                                        return (
                                            <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="font-bold text-slate-900">{member.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                        <span>{member.designation}</span>
                                                        <span>•</span>
                                                        <span>{member.mobile}</span>
                                                        <a
                                                            href={`https://wa.me/${member.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`*Reminder: ${selectedMeeting.title}*\n📅 Date: ${format(new Date(selectedMeeting.date), "PPP")}\n⏰ Time: ${selectedMeeting.time}\n📍 Location: ${selectedMeeting.location}\n\nPlease let us know your availability.`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 rounded transition-colors inline-block"
                                                            title="Message on WhatsApp"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                                                        <button
                                                            onClick={() => handleStatusChange(member.id, 'Present')}
                                                            className={`flex-1 flex justify-center items-center gap-1 px-3 py-2 rounded-lg font-bold text-xs transition-colors border ${status === 'Present' ? 'bg-emerald-100 border-emerald-200 text-emerald-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                                        >
                                                            <Check className="w-4 h-4" /> Present
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(member.id, 'Absent')}
                                                            className={`flex-1 flex justify-center items-center gap-1 px-3 py-2 rounded-lg font-bold text-xs transition-colors border ${status === 'Absent' ? 'bg-red-100 border-red-200 text-red-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                                        >
                                                            <X className="w-4 h-4" /> Absent
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(member.id, 'Late')}
                                                            className={`flex-1 flex justify-center items-center gap-1 px-3 py-2 rounded-lg font-bold text-xs transition-colors border ${status === 'Late' ? 'bg-amber-100 border-amber-200 text-amber-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                                        >
                                                            <Clock className="w-4 h-4" /> Late
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500 font-medium">
                            No eligible members found for {selectedMeeting.meetingType} committee.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function AttendancePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center font-bold text-slate-400">Loading Attendance Portal...</div>}>
            <AttendanceContent />
        </Suspense>
    );
}

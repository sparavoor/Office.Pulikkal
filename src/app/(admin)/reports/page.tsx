"use client"

import { useState } from "react";
import { useAppStore, CommitteeType, Member } from "@/lib/store";
import { Copy, BarChart3, Users, Building2, Calendar, Download, Search, AlertCircle, FileText, Filter, X, Check, Clock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function MemberDetailsModal({ memberId, onClose, members, meetings, attendanceRecords }: any) {
    const member = members.find((m: any) => m.id === memberId);
    if (!member) return null;

    const eligibleMeetings = meetings.filter((m: any) =>
        member.committeeType === 'Secretariat' ? true : m.meetingType === 'Executive'
    ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const records = attendanceRecords.filter((r: any) => r.memberId === memberId);

    // Only show meetings that have occurred (i.e. someone marked attendance for it)
    const occurredMeetingIds = Array.from(new Set(attendanceRecords.map((a: any) => a.meetingId)));
    const relevantMeetings = eligibleMeetings.filter((m: any) => occurredMeetingIds.includes(m.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{member.name}</h2>
                        <p className="text-sm text-slate-500 font-medium">{member.designation} • {member.committeeType} Committee</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Meeting Attendance History
                    </h3>

                    {relevantMeetings.length > 0 ? (
                        <div className="space-y-3">
                            {relevantMeetings.map((meeting: any) => {
                                const record = records.find((r: any) => r.meetingId === meeting.id);
                                const status = record ? record.status : 'Absent';

                                return (
                                    <div key={meeting.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors shadow-sm">
                                        <div>
                                            <p className="font-bold text-slate-800">{meeting.title}</p>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">{meeting.date} • {meeting.time} • {meeting.meetingType} Committee</p>
                                        </div>
                                        <div>
                                            {status === 'Present' && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs"><Check className="w-4 h-4" /> Present</span>}
                                            {status === 'Late' && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs"><Clock className="w-4 h-4" /> Late</span>}
                                            {status === 'Absent' && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-bold text-xs"><X className="w-4 h-4" /> Absent</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            No recorded meetings found for this member.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ReportsPage() {
    const { members, meetings, attendanceRecords } = useAppStore();
    const [filterCommittee, setFilterCommittee] = useState<CommitteeType | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState("");
    const [attendanceFilter, setAttendanceFilter] = useState("All");
    const [selectedMeetingFilter, setSelectedMeetingFilter] = useState("All");
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
    const [selectedMemberForDetails, setSelectedMemberForDetails] = useState<string | null>(null);

    const generateMemberStats = (memberId: string, memberCommitteeType: CommitteeType) => {
        let eligibleMeetings = meetings.filter(m =>
            memberCommitteeType === 'Secretariat' ? true : m.meetingType === 'Executive'
        );

        if (selectedMeetingFilter !== "All") eligibleMeetings = eligibleMeetings.filter(m => m.id === selectedMeetingFilter);

        const records = attendanceRecords.filter(r => r.memberId === memberId);

        // Find which eligible meetings actually have SOME attendance recorded (i.e. they actually happened)
        const occurredMeetingIds = Array.from(new Set(attendanceRecords.map(a => a.meetingId)));
        const relevantMeetings = eligibleMeetings.filter(m => occurredMeetingIds.includes(m.id));

        const totalRelevant = relevantMeetings.length;

        // Also only count attendance for relevant meetings if date filtered
        const relevantMeetingIds = relevantMeetings.map(m => m.id);
        const relevantRecords = records.filter(r => relevantMeetingIds.includes(r.meetingId));

        const presentCount = relevantRecords.filter(r => r.status === 'Present').length;
        const lateCount = relevantRecords.filter(r => r.status === 'Late').length;
        const absentCount = totalRelevant - presentCount - lateCount;

        const percentage = totalRelevant === 0 ? 0 : Math.round(((presentCount + (lateCount * 0.5)) / totalRelevant) * 100);

        return { totalRelevant, presentCount, lateCount, absentCount, percentage };
    };

    const memberStatsData = members.map(m => ({
        member: m,
        stats: generateMemberStats(m.id, m.committeeType)
    }));

    const filteredData = memberStatsData.filter(({ member: m, stats }) => {
        const matchesCommittee = filterCommittee === 'All'
            || m.committeeType === filterCommittee
            || (filterCommittee === 'Executive' && m.committeeType === 'Secretariat');
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.mobile.includes(searchQuery);

        let matchesAttendance = true;
        if (attendanceFilter === '<50') matchesAttendance = stats.percentage < 50;
        else if (attendanceFilter === '50-80') matchesAttendance = stats.percentage >= 50 && stats.percentage <= 80;
        else if (attendanceFilter === '>80') matchesAttendance = stats.percentage > 80;

        return matchesCommittee && matchesSearch && matchesAttendance;
    });

    const isAllSelected = filteredData.length > 0 && filteredData.every(d => selectedMemberIds.has(d.member.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedMemberIds(new Set());
        } else {
            setSelectedMemberIds(new Set(filteredData.map(d => d.member.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedMemberIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedMemberIds(newSet);
    };

    const handleCopySummary = () => {
        let text = `*📊 Division Committee Attendance Summary*\n`;

        const singleMeeting = selectedMeetingFilter !== "All" ? meetings.find(mt => mt.id === selectedMeetingFilter) : null;
        if (singleMeeting) {
            text += `*Meeting:* ${singleMeeting.title} (${singleMeeting.date})\n`;
        }
        text += `\n`;

        const dataToExport = selectedMemberIds.size > 0
            ? filteredData.filter(d => selectedMemberIds.has(d.member.id))
            : filteredData;

        const committeesToExport = filterCommittee === 'All'
            ? ['Secretariat', 'Executive']
            : [filterCommittee];

        committeesToExport.forEach(committee => {
            const committeeData = dataToExport.filter(d =>
                d.member.committeeType === committee ||
                (committee === 'Executive' && d.member.committeeType === 'Secretariat')
            );

            if (committeeData.length > 0) {
                text += `*_${committee} Committee_*\n`;

                if (singleMeeting) {
                    // Group by status for a single meeting
                    const present = committeeData.filter(d => d.stats.presentCount > 0);
                    const late = committeeData.filter(d => d.stats.lateCount > 0);
                    const absent = committeeData.filter(d => d.stats.totalRelevant > 0 && d.stats.presentCount === 0 && d.stats.lateCount === 0);

                    if (present.length > 0) {
                        text += `\n*✅ Present*\n`;
                        present.forEach(d => { text += `• ${d.member.name}\n`; });
                    }
                    if (late.length > 0) {
                        text += `\n*🕒 Late*\n`;
                        late.forEach(d => { text += `• ${d.member.name}\n`; });
                    }
                    if (absent.length > 0) {
                        text += `\n*❌ Absent*\n`;
                        absent.forEach(d => { text += `• ${d.member.name}\n`; });
                    }
                    text += `\n`;
                } else {
                    // Normal percentage summary for multiple meetings
                    committeeData.forEach(d => {
                        text += `👤 ${d.member.name}: ${d.stats.percentage}% (${d.stats.presentCount}/${d.stats.totalRelevant})\n`;
                    });
                    text += `\n`;
                }
            }
        });

        navigator.clipboard.writeText(text.trim());
        toast.success(`Summary copied! (${dataToExport.length} members)`);
    };

    const handleExportCSV = () => {
        const headers = ['Name', 'Mobile', 'Designation', 'Committee', 'Present', 'Late', 'Absent', 'Percentage'];

        const dataToExport = selectedMemberIds.size > 0
            ? filteredData.filter(d => selectedMemberIds.has(d.member.id))
            : filteredData;

        const rows = dataToExport.map(({ member, stats }) => {
            return [
                `"${member.name.replace(/"/g, '""')}"`,
                `"${member.mobile}"`,
                `"${member.designation.replace(/"/g, '""')}"`,
                `"${member.committeeType}"`,
                stats.presentCount,
                stats.lateCount,
                stats.absentCount,
                `"${stats.percentage}%"`
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Report downloaded! (${dataToExport.length} members)`);
    };

    const avgAttendance = filteredData.length > 0
        ? Math.round(filteredData.reduce((acc, d) => acc + d.stats.percentage, 0) / filteredData.length)
        : 0;

    const occurredMeetingsList = Array.from(new Set(attendanceRecords.map(a => a.meetingId)))
        .map(id => meetings.find(m => m.id === id))
        .filter(Boolean)
        .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-right" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Reports</h1>
                    <p className="text-slate-500 text-sm mt-1">Analytics and history of member attendance</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopySummary}
                        className="bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Copy className="w-4 h-4" /> Copy Summary
                    </button>
                    <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Calendar className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">Meetings in Range</p>
                        <h3 className="text-2xl font-black text-slate-800">
                            {Array.from(new Set(
                                attendanceRecords
                                    .filter(a => {
                                        const m = meetings.find(mt => mt.id === a.meetingId);
                                        if (!m) return false;
                                        if (selectedMeetingFilter !== "All" && m.id !== selectedMeetingFilter) return false;
                                        return true;
                                    })
                                    .map(a => a.meetingId)
                            )).length}
                        </h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Users className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">Results Avg Attendance</p>
                        <h3 className="text-2xl font-black text-slate-800">{avgAttendance}%</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Filter className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">Filtered Members</p>
                        <h3 className="text-2xl font-black text-slate-800">{filteredData.length}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
                    {/* Top row controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex bg-white rounded-lg border border-slate-200 p-1 w-full md:w-auto">
                            {['All', 'Secretariat', 'Executive'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterCommittee(tab as any)}
                                    className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filterCommittee === tab ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 ring-1 ring-blue-500/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    {/* Filter row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3 rounded-xl border border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Meeting Title</label>
                            <select value={selectedMeetingFilter} onChange={e => setSelectedMeetingFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500">
                                <option value="All">All Meetings</option>
                                {occurredMeetingsList.map((m: any) => (
                                    <option key={m.id} value={m.id}>{m.title} ({m.date})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Attendance %</label>
                            <select value={attendanceFilter} onChange={e => setAttendanceFilter(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500">
                                <option value="All">All Performance</option>
                                <option value="<50">Below 50% (Poor)</option>
                                <option value="50-80">50% - 80% (Average)</option>
                                <option value=">80">Above 80% (Good)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center text-sm font-bold">
                    <div className="text-blue-800">
                        {selectedMemberIds.size > 0 ? `${selectedMemberIds.size} members selected` : "No individual members selected (Actions will apply to ALL filtered below)"}
                    </div>
                    {selectedMemberIds.size > 0 && <button onClick={() => setSelectedMemberIds(new Set())} className="text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-md border border-blue-200 shadow-sm transition-colors">Clear Selection</button>}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-4 w-12 text-center cursor-pointer" onClick={toggleSelectAll}>
                                    <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                                </th>
                                <th className="px-4 py-4">Member Info</th>
                                <th className="px-6 py-4">Committee</th>
                                <th className="px-6 py-4 text-center">Present</th>
                                <th className="px-6 py-4 text-center">Late</th>
                                <th className="px-6 py-4 text-center">Absent</th>
                                <th className="px-6 py-4 text-right">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? (
                                filteredData.map(({ member, stats }) => {
                                    const isPoor = stats.percentage < 50;
                                    const isSelected = selectedMemberIds.has(member.id);

                                    return (
                                        <tr key={member.id} className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/20' : ''} ${isPoor && stats.totalRelevant > 0 ? (!isSelected ? 'bg-red-50/30' : 'bg-red-50/50') : ''}`} onClick={() => toggleSelect(member.id)}>
                                            <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(member.id)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 pointer-events-none" />
                                            </td>
                                            <td className="px-4 py-4 cursor-pointer group" onClick={e => { e.stopPropagation(); setSelectedMemberForDetails(member.id); }}>
                                                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                                    {member.name}
                                                    {isPoor && stats.totalRelevant > 0 && <AlertCircle className="w-4 h-4 text-red-500" />}
                                                </div>
                                                <div className="text-xs font-medium text-slate-500 mt-0.5 group-hover:text-blue-500 transition-colors">{member.designation} • {member.mobile}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${member.committeeType === 'Secretariat' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {member.committeeType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-emerald-600">{stats.presentCount}</td>
                                            <td className="px-6 py-4 text-center font-bold text-amber-600">{stats.lateCount}</td>
                                            <td className="px-6 py-4 text-center font-bold text-red-600">{stats.absentCount}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isPoor ? 'bg-red-500' : stats.percentage < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${stats.percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className={`font-black w-10 ${isPoor && stats.totalRelevant > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {stats.percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No members or reports found matching filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedMemberForDetails && (
                <MemberDetailsModal
                    memberId={selectedMemberForDetails}
                    onClose={() => setSelectedMemberForDetails(null)}
                    members={members}
                    meetings={meetings}
                    attendanceRecords={attendanceRecords}
                />
            )}
        </div>
    );
}

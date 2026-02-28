"use client"

import { useState, Suspense, useEffect } from "react";
import { useAppStore, CommitteeType, Meeting } from "@/lib/store";
import { Plus, Search, Calendar, Clock, MapPin, Users, ClipboardCheck, Edit, Trash2, CalendarDays, BarChart3, Share2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import AttendancePage from "../attendance/page";
import ReportsPage from "../reports/page";

function MeetingsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'meetings');
    const { meetings, addMeeting, updateMeeting, deleteMeeting } = useAppStore();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [meetingType, setMeetingType] = useState<CommitteeType>("Secretariat");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [agendaItems, setAgendaItems] = useState<string[]>([""]);

    const handleAgendaChange = (index: number, value: string) => {
        const newItems = [...agendaItems];
        newItems[index] = value;
        setAgendaItems(newItems);
    };

    const addAgendaItem = () => {
        setAgendaItems([...agendaItems, ""]);
    };

    const removeAgendaItem = (index: number) => {
        if (agendaItems.length === 1) {
            setAgendaItems([""]);
            return;
        }
        const newItems = [...agendaItems];
        newItems.splice(index, 1);
        setAgendaItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const description = agendaItems.filter(item => item.trim() !== "").map((item, index) => `${index + 1}. ${item.trim()}`).join('\n');
        if (editingId) {
            updateMeeting(editingId, { title, meetingType, date, time, location, description });
        } else {
            addMeeting({ title, meetingType, date, time, location, description });
        }
        resetForm();
    };

    const resetForm = () => {
        setTitle("");
        setMeetingType("Secretariat");
        setDate("");
        setTime("");
        setLocation("");
        setAgendaItems([""]);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (meeting: Meeting) => {
        setTitle(meeting.title);
        setMeetingType(meeting.meetingType);
        setDate(meeting.date);
        setTime(meeting.time);
        setLocation(meeting.location);
        const parsedAgendas = meeting.description ? meeting.description.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(Boolean) : [""];
        setAgendaItems(parsedAgendas.length > 0 ? parsedAgendas : [""]);
        setEditingId(meeting.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleShareWhatsApp = (meeting: Meeting) => {
        const text = `*SSF Pulikkal Division - Meeting Scheduled*\n\n*${meeting.title}*\n📝 *Type:* ${meeting.meetingType}\n📅 *Date:* ${format(new Date(meeting.date), "PPP")}\n⏰ *Time:* ${meeting.time}\n📍 *Location:* ${meeting.location}\n\n*Agenda:*\n${meeting.description || 'No specific agenda attached.'}\n\nPlease make sure to attend on time.`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const sortedMeetings = [...meetings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const switchTab = (tab: string) => {
        setActiveTab(tab);
        router.push(`/meetings?tab=${tab}`);
    }

    // Effect to sync tab if URL changes manually
    useEffect(() => {
        if (searchParams.get('tab')) {
            setActiveTab(searchParams.get('tab')!);
        }
    }, [searchParams]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Master Tab Navigation */}
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto w-full max-w-2xl mx-auto mb-8 relative z-10">
                <button
                    onClick={() => switchTab('meetings')}
                    className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'meetings' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                    <CalendarDays className="w-4 h-4" /> Schedule
                </button>
                <button
                    onClick={() => switchTab('attendance')}
                    className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                    <ClipboardCheck className="w-4 h-4" /> Attendance
                </button>
                <button
                    onClick={() => switchTab('reports')}
                    className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                    <BarChart3 className="w-4 h-4" /> Reports
                </button>
            </div>

            {activeTab === 'attendance' && <AttendancePage />}
            {activeTab === 'reports' && <ReportsPage />}

            {activeTab === 'meetings' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meetings Hub</h1>
                            <p className="text-slate-500 text-sm mt-1">Schedule and manage committee meetings</p>
                        </div>
                        <button
                            onClick={() => {
                                if (showForm) resetForm();
                                else setShowForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                        >
                            {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Meeting</>}
                        </button>
                    </div>

                    {showForm && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Meeting' : 'Schedule New Meeting'}</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Title</label>
                                    <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. Monthly Review Meeting" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Type</label>
                                    <select required value={meetingType} onChange={(e) => setMeetingType(e.target.value as CommitteeType)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                        <option value="Secretariat">Secretariat</option>
                                        <option value="Executive">Executive</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input required value={date} onChange={(e) => setDate(e.target.value)} type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <input required value={time} onChange={(e) => setTime(e.target.value)} type="time" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                    <input required value={location} onChange={(e) => setLocation(e.target.value)} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. Head Office" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Agenda</label>
                                    <div className="space-y-2">
                                        {agendaItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-400 w-6 text-right">{index + 1}.</span>
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => handleAgendaChange(index, e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                                    placeholder="Agenda item..."
                                                    required={index === 0 && agendaItems.length === 1}
                                                />
                                                <button type="button" onClick={() => removeAgendaItem(index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-lg border border-slate-200 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addAgendaItem} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1 pl-8 pb-2">
                                            <Plus className="w-4 h-4" /> Add Agenda Item
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-2 mt-4">
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95">
                                        {editingId ? 'Update Meeting' : 'Save Meeting'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedMeetings.length > 0 ? (
                            sortedMeetings.map((meeting) => (
                                <div key={meeting.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow group relative overflow-hidden">
                                    {/* Type Badge */}
                                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border-b border-l border-slate-200`}>
                                        {meeting.meetingType}
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 mt-2 mb-1 pr-16 leading-tight">{meeting.title}</h3>
                                    <div className="mb-4 flex-1">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Agenda</p>
                                        <p className="text-slate-600 text-sm whitespace-pre-wrap line-clamp-3">{meeting.description}</p>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center text-sm text-slate-600 gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>{format(new Date(meeting.date), "PPP")}</span>
                                            <span className="text-slate-300 mx-1">•</span>
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>{meeting.time}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span>{meeting.location}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => handleEdit(meeting)} className="w-9 h-9 flex justify-center items-center rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors tooltip-trigger relative" title="Edit Meeting">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleShareWhatsApp(meeting)} className="w-9 h-9 flex justify-center items-center rounded-lg border border-slate-200 text-slate-500 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-colors tooltip-trigger relative" title="Share on WhatsApp">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => {
                                                if (confirm('Are you sure you want to delete this meeting? All associated attendance records will also be deleted.')) deleteMeeting(meeting.id);
                                            }} className="w-9 h-9 flex justify-center items-center rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors" title="Delete Meeting">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button onClick={() => {
                                            setActiveTab('attendance');
                                            router.push(`/meetings?tab=attendance&meetingId=${meeting.id}`);
                                        }} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white flex-1 justify-center whitespace-nowrap cursor-pointer">
                                            <ClipboardCheck className="w-4 h-4" /> Check Attendance &rarr;
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm border-dashed">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-slate-700 font-medium">No Meetings Scheduled</h3>
                                <p className="text-slate-500 text-sm mt-1">Create a meeting to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MeetingsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Hub...</div>}>
            <MeetingsContent />
        </Suspense>
    );
}

"use client"

import { useAppStore } from "@/lib/store";
import { Users, Building2, UserCircle, Calendar, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const { members, meetings } = useAppStore();

  const secMembers = members.filter(m => m.committeeType === 'Secretariat').length;
  const execMembers = members.filter(m => m.committeeType === 'Executive').length;

  const sortedMeetings = [...meetings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latestMeeting = sortedMeetings[0];

  const cards = [
    { title: "Total Members", value: members.length, icon: Users, theme: "text-blue-600 bg-blue-50/80 ring-1 ring-blue-100" },
    { title: "Secretariat", value: secMembers, icon: UserCircle, theme: "text-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-100" },
    { title: "Executive", value: execMembers, icon: Building2, theme: "text-purple-600 bg-purple-50/80 ring-1 ring-purple-100" },
    { title: "Total Meetings", value: meetings.length, icon: Calendar, theme: "text-amber-600 bg-amber-50/80 ring-1 ring-amber-100" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome to the Division Committee Attendance Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 translate-y-0 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
                <h3 className="text-3xl font-black mt-2 text-slate-800 tracking-tight">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.theme}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Meeting Status */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6 mt-8">
        <h2 className="text-[13px] font-bold text-slate-500 mb-5 flex items-center gap-2 uppercase tracking-widest">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Latest Status
        </h2>

        {latestMeeting ? (
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center p-5 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">{latestMeeting.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{latestMeeting.description}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-[13px] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {latestMeeting.date}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">{latestMeeting.time}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">Location: {latestMeeting.location}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-white text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100 shadow-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {latestMeeting.meetingType}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
            <p className="text-slate-500">No meetings recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

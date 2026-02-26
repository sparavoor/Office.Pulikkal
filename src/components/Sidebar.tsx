"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, CalendarDays, ClipboardCheck, BarChart3, Building, Wallet } from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Meetings hub', href: '/meetings', icon: CalendarDays },
    { name: 'Finance', href: '/finance', icon: Wallet },
];

export function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 h-full bg-[#0B1120] border-r border-slate-800 text-slate-300 shadow-2xl">
            <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-900/20 ring-1 ring-white/10">
                    <Building className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-white tracking-tight leading-tight">
                        <span className="font-cooper font-normal tracking-wide text-[22px]">SSF</span> Division
                    </h1>
                    <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-0.5 opacity-80">Portal</p>
                </div>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Navigation</p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium relative",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400 font-bold"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            )}
                            onClick={onCloseMobile}
                        >
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                            <item.icon className={cn("w-4 h-4", isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300")} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-800/60">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-800/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shadow-inner relative z-10">
                        A
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-200 leading-none">Admin User</p>
                        <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[130px]" title="ssfpulikkaldivision@gmail.com">ssfpulikkaldivision@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

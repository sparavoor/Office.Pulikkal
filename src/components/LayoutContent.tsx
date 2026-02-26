"use client"

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Menu, X, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { fetchInitialData, isLoading } = useAppStore();

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Wrapper */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] px-4 sm:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Administrator Portal</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-right mr-1 hidden sm:flex">
                            <span className="text-sm font-bold text-slate-800">Admin</span>
                            <span className="text-xs text-slate-500 font-medium">Division Center</span>
                        </div>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                            A
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <p className="font-medium animate-pulse">Connecting to Division Database...</p>
                        </div>
                    ) : (
                        children
                    )}
                </main>
            </div>
        </div>
    );
}

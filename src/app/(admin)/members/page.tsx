"use client"

import { useState } from "react";
import { useAppStore, CommitteeType, Member } from "@/lib/store";
import { Plus, Search, Trash2, Edit } from "lucide-react";

export default function MembersPage() {
    const { members, addMember, updateMember, deleteMember } = useAppStore();
    const [activeTab, setActiveTab] = useState<'All' | 'Secretariat' | 'Executive'>('All');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [designation, setDesignation] = useState("");
    const [committeeType, setCommitteeType] = useState<CommitteeType>("Secretariat");

    const filteredMembers = members.filter(m =>
        activeTab === 'All' ||
        m.committeeType === activeTab ||
        (activeTab === 'Executive' && m.committeeType === 'Secretariat')
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateMember(editingId, { name, mobile, designation, committeeType });
        } else {
            addMember({ name, mobile, designation, committeeType });
        }
        resetForm();
    };

    const resetForm = () => {
        setName("");
        setMobile("");
        setDesignation("");
        setCommitteeType("Secretariat");
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (member: Member) => {
        setName(member.name);
        setMobile(member.mobile);
        setDesignation(member.designation);
        setCommitteeType(member.committeeType);
        setEditingId(member.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Members Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage Secretariat and Executive members</p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                >
                    {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Member</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit Member' : 'Add New Member'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input required value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                            <input required value={mobile} onChange={(e) => setMobile(e.target.value)} type="tel" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="+91 98765 43210" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                            <input required value={designation} onChange={(e) => setDesignation(e.target.value)} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. Secretary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Committee Type</label>
                            <select required value={committeeType} onChange={(e) => setCommitteeType(e.target.value as CommitteeType)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
                                <option value="Secretariat">Secretariat</option>
                                <option value="Executive">Executive</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 mt-4">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95">
                                {editingId ? 'Update Member' : 'Save Member'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 p-2 flex flex-col sm:flex-row justify-between items-center sm:gap-0 gap-4">
                    <div className="flex p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
                        {['All', 'Secretariat', 'Executive'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex-1 sm:flex-none ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64 px-2 sm:px-4 mb-2 sm:mb-0">
                        <Search className="w-4 h-4 text-slate-400 absolute left-5 sm:left-7 top-3" />
                        <input type="text" placeholder="Search members..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-lg">Name</th>
                                <th className="px-6 py-4">Mobile</th>
                                <th className="px-6 py-4">Designation</th>
                                <th className="px-6 py-4">Committee</th>
                                <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{member.mobile}</td>
                                        <td className="px-6 py-4 text-slate-600">{member.designation}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded bg-blue-50 border border-blue-100/50 text-xs font-bold text-blue-700 uppercase tracking-widest`}>
                                                {member.committeeType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(member)} className="text-slate-400 hover:text-blue-600 p-2 transition-colors inline-block"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => {
                                                if (confirm('Are you sure you want to delete this member?')) deleteMember(member.id);
                                            }} className="text-slate-400 hover:text-red-600 p-2 transition-colors inline-block"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

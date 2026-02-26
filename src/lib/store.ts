import { create } from 'zustand';

export type CommitteeType = 'Secretariat' | 'Executive';

export interface Member {
    id: string;
    name: string;
    mobile: string;
    designation: string;
    committeeType: CommitteeType;
    createdAt: string;
}

export interface Meeting {
    id: string;
    title: string;
    meetingType: CommitteeType;
    date: string;
    time: string;
    location: string;
    description: string;
    createdAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecord {
    id: string;
    meetingId: string;
    memberId: string;
    status: AttendanceStatus;
    markedAt: string;
}

export type TransactionType = 'Cash In' | 'Cash Out';
export type PaymentMode = 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque' | 'Other';

export interface FinanceRecord {
    id: string;
    type: TransactionType;
    amount: number;
    category: string;
    donorName?: string;
    description: string;
    date: string;
    paymentMode: PaymentMode;
    createdAt: string;
}

export interface ReceiptTemplate {
    orgName: string;
    orgAddress: string;
    orgContact: string;
    signatureText: string;
    note: string;
}

interface AppState {
    members: Member[];
    meetings: Meeting[];
    attendanceRecords: AttendanceRecord[];
    financeRecords: FinanceRecord[];
    isLoading: boolean;
    receiptTemplate: ReceiptTemplate;

    // Actions
    fetchInitialData: () => Promise<void>;
    addMember: (member: Omit<Member, 'id' | 'createdAt'>) => Promise<void>;
    updateMember: (id: string, member: Partial<Member>) => Promise<void>;
    deleteMember: (id: string) => Promise<void>;
    addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => Promise<string>;
    updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<void>;
    deleteMeeting: (id: string) => Promise<void>;
    markAttendance: (records: Omit<AttendanceRecord, 'id' | 'markedAt'>[]) => Promise<void>;
    addFinanceRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => Promise<void>;
    updateFinanceRecord: (id: string, record: Partial<FinanceRecord>) => Promise<void>;
    deleteFinanceRecord: (id: string) => Promise<void>;
    updateReceiptTemplate: (template: Partial<ReceiptTemplate>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    members: [],
    meetings: [],
    attendanceRecords: [],
    financeRecords: [],
    isLoading: false,
    receiptTemplate: {
        orgName: "SSF Pulikkal Division",
        orgAddress: "Kerala, India",
        orgContact: "+91 00000 00000",
        signatureText: "Finance Secretary",
        note: "Thank you for your generous contribution."
    },

    fetchInitialData: async () => {
        set({ isLoading: true });
        try {
            const [membersRes, meetingsRes, attendanceRes, financeRes] = await Promise.all([
                fetch('/api/members'),
                fetch('/api/meetings'),
                fetch('/api/attendance'),
                fetch('/api/finance')
            ]);

            const members = await membersRes.json();
            const meetings = await meetingsRes.json();
            const attendanceRecords = await attendanceRes.json();
            const financeRecords = await financeRes.json();

            set({
                members: Array.isArray(members) ? members : [],
                meetings: Array.isArray(meetings) ? meetings : [],
                attendanceRecords: Array.isArray(attendanceRecords) ? attendanceRecords : [],
                financeRecords: Array.isArray(financeRecords) ? financeRecords : []
            });
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addMember: async (member) => {
        try {
            const res = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(member)
            });
            const newMember = await res.json();
            set((state) => ({ members: [newMember, ...state.members] }));
        } catch (error) {
            console.error('Failed to add member:', error);
        }
    },

    updateMember: async (id, data) => {
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updatedMember = await res.json();
            set((state) => ({
                members: state.members.map(m => m.id === id ? updatedMember : m)
            }));
        } catch (error) {
            console.error('Failed to update member:', error);
        }
    },

    deleteMember: async (id) => {
        try {
            await fetch(`/api/members/${id}`, { method: 'DELETE' });
            set((state) => ({
                members: state.members.filter(m => m.id !== id),
                attendanceRecords: state.attendanceRecords.filter(a => a.memberId !== id)
            }));
        } catch (error) {
            console.error('Failed to delete member:', error);
        }
    },

    addMeeting: async (meeting) => {
        try {
            const res = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(meeting)
            });
            const newMeeting = await res.json();
            set((state) => ({ meetings: [newMeeting, ...state.meetings] }));
            return newMeeting.id;
        } catch (error) {
            console.error('Failed to add meeting:', error);
            return '';
        }
    },

    updateMeeting: async (id, data) => {
        try {
            const res = await fetch(`/api/meetings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updated = await res.json();
            set((state) => ({
                meetings: state.meetings.map(m => m.id === id ? updated : m)
            }));
        } catch (error) {
            console.error('Failed to update meeting:', error);
        }
    },

    deleteMeeting: async (id) => {
        try {
            await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
            set((state) => ({
                meetings: state.meetings.filter(m => m.id !== id),
                attendanceRecords: state.attendanceRecords.filter(a => a.meetingId !== id)
            }));
        } catch (error) {
            console.error('Failed to delete meeting:', error);
        }
    },

    markAttendance: async (records) => {
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(records)
            });
            const newRecords = await res.json();

            set((state) => {
                const memberIds = records.map(r => r.memberId);
                const meetingId = records[0]?.meetingId;
                const filtered = state.attendanceRecords.filter(
                    a => !(a.meetingId === meetingId && memberIds.includes(a.memberId))
                );
                return {
                    attendanceRecords: [...filtered, ...newRecords]
                };
            });
        } catch (error) {
            console.error('Failed to mark attendance:', error);
        }
    },

    addFinanceRecord: async (record) => {
        try {
            const res = await fetch('/api/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            const newRecord = await res.json();
            set((state) => ({ financeRecords: [newRecord, ...state.financeRecords] }));
        } catch (error) {
            console.error('Failed to add finance record:', error);
        }
    },

    updateFinanceRecord: async (id, data) => {
        try {
            const res = await fetch(`/api/finance/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updated = await res.json();
            set((state) => ({
                financeRecords: state.financeRecords.map(f => f.id === id ? updated : f)
            }));
        } catch (error) {
            console.error('Failed to update finance record:', error);
        }
    },

    deleteFinanceRecord: async (id) => {
        try {
            await fetch(`/api/finance/${id}`, { method: 'DELETE' });
            set((state) => ({
                financeRecords: state.financeRecords.filter(f => f.id !== id)
            }));
        } catch (error) {
            console.error('Failed to delete finance record:', error);
        }
    },

    updateReceiptTemplate: (data) => set((state) => ({
        receiptTemplate: { ...state.receiptTemplate, ...data }
    })),
}));

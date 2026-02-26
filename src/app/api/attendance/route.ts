import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Safety check for Vercel build time
    if (!process.env.DATABASE_URL) {
        return NextResponse.json([]);
    }
    try {
        const records = await prisma.attendanceRecord.findMany();
        return NextResponse.json(records);
    } catch (error) {
        console.error('Failed to fetch attendance records:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json(); // Array of records

        // Use a transaction to ensure all records are saved safely
        const results = await prisma.$transaction(
            body.map((record: any) =>
                prisma.attendanceRecord.upsert({
                    where: {
                        meetingId_memberId: {
                            meetingId: record.meetingId,
                            memberId: record.memberId
                        }
                    },
                    update: {
                        status: record.status,
                        markedAt: new Date()
                    },
                    create: {
                        meetingId: record.meetingId,
                        memberId: record.memberId,
                        status: record.status
                    }
                })
            )
        );

        return NextResponse.json(results);
    } catch (error) {
        console.error('Failed to save attendance:', error);
        return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
    }
}

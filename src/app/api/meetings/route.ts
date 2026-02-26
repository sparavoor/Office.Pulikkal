import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const meetings = await prisma.meeting.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(meetings);
    } catch (error) {
        console.error('Failed to fetch meetings:', error);
        return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, meetingType, date, time, location, description } = body;

        const meeting = await prisma.meeting.create({
            data: {
                title,
                meetingType,
                date,
                time,
                location,
                description
            }
        });

        return NextResponse.json(meeting);
    } catch (error) {
        console.error('Failed to create meeting:', error);
        return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
    }
}

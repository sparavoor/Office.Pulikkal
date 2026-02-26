import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const records = await prisma.financeRecord.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(records);
    } catch (error) {
        console.error('Failed to fetch finance records:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const record = await prisma.financeRecord.create({
            data: body
        });
        return NextResponse.json(record);
    } catch (error) {
        console.error('Failed to create finance record:', error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

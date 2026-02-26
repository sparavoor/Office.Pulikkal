import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!process.env.DATABASE_URL) {
        return NextResponse.json([]);
    }
    try {
        const members = await prisma.member.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(members);
    } catch (error) {
        console.error('Failed to fetch members:', error);
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, mobile, designation, committeeType } = body;

        const member = await prisma.member.create({
            data: {
                name,
                mobile,
                designation,
                committeeType
            }
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error('Failed to create member:', error);
        return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
    }
}

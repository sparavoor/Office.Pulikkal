import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const meeting = await prisma.meeting.update({
            where: { id },
            data: body
        });
        return NextResponse.json(meeting);
    } catch (error) {
        console.error('Failed to update meeting:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.meeting.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete meeting:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { members, meeting } = await request.json();

        if (!members || !Array.isArray(members) || !meeting) {
            return NextResponse.json({ error: 'Invalid data provided' }, { status: 400 });
        }

        const token = process.env.WHAPI_TOKEN;

        if (!token) {
            return NextResponse.json({ error: 'Whapi.Cloud API credentials not configured' }, { status: 500 });
        }

        const results = [];

        // Format date
        const meetingDate = new Date(meeting.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
        const agenda = meeting.description ? `\n\n*Agenda:*\n${meeting.description}` : '';
        const messageText = `*Reminder: ${meeting.title}*\n📅 Date: ${meetingDate}\n⏰ Time: ${meeting.time}\n📍 Location: ${meeting.location}${agenda}\n\nPlease let us know your availability.`;

        // Broadcast to all members
        for (const member of members) {
            // Clean the phone number (remove +, spaces, non-digits)
            // Note: WhatsApp API requires country code. We assume Indian (+91) if it's 10 digits
            let cleanNumber = member.mobile.replace(/\D/g, '');
            if (cleanNumber.length === 10) {
                cleanNumber = '91' + cleanNumber;
            }

            try {
                const response = await fetch(`https://gate.whapi.cloud/messages/text`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        typing_time: 0,
                        to: `${cleanNumber}@s.whatsapp.net`,
                        body: messageText
                    })
                });

                const data = await response.json();
                results.push({
                    id: member.id,
                    name: member.name,
                    mobile: cleanNumber,
                    success: response.ok,
                    data
                });
            } catch (err: any) {
                results.push({
                    id: member.id,
                    name: member.name,
                    mobile: cleanNumber,
                    success: false,
                    error: err.message
                });
            }
        }

        const allSuccess = results.every(r => r.success);

        return NextResponse.json({
            success: allSuccess,
            message: allSuccess ? 'Broadcast sent successfully!' : 'Some messages failed to send.',
            details: results
        });

    } catch (error) {
        console.error('Broadcast Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

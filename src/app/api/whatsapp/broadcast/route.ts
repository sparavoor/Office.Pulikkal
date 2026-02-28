import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { members } = await request.json();

        if (!members || !Array.isArray(members)) {
            return NextResponse.json({ error: 'Invalid members data' }, { status: 400 });
        }

        const token = process.env.WHATSAPP_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!token || !phoneId) {
            return NextResponse.json({ error: 'WhatsApp API credentials not configured' }, { status: 500 });
        }

        const results = [];

        // Broadcast to all members
        for (const member of members) {
            // Clean the phone number (remove +, spaces, non-digits)
            // Note: WhatsApp API requires country code. We assume Indian (+91) if it's 10 digits
            let cleanNumber = member.mobile.replace(/\D/g, '');
            if (cleanNumber.length === 10) {
                cleanNumber = '91' + cleanNumber;
            }

            try {
                const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: cleanNumber,
                        type: 'template',
                        template: {
                            name: 'meeting_reminder',
                            language: {
                                code: 'en_US' // Adjust if template is in different language, e.g., en, ml
                            }
                            // Note: If your template has variables (like {{1}}), you would pass a 'components' array here.
                        }
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

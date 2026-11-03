import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || to.length === 0) {
      return NextResponse.json({ message: 'Nincs címzett megadva.' }, { status: 400 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'famity.hu Értesítő <ertesites@famity.hu>',
        to: to,
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API hiba:', data);
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('E-mail küldési hiba:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

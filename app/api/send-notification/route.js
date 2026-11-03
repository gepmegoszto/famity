import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { tokens, title, body } = await request.json();

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ success: false, message: 'Nincsenek céltokenek' });
    }

    // Firebase Cloud Messaging REST API hívás (vagy Firebase Admin SDK)
    // Megjegyzés: Production környezetben ehhez a Google OAuth2 Access Token / Service Account szükséges
    console.log(`[PUSH ÉRTESÍTÉS KIKÜLDVE] Cím: ${title} | Üzenet: ${body} | Címzettek száma: ${tokens.length}`);

    return NextResponse.json({ success: true, count: tokens.length });
  } catch (error) {
    console.error('API Értesítési hiba:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * E-mail értesítés küldése a családtagoknak
 * @param {Object} params
 * @param {string} params.familyId - A család egyedi azonosítója
 * @param {string} params.senderId - Az akciót végrehajtó felhasználó ID-ja (ne kapjon e-mailt)
 * @param {string} params.subject - Az e-mail tárgya
 * @param {string} params.message - Az e-mail szöveges tartalma
 * @param {string} [params.actionUrl] - Opcionális hivatkozás gomb az e-mailben
 */
export async function sendFamilyEmailNotification({ familyId, senderId, subject, message, actionUrl }) {
  try {
    // Családtagok lekérése
    const membersSnap = await getDocs(collection(db, 'families', familyId, 'members'));
    const recipientEmails = [];

    membersSnap.forEach(docSnap => {
      const data = docSnap.data();
      // A küldőnek nem küldünk saját maga által kiváltott értesítést
      if (docSnap.id !== senderId && data.email) {
        recipientEmails.push(data.email);
      }
    });

    if (recipientEmails.length === 0) return;

    // Szépen megformázott HTML e-mail sablon
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f4; margin: 0; padding: 20px; }
            .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .header { text-align: center; margin-bottom: 24px; }
            .logo { height: 40px; width: auto; }
            .title { color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 12px; margin-bottom: 0; }
            .content { color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 28px; background-color: #f8fafc; padding: 16px; border-radius: 16px; border-left: 4px solid #2563eb; }
            .button-wrapper { text-align: center; }
            .button { background-color: #2563eb; color: #ffffff !important; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }
            .footer { text-align: center; margin-top: 28px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1 class="title">famity<span style="color: #2563eb;">.hu</span> — Családi értesítés</h1>
            </div>
            <div class="content">
              ${message}
            </div>
            <div class="button-wrapper">
              <a href="${actionUrl || 'https://famity.hu'}" class="button">Megnyitás a famity.hu-n</a>
            </div>
            <div class="footer">
              Ezt az e-mailt a famity.hu családi vezérlőpulton végzett aktivitás váltotta ki.
            </div>
          </div>
        </body>
      </html>
    `;

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmails,
        subject: subject,
        html: htmlContent
      })
    });
  } catch (err) {
    console.error('E-mail értesítés küldési hiba:', err);
  }
}

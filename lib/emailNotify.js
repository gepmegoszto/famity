import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Alapértelmezett HTML keret és elegáns aláírás
function wrapEmailTemplate(contentHtml) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f4; margin: 0; padding: 20px; }
          .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .header { text-align: center; margin-bottom: 24px; }
          .title { color: #0f172a; font-size: 20px; font-weight: 800; margin-top: 12px; margin-bottom: 0; }
          .content { color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 28px; background-color: #f8fafc; padding: 20px; border-radius: 18px; border-left: 4px solid #2563eb; }
          .button-wrapper { text-align: center; margin-top: 20px; margin-bottom: 20px; }
          .button { background-color: #2563eb; color: #ffffff !important; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }
          .signature { border-top: 1px solid #f1f5f9; pt: 20px; margin-top: 24px; text-align: left; color: #64748b; font-size: 13px; line-height: 1.5; }
          .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">famity<span style="color: #2563eb;">.hu</span></h1>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="signature">
            <p style="margin: 0; font-weight: bold; color: #0f172a;">Szeretettel,</p>
            <p style="margin: 2px 0 0 0; color: #2563eb; font-weight: bold;">A famity.hu csapata</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;">Az otthoni logisztika legkedvesebb segítője</p>
          </div>
          <div class="footer">
            Ezt az automatikus értesítést a famity.hu családi vezérlőpulton végzett aktivitás váltotta ki.
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Általános családi értesítő
 * @param {string} targetUserId - Ha meg van adva, CSAK neki megy az e-mail. Ha null, akkor mindenkinek a küldőn kívül.
 */
export async function sendEmailNotification({ familyId, senderId = null, targetUserId = null, subject, htmlContent }) {
  try {
    const recipientEmails = [];

    if (targetUserId) {
      // Csak egy konkrét felhasználónak küldjük
      const userSnap = await getDoc(doc(db, 'users', targetUserId));
      if (userSnap.exists() && userSnap.data().email) {
        recipientEmails.push(userSnap.data().email);
      }
    } else if (familyId) {
      // A család minden tagjának küldjük (a küldő kivételével)
      const membersSnap = await getDocs(collection(db, 'families', familyId, 'members'));
      membersSnap.forEach(docSnap => {
        const data = docSnap.data();
        if (docSnap.id !== senderId && data.email) {
          recipientEmails.push(data.email);
        }
      });
    }

    if (recipientEmails.length === 0) return;

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmails,
        subject: subject,
        html: wrapEmailTemplate(htmlContent)
      })
    });
  } catch (err) {
    console.error('E-mail értesítés küldési hiba:', err);
  }
}

/* ==========================================================================
   SPECIFIKUS ÉRTESÍTÉSI ESETEK ÉS SABLONOK
   ========================================================================== */

// 1. Új hűtőmágnes (Mindenkinek)
export async function notifyNewNotice({ familyId, senderId, senderName, title }) {
  const subject = `📌 Új hűtőmágnes a kijelzőn: "${title}"`;
  const htmlContent = `
    <p style="margin-top:0;">Kedves Családtagunk!</p>
    <p><strong>${senderName}</strong> egy új hűtőmágnes jegyzetet tűzött ki a közös táblára:</p>
    <p style="font-size: 16px; font-weight: bold; color: #0f172a; background: #ffffff; padding: 12px; border-radius: 12px; border: 1px dashed #cbd5e1; text-align: center;">
      "${title}"
    </p>
    <div class="button-wrapper">
      <a href="https://famity.hu" class="button">Megnyitás a hűtőmágnesen</a>
    </div>
  `;
  await sendEmailNotification({ familyId, senderId, subject, htmlContent });
}

// 2. Új házimunka feladat (Csak a kijelölt felelősnek)
export async function notifyNewChore({ familyId, assignedUserId, assignedUserName, choreTitle, points }) {
  const subject = `🧹 Új teendőd érkezett: "${choreTitle}" (+${points} pont)`;
  const htmlContent = `
    <p style="margin-top:0;">Kedves ${assignedUserName}!</p>
    <p>Egy új házimunka feladatot kaptál a családi teendők listáján:</p>
    <div style="background: #ffffff; padding: 14px; border-radius: 14px; border: 1px solid #e2e8f0; margin: 12px 0;">
      <p style="margin: 0; font-weight: bold; color: #0f172a;">${choreTitle}</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #16a34a; font-weight: bold;">Jutalompont: +${points} pont</p>
    </div>
    <p>Végezd el a feladatot, és pipáld ki a felületen a pontok jóváírásához!</p>
    <div class="button-wrapper">
      <a href="https://famity.hu" class="button">Teendők megtekintése</a>
    </div>
  `;
  await sendEmailNotification({ familyId, targetUserId: assignedUserId, subject, htmlContent });
}

// 3. Pontbeváltás (Csak annak, aki az ajánlatot kiírta)
export async function notifyRewardRedeemed({ familyId, creatorUserId, creatorName, redeemerName, rewardTitle, pointsCost }) {
  const subject = `🎁 Pontbeváltás: ${redeemerName} beváltotta a(z) "${rewardTitle}" jutalmat!`;
  const htmlContent = `
    <p style="margin-top:0;">Kedves ${creatorName}!</p>
    <p>Nagyszerű hírem van! <strong>${redeemerName}</strong> sikeresen beváltotta az általad kiírt jutalmat:</p>
    <div style="background: #ffffff; padding: 14px; border-radius: 14px; border: 1px solid #e2e8f0; margin: 12px 0;">
      <p style="margin: 0; font-weight: bold; color: #0f172a;">${rewardTitle}</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #2563eb; font-weight: bold;">Levont pontszám: ${pointsCost} pont</p>
    </div>
    <p>Kérlek, egyeztessetek a jutalom átadásáról vagy teljesítéséről!</p>
    <div class="button-wrapper">
      <a href="https://famity.hu" class="button">Jutalmak kezelése</a>
    </div>
  `;
  await sendEmailNotification({ familyId, targetUserId: creatorUserId, subject, htmlContent });
}

// 4. Új naptári esemény (Mindenkinek)
export async function notifyNewCalendarEvent({ familyId, senderId, senderName, eventTitle, eventDate, eventTime }) {
  const subject = `📅 Új családi esemény: "${eventTitle}"`;
  const htmlContent = `
    <p style="margin-top:0;">Kedves Családtagunk!</p>
    <p><strong>${senderName}</strong> egy új eseményt vett fel a közös családi naptárba:</p>
    <div style="background: #ffffff; padding: 14px; border-radius: 14px; border: 1px solid #e2e8f0; margin: 12px 0;">
      <p style="margin: 0; font-weight: bold; color: #0f172a;">${eventTitle}</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Időpont: <strong>${eventDate} ${eventTime || ''}</strong></p>
    </div>
    <div class="button-wrapper">
      <a href="https://famity.hu" class="button">Naptár megnyitása</a>
    </div>
  `;
  await sendEmailNotification({ familyId, senderId, subject, htmlContent });
}

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function sendFamilyNotification({ familyId, senderId, title, body }) {
  try {
    // 1. Családtagok tokenjeinek lekérése
    const membersSnap = await getDocs(collection(db, 'families', familyId, 'members'));
    
    const tokens = [];
    membersSnap.forEach(docSnap => {
      const data = docSnap.data();
      // Ne a saját magunk telefonjára küldjünk értesítést, és csak ha van token
      if (docSnap.id !== senderId && data.fcmToken && data.notificationsEnabled) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) return;

    // 2. Értesítés kiküldése a szerveroldali API-n keresztül
    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens, title, body })
    });
  } catch (error) {
    console.error('Hiba a push értesítés kiküldésekor:', error);
  }
}

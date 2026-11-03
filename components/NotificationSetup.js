'use client';
import { useState, useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import app from '@/lib/firebase';
import { Bell, BellCheck, AlertCircle } from 'lucide-react';

export default function NotificationSetup({ familyId, userId }) {
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Ez a böngésző nem támogatja a push értesítéseket.');
      return;
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        const messaging = getMessaging(app);
        
        // Service Worker regisztrálása
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // FCM Token kérése
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (currentToken) {
          // Token elmentése a Firestore-ba a családtag alá
          await setDoc(doc(db, 'families', familyId, 'members', userId), {
            fcmToken: currentToken,
            notificationsEnabled: true
          }, { merge: true });

          alert('Értesítések sikeresen bekapcsolva!');
        }
      }
    } catch (error) {
      console.error('Hiba az értesítések beállításakor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 text-xs font-semibold">
        <BellCheck className="w-4 h-4 text-emerald-600" />
        Értesítések aktívak
      </div>
    );
  }

  return (
    <button
      onClick={requestNotificationPermission}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 text-xs font-bold transition"
    >
      <Bell className="w-4 h-4 text-blue-600" />
      {loading ? 'Bekapcsolás...' : 'Értesítések bekapcsolása'}
    </button>
  );
}

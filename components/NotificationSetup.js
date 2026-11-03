'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Bell, BellCheck } from 'lucide-react';

export default function NotificationSetup({ familyId, userId }) {
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setPermission(Notification.permission);
      setIsSupported(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!isSupported) {
      alert('Ez a böngésző nem támogatja a push értesítéseket.');
      return;
    }

    setLoading(true);
    try {
      const { getMessaging, getToken, isSupported: checkMessagingSupported } = await import('firebase/messaging');
      const supported = await checkMessagingSupported();

      if (!supported) {
        alert('A push értesítések nem támogatottak ebben a környezetben.');
        setLoading(false);
        return;
      }

      const resPermission = await Notification.requestPermission();
      setPermission(resPermission);

      if (resPermission === 'granted') {
        const { default: app } = await import('@/lib/firebase');
        const messaging = getMessaging(app);

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey || undefined,
          serviceWorkerRegistration: registration
        });

        if (currentToken) {
          await setDoc(doc(db, 'families', familyId, 'members', userId), {
            fcmToken: currentToken,
            notificationsEnabled: true
          }, { merge: true });

          alert('Értesítések sikeresen bekapcsolva!');
        }
      }
    } catch (error) {
      console.error('Hiba az értesítések beállításakor:', error);
      alert('Nem sikerült bekapcsolni az értesítéseket.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) return null;

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

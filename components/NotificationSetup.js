'use client';
import { useState, useEffect } from 'react';
import { db, app } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Bell, BellCheck, AlertCircle } from 'lucide-react';

export default function NotificationSetup({ familyId, userId }) {
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    setErrorMessage('');

    try {
      const resPermission = await Notification.requestPermission();
      setPermission(resPermission);

      if (resPermission !== 'granted') {
        setLoading(false);
        return;
      }

      const { getMessaging, getToken, isSupported: checkMessagingSupported } = await import('firebase/messaging');
      
      const messagingSupported = await checkMessagingSupported().catch(() => false);
      if (!messagingSupported) {
        setErrorMessage('A push értesítések nem támogatottak ebben a környezetben.');
        setLoading(false);
        return;
      }

      let registration;
      try {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (swErr) {
        console.error('Service Worker hiba:', swErr);
        setErrorMessage('A /firebase-messaging-sw.js nem található a public mappában.');
        setLoading(false);
        return;
      }

      const messaging = getMessaging(app);
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        setErrorMessage('Hiányzik a NEXT_PUBLIC_FIREBASE_VAPID_KEY a Vercel-ben!');
        setLoading(false);
        return;
      }

      const currentToken = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration,
      }).catch((tokenErr) => {
        console.error('FCM Token hiba:', tokenErr);
        return null;
      });

      if (currentToken) {
        await setDoc(doc(db, 'families', familyId, 'members', userId), {
          fcmToken: currentToken,
          notificationsEnabled: true
        }, { merge: true });

        alert('Értesítések sikeresen bekapcsolva!');
      } else {
        setErrorMessage('Érvénytelen VAPID kulcs vagy letiltott értesítési token.');
      }
    } catch (error) {
      console.error('Értesítés beállítási hiba:', error);
      setErrorMessage('Nem sikerült bekapcsolni az értesítéseket.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) return null;

  if (permission === 'granted' && !errorMessage) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 text-xs font-semibold">
        <BellCheck className="w-4 h-4 text-emerald-600" />
        Értesítések aktívak
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={requestNotificationPermission}
        disabled={loading}
        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 text-xs font-bold transition cursor-pointer"
      >
        <Bell className="w-4 h-4 text-blue-600" />
        {loading ? 'Kérés folyamatban...' : 'Értesítések bekapcsolása'}
      </button>
      {errorMessage && (
        <span className="text-[10px] text-red-600 font-medium flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-100">
          <AlertCircle className="w-3 h-3 shrink-0" /> {errorMessage}
        </span>
      )}
    </div>
  );
}

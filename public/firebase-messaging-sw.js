importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "process.env.NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "famity-16802.firebaseapp.com",
  projectId: "famity-16802",
  storageBucket: "famity-16802.firebasestorage.app",
  messagingSenderId: "132756791578",
  appId: "1:132756791578:web:daf513ee9450164d340ca3"
});

const messaging = firebase.messaging();

// Háttérben érkező értesítések kezelése
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || 'Famity értesítés';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // Opcionális ikon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

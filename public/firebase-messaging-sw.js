importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA4q1uX5NcBQy-xKlUSxL1l-LR3RNqS3l8",
  authDomain: "famity-16802.firebaseapp.com",
  projectId: "famity-16802",
  storageBucket: "famity-16802.firebasestorage.app",
  messagingSenderId: "132756791578",
  appId: "1:132756791578:web:daf513ee9450164d340ca3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Famity értesítés';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

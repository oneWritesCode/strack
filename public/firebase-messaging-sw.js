importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js")

firebase.initializeApp({
    apiKey: "AIzaSyDaCRh8yZlK1PCELMb6Z6ZW6aM3AyHbLng",
    authDomain: "skilltracker-e3c7e.firebaseapp.com",
    projectId: "skilltracker-e3c7e",
    messagingSenderId: "48920378777",
    appId: "1:48920378777:web:7bc0b0b9053868569d2708",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

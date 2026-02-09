import { NextResponse } from "next/server";

export async function GET() {
  const swContent = `
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js")

firebase.initializeApp({
    apiKey: \`${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}\`,
    authDomain: \`${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}\`,
    projectId: \`${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}\`,
    messagingSenderId: \`${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSANGING_SENDER_ID}\`,
    appId: \`${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}\`,
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
  `;

  return new NextResponse(swContent, {
    headers: {
      "Content-Type": "application/javascript",
    },
  });
}

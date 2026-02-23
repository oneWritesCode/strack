// "use client";

// import { useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { messaging, getToken } from "@/app/lib/firebase";

// export default function NotificationPermission() {
//   const { data: session } = useSession();

//   useEffect(() => {
//     if (
//       session?.user &&
//       typeof window !== "undefined" &&
//       "serviceWorker" in navigator
//     ) {
//       const registerServiceWorker = async () => {
//         try {
//           const registration = await navigator.serviceWorker.register(
//             "/api/firebase-messaging-sw",
//           );
//           console.log(
//             "Service Worker registered with scope:",
//             registration.scope,
//           );
//           return registration;
//         } catch (error) {
//           console.error("Service Worker registration failed:", error);
//           return null;
//         }
//       };

//       const requestPermission = async (
//         registration: ServiceWorkerRegistration,
//       ) => {
//         try {
//           const permission = await Notification.requestPermission();
//           if (permission === "granted") {
//             const token = await getToken(messaging!, {
//               vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
//               serviceWorkerRegistration: registration,
//             });

//             if (token) {
//               await fetch("/api/notifications/register", {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ token }),
//               });
//             }
//           }
//         } catch (error) {
//           console.error("Error requesting notification permission:", error);
//         }
//       };

//       const registerAndRequest = async () => {
//         const registration = await registerServiceWorker();
//         if (registration) {
//           await requestPermission(registration);
//         }
//       };

//       registerAndRequest();
//     }
//   }, [session]);

//   return null;
// }

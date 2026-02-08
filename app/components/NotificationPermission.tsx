"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { messaging, getToken } from "@/app/lib/firebase";

export default function NotificationPermission() {
  const { data: session } = useSession();

  useEffect(() => {
    if (
      session?.user &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const requestPermission = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const token = await getToken(messaging!, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });

            if (token) {
              await fetch("/api/notifications/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
              });
            }
          }
        } catch (error) {
          console.error("Error requesting notification permission:", error);
        }
      };

      requestPermission();
    }
  }, [session]);

  return null;
}

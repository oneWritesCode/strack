// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { messaging } from "@/app/lib/firebaseAdmin";

// export async function GET(req: Request) {
//   // This endpoint should be protected, e.g., by a secret key in the header
//   const authHeader = req.headers.get("authorization");
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Find users who DON'T have a journal entry for today
//     const usersWithoutJournal = await prisma.user.findMany({
//       where: {
//         journal: {
//           none: {
//             date: today,
//           },
//         },
//       },
//       include: {
//         fcmTokens: true,
//       },
//     });

//     const notifications = [];

//     for (const user of usersWithoutJournal) {
//       for (const fcmToken of user.fcmTokens) {
//         notifications.push(
//           messaging.send({
//             token: fcmToken.token,
//             notification: {
//               title: "Skill Tracker",
//               body: "Don't forget to write about your day!",
//             },
//             webpush: {
//               fcmOptions: {
//                 link: "/",
//               },
//             },
//           }),
//         );
//       }
//     }

//     await Promise.allSettled(notifications);

//     return NextResponse.json({
//       success: true,
//       usersReminded: usersWithoutJournal.length,
//       notificationsSent: notifications.length,
//     });
//   } catch (error) {
//     console.error("Error sending daily reminders:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

// export {};

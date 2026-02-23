// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { token } = await req.json();

//     if (!token) {
//       return NextResponse.json({ error: "Token is required" }, { status: 400 });
//     }

//     // Upsert the token for this user
//     await prisma.fcmToken.upsert({
//       where: { token: token },
//       update: { userId: session.user.id },
//       create: {
//         token: token,
//         userId: session.user.id,
//       },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error registering FCM token:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

// export {};

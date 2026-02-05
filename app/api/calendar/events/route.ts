import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

async function refreshAccessToken(account: any) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // Update the account in the database
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: refreshedTokens.access_token,
        expires_at: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
        refresh_token: refreshedTokens.refresh_token ?? account.refresh_token, // Google may not always return a new refresh token
      },
    });

    return refreshedTokens.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user and their Google account
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: "google" },
        },
      },
    });

    if (!user || user.accounts.length === 0) {
      return NextResponse.json(
        { error: "No Google account linked" },
        { status: 404 },
      );
    }

    const account = user.accounts[0];
    let accessToken = account.access_token;

    // Check if token is expired (expires_at is in seconds)
    const isExpired = account.expires_at
      ? Math.floor(Date.now() / 1000) >= account.expires_at
      : false;

    if (isExpired && account.refresh_token) {
      console.log("Token expired, attempting refresh...");
      accessToken = await refreshAccessToken(account);
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found / failed to refresh" },
        { status: 401 },
      );
    }

    let res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // If still unauthorized, try one refresh just in case our expires_at was out of sync
    if (res.status === 401 && account.refresh_token) {
      console.log("Request unauthorized (401), attempting token refresh...");
      accessToken = await refreshAccessToken(account);
      if (accessToken) {
        res = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/en.indian%23holiday@group.v.calendar.google.com/events",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
      }
    }

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Google API Error:", errorData);
      return NextResponse.json(
        {
          error:
            errorData.error?.message || "Failed to fetch events from Google",
        },
        { status: res.status },
      );
    }
    const data = await res.json();
    console.log("here you go wiht data :: ", data);

    const events =
      data.items?.map((event: any) => ({
        id: event.id,
        title: event.summary ?? "No title",
        start: event.start.dateTime ?? event.start.date,
        end: event.end.dateTime ?? event.end.date,
        allDay: !!event.start.date,
        type: "meeting",
      })) || [];
    console.log("here you go wiht events :: ", events);

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Calendar API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

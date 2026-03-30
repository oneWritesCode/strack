import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    let isOwner = false;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user && user.id === note.userId) {
        isOwner = true; 
      }
    }

    // Ownership check. If user is NOT the owner AND the note isn't public, reject it.
    if (!note.isPublic && !isOwner) {
      return NextResponse.json({ error: "Note not available for everyone" }, { status: 403 });
    }

    return NextResponse.json({ 
      note, 
      isOwner 
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { contentJSON, contentHTML, content, password } = await req.json();

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Allow update if note has NO password OR if the provided password matches
    if (note.password && note.password !== password) {
       // Check if current user is owner
       const session = await getServerSession(authOptions);
       let isOwner = false;
       if (session?.user?.email) {
         const user = await prisma.user.findUnique({
           where: { email: session.user.email },
         });
         if (user && user.id === note.userId) {
           isOwner = true;
         }
       }
       if (!isOwner) {
         return NextResponse.json({ error: "Unauthorized: Incorrect password for editing" }, { status: 401 });
       }
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        contentJSON,
        contentHTML,
        content,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

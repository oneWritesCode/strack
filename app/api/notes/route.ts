import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";

// GET all notes for the authenticated user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST to create a new note
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, title, category, isStarred, isListNote, content, contentHTML, contentJSON, isPublic, password, bookView } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Upsert instead of create, so we can also update note data when syncing
    const note = await prisma.note.upsert({
      where: { id: id },
      update: {
        title,
        category: category || "none",
        isStarred: isStarred || false,
        isListNote: isListNote || false,
        content: content || null,
        contentHTML: contentHTML || null,
        contentJSON: contentJSON || null,
        isPublic: isPublic !== undefined ? isPublic : undefined,
        password: password !== undefined ? password : undefined,
        bookView: bookView !== undefined ? bookView : undefined,
      },
      create: {
        id: id,
        title,
        category: category || "none",
        isStarred: isStarred || false,
        isListNote: isListNote || false,
        content: content || null,
        contentHTML: contentHTML || null,
        contentJSON: contentJSON || null,
        isPublic: isPublic || false,
        password: password || null,
        bookView: bookView || false,
        userId: user.id,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE to remove a note
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 },
      );
    }

    // Check if the note exists and belongs to the user
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote || existingNote.userId !== user.id) {
      return NextResponse.json(
        { error: "Note not found or you do not have permission to delete it" },
        { status: 404 },
      );
    }

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Note deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

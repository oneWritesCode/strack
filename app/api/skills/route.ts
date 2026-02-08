import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// GET all skills
export async function GET() {
  const session = await getServerSession(authOptions);
  // console.log("here is the session", session);
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const skills = await prisma.skill.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const tasks = await prisma.task.findMany({
    where: {
      completed: true,
      journal: {
        userId: session.user.id,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ skills, tasks });
}

// ADD a skill
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const { skillName } = await req.json();

  if (!skillName || !skillName.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const skill = await prisma.skill.create({
    data: {
      skillName,
      userId: session.user.id,
    },
  });

  return NextResponse.json(skill, { status: 201 });
}

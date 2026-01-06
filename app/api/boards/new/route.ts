import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { Board } from "@/models/Board";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { title } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  await connectDB();

  const board = await Board.create({
    title,
    owner: (session.user as any).id,
  });

  return NextResponse.json(board);
}
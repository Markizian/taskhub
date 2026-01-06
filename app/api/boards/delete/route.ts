import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Board } from "@/models/Board";
import { Task } from "@/models/Task";

export async function POST(req: Request) {
  const { boardId } = await req.json();

  await connectDB();

  await Task.deleteMany({ boardId });
  await Board.findByIdAndDelete(boardId);

  return NextResponse.json({ success: true });
}
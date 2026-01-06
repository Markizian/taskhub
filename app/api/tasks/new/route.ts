import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Task } from "@/models/Task";

export async function POST(req: Request) {
  const { boardId, title } = await req.json();

  await connectDB();

  const task = await Task.create({ boardId, title });
  return NextResponse.json(task);
}
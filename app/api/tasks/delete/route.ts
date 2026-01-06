import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Task } from "@/models/Task";

export async function POST(req: Request) {
  const { taskId } = await req.json();

  await connectDB();
  await Task.findByIdAndDelete(taskId);

  return NextResponse.json({ success: true });
}
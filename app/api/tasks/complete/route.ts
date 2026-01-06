import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Task } from "@/models/Task";
import mongoose from "mongoose";

export async function POST(req: Request) {
  const { taskId, done } = await req.json();

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return NextResponse.json({ error: "Invalid taskId" }, { status: 400 });
  }

  await connectDB();

  const task = await Task.findByIdAndUpdate(
    taskId,
    { done },
    { new: true }
  );

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { Board } from "@/models/Board";
import { Task } from "@/models/Task";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const boards = await Board.find({ owner: (session.user as any).id })
    .sort({ createdAt: -1 })
    .lean();

  const boardIds = boards.map((b) => b._id);

  const tasks = await Task.find({ boardId: { $in: boardIds } }).lean();

  const tasksByBoard: Record<string, any[]> = {};

  tasks.forEach((task) => {
    const key = task.boardId.toString();
    if (!tasksByBoard[key]) tasksByBoard[key] = [];
    tasksByBoard[key].push(task);
  });

  const result = boards.map((board) => ({
    ...board,
    tasks: tasksByBoard[board._id.toString()] || [],
  }));

  return NextResponse.json(result);
}
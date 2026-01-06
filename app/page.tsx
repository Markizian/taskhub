"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type TaskType = {
  _id: string;
  title: string;
  done: boolean;
};

type BoardType = {
  _id: string;
  title: string;
  tasks: TaskType[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [boards, setBoards] = useState<BoardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  // LOAD DASHBOARD
  async function loadDashboard() {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    setBoards(data);
    setLoading(false);
  }

  useEffect(() => {
    if (session) loadDashboard();
  }, [session]);

  // BOARD ACTIONS
  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    const res = await fetch("/api/boards/new", {
      method: "POST",
      body: JSON.stringify({ title: newBoardTitle }),
    });

    const board = await res.json();

    setBoards((prevBoards) => {
      const newBoard = {
        ...board,
        tasks: [],
      };

      const updatedBoards = [newBoard, ...prevBoards];
      return updatedBoards;
    });
    setNewBoardTitle("");
  }

  async function deleteBoard(boardId: string) {
    await fetch("/api/boards/delete", {
      method: "POST",
      body: JSON.stringify({ boardId }),
    });

    setBoards((prevBoards) => {
      const updatedBoards = prevBoards.filter((board) => {
        const shouldKeep = board._id !== boardId;
        return shouldKeep;
      });

      return updatedBoards;
    });
  }

  // TASK ACTIONS
  async function createTask(boardId: string, title: string) {
    if (!title.trim()) return;

    const res = await fetch("/api/tasks/new", {
      method: "POST",
      body: JSON.stringify({ boardId, title }),
    });

    const task = await res.json();

    setBoards((prevBoards) => {
      const updatedBoards = prevBoards.map((board) => {
        const isTargetBoard = board._id === boardId;

        if (isTargetBoard) {
          const updatedTasks = [...board.tasks, task];

          const updatedBoard = {
            ...board,
            tasks: updatedTasks,
          };

          return updatedBoard;
        }

        return board;
      });

      return updatedBoards;
    });
  }

  async function deleteTask(boardId: string, taskId: string) {
    await fetch("/api/tasks/delete", {
      method: "POST",
      body: JSON.stringify({ taskId }),
    });

    setBoards((prevBoards) => {
      const updatedBoards = prevBoards.map((board) => {
        if (board._id !== boardId) {
          return board;
        }

        const filteredTasks = board.tasks.filter((task) => {
          return task._id !== taskId;
        });

        const updatedBoard = {
          ...board,
          tasks: filteredTasks,
        };

        return updatedBoard;
      });

      return updatedBoards;
    });
  }

  async function toggleTaskDone(boardId: string, taskId: string, current: boolean) {
    // Optimistic update
    setBoards((prevBoards) => {
      const updatedBoards = prevBoards.map((board) => {
        if (board._id !== boardId) {
          return board;
        }

        const updatedTasks = board.tasks.map((task) => {
          if (task._id !== taskId) {
            return task;
          }

          const updatedTask = {
            ...task,
            done: !current,
          };

          return updatedTask;
        });

        const updatedBoard = {
          ...board,
          tasks: updatedTasks,
        };

        return updatedBoard;
      });

      return updatedBoards;
    });

    // Server sync
    const res = await fetch("/api/tasks/complete", {
      method: "POST",
      body: JSON.stringify({
        taskId,
        done: !current,
      }),
    });

    // Rollback on error
    if (!res.ok) {
      setBoards((prevBoards) => {
        const updatedBoards = prevBoards.map((board) => {
          if (board._id !== boardId) {
            return board;
          }

          const updatedTasks = board.tasks.map((task) => {
            if (task._id !== taskId) {
              return task;
            }

            return {
              ...task,
              done: current,
            };
          });

          return {
            ...board,
            tasks: updatedTasks,
          };
        });

        return updatedBoards;
      });
    }
  }

  // RENDER STATES
  if (status === "loading") {
    return <div className="p-6">Checking session...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="p-6">Not authenticated</div>;
  }

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  // UI
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* CREATE BOARD */}
      <form onSubmit={createBoard} className="flex gap-2">
        <input
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New board title"
          className="border p-2 rounded w-full"
        />
        <button className="bg-blue-600 text-white px-4 rounded">
          Add board
        </button>
      </form>

      {/* BOARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boards.map((board) => (
          <BoardCard
            key={board._id}
            board={board}
            onDeleteBoard={deleteBoard}
            onCreateTask={createTask}
            onDeleteTask={deleteTask}
            toggleTaskDone={toggleTaskDone}
          />
        ))}
      </div>

      {boards.length === 0 && (
        <p className="text-gray-500 text-sm">
          No boards yet. Create your first one 👆
        </p>
      )}
    </div>
  );
}


// BOARD COMPONENT
function BoardCard({
  board,
  onDeleteBoard,
  onCreateTask,
  onDeleteTask,
  toggleTaskDone,
}: {
  board: BoardType;
  onDeleteBoard: (id: string) => void;
  onCreateTask: (boardId: string, title: string) => void;
  onDeleteTask: (boardId: string, taskId: string) => void;
  toggleTaskDone: (boardId: string, taskId: string, current: boolean) => void;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  function submitTask(e: React.FormEvent) {
    e.preventDefault();
    onCreateTask(board._id, newTaskTitle);
    setNewTaskTitle("");
  }


  return (
    <div className="border rounded bg-white shadow p-4 flex flex-col gap-4">
      {/* BOARD HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{board.title}</h2>
        <button
          onClick={() => onDeleteBoard(board._id)}
          className="text-sm text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>

      {/* TASKS */}
      <div className="space-y-2">
        {board.tasks.map((task) => (
          <div
            key={task._id}
            className="flex items-center justify-between border rounded p-2"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() =>
                  toggleTaskDone(board._id, task._id, task.done)
                }
              />

              <span
                className={task.done ? "line-through text-gray-400" : ""}
              >
                {task.title}
              </span>
            </label>

            <button
              onClick={() => onDeleteTask(board._id, task._id)}
              className="text-xs text-red-500 hover:underline"
            >
              ✕
            </button>
          </div>
        ))}

        {board.tasks.length === 0 && (
          <p className="text-sm text-gray-400">No tasks</p>
        )}
      </div>

      {/* ADD TASK */}
      <form onSubmit={submitTask} className="flex gap-2">
        <input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task"
          className="border p-1 rounded w-full text-sm"
        />
        <button className="bg-gray-800 text-white px-3 rounded text-sm">
          Add
        </button>
      </form>
    </div>
  );
}
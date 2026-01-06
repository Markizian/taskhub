import mongoose, { Schema, model, models } from "mongoose";

const TaskSchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    title: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Task = models.Task || model("Task", TaskSchema);

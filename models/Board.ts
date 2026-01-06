import mongoose, { Schema, model, models } from "mongoose";

const BoardSchema = new Schema(
  {
    title: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Board = models.Board || model("Board", BoardSchema);
const { text } = require("express");
const mongoose = require("mongoose");
const { create } = require("./User");
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Note", noteSchema);

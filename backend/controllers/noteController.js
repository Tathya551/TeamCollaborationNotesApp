const authMiddleware = require("../middleware/authMiddleware");
const Note = require("../models/Note");
const User = require("../models/User");
exports.createNote = async (req, res) => {
  try {
    const { title, description } = req.body;
    const note = new Note({
      title,
      description,
      owner: req.user.userId,
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.find({
      $or: [{ owner: userId }, { sharedWith: userId }],
    })
      .populate("owner", "username email")
      .populate("sharedWith", "username email")
      .populate("comments.author", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { title, description } = req.body;
    note.title = title || note.title;
    note.description = description || note.description;
    await note.save();
    res.status(200).json({ message: "Note updated successfully", note });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    await note.deleteOne();
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
exports.shareNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { email } = req.body;
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!note.sharedWith.includes(userToShare._id)) {
      note.sharedWith.push(userToShare._id);
      await note.save();
    }
    res.status(200).json({ message: "Note shared successfully", note });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
exports.addComment = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    const userId = req.user.userId;
    const isOwnerOrShared =
      note.owner.toString() === userId.toString() ||
      note.sharedWith.includes(userId);
    if (!isOwnerOrShared) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { text } = req.body;
    const comment = {
      text,
      author: userId,
    };

    note.comments.push(comment);
    await note.save();
    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

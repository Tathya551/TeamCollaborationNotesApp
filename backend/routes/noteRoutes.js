const express = require("express");
const router = express.Router();
const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  shareNote,
  addComment,
} = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");
router.use(authMiddleware); // Apply auth middleware to all note routes

router.post("/", createNote); // Create a new note
router.get("/", getNotes); // Get all notes for the authenticated user
router.put("/:id", updateNote); // Update a specific note by ID
router.delete("/:id", deleteNote); // Delete a specific note by ID
router.post("/:id/share", shareNote); // Share a note with another user
router.post("/:id/comment", addComment); // Add a comment to a note

module.exports = router; // Export the router for use in the main app

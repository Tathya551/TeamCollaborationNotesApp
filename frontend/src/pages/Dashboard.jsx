// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const token = localStorage.getItem("token");
  let userId = null;
  if (token) {
    const decoded = jwtDecode(token);
    userId = decoded.userId;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);

  const [notes, setNotes] = useState([]);
  const [shareEmail, setShareEmail] = useState({});
  const [commentText, setCommentText] = useState({});

  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data.notes)
        ? res.data.notes
        : Array.isArray(res.data)
        ? res.data
        : [];
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const payload = { title, description };
    try {
      if (editNoteId) {
        await axios.put(
          `http://localhost:5000/api/notes/${editNoteId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://localhost:5000/api/notes", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setTitle("");
      setDescription("");
      setEditNoteId(null);
      fetchNotes();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };
  const handleShare = async (id) => {
    const email = shareEmail[id]?.trim();
    if (!email) return alert("Enter an email to share with");
    try {
      await axios.post(
        `http://localhost:5000/api/notes/${id}/share`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShareEmail({ ...shareEmail, [id]: "" });
      fetchNotes();
    } catch (err) {
      console.error("Error sharing note:", err);
    }
  };
  const handleComment = async (id) => {
    const text = commentText[id]?.trim();
    if (!text) return alert("Enter a comment");
    try {
      await axios.post(
        `http://localhost:5000/api/notes/${id}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText({ ...commentText, [id]: "" });
      fetchNotes();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleEditClick = (note) => {
    setEditNoteId(note._id);
    setTitle(note.title);
    setDescription(note.description);
  };

  const myNotes = notes.filter((n) => n.owner === userId);
  const sharedNotes = notes.filter(
    (n) => n.owner !== userId && n.sharedWith.includes(userId)
  );

  return (
    <div className="dashboard-container">
      <h2>{editNoteId ? "Edit Note" : "Create a New Note"}</h2>
      <form onSubmit={handleCreateOrUpdate}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br />
        <button type="submit">
          {editNoteId ? "Save Changes" : "Create Note"}
        </button>
      </form>
      <h2>Your Notes</h2>
      {myNotes.length === 0 && <p>No notes yet.</p>}
      {myNotes.map((note) => (
        <div key={note._id} className="note-card">
          <h3>{note.title}</h3>
          <p>{note.description}</p>
          <button onClick={() => handleEditClick(note)}>Edit</button>
          <button onClick={() => handleDelete(note._id)}>Delete</button>

          <div className="share-section">
            <input
              type="email"
              placeholder="Share via email"
              value={shareEmail[note._id] || ""}
              onChange={(e) =>
                setShareEmail({
                  ...shareEmail,
                  [note._id]: e.target.value,
                })
              }
            />
            <button onClick={() => handleShare(note._id)}>Share</button>
          </div>

          <div className="comments-section">
            <h4>Comments</h4>
            {note.comments?.map((c) => (
              <p key={c._id}>
                <strong>{c.user.username}:</strong> {c.text}
              </p>
            ))}
            <input
              type="text"
              placeholder="Add a comment"
              value={commentText[note._id] || ""}
              onChange={(e) =>
                setCommentText({
                  ...commentText,
                  [note._id]: e.target.value,
                })
              }
            />
            <button onClick={() => handleComment(note._id)}>Comment</button>
          </div>
        </div>
      ))}
      <h2>Notes Shared With You</h2>
      {sharedNotes.length === 0 && <p>No shared notes.</p>}
      {sharedNotes.map((note) => (
        <div key={note._id} className="note-card">
          <h3>{note.title}</h3>
          <p>{note.description}</p>
          <div className="comments-section">
            <h4>Comments</h4>
            {note.comments?.map((c) => (
              <p key={c._id}>
                <strong>{c.user.username}:</strong> {c.text}
              </p>
            ))}
            <input
              type="text"
              placeholder="Add a comment"
              value={commentText[note._id] || ""}
              onChange={(e) =>
                setCommentText({
                  ...commentText,
                  [note._id]: e.target.value,
                })
              }
            />
            <button onClick={() => handleComment(note._id)}>Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;

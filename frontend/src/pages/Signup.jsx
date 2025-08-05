import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    try {
      await axios.post("http://localhost:5000/api/auth/signup", form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      alert("Signup failed. Please try again.");
    }
  };
  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;

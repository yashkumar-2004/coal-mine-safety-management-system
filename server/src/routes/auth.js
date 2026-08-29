import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

// Login
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, password_hash, role, organization, phone, is_active FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: "User account is inactive" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
      expiresIn: "7d",
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      phone: user.phone,
    };

    res.json({
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Register
authRouter.post("/register", async (req, res) => {
  const { name, email, password, role = "mine_inspector", organization, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase().trim(),
    ]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, organization, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, organization, phone, created_at`,
      [name, email.toLowerCase().trim(), password_hash, role, organization, phone]
    );

    const newUser = result.rows[0];
    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, env.jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: newUser,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Get Current User Profile
authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Get All Users (Directory)
authRouter.get("/users", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, organization, phone, is_active, created_at FROM users ORDER BY id ASC"
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

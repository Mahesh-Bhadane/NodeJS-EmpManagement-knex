import express from "express";
import { Request, Response } from "express";
import knex from "knex";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DATABASE,
  },
});

//Register
app.post(
  "/api/users/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("designation").notEmpty().withMessage("Designation is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, designation } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const [userId] = await db("employees").insert({
        name,
        email,
        password: hashedPassword,
        designation,
      });
      const token = jwt.sign({ userId }, "my_secret_key");
      res.status(201).json({ token });
    } catch (error) {
      console.error("Error creating user: ", error);
      res.status(500).json({ message: "Error creating user" });
    }
  }
);

//Login
app.post(
  "/api/users/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [user] = await db("employees").select("*").where("email", email);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user.id }, "my_secret_key");
      res.status(200).json({ token });
    } catch (error) {
      console.error("Error logging in user: ", error);
      res.status(500).json({ message: "Error logging in user" });
    }
  }
);

//Create Project
app.post(
  "/api/projects/create",
  async (req: express.Request, res: express.Response) => {
    const { title, description, userId } = req.body;
    try {
      await db("projects").insert({
        title,
        description,
        user_id: userId,
      });

      res.status(201).json({ message: "Project created successfully" });
    } catch (error) {
      console.error("Error creating project: ", error);

      res.status(500).json({ message: "Error creating project" });
    }
  }
);

//Get Users Project
app.get(
  "/api/projects/:userId",
  async (req: express.Request, res: express.Response) => {
    const { userId } = req.params;
    try {
      const projects = await db("projects")
        .select("*")
        .where("user_id", userId);
      res.status(200).json({ projects });
    } catch (error) {
      console.error("Error fetching projects: ", error);
      res.status(500).json({ message: "Error fetching projects" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

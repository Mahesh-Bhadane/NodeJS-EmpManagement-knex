import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { db } from "../models/db";
require("dotenv").config();

//Register
export const register = async (req: Request, res: Response) => {
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
};

//Login
export const login = async (req: Request, res: Response) => {
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

    if (isPasswordValid) {
      const accessToken = jwt.sign(
        { email: user.email },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "2h" }
      );
      const refreshToken = jwt.sign(
        { email: user.email },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "1d" }
      );
      // Saving refreshToken with current user
      user.refreshToken = refreshToken;
      db("employees")
        .where({ email: email })
        .update({ refreshToken: refreshToken }),
        (error: any, result: any) => {
          if (error) {
            console.error("Error updating user with refresh token:", error);
            return res.status(500).send("Internal server error");
          }
        };
      return res.json({ accessToken });
    }
  } catch (error) {
    console.error("Error logging in user: ", error);
    res.status(500).json({ message: "Error logging in user" });
  }
};

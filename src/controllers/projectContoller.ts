import { Request, Response } from "express";
import {db}  from '../models/db';

//Create Project
export const createProject =
    async (req: Request, res: Response) => {
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

  
  //Get Users Project
  export const getProject =
    async (req: Request, res: Response) => {
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

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import githubRouter from "./api/github.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// mount GitHub API router
app.use("/api/github", githubRouter);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

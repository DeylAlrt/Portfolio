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

// Serve frontend files (this handles CSS_FOLDER, SCRIPT_FOLDER, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Mount GitHub API router (only once!)
app.use("/api/github", githubRouter);

// Catch-all route: this is what fixes "Cannot GET /"
// Serve your main page (Index.html with capital I) for root and any unmatched paths
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Index.html"));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
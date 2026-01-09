import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// test API
app.get("/api/visits", (req, res) => {
  res.json({ activeUsers: 5, totalVisits: 42 });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

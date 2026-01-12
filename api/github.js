import express from "express";
import https from "https";

const router = express.Router();

function githubGet(path, token) {
  const options = {
    hostname: "api.github.com",
    path,
    method: "GET",
    headers: {
      "User-Agent": "Portfolio-App",
      Accept: "application/vnd.github+json",
    },
  };
  if (token) options.headers.Authorization = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data || "{}");
          resolve({ statusCode: res.statusCode || 200, body: json });
        } catch (err) {
          resolve({ statusCode: res.statusCode || 500, body: data });
        }
      });
    });
    req.on("error", (err) => reject(err));
    req.end();
  });
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;

router.get("/user/:username", async (req, res) => {
  const username = encodeURIComponent(req.params.username);
  try {
    const result = await githubGet(`/users/${username}`, GITHUB_TOKEN);
    return res.status(result.statusCode).json(result.body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/repos/:username", async (req, res) => {
  const username = encodeURIComponent(req.params.username);
  try {
    const result = await githubGet(`/users/${username}/repos?per_page=100`, GITHUB_TOKEN);
    return res.status(result.statusCode).json(result.body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/rate", async (req, res) => {
  try {
    const result = await githubGet(`/rate_limit`, GITHUB_TOKEN);
    return res.status(result.statusCode).json(result.body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

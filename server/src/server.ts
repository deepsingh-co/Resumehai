import express from "express";

const app = express();

const PORT = 5000;

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "AI Resume Maker API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
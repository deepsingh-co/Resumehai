import "dotenv/config";
import express from "express";
import { env } from "./config/env.js";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(helmet());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "AI Resume Maker API is running",
    environment: env.nodeEnv,
  });
});

app.listen(env.port, () => {
  console.log(
    `Server running on http://localhost:${env.port}`
  );
});
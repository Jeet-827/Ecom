import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "",
    },
  })
);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Gateway is running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Gateway server failed to start: Port ${PORT} is already in use by another process.`);
  } else {
    console.error("Gateway server error:", err.message);
  }
});
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
dotenv.config();

// Enable CORS for the client
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const productProxy = createProxyMiddleware({
  target: "http://localhost:4003/products",
  changeOrigin: true,
});

const authProxy = createProxyMiddleware({
  target: "http://localhost:4001",
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      // Forward headers if needed
    },
  },
});

app.use("/api/v1/products", productProxy);
app.use("/api/v1", authProxy);

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Gateway server is running on port ${PORT}`);
});
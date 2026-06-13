import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

// Connect to Database
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Mount product routes under /products
app.use("/products", productRoutes);

const port = process.env.PORT || 4003;
app.listen(port, () => {
  console.log(`Products server is running on port ${port}`);
});


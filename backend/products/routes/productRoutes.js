import express from "express";
import { getProducts } from "../controller/Showproduct.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all products (protected)
router.get("/", protect, getProducts);

export default router;

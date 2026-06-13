import express from "express";
import {
  signup,
  login,
  logout,
  refresh,
  profile,
  addToCart,
  getCart,
  updateCartQuantity,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/profile", protect, profile);

// Cart routes
router.post("/cart", protect, addToCart);
router.get("/cart", protect, getCart);
router.put("/cart", protect, updateCartQuantity);

export default router;

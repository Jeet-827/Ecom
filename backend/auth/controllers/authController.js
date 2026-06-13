import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshTokenCookie,
} from "../utils/tokenUtils.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please provide username, email, and password" });
  }

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const user = await User.create({ username, email, password });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    sendRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      message: "Registration successful!",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: `Server error during registration: ${error.message}` });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    sendRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: "Signed in successfully!",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: `Server error during login: ${error.message}` });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(user);
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Refresh token verification error:", error.message);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const profile = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }
  const qty = Number(quantity) || 1;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += qty;
    } else {
      user.cart.push({ productId, quantity: qty });
    }

    await user.save();
    return res.status(200).json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({ message: "Server error updating cart" });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ cart: user.cart || [] });
  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({ message: "Server error fetching cart" });
  }
};

export const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }
  const qty = Number(quantity);
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      if (qty <= 0) {
        user.cart.splice(itemIndex, 1);
      } else {
        user.cart[itemIndex].quantity = qty;
      }
      await user.save();
    }

    return res.status(200).json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    console.error("updateCartQuantity error:", error);
    return res.status(500).json({ message: "Server error updating cart quantity" });
  }
};

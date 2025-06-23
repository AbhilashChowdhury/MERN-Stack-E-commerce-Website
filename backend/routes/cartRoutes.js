import express from "express";
import {
  getCartItems,
  addCartItem,
  removeCartItem,
} from "../controllers/cartController.js";

const router = express.Router();

// Get all cart items for a user
router.get("/:userId", getCartItems);

// Add or update a cart item for a user
router.post("/:userId", addCartItem);

// Remove a cart item by ID for a user
router.delete("/:userId/:itemId", removeCartItem);

export default router;

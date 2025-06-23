import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
} from "../controllers/orderController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Create a new order or get all orders (admin only)
router.route("/")
  .post(authenticate, createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders);

// Get logged-in user's orders
router.route("/mine").get(authenticate, getUserOrders);

// Get order by ID
router.route("/:id").get(authenticate, findOrderById);

// Mark order as paid
router.route("/:id/pay").put(authenticate, markOrderAsPaid);

// Mark order as delivered (admin only)
router.route("/:id/deliver").put(authenticate, authorizeAdmin, markOrderAsDelivered);

export default router;
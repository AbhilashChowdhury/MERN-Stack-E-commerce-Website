import express from "express";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favoriteController.js";

const router = express.Router();

router.get("/:userId", getFavorites);
router.post("/:userId", addFavorite);
router.delete("/:userId/:productId", removeFavorite);

export default router;

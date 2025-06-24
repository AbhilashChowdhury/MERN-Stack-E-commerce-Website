import express from "express";
import { 
  addCoupon, 
  addUniversity, 
  getCoupons, 
  getUniversities 
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/coupons", addCoupon);
router.post("/universities", addUniversity);

// New GET routes to fetch coupons and universities
router.get("/coupons", getCoupons);
router.get("/universities", getUniversities);

export default router;

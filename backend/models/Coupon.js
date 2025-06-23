import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  expiryDate: { type: Date, default: null },
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;

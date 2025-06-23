import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1, min: 1 },
  variant: {
    ram: String,
    rom: String,
  },
  addedAt: { type: Date, default: Date.now },
});

const CartItem = mongoose.model("CartItem", cartItemSchema);

export default CartItem;

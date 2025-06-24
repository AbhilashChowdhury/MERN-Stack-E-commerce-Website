import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

// Review sub-schema
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Specification sub-schema (dynamic key-value pairs)
const specificationSchema = mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

// Variant sub-schema (RAM/ROM + price + quantity + countInStock)
const variantSchema = mongoose.Schema(
  {
    ram: { type: String, required: true },
    rom: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    countInStock: { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, required: function() { return this.variants.length === 0; } }, // required only if no variants
    category: { type: ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },

    specifications: [specificationSchema], // dynamic specifications array
    variants: [variantSchema],             // RAM/ROM variants array

    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: function() { return this.variants.length === 0; }, default: 0 }, // required only if no variants
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;

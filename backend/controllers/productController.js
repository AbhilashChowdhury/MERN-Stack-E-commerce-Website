import asyncHandler from "../middlewares/asyncHandler.js";
import mongoose from "mongoose";
import Product from "../models/productModel.js";

// Helper to safely parse JSON strings
const safeParseJSON = (data) => {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Add new product
const addProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      brand,
      specifications,
      countInStock,
      image,
      variants,
    } = req.fields || {};

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!brand) return res.status(400).json({ error: "Brand is required" });
    if (!description) return res.status(400).json({ error: "Description is required" });
    if (!category) return res.status(400).json({ error: "Category is required" });

    let parsedVariants = [];
    if (variants) {
      if (typeof variants === "string") {
        parsedVariants = safeParseJSON(variants) || [];
      } else if (Array.isArray(variants)) {
        parsedVariants = variants;
      }
    }

    let parsedSpecifications = [];
    if (specifications) {
      if (typeof specifications === "string") {
        parsedSpecifications = safeParseJSON(specifications) || [];
        if (!Array.isArray(parsedSpecifications)) {
          parsedSpecifications = Object.entries(parsedSpecifications || {}).map(([key, value]) => ({ key, value }));
        }
      } else if (Array.isArray(specifications)) {
        parsedSpecifications = specifications;
      } else if (typeof specifications === "object") {
        parsedSpecifications = Object.entries(specifications).map(([key, value]) => ({ key, value }));
      }
    }

    let productPrice = price;
    let productQuantity = quantity;
    let productStock = countInStock;

    if (parsedVariants.length > 0) {
      if (!parsedVariants[0].price) {
        return res.status(400).json({ error: "First variant price is required" });
      }
      productPrice = parsedVariants[0].price;
      productQuantity = undefined;
      productStock = undefined;

      for (const variant of parsedVariants) {
        if (
          !variant.ram ||
          !variant.rom ||
          variant.price === undefined ||
          variant.quantity === undefined ||
          variant.countInStock === undefined
        ) {
          return res.status(400).json({ error: "All variant fields (RAM, ROM, Price, Quantity, Stock) are required" });
        }
      }
    } else {
      if (!price) return res.status(400).json({ error: "Price is required" });
      if (!quantity) return res.status(400).json({ error: "Quantity is required" });
    }

    const product = new Product({
      name,
      description,
      price: productPrice,
      category,
      quantity: productQuantity,
      brand,
      specifications: parsedSpecifications,
      variants: parsedVariants,
      image: image || "",
      countInStock: productStock || 0,
    });

    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ error: error.message || "Failed to add product" });
  }
});

// Update product details
const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      brand,
      specifications,
      countInStock,
      image,
      variants,
    } = req.fields || {};

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!brand) return res.status(400).json({ error: "Brand is required" });
    if (!description) return res.status(400).json({ error: "Description is required" });
    if (!category) return res.status(400).json({ error: "Category is required" });

    let parsedVariants = [];
    if (variants) {
      if (typeof variants === "string") {
        parsedVariants = safeParseJSON(variants) || [];
      } else if (Array.isArray(variants)) {
        parsedVariants = variants;
      }
    }

    let parsedSpecifications = [];
    if (specifications) {
      if (typeof specifications === "string") {
        parsedSpecifications = safeParseJSON(specifications) || [];
        if (!Array.isArray(parsedSpecifications)) {
          parsedSpecifications = Object.entries(parsedSpecifications || {}).map(([key, value]) => ({ key, value }));
        }
      } else if (Array.isArray(specifications)) {
        parsedSpecifications = specifications;
      } else if (typeof specifications === "object") {
        parsedSpecifications = Object.entries(specifications).map(([key, value]) => ({ key, value }));
      }
    }

    let productPrice = price;
    let productQuantity = quantity;
    let productStock = countInStock;

    if (parsedVariants.length > 0) {
      if (!parsedVariants[0].price) {
        return res.status(400).json({ error: "First variant price is required" });
      }
      productPrice = parsedVariants[0].price;
      productQuantity = undefined;
      productStock = undefined;

      for (const variant of parsedVariants) {
        if (
          !variant.ram ||
          !variant.rom ||
          variant.price === undefined ||
          variant.quantity === undefined ||
          variant.countInStock === undefined
        ) {
          return res.status(400).json({ error: "All variant fields (RAM, ROM, Price, Quantity, Stock) are required" });
        }
      }
    } else {
      if (!price) return res.status(400).json({ error: "Price is required" });
      if (!quantity) return res.status(400).json({ error: "Quantity is required" });
    }

    const updatedData = {
      name,
      description,
      price: productPrice,
      category,
      quantity: productQuantity,
      brand,
      image: image || undefined,
      countInStock: productStock,
      specifications: parsedSpecifications,
      variants: parsedVariants,
    };

    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.save();

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: error.message || "Failed to update product" });
  }
});

// Remove product
const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch products with pagination, keyword search, AND category filter (with ObjectId conversion and debug logs)
const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;
    const page = Number(req.query.pageNumber) || 1;

    console.log("fetchProducts called with query:", req.query);

    const keywordFilter = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    let categoryFilter = {};
    if (req.query.category) {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        categoryFilter = { category: mongoose.Types.ObjectId(req.query.category) };
        console.log("Filtering products by category ObjectId:", req.query.category);
      } else {
        console.warn("Invalid category ObjectId received:", req.query.category);
        return res.json({ products: [], page: 1, pages: 0, hasMore: false });
      }
    }

    const filter = { ...keywordFilter, ...categoryFilter };
    console.log("MongoDB filter object:", filter);

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    console.log(`Found ${products.length} products for filter.`);

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      hasMore: page < Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Fetch product by ID
const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Product not found" });
  }
});

// Fetch all products (limited)
const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Add product review
const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Failed to add review" });
  }
});

// Fetch top rated products
const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Failed to fetch top products" });
  }
});

// Fetch newest products
const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }).limit(5);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Failed to fetch new products" });
  }
});

// Filter products by category and price
const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked = [], radio = [] } = req.body;

    let args = {};
    if (checked.length > 0) args.category = { $in: checked };
    if (radio.length === 2) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await Product.find(args);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
};

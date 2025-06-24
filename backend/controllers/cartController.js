import CartItem from "../models/cartItemModel.js";

// Get all cart items for a user
export const getCartItems = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartItems = await CartItem.find({ user: userId }).populate("product");
    res.json(cartItems);
  } catch (error) {
    console.error("Failed to get cart items:", error);
    res.status(500).json({ message: "Failed to get cart items", error });
  }
};

// Add or update a cart item
export const addCartItem = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { productId, quantity, variant } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Build query to find existing cart item including variant fields
    let query = { user: userId, product: productId };
    if (variant) {
      if (variant.ram) query["variant.ram"] = variant.ram;
      if (variant.rom) query["variant.rom"] = variant.rom;
    }

    let cartItem = await CartItem.findOne(query);

    if (cartItem) {
      cartItem.quantity = quantity;
      if (variant) cartItem.variant = variant;
      await cartItem.save();
    } else {
      cartItem = new CartItem({
        user: userId,
        product: productId,
        quantity,
        variant,
      });
      await cartItem.save();
    }

    await cartItem.populate("product");

    res.status(201).json(cartItem);
  } catch (error) {
    console.error("Failed to add/update cart item:", error);
    res.status(500).json({ message: "Failed to add/update cart item", error });
  }
};

// Remove a cart item
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.params.userId;
    const itemId = req.params.itemId;

    const deleted = await CartItem.findOneAndDelete({ _id: itemId, user: userId });
    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Cart item removed" });
  } catch (error) {
    console.error("Failed to remove cart item:", error);
    res.status(500).json({ message: "Failed to remove cart item", error });
  }
};

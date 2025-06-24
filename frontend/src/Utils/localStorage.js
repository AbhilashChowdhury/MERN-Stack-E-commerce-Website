// src/Utils/localStorage.js

// --- Favorites management in localStorage ---

/**
 * Retrieve favorites array from localStorage.
 * Returns an empty array if none found or on error.
 */
export const getFavoritesFromLocalStorage = () => {
  try {
    const favoritesJSON = localStorage.getItem("favorites");
    return favoritesJSON ? JSON.parse(favoritesJSON) : [];
  } catch (error) {
    console.error("Error reading favorites from localStorage:", error);
    return [];
  }
};

/**
 * Add a product to favorites in localStorage if not already present.
 * @param {Object} product - Product object to add.
 */
export const addFavoriteToLocalStorage = (product) => {
  try {
    const favorites = getFavoritesFromLocalStorage();
    const exists = favorites.some((p) => p._id === product._id);
    if (!exists) {
      favorites.push(product);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  } catch (error) {
    console.error("Error adding favorite to localStorage:", error);
  }
};

/**
 * Remove a product from favorites in localStorage by product ID.
 * @param {string} productId - ID of the product to remove.
 */
export const removeFavoriteFromLocalStorage = (productId) => {
  try {
    const favorites = getFavoritesFromLocalStorage();
    const updatedFavorites = favorites.filter((p) => p._id !== productId);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error("Error removing favorite from localStorage:", error);
  }
};

// --- Cart management in localStorage ---

/**
 * Retrieve cart items array from localStorage.
 * Returns an empty array if none found or on error.
 */
export const getCartFromLocalStorage = () => {
  try {
    const cartJSON = localStorage.getItem("cartItems");
    return cartJSON ? JSON.parse(cartJSON) : [];
  } catch (error) {
    console.error("Error reading cart from localStorage:", error);
    return [];
  }
};

/**
 * Save cart items array to localStorage.
 * @param {Array} cartItems - Array of cart items to save.
 */
export const saveCartToLocalStorage = (cartItems) => {
  try {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

/**
 * Clear cart items from localStorage.
 */
export const clearCartFromLocalStorage = () => {
  try {
    localStorage.removeItem("cartItems");
  } catch (error) {
    console.error("Error clearing cart from localStorage:", error);
  }
};

import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import {
  addFavoriteToBackend,
  removeFavoriteFromBackend,
  fetchFavorites,
} from "../../redux/features/favorites/favoriteSlice";

const HeartIcon = ({ product }) => {
  const dispatch = useDispatch();

  // Get logged-in user ID from Redux store
  const userId = useSelector((state) => state.auth.userInfo?._id);

  // Get current favorites list from Redux store
  const favorites = useSelector((state) => state.favorites.favorites) || [];

  // Check if the product is already in favorites
  const isFavorite = favorites.some(
    (fav) => String(fav._id) === String(product._id)
  );

  // Loading state to prevent multiple rapid clicks
  const [loading, setLoading] = useState(false);

  // Fetch favorites on component mount or when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(fetchFavorites(userId));
    }
  }, [dispatch, userId]);

  // Toggle favorite status handler
  const toggleFavorite = async () => {
    if (!userId) {
      alert("Please log in to save favorites.");
      return;
    }

    if (loading) return; // Prevent multiple clicks

    setLoading(true);
    try {
      if (isFavorite) {
        await dispatch(
          removeFavoriteFromBackend({ userId, productId: product._id })
        ).unwrap();
      } else {
        await dispatch(
          addFavoriteToBackend({ userId, productId: product._id })
        ).unwrap();
      }
      // Refresh favorites after update
      dispatch(fetchFavorites(userId));
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={`text-3xl transition-colors duration-300 ease-in-out transform hover:scale-110 focus:outline-none ${
        isFavorite ? "text-pink-500" : "text-gray-400 hover:text-pink-500"
      }`}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default HeartIcon;

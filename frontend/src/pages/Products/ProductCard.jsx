import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCartLocal, addToCartBackend } from "../../redux/features/cart/cartSlice";
import {
  addFavoriteToBackend,
  removeFavoriteFromBackend,
  fetchFavorites,
} from "../../redux/features/favorites/favoriteSlice";
import { toast } from "react-toastify";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userInfo?._id);
  const favorites = useSelector((state) => state.favorites.favorites) || [];

  // Determine if product is favorite from Redux store
  const isFavorite = favorites.some((fav) => fav._id === p._id);

  // Fetch favorites on mount or when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(fetchFavorites(userId));
    }
  }, [dispatch, userId]);

  const toggleFavorite = () => {
    if (!userId) {
      alert("Please log in to save favorites.");
      return;
    }

    if (isFavorite) {
      dispatch(removeFavoriteFromBackend({ userId, productId: p._id }))
        .unwrap()
        .then(() => {
          toast.info("Removed from favorites");
          dispatch(fetchFavorites(userId)); // Refresh favorites after removal
        })
        .catch(() => {
          toast.error("Failed to remove favorite");
        });
    } else {
      dispatch(addFavoriteToBackend({ userId, productId: p._id }))
        .unwrap()
        .then(() => {
          toast.success("Added to favorites");
          dispatch(fetchFavorites(userId)); // Refresh favorites after addition
        })
        .catch(() => {
          toast.error("Failed to add favorite");
        });
    }
  };

  const addToCartHandler = (product) => {
    const qty = 1;
    if (userId) {
      dispatch(addToCartBackend({ userId, productId: product._id, qty }));
    } else {
      dispatch(addToCartLocal({ ...product, qty }));
    }
    toast.success("Item added successfully", { position: "top-right", autoClose: 2000 });
  };

  if (!p) return null;

  return (
    <div className="relative max-w-xs bg-[#1A1A1A] rounded-lg shadow flex flex-col">
      <section className="relative">
        <Link to={`/product/${p._id}`}>
          <span className="absolute bottom-3 right-3 bg-pink-100 text-pink-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
            {p.brand}
          </span>
          <div className="w-full h-48 bg-white flex items-center justify-center overflow-hidden rounded-t-lg">
            <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
          </div>
        </Link>

        <div
          onClick={toggleFavorite}
          className="absolute top-2 right-2 cursor-pointer z-20 text-2xl text-pink-500 hover:text-pink-700 transition-transform transform hover:scale-110"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-label="Toggle favorite"
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </div>
      </section>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-lg text-white truncate">{p.name}</h5>
          <p className="text-pink-500 font-semibold whitespace-nowrap">
            {p.price.toLocaleString("en-BD", { style: "currency", currency: "BDT" })}
          </p>
        </div>
        <p className="mb-3 font-normal text-[#CFCFCF]">{p.description.substring(0, 60)} ...</p>
        <section className="flex justify-between items-center mt-auto">
          <Link
            to={`/product/${p._id}`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-pink-700 rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800"
          >
            Read More
            <svg
              className="w-3.5 h-3.5 ml-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </Link>
          <button
            className="p-2 rounded-full text-pink-500 hover:text-pink-700"
            onClick={() => addToCartHandler(p)}
            aria-label="Add to cart"
          >
            <AiOutlineShoppingCart size={25} />
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProductCard;

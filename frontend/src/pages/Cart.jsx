import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import {
  fetchCart,
  removeFromCartBackend,
  removeFromCartLocal,
} from "../redux/features/cart/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, loading, error } = useSelector((state) => state.cart);
  const userId = useSelector((state) => state.auth.userInfo?._id);

  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(userId));
    }
  }, [dispatch, userId]);

  const getQuantity = (item) => item.qty ?? 1;
  const getPrice = (item) =>
    item.variant?.price ?? item.product?.price ?? item.price ?? 0;

  const removeFromCartHandler = (id) => {
    if (userId) {
      dispatch(removeFromCartBackend({ userId, itemId: id }));
    } else {
      dispatch(removeFromCartLocal(id));
    }
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  if (loading) return <p className="ml-8 mt-8">Loading cart...</p>;
  if (error) return <p className="ml-8 mt-8 text-red-600">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 mt-8">
      {cartItems.length === 0 ? (
        <div className="text-center text-lg">
          Your cart is empty.{" "}
          <Link to="/shop" className="text-pink-500 underline">
            Go To Shop
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-semibold mb-6 text-center md:text-left">
            Shopping Cart
          </h1>

          {/* Header row */}
          <div className="grid grid-cols-4 gap-4 bg-gray-900 p-3 rounded-t-lg text-white font-semibold text-center">
            <div>Product</div>
            <div>Variant</div>
            <div>Quantity</div>
            <div>Total Price</div>
          </div>

          {/* Cart items */}
          <div className="divide-y divide-gray-700">
            {cartItems.map((item) => {
              const quantity = getQuantity(item);
              const price = getPrice(item);
              const productId = item.product?._id ?? item._id;

              // Prepare variant description (e.g., "RAM: 8GB, ROM: 128GB")
              const variantDesc = item.variant
                ? Object.entries(item.variant)
                    .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
                    .join(", ")
                : "-";

              return (
                <div
                  key={item._id}
                  className="grid grid-cols-4 gap-4 items-center p-3 bg-gray-800"
                >
                  {/* Product with image and name */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded overflow-hidden border border-gray-700 flex-shrink-0">
                      <img
                        src={item.variant?.image ?? item.product?.image ?? item.image}
                        alt={item.variant?.name ?? item.product?.name ?? item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Link
                      to={`/product/${productId}`}
                      className="text-pink-500 font-semibold hover:underline"
                    >
                      {item.variant?.name ?? item.product?.name ?? item.name}
                    </Link>
                  </div>

                  {/* Variant details */}
                  <div className="text-white text-center">{variantDesc}</div>

                  {/* Quantity */}
                  <div className="text-white text-center font-medium">{quantity}</div>

                  {/* Total price and remove button */}
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-white font-bold text-lg">
                      ৳ {(price * quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCartHandler(item._id)}
                      aria-label="Remove item from cart"
                      className="text-red-500 hover:text-red-600 transition"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart summary */}
          <div className="mt-10 max-w-md mx-auto md:mx-0 bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center md:text-left">
              Cart Summary
            </h2>
            <p className="text-lg font-medium">
              Items:{" "}
              <span className="font-bold">
                {cartItems.reduce((acc, item) => acc + getQuantity(item), 0)}
              </span>
            </p>
            <p className="text-lg font-medium mt-2">
              Total Price:{" "}
              <span className="font-bold text-pink-500 text-xl">
                ৳{" "}
                {cartItems
                  .reduce((acc, item) => acc + getQuantity(item) * getPrice(item), 0)
                  .toLocaleString()}
              </span>
            </p>

            <button
              onClick={checkoutHandler}
              disabled={cartItems.length === 0}
              className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-full font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed To Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

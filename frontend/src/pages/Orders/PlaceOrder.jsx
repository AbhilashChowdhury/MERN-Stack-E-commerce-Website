import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponValid, setCouponValid] = useState(null);
  const [hasCoupon, setHasCoupon] = useState(false);

  // Student states
  const [isStudent, setIsStudent] = useState(false);
  const [universityName, setUniversityName] = useState("");
  const [universityEmail, setUniversityEmail] = useState("");
  const [studentInfoValid, setStudentInfoValid] = useState(null);
  const [studentOfferApplied, setStudentOfferApplied] = useState(false);

  // Discount percent state
  const [discountPercent, setDiscountPercent] = useState(0);

  // Data fetched from backend
  const [validCoupons, setValidCoupons] = useState([]);
  const [validUniversities, setValidUniversities] = useState([]);

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress.address, navigate]);

  // Fetch valid coupons and universities from backend on mount
  useEffect(() => {
    const fetchValidCoupons = async () => {
      try {
        const { data } = await axios.get("/api/admin/coupons");
        // Map coupon objects to their codes in uppercase
        setValidCoupons(data.map((coupon) => coupon.code.toUpperCase()));
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      }
    };

    const fetchValidUniversities = async () => {
      try {
        const { data } = await axios.get("/api/admin/universities");
        const normalizedUniversities = data.map((u) => ({
          name: u.name.trim().toLowerCase(),
          emailDomain: u.emailDomain.trim().toLowerCase(),
        }));
        setValidUniversities(normalizedUniversities);
      } catch (error) {
        console.error("Failed to fetch universities:", error);
      }
    };

    fetchValidCoupons();
    fetchValidUniversities();
  }, []);

  // Validate coupon code
  const validateCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (validCoupons.includes(code)) {
      setCouponValid(true);
      setCouponApplied(true);
      toast.success("Coupon code applied! 5% discount granted.");
      return true;
    } else {
      setCouponValid(false);
      setCouponApplied(false);
      toast.error("Invalid coupon code.");
      return false;
    }
  };

  // Validate student info
  const validateStudentInfo = () => {
    if (!isStudent) {
      setStudentInfoValid(null);
      return true;
    }

    const trimmedName = universityName.trim().toLowerCase();
    const trimmedEmail = universityEmail.trim().toLowerCase();

    if (trimmedName === "" || trimmedEmail === "") {
      setStudentInfoValid(false);
      toast.error("Please provide valid university name and email.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStudentInfoValid(false);
      toast.error("Please provide a valid university email.");
      return false;
    }

    const emailParts = trimmedEmail.split("@");
    if (emailParts.length !== 2) {
      setStudentInfoValid(false);
      toast.error("Invalid university email format.");
      return false;
    }
    const emailDomain = emailParts[1];

    if (!validUniversities || validUniversities.length === 0) {
      toast.error("University list is not loaded yet. Please try again shortly.");
      return false;
    }

    const matchedUniversity = validUniversities.find(
      (uni) =>
        uni.name === trimmedName &&
        uni.emailDomain === emailDomain
    );

    if (!matchedUniversity) {
      setStudentInfoValid(false);
      toast.error("University name and email domain do not match or are not eligible.");
      return false;
    }

    setStudentInfoValid(true);
    return true;
  };

  // Update discount percent based on coupon and student offer
  useEffect(() => {
    let discount = 0;
    if (couponApplied && couponValid) discount = 5;
    if (isStudent && studentInfoValid && studentOfferApplied) discount = 5;
    setDiscountPercent(discount);
  }, [couponApplied, couponValid, isStudent, studentInfoValid, studentOfferApplied]);

  // Helper to safely get price from item or its product
  const getPrice = (item) => {
    const price = item.price ?? item.product?.price ?? 0;
    return Number(price);
  };

  // Helper to safely get quantity from item
  const getQuantity = (item) => {
    return Number(item.qty ?? item.quantity ?? 1);
  };

  // Calculate items total price (sum of item price * quantity)
  const cartTotalPrice = cart.cartItems.reduce((acc, item) => {
    return acc + getPrice(item) * getQuantity(item);
  }, 0);

  // Fixed delivery fee
  const shippingPrice = 100;

  // Tax is 10% of items price
  const taxPrice = Number((cartTotalPrice * 0.10).toFixed(2));

  // Calculate total before discount
  const totalBeforeDiscount = cartTotalPrice + shippingPrice + taxPrice;

  // Calculate discounted total price
  const discountedTotalPrice = Number(
    (totalBeforeDiscount * (1 - discountPercent / 100)).toFixed(2)
  );

  // Calculate discount amount
  const discountAmount = Number((totalBeforeDiscount - discountedTotalPrice).toFixed(2));

  // Place order handler
  const placeOrderHandler = async () => {
    if (isStudent && !studentOfferApplied) {
      toast.error("Please apply the student offer before placing the order.");
      return;
    }

    if (isStudent && !validateStudentInfo()) return;

    if (hasCoupon && couponCode && !couponApplied) {
      if (!validateCoupon()) return;
    }

    const orderItems = cart.cartItems.map((item, idx) => {
      const id = item.productId || item.product?._id || item._id;
      if (!id) {
        console.error(`Cart item at index ${idx} is missing a product ID`, item);
      }
      return {
        _id: id,
        name: item.name ?? item.product?.name ?? "Unnamed Product",
        qty: getQuantity(item),
        image: item.image ?? item.product?.image ?? "",
        price: getPrice(item),
        product: id,
        variant: item.variant || {},
      };
    });

    const hasMissingId = orderItems.some((item) => !item._id);
    if (hasMissingId) {
      toast.error("One or more cart items are missing a product ID.");
      return;
    }

    const orderData = {
      orderItems,
      shippingAddress: cart.shippingAddress,
      paymentMethod: cart.paymentMethod,
      itemsPrice: cartTotalPrice,
      shippingPrice,
      taxPrice,
      totalPrice: discountedTotalPrice,
      couponCode: couponApplied ? couponCode.trim().toUpperCase() : null,
      isStudent,
      universityName: isStudent ? universityName.trim() : null,
      universityEmail: isStudent ? universityEmail.trim() : null,
      discountPercent,
      discountAmount,
    };

    try {
      const res = await createOrder(orderData).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(err.data?.message || err.message || "Order failed");
    }
  };

  // Format currency helper
  const formatCurrency = (num) => {
    return Number(num).toLocaleString("en-BD");
  };

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className="container mx-auto mt-8">
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <>
            {/* Cart Items Table */}
            <div className="overflow-x-auto my-8">
              <table
                className="bg-[#181818] rounded-lg shadow-md"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-center align-middle text-gray-300 break-words">
                      Image
                    </th>
                    <th className="px-4 py-3 text-center align-middle text-gray-300 break-words">
                      Product
                    </th>
                    <th className="px-4 py-3 text-center align-middle text-gray-300 break-words">
                      Variant
                    </th>
                    <th className="px-4 py-3 text-center align-middle text-gray-300 break-words">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-center align-middle text-gray-300 break-words">
                      Price
                    </th>
                    <th className="px-4 py-3 text-center align-middle text-gray-300 break-words">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.cartItems.map((item, index) => {
                    const price = getPrice(item);
                    const quantity = getQuantity(item);
                    const total = price * quantity;

                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-[#222]"
                      >
                        <td className="p-3 text-center align-middle break-words">
                          <img
                            src={item.image ?? item.product?.image}
                            alt={item.name ?? item.product?.name}
                            className="w-24 h-24 object-cover rounded mx-auto"
                          />
                        </td>
                        <td className="p-3 text-center align-middle font-semibold break-words">
                          {item.name ?? item.product?.name}
                        </td>
                        <td className="p-3 text-center align-middle break-words">
                          {item.variant && Object.keys(item.variant).length > 0 ? (
                            <ul className="list-none m-0 p-0">
                              {Object.entries(item.variant).map(([key, val]) => (
                                <li key={key}>
                                  <span className="font-medium">{key}:</span> {val}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-3 text-center align-middle break-words">
                          {quantity}
                        </td>
                        <td className="p-3 text-center align-middle break-words">
                          ৳{formatCurrency(price.toFixed(2))}
                        </td>
                        <td className="p-3 text-center align-middle break-words">
                          ৳{formatCurrency(total.toFixed(2))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Student & Coupon sections side by side */}
            <div className="mb-8 flex justify-between gap-8 max-w-5xl mx-auto px-4">
              {/* Student Section */}
              <div className="w-1/2 bg-[#181818] p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Are you a student?
                </h2>
                <div className="mb-4">
                  <div className="flex space-x-6">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="isStudent"
                        value="yes"
                        checked={isStudent === true}
                        onChange={() => {
                          setIsStudent(true);
                          setStudentInfoValid(null);
                          setStudentOfferApplied(false);
                        }}
                        className="form-radio text-pink-500"
                      />
                      <span className="ml-2 text-white">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="isStudent"
                        value="no"
                        checked={isStudent === false}
                        onChange={() => {
                          setIsStudent(false);
                          setStudentInfoValid(null);
                          setStudentOfferApplied(false);
                          setUniversityName("");
                          setUniversityEmail("");
                        }}
                        className="form-radio text-pink-500"
                      />
                      <span className="ml-2 text-white">No</span>
                    </label>
                  </div>
                </div>

                {isStudent && (
                  <>
                    <div className="mb-4">
                      <label className="block mb-2 text-gray-300 font-medium">
                        University Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 rounded border border-gray-600 bg-[#121212] text-white"
                        value={universityName}
                        onChange={(e) => setUniversityName(e.target.value)}
                        placeholder="Enter your university name"
                        required
                        disabled={studentOfferApplied}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2 text-gray-300 font-medium">
                        University Email
                      </label>
                      <input
                        type="email"
                        className="w-full p-2 rounded border border-gray-600 bg-[#121212] text-white"
                        value={universityEmail}
                        onChange={(e) => setUniversityEmail(e.target.value)}
                        placeholder="Enter your university email"
                        required
                        disabled={studentOfferApplied}
                      />
                    </div>
                    {studentInfoValid === false && (
                      <p className="text-red-500 mb-2">
                        Please provide valid university name and email.
                      </p>
                    )}
                    {!studentOfferApplied && (
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStudentInfo()) {
                            setStudentOfferApplied(true);
                            toast.success("Student offer applied! 5% discount granted.");
                          }
                        }}
                        className="mt-2 bg-pink-500 hover:bg-pink-600 text-white py-1 px-4 rounded w-auto"
                      >
                        Apply Student Offer
                      </button>
                    )}
                    {studentOfferApplied && (
                      <p className="text-green-500 mt-1 font-semibold">
                        Student offer successfully applied!
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Coupon Section */}
              <div className="w-1/2 bg-[#181818] p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Have any coupon code?
                </h2>
                <div className="mb-4">
                  <div className="flex space-x-6 mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="hasCoupon"
                        value="yes"
                        checked={hasCoupon === true}
                        onChange={() => {
                          setHasCoupon(true);
                          setCouponValid(null);
                          setCouponApplied(false);
                          setCouponCode("");
                        }}
                        className="form-radio text-pink-500"
                      />
                      <span className="ml-2 text-white">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="hasCoupon"
                        value="no"
                        checked={hasCoupon === false}
                        onChange={() => {
                          setHasCoupon(false);
                          setCouponValid(null);
                          setCouponApplied(false);
                          setCouponCode("");
                        }}
                        className="form-radio text-pink-500"
                      />
                      <span className="ml-2 text-white">No</span>
                    </label>
                  </div>

                  {hasCoupon && (
                    <>
                      <input
                        type="text"
                        className="w-full p-2 rounded border border-gray-600 bg-[#121212] text-white"
                        value={couponCode}
                        onChange={(e) => {
                          if (!couponApplied) {
                            setCouponCode(e.target.value);
                            setCouponValid(null);
                            setCouponApplied(false);
                          }
                        }}
                        disabled={couponApplied}
                        placeholder="Enter coupon code"
                      />
                      {!couponApplied && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            validateCoupon();
                          }}
                          className="mt-2 bg-pink-500 hover:bg-pink-600 text-white py-1 px-4 rounded w-auto"
                        >
                          Apply Coupon
                        </button>
                      )}
                      {couponValid === false && (
                        <p className="text-red-500 mt-1">Invalid coupon code.</p>
                      )}
                      {couponApplied && (
                        <p className="text-green-500 mt-1 font-semibold">
                          Coupon applied: {couponCode.toUpperCase()}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-semibold mb-5">Order Summary</h2>
              <div className="flex justify-between flex-wrap p-8 bg-[#181818] rounded-lg shadow-md">
                <ul className="text-lg">
                  <li>
                    <span className="font-semibold mb-4">Items:</span> ৳{formatCurrency(cartTotalPrice)}
                  </li>
                  <li>
                    <span className="font-semibold mb-4">Shipping:</span> ৳{formatCurrency(shippingPrice)}
                  </li>
                  <li>
                    <span className="font-semibold mb-4">Tax:</span> ৳{formatCurrency(taxPrice)}
                  </li>
                  {discountPercent > 0 && (
                    <li className="text-green-400">
                      <span className="font-semibold mb-4">Discount ({discountPercent}%):</span> - ৳{formatCurrency(discountAmount)}
                    </li>
                  )}
                  <li className="text-xl font-bold mt-2">
                    <span className="font-semibold mb-4">Total:</span> ৳{formatCurrency(discountedTotalPrice)}
                  </li>
                </ul>

                {error && (
                  <Message variant="danger">
                    {error.data?.message || error.error || "An error occurred"}
                  </Message>
                )}

                <div>
                  <h2 className="text-2xl font-semibold mb-4">Shipping</h2>
                  <p>
                    <strong>Address:</strong> {cart.shippingAddress.address},{" "}
                    {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
                    {cart.shippingAddress.country}
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
                  <strong>Method:</strong> {cart.paymentMethod}
                </div>
              </div>

              {/* Back and Place Order buttons */}
              <div className="flex justify-between mt-6 max-w-6xl mx-auto px-4">
                <button
                  type="button"
                  className="bg-gray-600 text-white py-3 px-6 rounded-full text-lg hover:bg-gray-700 transition-colors"
                  onClick={() => navigate("/shipping")}
                >
                  &larr; Back to Shipping
                </button>

                <button
                  type="button"
                  className="bg-pink-500 text-white py-3 px-10 rounded-full text-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
                  disabled={cart.cartItems.length === 0 || isLoading}
                  onClick={placeOrderHandler}
                >
                  Place Order
                </button>
              </div>
            </div>

            {isLoading && <Loader />}
          </>
        )}
      </div>
    </>
  );
};

export default PlaceOrder;

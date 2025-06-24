import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useGetProductsByCategoryQuery,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import Ratings from "./Ratings";
import ProductTabs from "./ProductTabs";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import moment from "moment";
import {
  addToCartLocal,
  addToCartBackend,
} from "../../redux/features/cart/cartSlice";
import {
  addFavoriteToBackend,
  removeFavoriteFromBackend,
  fetchFavorites,
} from "../../redux/features/favorites/favoriteSlice";

const CurrentCompareProduct = ({ product, imageHeight, title }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;

  const displayPrice = hasVariants
    ? product.variants[selectedVariantIndex]?.price ?? product.price
    : product.price;

  return (
    <div className="flex-1 bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">{title}</h2>
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-auto object-contain mb-4"
        style={{ maxHeight: imageHeight ? `${imageHeight}px` : "auto" }}
      />
      <h3 className="text-lg font-bold text-black mb-2">{product.name}</h3>
      <p className="text-black mb-4">Price: ৳ {displayPrice.toLocaleString()}</p>

      {hasVariants && (
        <div className="flex flex-wrap gap-2">
          {product.variants.map((variant, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVariantIndex(idx)}
              className={`px-4 py-2 rounded border ${
                selectedVariantIndex === idx
                  ? "bg-pink-600 text-white border-pink-600"
                  : "bg-white text-black border-gray-300 hover:bg-pink-100"
              } transition`}
            >
              RAM: {variant.ram} | ROM: {variant.rom}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [availableStock, setAvailableStock] = useState(0);
  const [showCompareList, setShowCompareList] = useState(false);
  const [compareProduct, setCompareProduct] = useState(null);
  const [imageHeight, setImageHeight] = useState(null);

  const {
    data: product,
    isLoading: loadingProduct,
    refetch,
    error: errorProduct,
  } = useGetProductDetailsQuery(productId);

  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useFetchCategoriesQuery();

  const categoryId =
    product?.category
      ? typeof product.category === "string"
        ? product.category
        : product.category._id
      : null;

  const {
    data: similarProducts,
    isLoading: loadingSimilar,
    error: errorSimilar,
  } = useGetProductsByCategoryQuery(categoryId, {
    skip: !categoryId,
  });

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;

  const favorites = useSelector((state) => state.favorites.favorites) || [];
  const isFavorite = favorites.some((fav) => fav._id === product?._id);

  const imageRef = useRef(null);

  const similarProductsArray = useMemo(() => {
    if (Array.isArray(similarProducts)) return similarProducts;
    if (similarProducts && Array.isArray(similarProducts.products)) return similarProducts.products;
    return [];
  }, [similarProducts]);

  const filteredSimilarProducts = useMemo(() => {
    if (!product) return [];
    return similarProductsArray.filter(
      (p) => p._id.toString() !== product._id.toString()
    );
  }, [similarProductsArray, product]);

  useEffect(() => {
    if (!product) return;

    const variantsLength = product?.variants?.length || 0;
    const validIndex = selectedVariantIndex < variantsLength ? selectedVariantIndex : 0;

    if (selectedVariantIndex !== validIndex) {
      setSelectedVariantIndex(validIndex);
      return;
    }

    if (variantsLength > 0) {
      const variant = product.variants[validIndex];
      setDisplayPrice(variant?.price ?? 0);
      setAvailableStock(variant?.countInStock ?? 0);
    } else {
      setDisplayPrice(product.price ?? 0);
      setAvailableStock(product.countInStock ?? 0);
    }
    setQty(1);
  }, [product, selectedVariantIndex]);

  useEffect(() => {
    function updateImageHeight() {
      if (imageRef.current) {
        setImageHeight(imageRef.current.clientHeight);
      }
    }

    updateImageHeight();
    window.addEventListener("resize", updateImageHeight);

    return () => {
      window.removeEventListener("resize", updateImageHeight);
    };
  }, [product?.image]);

  useEffect(() => {
    if (userInfo?._id) {
      dispatch(fetchFavorites(userInfo._id));
    }
  }, [dispatch, userInfo]);

  const toggleFavorite = () => {
    if (!userInfo?._id) {
      alert("Please log in to save favorites.");
      return;
    }

    if (isFavorite) {
      dispatch(removeFavoriteFromBackend({ userId: userInfo._id, productId: product._id }))
        .unwrap()
        .then(() => {
          toast.info("Removed from favorites");
          dispatch(fetchFavorites(userInfo._id));
        })
        .catch(() => {
          toast.error("Failed to remove favorite");
        });
    } else {
      dispatch(addFavoriteToBackend({ userId: userInfo._id, productId: product._id }))
        .unwrap()
        .then(() => {
          toast.success("Added to favorites");
          dispatch(fetchFavorites(userInfo._id));
        })
        .catch(() => {
          toast.error("This product are already added to favourites");
        });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!rating || !comment.trim()) {
      toast.error("Please provide rating and comment.");
      return;
    }

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      setRating(0);
      setComment("");
      toast.success("Review created successfully");
    } catch (error) {
      toast.error(error?.data?.message || error.message || "Failed to submit review");
    }
  };

  const addToCartHandler = async () => {
    if (qty > availableStock) {
      toast.error("Quantity exceeds available stock.");
      return;
    }

    const variant = hasVariants ? product.variants[selectedVariantIndex] : null;

    try {
      if (userInfo) {
        const resultAction = await dispatch(
          addToCartBackend({
            userId: userInfo._id,
            productId: product._id,
            qty,
            variant,
          })
        );

        if (addToCartBackend.rejected.match(resultAction)) {
          toast.error(resultAction.payload || "Failed to add/update cart item");
          return;
        }
      } else {
        dispatch(
          addToCartLocal({
            _id: product._id,
            name: product.name,
            image: product.image,
            price: variant ? variant.price : product.price,
            qty,
            variant,
            countInStock: variant ? variant.countInStock : product.countInStock,
          })
        );
      }

      navigate("/cart");
    } catch (error) {
      toast.error("An unexpected error occurred while adding to cart.");
    }
  };

  if (loadingProduct || loadingCategories) return <Loader />;
  if (errorProduct)
    return (
      <Message variant="danger">
        {errorProduct?.data?.message || errorProduct.message || "Failed to load product"}
      </Message>
    );
  if (errorCategories)
    return (
      <Message variant="danger">
        {errorCategories?.data?.message || errorCategories.message || "Failed to load categories"}
      </Message>
    );

  const categoryObj = categories?.find((cat) => cat._id === categoryId);
  const categoryName = categoryObj ? categoryObj.name : "N/A";

  const displayQuantity = hasVariants
    ? product.variants[selectedVariantIndex]?.quantity ?? "N/A"
    : product.quantity ?? "N/A";

  const displayStock = hasVariants
    ? product.variants[selectedVariantIndex]?.countInStock ?? "N/A"
    : product.countInStock ?? "N/A";

  return (
    <div className="w-4/5 mx-auto px-6 py-8">
      <Link
        to="/shop"
        className="inline-flex items-center mb-8 px-4 py-2 bg-pink-600 text-white font-semibold rounded hover:bg-pink-700 transition"
      >
        <FaArrowLeft className="mr-2" />
        Go Back
      </Link>

      {/* Product Details Section */}
      <div className="flex gap-8 items-start justify-center">
        {/* Image Section */}
        <div className="flex-shrink-0 w-1/3 bg-[#101011] rounded p-4 relative flex flex-col items-center">
          <img
            ref={imageRef}
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-contain rounded"
            onLoad={() => {
              if (imageRef.current) {
                setImageHeight(imageRef.current.clientHeight);
              }
            }}
          />
          <div
            className="absolute top-4 right-4 cursor-pointer text-3xl text-pink-500 hover:text-pink-700 transition-transform transform hover:scale-110"
            style={{ transform: "translate(-6px, 4px)" }}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter") toggleFavorite();
            }}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </div>
        </div>

        {/* Variants Section */}
        {hasVariants && (
          <div
            className="flex-shrink-0 w-1/5 bg-[#101011] rounded p-4 overflow-auto text-white flex flex-col items-center justify-center"
            style={{ height: imageHeight ? `${imageHeight}px` : "auto" }}
          >
            <h3 className="text-xl font-semibold mb-4 text-center">Available Variants</h3>
            <ul className="space-y-3 w-full">
              {product.variants.map((variant, index) => (
                <li
                  key={index}
                  onClick={() => setSelectedVariantIndex(index)}
                  className={`cursor-pointer p-3 rounded border w-full text-center ${
                    selectedVariantIndex === index
                      ? "border-blue-500 bg-blue-900"
                      : "border-gray-600 hover:border-blue-400"
                  }`}
                >
                  <p className="m-0">
                    <strong>RAM:</strong> {variant.ram} | <strong>ROM:</strong> {variant.rom}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Details Section */}
        <div
          className="flex-1 bg-[#101011] rounded p-6 overflow-auto text-gray-300 flex flex-col"
          style={{ height: imageHeight ? `${imageHeight}px` : "auto" }}
        >
          <h2 className="text-3xl font-semibold mb-2">{product.name}</h2>

          <p className="mb-4 text-gray-400">
            Category: <span className="text-white font-semibold">{categoryName}</span>
          </p>

          <p className="text-4xl font-extrabold mb-6">৳ {displayPrice.toLocaleString()}</p>

          <p className="mb-8 whitespace-pre-line flex-grow text-justify">{product.description}</p>

          <div className="flex flex-wrap justify-between items-start max-w-[480px] mb-8">
            <div className="mb-6">
              <h1 className="flex items-center mb-3">
                <FaStore className="mr-2 text-white" /> Brand: {product.brand}
              </h1>
              <h1 className="flex items-center mb-3">
                <FaClock className="mr-2 text-white" /> Added:{" "}
                {moment(product.createdAt).fromNow()}
              </h1>
              <h1 className="flex items-center">
                <FaStar className="mr-2 text-white" /> Reviews: {product.numReviews}
              </h1>
            </div>

            <div className="mb-6">
              <h1 className="flex items-center mb-3">
                <FaStar className="mr-2 text-white" /> Ratings: {product.rating}
              </h1>
              <h1 className="flex items-center mb-3">
                <FaShoppingCart className="mr-2 text-white" /> Quantity: {displayQuantity}
              </h1>
              <h1 className="flex items-center">
                <FaBox className="mr-2 text-white" /> In Stock: {displayStock}
              </h1>
            </div>
          </div>

          <div className="flex justify-between flex-wrap max-w-[480px] mb-8">
            <Ratings value={product.rating} text={`${product.numReviews} reviews`} />

            {displayStock > 0 && (
              <div>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="p-2 w-[6rem] rounded-lg text-black"
                >
                  {[...Array(displayStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="btn-container max-w-[480px]">
            <button
              onClick={addToCartHandler}
              disabled={displayStock === 0}
              className="bg-pink-600 text-black py-3 px-6 rounded-lg hover:bg-pink-700 transition w-full"
            >
              Add To Cart
            </button>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="mt-16 max-w-7xl mx-auto px-4 text-white">
        <h3 className="text-2xl font-semibold mb-6">Specifications</h3>
        {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
          <>
            <table className="w-full border border-gray-300 rounded">
              <tbody>
                {product.specifications.map((spec, index) => (
                  <tr key={index} className="border-b border-gray-200 align-top">
                    <td
                      className="py-3 px-6 font-medium text-left whitespace-nowrap"
                      style={{ width: "180px", verticalAlign: "top" }}
                    >
                      {spec.key || "N/A"}
                    </td>
                    <td
                      className="py-3 px-6 whitespace-normal"
                      style={{ verticalAlign: "top", textAlign: "justify" }}
                    >
                      {spec.value || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              onClick={() => setShowCompareList(!showCompareList)}
            >
              {showCompareList ? "Hide Comparison List" : "Compare this with similar products"}
            </button>
          </>
        ) : (
          <p className="text-gray-400">No specifications available.</p>
        )}
      </div>

      {/* Related Products Section */}
      {showCompareList && (
        <div className="mt-8 max-w-7xl mx-auto p-4 bg-[#101011] rounded text-white">
          <h3 className="text-xl mb-4">Select a product to compare:</h3>
          {loadingSimilar && <Loader />}
          {errorSimilar && (
            <Message variant="danger">Failed to load similar products.</Message>
          )}
          {filteredSimilarProducts.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredSimilarProducts.map((p) => (
                <li
                  key={p._id}
                  className="cursor-pointer border border-gray-300 rounded p-4 bg-white text-black transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => setCompareProduct(p)}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-40 object-contain mb-2"
                  />
                  <h4 className="font-semibold">{p.name}</h4>
                  <p>৳ {p.price.toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No similar products available for comparison.</p>
          )}
        </div>
      )}

      {/* Comparison Section */}
      {compareProduct && (
        <>
          <div className="max-w-7xl mx-auto flex gap-8 p-6 mt-12">
            <CurrentCompareProduct
              product={product}
              imageHeight={imageHeight}
              title="Current Product"
            />
            <CurrentCompareProduct
              product={compareProduct}
              imageHeight={imageHeight}
              title="Compare Product"
            />
          </div>

          {/* Specifications Comparison Table */}
          <div className="max-w-7xl mx-auto p-6 mt-6 bg-[#18181b] rounded text-gray-300 overflow-auto">
            <h3 className="text-2xl font-semibold mb-4 text-white">Specifications Comparison</h3>
            <table className="w-full border border-gray-700 rounded text-white">
              <thead>
                <tr className="border-b border-gray-700">
                  <th
                    className="py-2 px-4 font-semibold text-left whitespace-nowrap"
                    style={{ maxWidth: "25%" }}
                  >
                    Specification
                  </th>
                  <th
                    className="py-2 px-4 font-semibold text-left"
                    style={{ maxWidth: "37.5%" }}
                  >
                    Current Product
                  </th>
                  <th
                    className="py-2 px-4 font-semibold text-left"
                    style={{ maxWidth: "37.5%" }}
                  >
                    Compare Product
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const keysSet = new Set();
                  (product.specifications || []).forEach(spec => keysSet.add(spec.key));
                  (compareProduct.specifications || []).forEach(spec => keysSet.add(spec.key));
                  const allKeys = Array.from(keysSet);

                  return allKeys.map((key) => {
                    const currentSpec = product.specifications?.find(s => s.key === key);
                    const compareSpec = compareProduct.specifications?.find(s => s.key === key);

                    return (
                      <tr key={key} className="border-b border-gray-700 min-h-[48px]">
                        <td
                          className="py-2 px-4 font-semibold text-left whitespace-nowrap align-top"
                          style={{ maxWidth: "25%" }}
                        >
                          {key || "N/A"}
                        </td>
                        <td
                          className="py-2 px-4 text-left align-top break-words whitespace-normal"
                          style={{ maxWidth: "37.5%", textAlign: "justify" }}
                        >
                          {currentSpec?.value || "N/A"}
                        </td>
                        <td
                          className="py-2 px-4 text-left align-top break-words whitespace-normal"
                          style={{ maxWidth: "37.5%", textAlign: "justify" }}
                        >
                          {compareSpec?.value || "N/A"}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Reviews Section */}
      <div className="mt-[5rem] flex flex-wrap items-start justify-between max-w-[90rem] w-full mx-auto px-6">
        <ProductTabs
          loadingProductReview={loadingProductReview}
          userInfo={userInfo}
          submitHandler={submitHandler}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          product={product}
        />
      </div>
    </div>
  );
};

export default ProductDetails;

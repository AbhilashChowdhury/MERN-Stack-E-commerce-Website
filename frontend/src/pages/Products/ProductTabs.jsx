import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Ratings from "./Ratings";
import { useGetProductsByCategoryQuery } from "../../redux/api/productApiSlice";
import SmallProduct from "./SmallProduct";
import Loader from "../../components/Loader";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) => {
  // Guard clause: if product is not loaded yet
  if (!product || !product._id) {
    return <p>Loading product data...</p>;
  }

  // Safely extract categoryId from product.category (object or string)
  const categoryId =
    product.category && typeof product.category === "object" && product.category !== null
      ? product.category._id
      : product.category || null;

  // Debug logs
  useEffect(() => {
    console.log("Product:", product);
    console.log("Category:", product.category);
    console.log("Category ID:", categoryId);
  }, [product, categoryId]);

  // Fetch related products by category, skip if no categoryId
  const {
    data: relatedProducts,
    isLoading,
    isError,
  } = useGetProductsByCategoryQuery(categoryId, { skip: !categoryId });

  // Access products array inside response object safely
  const relatedProductsArray = relatedProducts?.products || [];

  // Filter out the current product from related products
  const filteredRelatedProducts = relatedProductsArray.filter(
    (p) => p._id !== product._id
  );

  const [activeTab, setActiveTab] = useState(1);

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Tab buttons */}
      <section className="mr-[5rem]">
        <div
          className={`flex-1 p-4 cursor-pointer text-lg ${
            activeTab === 1 ? "font-bold" : ""
          }`}
          onClick={() => handleTabClick(1)}
        >
          Write Your Review
        </div>
        <div
          className={`flex-1 p-4 cursor-pointer text-lg ${
            activeTab === 2 ? "font-bold" : ""
          }`}
          onClick={() => handleTabClick(2)}
        >
          All Reviews
        </div>
        <div
          className={`flex-1 p-4 cursor-pointer text-lg ${
            activeTab === 3 ? "font-bold" : ""
          }`}
          onClick={() => handleTabClick(3)}
        >
          Related Products
        </div>
      </section>

      {/* Tab content */}
      <section className="flex-1">
        {/* Write Your Review Tab */}
        {activeTab === 1 && (
          <div className="mt-4">
            {userInfo ? (
              <form onSubmit={submitHandler}>
                <div className="my-2">
                  <label htmlFor="rating" className="block text-xl mb-2">
                    Rating
                  </label>

                  <select
                    id="rating"
                    required
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="p-2 border rounded-lg xl:w-[40rem] text-black w-full"
                  >
                    <option value="">Select</option>
                    <option value="1">Inferior</option>
                    <option value="2">Decent</option>
                    <option value="3">Great</option>
                    <option value="4">Excellent</option>
                    <option value="5">Exceptional</option>
                  </select>
                </div>

                <div className="my-2">
                  <label htmlFor="comment" className="block text-xl mb-2">
                    Comment
                  </label>

                  <textarea
                    id="comment"
                    rows="3"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="p-2 border rounded-lg xl:w-[40rem] text-black w-full"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loadingProductReview}
                  className="bg-pink-600 text-white py-2 px-4 rounded-lg"
                >
                  Submit
                </button>
              </form>
            ) : (
              <p>
                Please <Link to="/login">sign in</Link> to write a review
              </p>
            )}
          </div>
        )}

        {/* All Reviews Tab */}
        {activeTab === 2 && (
          <>
            <div>{product.reviews.length === 0 && <p>No Reviews</p>}</div>

            <div>
              {product.reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-[#1A1A1A] p-4 rounded-lg xl:ml-[2rem] sm:ml-[0rem] xl:w-[50rem] sm:w-[24rem] mb-5"
                >
                  <div className="flex justify-between">
                    <strong className="text-[#B0B0B0]">{review.name}</strong>
                    <p className="text-[#B0B0B0]">
                      {review.createdAt.substring(0, 10)}
                    </p>
                  </div>

                  <p className="my-4">{review.comment}</p>
                  <Ratings value={review.rating} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Related Products Tab */}
        {activeTab === 3 && (
          <section className="mx-8 mt-4 max-w-[90rem]">
            {isLoading ? (
              <Loader />
            ) : isError ? (
              <p className="text-red-500">Failed to load related products.</p>
            ) : filteredRelatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredRelatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct._id}
                    className="cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-lg rounded"
                  >
                    <SmallProduct product={relatedProduct} />
                  </div>
                ))}
              </div>
            ) : (
              <p>No related products found.</p>
            )}
          </section>
        )}
      </section>
    </div>
  );
};

export default ProductTabs;

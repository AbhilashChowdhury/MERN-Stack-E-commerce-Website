import React from "react";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import Message from "../../components/Message";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import moment from "moment";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";

// Custom Previous Arrow
const CustomPrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "block",
        left: "10px",
        zIndex: 2,
        top: "50%",
        transform: "translate(0, -50%)",
        fontSize: "30px",
        color: "#ec4899", // Tailwind pink-500 color
        cursor: "pointer",
      }}
      onClick={onClick}
      aria-label="Previous slide"
    />
  );
};

// Custom Next Arrow
const CustomNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "block",
        right: "10px",
        zIndex: 2,
        top: "50%",
        transform: "translate(0, -50%)",
        fontSize: "30px",
        color: "#ec4899", // Tailwind pink-500 color
        cursor: "pointer",
      }}
      onClick={onClick}
      aria-label="Next slide"
    />
  );
};

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
  };

  return (
    <div className="mb-4 flex justify-center mt-4">
      {isLoading ? null : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <div className="w-full max-w-[56rem] relative">
          <Slider {...settings}>
            {products.map(
              ({
                image,
                _id,
                name,
                price,
                description,
                brand,
                createdAt,
                numReviews,
                rating,
                quantity,
                countInStock,
              }) => (
                <div key={_id}>
                  <img
                    src={image}
                    alt={name}
                    className="w-full rounded-lg object-contain h-[30rem] bg-white"
                  />

                  <div className="mt-4 flex justify-between">
                    <div className="one">
                      <h2>{name}</h2>
                      <p>৳ {price}</p> <br /> <br />
                      <p className="w-[25rem]">
                        {description.substring(0, 170)} ...
                      </p>
                    </div>

                    <div className="flex justify-between w-[20rem]">
                      <div className="one">
                        <h1 className="flex items-center mb-6">
                          <FaStore className="mr-2 text-white" /> Brand: {brand}
                        </h1>
                        <h1 className="flex items-center mb-6">
                          <FaClock className="mr-2 text-white" /> Added:{" "}
                          {moment(createdAt).fromNow()}
                        </h1>
                        <h1 className="flex items-center mb-6">
                          <FaStar className="mr-2 text-white" /> Reviews:{" "}
                          {numReviews}
                        </h1>
                      </div>

                      <div className="two">
                        <h1 className="flex items-center mb-6">
                          <FaStar className="mr-2 text-white" /> Ratings:{" "}
                          {Math.round(rating)}
                        </h1>
                        <h1 className="flex items-center mb-6">
                          <FaShoppingCart className="mr-2 text-white" /> Quantity:{" "}
                          {quantity}
                        </h1>
                        <h1 className="flex items-center mb-6">
                          <FaBox className="mr-2 text-white" /> In Stock:{" "}
                          {countInStock}
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;

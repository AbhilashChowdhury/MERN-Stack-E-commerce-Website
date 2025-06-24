import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon"; // Adjust path if needed

const Product = ({ product }) => {
  return (
    <div className="w-[30rem] ml-[2rem] p-3 relative rounded-lg shadow-lg bg-[#1A1A1A]">
      <div className="relative rounded overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-[30rem] rounded"
        />
        {/* Prevent click bubbling to Link */}
        <div
          className="absolute top-2 right-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <HeartIcon product={product} />
        </div>
      </div>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h2 className="flex justify-between items-center">
            <div className="text-lg text-white truncate">{product.name}</div>
            <span className="bg-pink-100 text-pink-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
              ৳ {product.price.toLocaleString()}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default Product;

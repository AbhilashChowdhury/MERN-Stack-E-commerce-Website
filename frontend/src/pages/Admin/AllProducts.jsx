import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAllProductsQuery, useDeleteProductMutation } from "../../redux/api/productApiSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

const AllProducts = () => {
  const { data: products, isLoading, isError, refetch } = useAllProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Product deleted successfully");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete product");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Error loading products
      </div>
    );
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-row-reverse min-h-screen bg-black text-gray-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`transition-width duration-300 bg-gray-900 ${
          sidebarOpen ? "w-64" : "w-16"
        } flex flex-col shadow-lg`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-white select-none">
              Admin Menu
            </h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-pink-500 hover:text-pink-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex flex-col mt-4 space-y-1 px-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Dashboard"
          >
            {sidebarOpen ? "Dashboard" : "🏠"}
          </NavLink>
          <NavLink
            to="/admin/categorylist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Create Category"
          >
            {sidebarOpen ? "Create Category" : "📂"}
          </NavLink>
          <NavLink
            to="/admin/productlist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Create Product"
          >
            {sidebarOpen ? "Create Product" : "🛒"}
          </NavLink>
          <NavLink
            to="/admin/allproductslist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="All Products"
          >
            {sidebarOpen ? "All Products" : "📦"}
          </NavLink>
          <NavLink
            to="/admin/userlist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Manage Users"
          >
            {sidebarOpen ? "Manage Users" : "👥"}
          </NavLink>
          <NavLink
            to="/admin/orderlist"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Manage Orders"
          >
            {sidebarOpen ? "Manage Orders" : "📋"}
          </NavLink>
          <NavLink
            to="/admin/add-discounts"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700 ${
                isActive ? "bg-pink-600 text-black" : "text-gray-300"
              }`
            }
            title="Add Coupons & Student Discount"
          >
            {sidebarOpen ? "Add Coupons & Student Discount" : "🎁"}
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-white">
          All Products ({filteredProducts.length})
        </h1>

        {/* Search Input */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded bg-[#141414] text-white border border-gray-700 focus:outline-none focus:border-pink-600 transition"
          />
        </div>

        <div className="overflow-x-auto rounded-lg shadow-lg bg-[#101011]">
          <table className="min-w-full divide-y divide-gray-700 table-fixed">
            <thead className="bg-gray-800">
              <tr>
                <th className="w-1/5 px-6 py-4 text-left text-sm font-semibold text-white uppercase">
                  Image
                </th>
                <th className="w-1/5 px-6 py-4 text-left text-sm font-semibold text-white uppercase">
                  Name
                </th>
                <th className="w-1/5 px-6 py-4 text-left text-sm font-semibold text-white uppercase">
                  Created
                </th>
                <th className="w-1/5 px-6 py-4 text-left text-sm font-semibold text-white uppercase">
                  Price
                </th>
                <th className="w-1/5 px-6 py-4 text-left text-sm font-semibold text-white uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-800 cursor-default transition-colors duration-300"
                  >
                    <td className="w-1/5 px-6 py-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </td>
                    <td className="w-1/5 px-6 py-4 text-gray-300 text-sm font-semibold truncate max-w-xs">
                      {product.name}
                    </td>
                    <td className="w-1/5 px-6 py-4 text-gray-400 text-sm">
                      {moment(product.createdAt).format("MMM Do, YYYY")}
                    </td>
                    <td className="w-1/5 px-6 py-4 text-gray-300 text-sm font-semibold">
                      ৳ {product.price}
                    </td>
                    <td className="w-1/5 px-6 py-4 text-left">
                      <div className="inline-flex items-center space-x-3">
                        <Link to={`/admin/product/update/${product._id}`}>
                          <button className="bg-pink-600 hover:bg-pink-700 text-black font-semibold py-2 px-4 rounded flex items-center transition cursor-pointer">
                            <FaEdit className="mr-2" size={16} /> Update
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteHandler(product._id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded flex items-center transition cursor-pointer"
                          aria-label={`Delete product ${product.name}`}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AllProducts;

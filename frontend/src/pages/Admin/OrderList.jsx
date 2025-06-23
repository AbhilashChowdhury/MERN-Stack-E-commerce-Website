import React, { useState } from "react";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link, NavLink } from "react-router-dom";
import { useGetOrdersQuery } from "../../redux/api/orderApiSlice";

const OrderList = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <main className="flex-1 p-8 overflow-auto max-w-7xl mx-auto bg-black">
        {/* Heading with order count */}
        <h1 className="text-3xl font-bold mb-8 text-white">
          Orders{" "}
          <span className="text-gray-400">
            ({orders ? orders.length : 0})
          </span>
        </h1>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger" className="max-w-xl mx-auto">
            {error?.data?.message || error.error}
          </Message>
        ) : orders && orders.length === 0 ? (
          <Message variant="info" className="max-w-xl mx-auto">
            No orders found.
          </Message>
        ) : (
          <div className="overflow-x-auto max-w-7xl mx-auto rounded-lg shadow-lg bg-[#101011]">
            <table className="min-w-full divide-y divide-gray-700 table-fixed">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                    Delivered
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-800 transition-colors duration-300 cursor-default"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={order.orderItems[0]?.image}
                        alt={order._id}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono break-all max-w-xs">
                      {order._id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {order.user?.username || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-black">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-black">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.isDelivered ? (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-black">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-black">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/order/${order._id}`}>
                        <button className="bg-pink-600 hover:bg-pink-700 text-black font-semibold py-1 px-3 rounded transition cursor-pointer">
                          More
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderList;

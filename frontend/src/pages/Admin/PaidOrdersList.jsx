import React from "react";
import { useFetchOrdersQuery } from "../../redux/api/orderApiSlice"; // Adjust import path as needed
import moment from "moment";

const PaidOrdersList = () => {
  const { data: orders = [], isLoading, isError } = useFetchOrdersQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Error loading orders.
      </div>
    );
  }

  // Filter orders that are fully paid
  const paidOrders = orders.filter((order) => order.isPaid === true);

  if (paidOrders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        No fully paid orders found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-6">Fully Paid Orders</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold uppercase">
                Order ID
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold uppercase">
                User
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold uppercase">
                Total Price
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold uppercase">
                Paid At
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paidOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-800">
                <td className="px-4 py-2">{order._id}</td>
                <td className="px-4 py-2">{order.user?.name || "Unknown"}</td>
                <td className="px-4 py-2">৳ {order.totalPrice.toFixed(2)}</td>
                <td className="px-4 py-2">
                  {order.paidAt
                    ? moment(order.paidAt).format("MMM Do, YYYY")
                    : "N/A"}
                </td>
                <td className="px-4 py-2 text-green-500 font-semibold">Paid</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaidOrdersList;

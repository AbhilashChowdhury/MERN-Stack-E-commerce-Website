import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";

const UserOrder = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-2">
        My Orders({orders ? orders.length : 0})
      </h2>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger" className="max-w-xl mx-auto text-red-400">
          {error?.data?.error || error.error}
        </Message>
      ) : orders && orders.length === 0 ? (
        <Message variant="info" className="max-w-xl mx-auto text-gray-400">
          You have no orders yet.
        </Message>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg bg-[#101011] border border-gray-800">
          <table className="min-w-full table-fixed divide-y divide-gray-800">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="w-32 px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Items
                </th>
                <th className="w-56 px-6 py-3 text-left text-sm font-semibold text-white uppercase break-words">
                  ID
                </th>
                <th className="w-32 px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Date
                </th>
                <th className="w-24 px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Total
                </th>
                <th className="w-28 px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Paid
                </th>
                <th className="w-28 px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  Delivered
                </th>
                <th className="w-20 px-6 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-800 transition-colors duration-300 cursor-default"
                >
                  <td className="w-32 px-6 py-4">
                    <img
                      src={order.orderItems[0]?.image}
                      alt={`Order ${order._id}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </td>
                  <td className="w-56 px-6 py-4 text-sm text-gray-300 font-mono break-words max-w-xs">
                    {order._id}
                  </td>
                  <td className="w-32 px-6 py-4 text-sm text-gray-300">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="w-24 px-6 py-4 text-sm text-gray-300">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="w-28 px-6 py-4">
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
                  <td className="w-28 px-6 py-4">
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
                  <td className="w-20 px-6 py-4 text-right">
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
    </div>
  );
};

export default UserOrder;

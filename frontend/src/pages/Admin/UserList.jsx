import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        toast.success("User deleted successfully");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const toggleEdit = (id, username, email) => {
    setEditableUserId(id);
    setEditableUserName(username);
    setEditableUserEmail(email);
  };

  const cancelEdit = () => {
    setEditableUserId(null);
    setEditableUserName("");
    setEditableUserEmail("");
  };

  const updateHandler = async (id) => {
    if (!editableUserName.trim() || !editableUserEmail.trim()) {
      toast.error("Name and email cannot be empty");
      return;
    }
    try {
      await updateUser({
        userId: id,
        username: editableUserName.trim(),
        email: editableUserEmail.trim(),
      });
      toast.success("User updated successfully");
      setEditableUserId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

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
        <h1 className="text-3xl font-bold mb-6 text-white">Users</h1>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger" className="max-w-xl mx-auto">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-lg bg-[#101011]">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300 uppercase">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono break-all max-w-xs">
                      {user._id}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-300">
                      {editableUserId === user._id ? (
                        <input
                          type="text"
                          value={editableUserName}
                          onChange={(e) => setEditableUserName(e.target.value)}
                          className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-pink-600"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <span>{user.username}</span>
                          <button
                            onClick={() =>
                              toggleEdit(user._id, user.username, user.email)
                            }
                            aria-label="Edit user"
                            className="ml-3 text-pink-500 hover:text-pink-600 transition"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-300">
                      {editableUserId === user._id ? (
                        <input
                          type="email"
                          value={editableUserEmail}
                          onChange={(e) => setEditableUserEmail(e.target.value)}
                          className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-pink-600"
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <a
                            href={`mailto:${user.email}`}
                            className="hover:underline break-words"
                          >
                            {user.email}
                          </a>
                          <button
                            onClick={() =>
                              toggleEdit(user._id, user.username, user.email)
                            }
                            aria-label="Edit user"
                            className="ml-3 text-pink-500 hover:text-pink-600 transition"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {user.isAdmin ? (
                        <FaCheck className="text-green-500 mx-auto" />
                      ) : (
                        <FaTimes className="text-red-500 mx-auto" />
                      )}
                    </td>

                    <td className="px-6 py-4 text-center space-x-2">
                      {editableUserId === user._id ? (
                        <>
                          <button
                            onClick={() => updateHandler(user._id)}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md transition"
                            aria-label="Save changes"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded-md transition"
                            aria-label="Cancel edit"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        !user.isAdmin && (
                          <button
                            onClick={() => deleteHandler(user._id)}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
                            aria-label="Delete user"
                          >
                            <FaTrash />
                          </button>
                        )
                      )}
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

export default UserList;

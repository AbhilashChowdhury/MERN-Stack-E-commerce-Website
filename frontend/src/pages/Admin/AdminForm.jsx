import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const AdminForm = () => {
  // Coupon form state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(5);
  const [couponExpiry, setCouponExpiry] = useState("");

  // University form state
  const [universityName, setUniversityName] = useState("");
  const [universityEmailDomain, setUniversityEmailDomain] = useState("");

  // Status messages
  const [couponMessage, setCouponMessage] = useState("");
  const [universityMessage, setUniversityMessage] = useState("");

  // Existing coupons and universities
  const [existingCoupons, setExistingCoupons] = useState([]);
  const [existingUniversities, setExistingUniversities] = useState([]);

  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const API_BASE_URL = "/api/admin";

  const postData = async (url = "", data = {}) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error");
      return result;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/coupons`);
        if (!res.ok) throw new Error("Failed to fetch coupons");
        const data = await res.json();
        setExistingCoupons(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchUniversities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/universities`);
        if (!res.ok) throw new Error("Failed to fetch universities");
        const data = await res.json();
        setExistingUniversities(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCoupons();
    fetchUniversities();
  }, []);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponMessage("");
    try {
      await postData(`${API_BASE_URL}/coupons`, {
        code: couponCode.trim(),
        discountPercent: Number(couponDiscount),
        expiryDate: couponExpiry ? new Date(couponExpiry).toISOString() : null,
      });
      setCouponMessage("🎉 Coupon added successfully!");
      setCouponCode("");
      setCouponDiscount(5);
      setCouponExpiry("");
      const res = await fetch(`${API_BASE_URL}/coupons`);
      const data = await res.json();
      setExistingCoupons(data);
    } catch (error) {
      setCouponMessage(`⚠️ Error: ${error.message}`);
    }
  };

  const handleUniversitySubmit = async (e) => {
    e.preventDefault();
    setUniversityMessage("");
    try {
      await postData(`${API_BASE_URL}/universities`, {
        name: universityName.trim(),
        emailDomain: universityEmailDomain.trim().toLowerCase(),
      });
      setUniversityMessage("🎉 University added successfully!");
      setUniversityName("");
      setUniversityEmailDomain("");
      const res = await fetch(`${API_BASE_URL}/universities`);
      const data = await res.json();
      setExistingUniversities(data);
    } catch (error) {
      setUniversityMessage(`⚠️ Error: ${error.message}`);
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
        <h1 className="text-3xl font-bold mb-6 text-white text-left ml-2">
          Coupons and Student Discount
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
          {/* Coupon Form */}
          <section className="bg-[#101011] rounded-lg shadow-lg p-6 w-full max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 border-b border-pink-600 pb-2 text-white text-left">
              Add Coupon
            </h2>
            <form onSubmit={handleCouponSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="couponCode"
                  className="block mb-1 font-semibold text-white"
                >
                  Coupon Code
                </label>
                <input
                  id="couponCode"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  required
                  placeholder="e.g. SAVE5"
                  className="w-full p-3 rounded bg-[#141414] text-white border border-gray-700 focus:border-pink-600 focus:outline-none transition"
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="couponDiscount"
                  className="block mb-1 font-semibold text-white"
                >
                  Discount Percent
                </label>
                <input
                  id="couponDiscount"
                  type="number"
                  min="1"
                  max="100"
                  value={couponDiscount}
                  onChange={(e) => setCouponDiscount(e.target.value)}
                  required
                  className="w-full p-3 rounded bg-[#141414] text-white border border-gray-700 focus:border-pink-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="couponExpiry"
                  className="block mb-1 font-semibold text-white"
                >
                  Expiry Date (optional)
                </label>
                <input
                  id="couponExpiry"
                  type="date"
                  value={couponExpiry}
                  onChange={(e) => setCouponExpiry(e.target.value)}
                  className="w-full p-3 rounded bg-[#141414] text-white border border-gray-700 focus:border-pink-600 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 px-6 py-3 bg-pink-600 rounded text-white font-bold hover:bg-pink-700 transition"
              >
                Add Coupon
              </button>

              {couponMessage && (
                <p
                  className={`mt-4 text-center font-semibold ${
                    couponMessage.startsWith("⚠️")
                      ? "text-red-500"
                      : "text-green-400"
                  }`}
                >
                  {couponMessage}
                </p>
              )}
            </form>

            {/* Existing Coupons List */}
            <div className="mt-8 text-gray-300">
              <h3 className="text-xl font-semibold mb-4 text-left">Existing Coupons</h3>
              {existingCoupons.length === 0 ? (
                <p>No coupons added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {existingCoupons.map((coupon) => (
                    <li key={coupon._id} className="border-b border-gray-700 pb-2">
                      <strong>Code:</strong> {coupon.code} | <strong>Discount:</strong> {coupon.discountPercent}% |{" "}
                      <strong>Expires:</strong> {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "No expiry"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* University Form */}
          <section className="bg-[#101011] rounded-lg shadow-lg p-6 w-full max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 border-b border-pink-600 pb-2 text-white text-left">
              Add University & Email
            </h2>
            <form onSubmit={handleUniversitySubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="universityName"
                  className="block mb-1 font-semibold text-white"
                >
                  University Name
                </label>
                <input
                  id="universityName"
                  type="text"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  required
                  placeholder="e.g. Example University"
                  className="w-full p-3 rounded bg-[#141414] text-white border border-gray-700 focus:border-pink-600 focus:outline-none transition"
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="universityEmailDomain"
                  className="block mb-1 font-semibold text-white"
                >
                  University Email Domain
                </label>
                <input
                  id="universityEmailDomain"
                  type="text"
                  value={universityEmailDomain}
                  onChange={(e) => setUniversityEmailDomain(e.target.value)}
                  required
                  placeholder="e.g. example.edu"
                  className="w-full p-3 rounded bg-[#141414] text-white border border-gray-700 focus:border-pink-600 focus:outline-none transition"
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 px-6 py-3 bg-pink-600 rounded text-white font-bold hover:bg-pink-700 transition"
              >
                Add University & Email
              </button>

              {universityMessage && (
                <p
                  className={`mt-4 text-center font-semibold ${
                    universityMessage.startsWith("⚠️")
                      ? "text-red-500"
                      : "text-green-400"
                  }`}
                >
                  {universityMessage}
                </p>
              )}
            </form>

            {/* Existing Universities List */}
            <div className="mt-8 text-gray-300">
              <h3 className="text-xl font-semibold mb-4 text-left">Existing Universities & Email Domain</h3>
              {existingUniversities.length === 0 ? (
                <p>No universities added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {existingUniversities.map((uni) => (
                    <li key={uni._id} className="border-b border-gray-700 pb-2">
                      <strong>Name:</strong> {uni.name} | <strong>Email Domain:</strong> {uni.emailDomain}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminForm;

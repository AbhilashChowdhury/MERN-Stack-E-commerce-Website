import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import ProgressSteps from "../../components/ProgressSteps";

const districts = [
  "Bagerhat",
  "Bandarban",
  "Barguna",
  "Barishal",
  "Bhola",
  "Bogura",
  "Brahmanbaria",
  "Chandpur",
  "Chapai Nawabganj",
  "Chattogram",
  "Chuadanga",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Gaibandha",
  "Gopalganj",
  "Habiganj",
  "Jamalp",
  "Jashore",
  "Jhenaidah",
  "Joypurhat",
  "Kagrachari",
  "Kishoreganj",
  "Khagrachari",
  "Khulna",
  "Kurigram",
  "Kushtia",
  "Lalmonirhat",
  "Lakshmipur",
  "Madaripur",
  "Magura",
  "Manikganj",
  "Meherpur",
  "Moulvibazar",
  "Munshiganj",
  "Mymensingh",
  "Narayanganj",
  "Narsingdi",
  "Natore",
  "Naogaon",
  "Netrokona",
  "Nilphamari",
  "Noakhali",
  "Pabna",
  "Panchagarh",
  "Patuakhali",
  "Pirojpur",
  "Rajbar",
  "Rajshahi",
  "Rangamati",
  "Rangpur",
  "Satkhira",
  "Shariatpur",
  "Sherpur",
  "Sirajganj",
  "Sylhet",
  "Tangail",
  "Thakurgaon",
  "Termo",
];

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [paymentMethod, setPaymentMethod] = useState(
    shippingAddress.paymentMethod || "PayPal"
  );
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || "");
  const [country] = useState("Bangladesh");

  const [cityInput, setCityInput] = useState(shippingAddress.city || "");
  const [filteredDistricts, setFilteredDistricts] = useState(districts);
  const [showDropdown, setShowDropdown] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  // Filter districts based on input
  useEffect(() => {
    if (cityInput.trim() === "") {
      setFilteredDistricts(districts);
      return;
    }
    const filtered = districts.filter((d) =>
      d.toLowerCase().includes(cityInput.toLowerCase())
    );
    setFilteredDistricts(filtered);
  }, [cityInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // When user selects a district from dropdown
  const handleSelectDistrict = (district) => {
    setCityInput(district);
    setCity(district);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) {
      setFilteredDistricts(districts);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // Validate city is a valid district
    if (!districts.includes(cityInput)) {
      alert("Please select a valid district from the list.");
      return;
    }

    setCity(cityInput);

    dispatch(
      saveShippingAddress({ address, city: cityInput, postalCode, country })
    );
    dispatch(savePaymentMethod(paymentMethod));

    // Navigate to placeorder without alert
    navigate("/placeorder");
  };

  return (
    <div className="container mx-auto mt-10">
      <ProgressSteps step1 step2 />
      <div className="mt-6 flex justify-around items-center flex-wrap">
        <form onSubmit={submitHandler} className="w-[40rem] relative">
          <h1 className="text-2xl font-semibold mb-4">Shipping</h1>

          <div className="mb-4">
            <label className="block text-white mb-2">Address</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter address"
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="mb-4 relative" ref={dropdownRef}>
            <label className="block text-white mb-2">City (District)</label>
            <div className="flex">
              <input
                type="text"
                className="w-full p-2 border rounded-l"
                placeholder="Enter or select district"
                value={cityInput}
                required
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setCity(""); // reset city until valid selection
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={toggleDropdown}
                className="bg-gray-700 border border-l-0 border-gray-600 rounded-r px-3 flex items-center justify-center text-white hover:bg-pink-600 transition-colors"
                aria-label="Toggle district dropdown"
              >
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    showDropdown ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {showDropdown && (
              <ul className="absolute z-10 w-full max-h-48 overflow-auto bg-[#181818] border border-gray-600 rounded-b shadow-lg mt-1">
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map((district) => (
                    <li
                      key={district}
                      className="px-4 py-2 cursor-pointer hover:bg-pink-600 hover:text-white"
                      onClick={() => handleSelectDistrict(district)}
                    >
                      {district}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-400">No districts found</li>
                )}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2">Postal Code</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter postal code"
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2">Country</label>
            <select
              className="w-full p-2 border rounded bg-gray-700 text-white cursor-not-allowed"
              value={country}
              disabled
            >
              <option value="Bangladesh">Bangladesh</option>
            </select>
          </div>

          {/* Payment Method Section */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Select Method</label>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio text-pink-500"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === "PayPal"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="ml-2">PayPal or Credit Card</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio text-pink-500"
                  name="paymentMethod"
                  value="bKash"
                  checked={paymentMethod === "bKash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="ml-2">bKash</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio text-pink-500"
                  name="paymentMethod"
                  value="Nagad"
                  checked={paymentMethod === "Nagad"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="ml-2">Nagad</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio text-pink-500"
                  name="paymentMethod"
                  value="Rocket"
                  checked={paymentMethod === "Rocket"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="ml-2">Rocket</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  className="form-radio text-pink-500"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={paymentMethod === "Cash on Delivery"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="ml-2">Cash on Delivery</span>
              </label>
            </div>
          </div>

          {/* Buttons side by side with gap and content width */}
          <div className="flex justify-between items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="bg-gray-600 text-white py-2 px-6 rounded-full hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              &larr; Back to Cart
            </button>

            <button
              className="bg-pink-500 text-white py-2 px-6 rounded-full text-lg hover:bg-pink-600 transition-colors whitespace-nowrap"
              type="submit"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Shipping;

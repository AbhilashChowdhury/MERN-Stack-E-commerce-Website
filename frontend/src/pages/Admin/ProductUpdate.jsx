import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/productApiSlice";
import { toast } from "react-toastify";

const ramOptions = [
  "2 GB",
  "3 GB",
  "4 GB",
  "6 GB",
  "8 GB",
  "12 GB",
  "16 GB",
];

const romOptions = [
  "16 GB",
  "32 GB",
  "64 GB",
  "128 GB",
  "256 GB",
  "512 GB",
  "1 TB",
];

const ProductUpdate = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { data: productData, isLoading } = useGetProductByIdQuery(params._id);
  const { data: categories = [], isLoading: categoriesLoading } = useFetchCategoriesQuery();

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

  const fileInputRef = useRef(null);

  // Sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [displayFileName, setDisplayFileName] = useState("No file chosen");

  // Variants and specifications
  const [variants, setVariants] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);

  // Sync default price with first variant price if variants exist
  useEffect(() => {
    if (variants.length > 0 && variants[0].price) {
      setPrice(variants[0].price);
    }
  }, [variants]);

  // Load product data into form on fetch
  useEffect(() => {
    if (productData) {
      setName(productData.name || "");
      setDescription(productData.description || "");
      setPrice(productData.price?.toString() || "");
      setCategory(productData.category?._id || productData.category || "");
      setQuantity(productData.quantity?.toString() || "");
      setBrand(productData.brand || "");
      setStock(productData.countInStock?.toString() || "");
      setImage(productData.image || "");

      setVariants(Array.isArray(productData.variants) ? productData.variants : []);

      // Robust parsing of specifications
      let specs = [];
      try {
        if (!productData.specifications) {
          specs = [{ key: "", value: "" }];
        } else if (typeof productData.specifications === "string") {
          specs = JSON.parse(productData.specifications);
          if (!Array.isArray(specs)) {
            specs = Object.entries(specs).map(([key, value]) => ({ key, value }));
          }
        } else if (Array.isArray(productData.specifications)) {
          specs = productData.specifications;
        } else if (typeof productData.specifications === "object") {
          specs = Object.entries(productData.specifications).map(([key, value]) => ({ key, value }));
        } else {
          specs = [{ key: "", value: "" }];
        }
      } catch (error) {
        console.error("Error parsing specifications:", error);
        specs = [{ key: "", value: "" }];
      }
      setSpecifications(specs.length ? specs : [{ key: "", value: "" }]);

      if (productData.image) {
        try {
          const urlParts = productData.image.split("/");
          setDisplayFileName(urlParts[urlParts.length - 1] || "No file chosen");
        } catch {
          setDisplayFileName("No file chosen");
        }
      } else {
        setDisplayFileName("No file chosen");
      }
    }
  }, [productData]);

  // Image upload handlers
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDisplayFileName(file.name);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Image uploaded successfully", { position: "top-right", autoClose: 2000 });
      setImage(res.image);
    } catch (error) {
      toast.error("Image upload failed", { position: "top-right", autoClose: 2000 });
    }
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Variants handlers
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const newVariants = [...prev];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return newVariants;
    });
  };

  const addVariant = () => setVariants((prev) => [...prev, { ram: "", rom: "", price: "", quantity: "", countInStock: "" }]);

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Specifications handlers
  const handleSpecChange = (index, field, value) => {
    setSpecifications((prev) => {
      const newSpecs = [...prev];
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return newSpecs;
    });
  };

  const addSpecification = () => setSpecifications((prev) => [...prev, { key: "", value: "" }]);

  const removeSpecification = (index) => {
    setSpecifications((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (variants.length > 0) {
      for (const variant of variants) {
        if (
          !variant.ram ||
          !variant.rom ||
          !variant.price ||
          variant.quantity === "" ||
          variant.countInStock === ""
        ) {
          toast.error("Please fill all RAM, ROM, Price, Quantity, and Stock fields for each variant.");
          return;
        }
      }
    } else {
      if (quantity === "" || stock === "") {
        toast.error("Please fill Quantity and Stock for the product.");
        return;
      }
    }

    for (const spec of specifications) {
      if (!spec.key.trim() || !spec.value.trim()) {
        toast.error("Please fill all specification fields.");
        return;
      }
    }

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("brand", brand);

      if (variants.length > 0) {
        formData.append("variants", JSON.stringify(variants));
      } else {
        formData.append("quantity", quantity);
        formData.append("countInStock", stock);
        formData.append("variants", JSON.stringify([]));
      }

      formData.append("image", image);
      formData.append("specifications", JSON.stringify(specifications));

      await updateProduct({ productId: params._id, formData }).unwrap();

      toast.success("Product updated successfully", { position: "top-right", autoClose: 2000 });

      navigate("/admin/allproductslist");
    } catch (error) {
      toast.error("Update failed. Please try again.", { position: "top-right", autoClose: 2000 });
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(params._id).unwrap();
        toast.success("Product deleted successfully", { position: "top-right", autoClose: 2000 });
        navigate("/admin/allproductslist");
      } catch (error) {
        toast.error("Delete failed. Please try again.", { position: "top-right", autoClose: 2000 });
      }
    }
  };

  if (isLoading || categoriesLoading)
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading...
      </div>
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
            <h2 className="text-xl font-bold text-white select-none">Admin Menu</h2>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
            title="Add Coupons & Universities"
          >
            {sidebarOpen ? "Add Coupons & Universities" : "🎁"}
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Update / Delete Product</h1>

        {image && (
          <div className="text-center mb-4">
            <img src={image} alt="product" className="block mx-auto w-48 h-48 object-contain rounded-md shadow-md" />
          </div>
        )}

        <div className="bg-[#101011] rounded-lg shadow-lg p-6 w-full">
          <div className="mb-3">
            <label className="block mb-1 font-semibold text-white">Upload image</label>
            <div
              onClick={handleFileInputClick}
              className="flex items-center justify-between cursor-pointer bg-[#141414] border border-gray-600 rounded p-2 text-white select-none"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleFileInputClick();
              }}
            >
              <span>{displayFileName}</span>
              <button type="button" className="ml-4 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition">
                Choose File
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadFileHandler} className="hidden" />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name and Price */}
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[300px]">
                <label className="block mb-1 font-semibold text-white">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded bg-[#141414] text-white border border-gray-600"
                  required
                />
              </div>
              <div className="flex-1 min-w-[300px]">
                <label className="block mb-1 font-semibold text-white">Price</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 rounded bg-[#141414] text-white border border-gray-600"
                  required
                  disabled={variants.length > 0}
                />
                {variants.length > 0 && (
                  <p className="text-sm text-gray-400 mt-1">Price is set automatically from the first variant.</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="max-w-[480px] mt-6">
              <label className="block mb-1 font-semibold text-white">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded bg-[#141414] text-white border border-gray-600"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Variants */}
            <div className="max-w-[900px] mt-6">
              <label className="block mb-2 font-semibold text-white">
                RAM/ROM Variants with Price, Quantity, and Stock (optional)
              </label>
              {variants.length === 0 && (
                <p className="mb-2 text-gray-400">No variants added. You can add variants below if needed.</p>
              )}
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex gap-4 mb-3 items-center flex-wrap bg-[#141414] p-3 rounded border border-gray-700"
                >
                  <select
                    value={variant.ram}
                    onChange={(e) => handleVariantChange(index, "ram", e.target.value)}
                    className="p-2 rounded bg-[#101011] text-white border border-gray-600 flex-grow min-w-[120px] focus:border-pink-600 focus:outline-none transition"
                    required
                  >
                    <option value="">Select RAM</option>
                    {ramOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <select
                    value={variant.rom}
                    onChange={(e) => handleVariantChange(index, "rom", e.target.value)}
                    className="p-2 rounded bg-[#101011] text-white border border-gray-600 flex-grow min-w-[120px] focus:border-pink-600 focus:outline-none transition"
                    required
                  >
                    <option value="">Select ROM</option>
                    {romOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                    placeholder="Price"
                    className="p-2 rounded bg-[#101011] text-white border border-gray-600 w-36 focus:border-pink-600 focus:outline-none transition"
                    required
                  />

                  <input
                    type="number"
                    min="0"
                    value={variant.quantity}
                    onChange={(e) => handleVariantChange(index, "quantity", e.target.value)}
                    placeholder="Quantity"
                    className="p-2 rounded bg-[#101011] text-white border border-gray-600 w-28 focus:border-pink-600 focus:outline-none transition"
                    required
                  />

                  <input
                    type="number"
                    min="0"
                    value={variant.countInStock}
                    onChange={(e) => handleVariantChange(index, "countInStock", e.target.value)}
                    placeholder="Stock"
                    className="p-2 rounded bg-[#101011] text-white border border-gray-600 w-28 focus:border-pink-600 focus:outline-none transition"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 font-bold px-2 hover:text-red-600 transition"
                    title="Remove variant"
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addVariant}
                className="mt-2 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
              >
                Add Variant
              </button>
            </div>

            {/* Specifications */}
            <div className="mt-6 w-full max-w-[1100px]">
              <label className="block mb-2 font-semibold text-white">Specifications</label>
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-4 mb-3 items-center">
                  <textarea
                    placeholder="Key (e.g. Display)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                    className="p-2 rounded bg-[#101011] text-white border border-gray-600 flex-none min-w-[300px] focus:border-pink-600 focus:outline-none transition"
                    rows={6}
                    required
                  />
                  <textarea
                    placeholder="Value (e.g. multi-line details)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    className="p-2 rounded bg-[#101011] text-white border border-gray-600 flex-1 w-[1000px] focus:border-pink-600 focus:outline-none transition"
                    rows={6}
                    required
                  />
                  {specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="text-red-500 font-bold px-2 hover:text-red-600 transition"
                      title="Remove specification"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSpecification}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Add Specification
              </button>
            </div>

            {/* Brand, Quantity, Stock */}
            <div className="flex flex-wrap justify-between max-w-[480px] mb-8 mt-6">
              <div className="mb-6 w-[48%]">
                <label className="block mb-1 font-semibold text-white">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-3 rounded bg-[#141414] text-white border border-gray-600 focus:border-pink-600 focus:outline-none transition"
                  required
                />
              </div>

              {variants.length === 0 && (
                <>
                  <div className="mb-6 w-[48%]">
                    <label className="block mb-1 font-semibold text-white">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-3 rounded bg-[#141414] text-white border border-gray-600 focus:border-pink-600 focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="mb-6 w-[48%]">
                    <label className="block mb-1 font-semibold text-white">Count In Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full p-3 rounded bg-[#141414] text-white border border-gray-600 focus:border-pink-600 focus:outline-none transition"
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block mb-1 font-semibold text-white">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded bg-[#141414] text-white border border-gray-600 focus:border-pink-600 focus:outline-none transition"
                rows={4}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-3 bg-pink-600 rounded text-white font-bold hover:bg-pink-700 transition"
              >
                {isUpdating ? "Updating..." : "Update Product"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-3 bg-red-600 rounded text-white font-bold hover:bg-red-700 transition"
              >
                {isDeleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProductUpdate;

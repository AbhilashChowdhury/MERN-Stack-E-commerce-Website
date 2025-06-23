import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";

import {
  setCategories,
  setProducts,
  setChecked,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";
import { toast } from "react-toastify";

const Shop = () => {
  const dispatch = useDispatch();
  const { categories, products, checked, radio } = useSelector((state) => state.shop);

  const categoriesQuery = useFetchCategoriesQuery();
  const filteredProductsQuery = useGetFilteredProductsQuery({ checked, radio });

  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!categoriesQuery.isLoading && categoriesQuery.data) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, categoriesQuery.isLoading, dispatch]);

  const applyFilters = () => {
    if (!filteredProductsQuery.data) return;

    let filtered = filteredProductsQuery.data;

    const min = minPriceFilter.trim() !== "" ? Number(minPriceFilter) : undefined;
    const max = maxPriceFilter.trim() !== "" ? Number(maxPriceFilter) : undefined;

    if (
      (min !== undefined && isNaN(min)) ||
      (max !== undefined && isNaN(max)) ||
      (min !== undefined && max !== undefined && min > max)
    ) {
      toast.error("Invalid price range: Min price should be less than or equal to Max price.");
      return;
    }

    if (min !== undefined) {
      filtered = filtered.filter((product) => product.price >= min);
    }
    if (max !== undefined) {
      filtered = filtered.filter((product) => product.price <= max);
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(lowerSearch)
      );
    }

    dispatch(setProducts(filtered));
  };

  useEffect(() => {
    applyFilters();
  }, [checked, radio, filteredProductsQuery.data]);

  const handleBrandClick = (brand) => {
    if (!filteredProductsQuery.data) return;

    const filteredByBrand = filteredProductsQuery.data.filter(
      (product) => product.brand === brand
    );

    dispatch(setProducts(filteredByBrand));
  };

  const handleCheck = (checkedValue, categoryId) => {
    const updatedChecked = checkedValue
      ? [...checked, categoryId]
      : checked.filter((c) => c !== categoryId);
    dispatch(setChecked(updatedChecked));
  };

  const uniqueBrands = filteredProductsQuery.data
    ? Array.from(
        new Set(
          filteredProductsQuery.data
            .map((product) => product.brand)
            .filter(Boolean)
        )
      )
    : [];

  const handleMinPriceChange = (e) => {
    setMinPriceFilter(e.target.value);
  };
  const handleMaxPriceChange = (e) => {
    setMaxPriceFilter(e.target.value);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleSearchClick = () => {
    applyFilters();
  };
  const resetFilters = () => {
    dispatch(setChecked([]));
    setMinPriceFilter("");
    setMaxPriceFilter("");
    setSearchTerm("");
    dispatch(setProducts(filteredProductsQuery.data || []));
  };

  return (
    <div className="container mx-auto p-4">
      {/* Search Bar on Top */}
      <div className="mb-6 max-w-3xl mx-auto flex gap-2">
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-grow px-4 py-2 rounded border border-gray-400 focus:outline-none focus:ring focus:ring-pink-500"
        />
        <button
          onClick={handleSearchClick}
          className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
        >
          Search
        </button>
      </div>

      <div className="flex md:flex-row">
        {/* Sidebar Filters */}
        <aside className="bg-[#151515] p-3 mt-2 mb-2 w-[15rem] rounded space-y-6">
          {/* Category Filter */}
          <div>
            <h2 className="text-center py-2 bg-black rounded-full mb-4 font-semibold text-white">
              Filter by Categories
            </h2>
            <div className="p-5">
              {categories?.map((c) => (
                <div key={c._id} className="mb-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked.includes(c._id)}
                      onChange={(e) => handleCheck(e.target.checked, c._id)}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm font-medium text-white">{c.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h2 className="text-center py-2 bg-black rounded-full mb-4 font-semibold text-white">
              Filter by Brands
            </h2>
            <div className="p-5">
              {uniqueBrands.map((brand) => (
                <div key={brand} className="mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="brand"
                      onChange={() => handleBrandClick(brand)}
                      className="w-4 h-4 text-pink-400 bg-gray-100 border-gray-300 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm font-medium text-white">{brand}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h2 className="text-center py-2 bg-black rounded-full mb-4 font-semibold text-white">
              Filter by Price Range
            </h2>
            <div className="p-5 space-y-3">
              <input
                type="number"
                placeholder="Min Price"
                value={minPriceFilter}
                onChange={handleMinPriceChange}
                className="w-full px-3 py-2 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring focus:border-pink-300"
                min="0"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPriceFilter}
                onChange={handleMaxPriceChange}
                className="w-full px-3 py-2 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring focus:border-pink-300"
                min="0"
              />
              <button
                onClick={handleSearchClick}
                className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="p-5 pt-0">
            <button
              className="w-full border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white transition py-2 rounded"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="p-3 flex-1">
          {/* Removed total products count here */}

          {filteredProductsQuery.isLoading ? (
            <Loader />
          ) : products.length === 0 ? (
            <p className="text-center text-white">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard p={p} key={p._id} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;

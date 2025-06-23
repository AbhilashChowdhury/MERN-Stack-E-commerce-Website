import React from "react";

const ProductComparison = ({ currentProduct, compareProduct }) => {
  if (!currentProduct || !compareProduct) return null;

  const specsToCompare = new Set([
    ...currentProduct.specifications?.map((s) => s.key) || [],
    ...compareProduct.specifications?.map((s) => s.key) || [],
  ]);

  const getSpecValue = (product, key) => {
    const spec = product.specifications?.find((s) => s.key === key);
    return spec ? spec.value : "N/A";
  };

  return (
    <div className="max-w-7xl mx-auto mt-12 p-6 bg-[#101011] rounded text-white grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Current Product */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Current Product</h3>
        <img
          src={currentProduct.image}
          alt={currentProduct.name}
          className="w-full h-64 object-contain mb-4 rounded"
        />
        <h4 className="text-xl font-semibold mb-2">{currentProduct.name}</h4>
        <p className="mb-2">Price: ৳ {currentProduct.price.toLocaleString()}</p>
        <p className="mb-4">{currentProduct.description}</p>
      </div>

      {/* Compare Product */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Compare Product</h3>
        <img
          src={compareProduct.image}
          alt={compareProduct.name}
          className="w-full h-64 object-contain mb-4 rounded"
        />
        <h4 className="text-xl font-semibold mb-2">{compareProduct.name}</h4>
        <p className="mb-2">Price: ৳ {compareProduct.price.toLocaleString()}</p>
        <p className="mb-4">{compareProduct.description}</p>
      </div>

      {/* Specifications Comparison Table */}
      <div className="col-span-full mt-6 overflow-auto">
        <h3 className="text-2xl font-bold mb-4">Specifications Comparison</h3>
        <table className="w-full border border-gray-600 rounded text-left">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3 border border-gray-600">Specification</th>
              <th className="p-3 border border-gray-600">Current Product</th>
              <th className="p-3 border border-gray-600">Compare Product</th>
            </tr>
          </thead>
          <tbody>
            {[...specsToCompare].map((key) => {
              const currentVal = getSpecValue(currentProduct, key);
              const compareVal = getSpecValue(compareProduct, key);
              const isDifferent = currentVal !== compareVal;
              return (
                <tr key={key} className={isDifferent ? "bg-gray-700" : ""}>
                  <td className="p-3 border border-gray-600 font-semibold">{key}</td>
                  <td className="p-3 border border-gray-600">{currentVal}</td>
                  <td className="p-3 border border-gray-600">{compareVal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductComparison;

import { useState, useEffect } from "react";
import { getParts } from "../api/part";
import { formatPrice } from "../utils/format";
import { getImageUrl } from "../utils/api";
import Loading from "../components/Loading";

export default function ComparePartsPage() {
  const [leftPart, setLeftPart] = useState(null);
  const [rightPart, setRightPart] = useState(null);
  const [availableParts, setAvailableParts] = useState([]);
  const [rightParts, setRightParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLeftDropdown, setShowLeftDropdown] = useState(false);
  const [showRightDropdown, setShowRightDropdown] = useState(false);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");

  useEffect(() => {
    loadAllParts();
  }, []);

  // Khi chọn linh kiện bên trái, lọc linh kiện bên phải cùng loại
  useEffect(() => {
    if (leftPart) {
      const sameCategoryParts = availableParts.filter(
        (p) => p.category === leftPart.category && p.id !== leftPart.id
      );
      setRightParts(sameCategoryParts);
      
      // Reset right part nếu không cùng loại
      if (rightPart && rightPart.category !== leftPart.category) {
        setRightPart(null);
      }
    } else {
      setRightParts([]);
      setRightPart(null);
    }
  }, [leftPart]);

  const loadAllParts = async () => {
    setLoading(true);
    try {
      const response = await getParts({ page: 0, size: 1000 });
      if (response.success) {
        setAvailableParts(response.data.content);
      }
    } catch (error) {
      console.error("Error loading parts:", error);
      alert("Không thể tải danh sách linh kiện");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredParts = (searchTerm, partsList) => {
    if (!searchTerm) return partsList;
    return partsList.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const parseSpecs = (part) => {
    try {
      return part.specJson ? JSON.parse(part.specJson) : {};
    } catch {
      return {};
    }
  };

  const compareSpecs = () => {
    if (!leftPart || !rightPart) return [];

    const leftSpecs = parseSpecs(leftPart);
    const rightSpecs = parseSpecs(rightPart);

    const allKeys = new Set([
      ...Object.keys(leftSpecs),
      ...Object.keys(rightSpecs),
    ]);

    return Array.from(allKeys).map((key) => ({
      key,
      leftValue: leftSpecs[key] || "N/A",
      rightValue: rightSpecs[key] || "N/A",
    }));
  };

  const compareNumericValue = (leftVal, rightVal) => {
    // Trích xuất số từ chuỗi (VD: "8GB" -> 8, "3.6GHz" -> 3.6)
    const extractNumber = (val) => {
      if (typeof val === "number") return val;
      const match = String(val).match(/[\d.]+/);
      return match ? parseFloat(match[0]) : null;
    };

    const leftNum = extractNumber(leftVal);
    const rightNum = extractNumber(rightVal);

    if (leftNum !== null && rightNum !== null) {
      if (leftNum > rightNum) return "left";
      if (rightNum > leftNum) return "right";
    }
    return "equal";
  };

  const PartSelector = ({ 
    selectedPart, 
    onSelect, 
    partsList, 
    showDropdown, 
    setShowDropdown, 
    searchTerm, 
    setSearchTerm, 
    label 
  }) => (
    <div className="flex-1 relative">
      <h2 className="text-xl font-bold mb-4">{label}</h2>
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm linh kiện..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {getFilteredParts(searchTerm, partsList).length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Không tìm thấy linh kiện
              </div>
            ) : (
              getFilteredParts(searchTerm, partsList).map((part) => (
                <div
                  key={part.id}
                  onClick={() => {
                    onSelect(part);
                    setShowDropdown(false);
                    setSearchTerm(part.name);
                  }}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                      {part.imageUrl ? (
                        <img
                          src={getImageUrl(part.imageUrl)}
                          alt={part.name}
                          loading="lazy"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{part.name}</div>
                      <div className="text-xs text-gray-500">{part.category}</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {formatPrice(part.price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedPart && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              {selectedPart.imageUrl ? (
                <img
                  src={getImageUrl(selectedPart.imageUrl)}
                  alt={selectedPart.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-5xl">📦</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xs text-blue-600 font-medium mb-1">
                {selectedPart.category}
              </div>
              <h3 className="font-bold text-lg mb-2">{selectedPart.name}</h3>
              {selectedPart.brand && (
                <p className="text-sm text-gray-600 mb-2">
                  Thương hiệu: {selectedPart.brand}
                </p>
              )}
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(selectedPart.price)}
              </div>
              {selectedPart.wattage && (
                <p className="text-sm text-gray-600 mt-2">
                  Công suất: {selectedPart.wattage}W
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
                setSearchTerm("");
              }}
              className="ml-2 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) return <Loading />;

  const comparisonData = compareSpecs();
  const canCompare = leftPart && rightPart;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">So sánh linh kiện</h1>
        <p className="text-gray-600">
          Chọn hai linh kiện cùng loại để so sánh thông số kỹ thuật
        </p>
      </div>

      {/* Part Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PartSelector
          selectedPart={leftPart}
          onSelect={setLeftPart}
          partsList={availableParts}
          showDropdown={showLeftDropdown}
          setShowDropdown={setShowLeftDropdown}
          searchTerm={searchLeft}
          setSearchTerm={setSearchLeft}
          label="Linh kiện 1"
        />

        <PartSelector
          selectedPart={rightPart}
          onSelect={setRightPart}
          partsList={leftPart ? rightParts : []}
          showDropdown={showRightDropdown}
          setShowDropdown={setShowRightDropdown}
          searchTerm={searchRight}
          setSearchTerm={setSearchRight}
          label="Linh kiện 2"
        />
      </div>

      {/* Comparison Table */}
      {canCompare ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">
              Bảng so sánh chi tiết
            </h2>
          </div>

          {/* Price Comparison */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="p-4 bg-gray-50 font-semibold">Giá</div>
              <div className={`p-4 text-center ${
                leftPart.price < rightPart.price
                  ? "bg-green-50 font-bold text-green-700"
                  : leftPart.price > rightPart.price
                  ? "bg-red-50 text-red-700"
                  : ""
              }`}>
                {formatPrice(leftPart.price)}
                {leftPart.price < rightPart.price && " ✓"}
              </div>
              <div className={`p-4 text-center ${
                rightPart.price < leftPart.price
                  ? "bg-green-50 font-bold text-green-700"
                  : rightPart.price > leftPart.price
                  ? "bg-red-50 text-red-700"
                  : ""
              }`}>
                {formatPrice(rightPart.price)}
                {rightPart.price < leftPart.price && " ✓"}
              </div>
            </div>
          </div>

          {/* Rating Comparison */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="p-4 bg-gray-50 font-semibold">Đánh giá</div>
              <div className={`p-4 text-center ${
                (leftPart.ratingAvg || 0) > (rightPart.ratingAvg || 0)
                  ? "bg-green-50 font-bold text-green-700"
                  : ""
              }`}>
                ⭐ {(leftPart.ratingAvg || 0).toFixed(1)} ({leftPart.ratingCount || 0})
                {(leftPart.ratingAvg || 0) > (rightPart.ratingAvg || 0) && " ✓"}
              </div>
              <div className={`p-4 text-center ${
                (rightPart.ratingAvg || 0) > (leftPart.ratingAvg || 0)
                  ? "bg-green-50 font-bold text-green-700"
                  : ""
              }`}>
                ⭐ {(rightPart.ratingAvg || 0).toFixed(1)} ({rightPart.ratingCount || 0})
                {(rightPart.ratingAvg || 0) > (leftPart.ratingAvg || 0) && " ✓"}
              </div>
            </div>
          </div>

          {/* Specs Comparison */}
          {comparisonData.length > 0 && (
            <div>
              <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
                <h3 className="font-bold text-blue-900">Thông số kỹ thuật</h3>
              </div>
              {comparisonData.map((spec, index) => {
                const comparison = compareNumericValue(spec.leftValue, spec.rightValue);
                
                return (
                  <div
                    key={index}
                    className={`grid grid-cols-3 divide-x divide-gray-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } border-b border-gray-200`}
                  >
                    <div className="p-4 font-semibold text-gray-700">
                      {spec.key}
                    </div>
                    <div className={`p-4 text-center ${
                      comparison === "left"
                        ? "bg-green-50 font-bold text-green-700"
                        : comparison === "right"
                        ? "bg-red-50 text-red-700"
                        : ""
                    }`}>
                      {String(spec.leftValue)}
                      {comparison === "left" && " ✓"}
                    </div>
                    <div className={`p-4 text-center ${
                      comparison === "right"
                        ? "bg-green-50 font-bold text-green-700"
                        : comparison === "left"
                        ? "bg-red-50 text-red-700"
                        : ""
                    }`}>
                      {String(spec.rightValue)}
                      {comparison === "right" && " ✓"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-50 border border-green-200 rounded"></span>
                Tốt hơn
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-50 border border-red-200 rounded"></span>
                Kém hơn
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">⚖️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có linh kiện để so sánh
          </h3>
          <p className="text-gray-500">
            Vui lòng chọn hai linh kiện cùng loại để bắt đầu so sánh
          </p>
        </div>
      )}
    </div>
  );
}

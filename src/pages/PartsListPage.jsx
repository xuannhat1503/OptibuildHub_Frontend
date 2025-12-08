import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getParts, crawlPartPrice } from "../api/part";
import { CATEGORIES, SORT_OPTIONS } from "../utils/constants";
import { formatPrice } from "../utils/format";
import { getImageUrl } from "../utils/api";
import StarRating from "../components/StarRating";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import SkeletonCard from "../components/SkeletonCard";
import { useAuth } from "../context/AuthContext";

export default function PartsListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get("page") || "0"),
    size: 12,
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    q: searchParams.get("q") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortDir: searchParams.get("sortDir") || "desc",
  });

  useEffect(() => {
    loadParts();
  }, [filters]);

  const loadParts = async () => {
    setLoading(true);
    try {
      const response = await getParts(filters);
      if (response.success) {
        setParts(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error loading parts:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 0 };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const [sortBy, sortDir] = e.target.value.split("-");
    setFilters((prev) => ({ ...prev, sortBy, sortDir, page: 0 }));
  };

  const handleUpdateAllPrices = async () => {
    if (!confirm("Bạn có chắc muốn cập nhật giá cho tất cả linh kiện?")) {
      return;
    }

    setUpdatingPrices(true);
    try {
      const updatePromises = parts.map(part => crawlPartPrice(part.id));
      await Promise.all(updatePromises);
      alert(`Đã gửi yêu cầu cập nhật giá cho ${parts.length} linh kiện!`);
      loadParts();
    } catch (error) {
      console.error("Error updating prices:", error);
      alert("Có lỗi xảy ra khi cập nhật giá");
    } finally {
      setUpdatingPrices(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Filters */}
      <aside className="lg:col-span-1 space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Tìm kiếm</h3>
          <input
            type="text"
            placeholder="Tên linh kiện..."
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Danh mục</h3>
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Thương hiệu</h3>
          <input
            type="text"
            placeholder="Nhập thương hiệu..."
            value={filters.brand}
            onChange={(e) => updateFilter("brand", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Giá</h3>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Giá tối thiểu"
              value={filters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Giá tối đa"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setFilters({
              page: 0,
              size: 12,
              category: "",
              brand: "",
              minPrice: "",
              maxPrice: "",
              q: "",
              sortBy: "createdAt",
              sortDir: "desc",
            });
            setSearchParams({});
          }}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Xóa bộ lọc
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Linh kiện PC</h1>
          <div className="flex gap-2">
            {user?.role === "ADMIN" && (
              <button
                onClick={handleUpdateAllPrices}
                disabled={updatingPrices || parts.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingPrices ? "Đang cập nhật..." : "🔄 Cập nhật giá"}
              </button>
            )}
            <select
              value={`${filters.sortBy}-${filters.sortDir}`}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : parts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy linh kiện nào
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {parts.map((part) => (
                <Link
                  key={part.id}
                  to={`/parts/${part.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex"
                >
                  {/* Image Section */}
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {part.imageUrl ? (
                      <img
                        src={getImageUrl(part.imageUrl)}
                        alt={part.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-4xl">📦</span>
                    )}
                  </div>
                  
                  {/* Info Section */}
                  <div className="flex-1 p-4">
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      {part.category}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                      {part.name}
                    </h3>
                    {part.brand && (
                      <p className="text-sm text-gray-600 mb-2">Thương hiệu: {part.brand}</p>
                    )}
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(part.price)}
                      </span>
                      {part.wattage && (
                        <span className="text-sm text-gray-500">
                          ⚡ {part.wattage}W
                        </span>
                      )}
                    </div>
                    {part.avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating value={part.avgRating} readOnly size="sm" />
                        <span className="text-sm text-gray-600">
                          ({part.ratingCount} đánh giá)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Price History Mini Chart */}
                  {part.priceHistory && part.priceHistory.length > 1 ? (
                    <div className="w-64 p-4 border-l border-gray-200 flex flex-col">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Biểu đồ giá (7 ngày)
                      </h4>
                      <div className="flex-1 relative">
                        <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id={`miniGradient-${part.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                          <PriceHistoryChart data={part.priceHistory} partId={part.id} />
                        </svg>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        <div className="flex justify-between">
                          <span className="text-green-600">↓ {formatPrice(Math.min(...part.priceHistory.map(h => h.price)))}</span>
                          <span className="text-red-600">↑ {formatPrice(Math.max(...part.priceHistory.map(h => h.price)))}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-64 p-4 border-l border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                      Chưa có dữ liệu giá
                    </div>
                  )}
                </Link>
              ))}
            </div>

            <Pagination
              page={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
}

// Mini chart component
function PriceHistoryChart({ data, partId }) {
  if (!data || data.length < 2) return null;
  
  // Sort by crawledAt ascending (oldest to newest)
  const sortedData = [...data].sort((a, b) => 
    new Date(a.crawledAt) - new Date(b.crawledAt)
  );
  
  const prices = sortedData.map(d => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;
  const padding = 5;
  
  const points = sortedData.map((item, index) => {
    const x = padding + (index / (sortedData.length - 1)) * (200 - 2 * padding);
    const y = padding + (1 - (item.price - minPrice) / range) * (80 - 2 * padding);
    return { x, y, price: item.price };
  });
  
  const lineData = points.map(p => `${p.x},${p.y}`).join(' ');
  
  // Area path
  const areaData = `M ${points[0].x} ${80 - padding} ` +
    points.map(p => `L ${p.x} ${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x} ${80 - padding} Z`;
  
  return (
    <g>
      {/* Area fill */}
      <path
        d={areaData}
        fill={`url(#miniGradient-${partId})`}
      />
      
      {/* Line */}
      <polyline
        points={lineData}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Data points */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="2.5"
          fill="white"
          stroke="#3b82f6"
          strokeWidth="1.5"
        >
          <title>{formatPrice(point.price)}</title>
        </circle>
      ))}
    </g>
  );
}

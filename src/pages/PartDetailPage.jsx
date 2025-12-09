import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getPartDetail, getPartRatings, postRating } from "../api/part";
import { formatPrice, formatDate } from "../utils/format";
import { getImageUrl } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import Loading from "../components/Loading";

export default function PartDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [part, setPart] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Rating form
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState({
    score: 5,
    content: "",
  });

  // Memoize expensive JSON parsing - must be before any conditional returns
  const specs = useMemo(() => {
    return part?.specJson ? JSON.parse(part.specJson) : {};
  }, [part?.specJson]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load both part detail and ratings in parallel for faster loading
      const [partRes, ratingsRes] = await Promise.all([
        getPartDetail(id),
        getPartRatings(id).catch(err => {
          console.warn("Could not load ratings:", err);
          return { success: false, data: [] };
        })
      ]);
      
      if (partRes.success) {
        console.log("Part data received:", partRes.data);
        console.log("Price history:", partRes.data.priceHistory);
        setPart(partRes.data);
      }
      
      if (ratingsRes.success) {
        setRatings(ratingsRes.data);
      }
    } catch (error) {
      console.error("Error loading part:", error);
      alert("Không thể tải thông tin linh kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá");
      return;
    }
    
    try {
      const response = await postRating(id, {
        userId: user.id,
        score: newRating.score,
        content: newRating.content,
      });

      if (response.success) {
        alert("Đánh giá của bạn đã được gửi!");
        setShowRatingForm(false);
        setNewRating({ score: 5, content: "" });
        loadData();
      } else {
        alert(response.message || "Không thể gửi đánh giá");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      const errorMsg = error.response?.data?.message || "Lỗi khi gửi đánh giá. Vui lòng thử lại.";
      alert(errorMsg);
    }
  };

  if (loading) return <Loading />;
  if (!part) return <div className="text-center py-12">Không tìm thấy linh kiện</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/parts" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            {part.imageUrl ? (
              <img
                src={getImageUrl(part.imageUrl)}
                alt={part.name}
                loading="lazy"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-400 text-9xl">📦</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-blue-600 font-medium mb-2">
            {part.category}
          </div>
          <h1 className="text-3xl font-bold mb-4">{part.name}</h1>
          
          {part.brand && (
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Thương hiệu:</span> {part.brand}
            </p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <StarRating value={part.ratingAvg || 0} readonly />
            <span className="text-gray-600">
              ({part.ratingCount || 0} đánh giá)
            </span>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-blue-600">
              {formatPrice(part.price)}
            </span>
          </div>

          {part.wattage && (
            <p className="mb-4 text-gray-600">
              <span className="font-semibold">Công suất:</span> {part.wattage}W
            </p>
          )}

          {/* Specifications */}
          {Object.keys(specs).length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-4">Thông số kỹ thuật</h3>
              <div className="space-y-2">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex border-b border-gray-200 py-2">
                    <span className="font-semibold text-gray-700 w-1/2">{key}:</span>
                    <span className="text-gray-600 w-1/2">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price History Chart */}
      {part.priceHistory && part.priceHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Lịch sử giá</h2>
          
          {part.priceHistory.length >= 2 ? (
            <>
              {/* Interactive Chart */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="h-64 relative">
                  <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#93c5fd" />
                      </linearGradient>
                    </defs>
                    <PriceChart data={part.priceHistory} />
                  </svg>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Giá thấp nhất: <strong className="text-green-600">{formatPrice(Math.min(...part.priceHistory.map(h => h.price)))}</strong></span>
                  <span>Giá cao nhất: <strong className="text-red-600">{formatPrice(Math.max(...part.priceHistory.map(h => h.price)))}</strong></span>
                  <span>Giá trung bình: <strong className="text-blue-600">{formatPrice(part.priceHistory.reduce((sum, h) => sum + h.price, 0) / part.priceHistory.length)}</strong></span>
                </div>
              </div>
            </>
          ) : (
            <div className="mb-6 bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              <p>Cần ít nhất 2 điểm dữ liệu để hiển thị biểu đồ</p>
            </div>
          )}

          {/* Price History Table */}
          <h3 className="text-lg font-semibold mb-3">Chi tiết lịch sử</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {part.priceHistory.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-100 py-2">
                <span className="text-sm text-gray-600">
                  {formatDate(item.crawledAt)}
                </span>
                <div className="text-right">
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                  {item.source && (
                    <span className="text-xs text-gray-500 ml-2">({item.source})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Đánh giá</h2>
          {user && (
            <button
              onClick={() => setShowRatingForm(!showRatingForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Viết đánh giá
            </button>
          )}
        </div>

        {showRatingForm && (
          <form onSubmit={handleSubmitRating} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Xếp hạng
              </label>
              <StarRating
                value={newRating.score}
                onChange={(score) => setNewRating({ ...newRating, score })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Nội dung
              </label>
              <textarea
                value={newRating.content}
                onChange={(e) =>
                  setNewRating({ ...newRating, content: e.target.value })
                }
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chia sẻ trải nghiệm của bạn..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Gửi đánh giá
              </button>
              <button
                type="button"
                onClick={() => setShowRatingForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {ratings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Chưa có đánh giá nào
          </p>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating value={rating.score} readonly />
                  <span className="text-sm text-gray-600">
                    {rating.userName || rating.user?.fullName || rating.user?.email || "User"}
                  </span>
                  {(
                    rating.userRole || rating.user?.role
                  ) && (
                    <span className="text-xs text-white bg-gray-500 ml-2 px-2 py-0.5 rounded">
                      {rating.userRole || rating.user?.role}
                    </span>
                  )}
                </div>
                {rating.content && (
                  <p className="text-gray-700">{rating.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Price Chart Component for detail page
function PriceChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <text x="400" y="100" textAnchor="middle" fill="#9ca3af" fontSize="14">
        Chưa có đủ dữ liệu để hiển thị biểu đồ
      </text>
    );
  }
  
  // Sort by crawledAt ascending (oldest to newest for chart)
  const sortedData = [...data].sort((a, b) => 
    new Date(a.crawledAt) - new Date(b.crawledAt)
  );
  
  const prices = sortedData.map(d => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;
  const padding = 20;
  
  const points = sortedData.map((item, index) => {
    const x = padding + (index / (sortedData.length - 1)) * (800 - 2 * padding);
    const y = padding + (1 - (item.price - minPrice) / range) * (200 - 2 * padding);
    return { x, y, price: item.price };
  });
  
  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');
  
  // Area fill
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${200 - padding} L ${padding} ${200 - padding} Z`;
  
  return (
    <g>
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map(i => {
        const y = padding + i * (200 - 2 * padding) / 4;
        return (
          <line
            key={`grid-${i}`}
            x1={padding}
            y1={y}
            x2={800 - padding}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}
      
      {/* Area fill */}
      <path
        d={areaPath}
        fill="url(#priceGradient)"
        opacity="0.3"
      />
      
      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Data points */}
      {points.map((point, index) => (
        <g key={index}>
          <circle
            cx={point.x}
            cy={point.y}
            r="4"
            fill="white"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <title>{formatPrice(point.price)}</title>
        </g>
      ))}
    </g>
  );
}

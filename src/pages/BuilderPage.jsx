import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getParts, getPartDetail } from "../api/part";
import { checkCompatibility, saveBuild } from "../api/build";
import { formatPrice } from "../utils/format";
import { CATEGORIES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function BuilderPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedParts, setSelectedParts] = useState({});
  const [availableParts, setAvailableParts] = useState({});
  const [loadingParts, setLoadingParts] = useState({});
  const [compatibility, setCompatibility] = useState(null);
  const [buildTitle, setBuildTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Load build from profile if passed via state
  useEffect(() => {
    const loadBuildFromProfile = async () => {
      const build = location.state?.build;
      if (build && build.partIds && build.partIds.length > 0) {
        setInitialLoading(true);
        setBuildTitle(build.title || "");
        
        try {
          // Load all parts details
          const partsPromises = build.partIds.map(id => getPartDetail(id));
          const partsResponses = await Promise.all(partsPromises);
          
          const loadedParts = {};
          partsResponses.forEach(response => {
            if (response.success) {
              const part = response.data;
              loadedParts[part.category] = part;
            }
          });
          
          setSelectedParts(loadedParts);
        } catch (error) {
          console.error("Error loading build parts:", error);
          alert("Không thể tải cấu hình");
        } finally {
          setInitialLoading(false);
        }
      }
    };

    loadBuildFromProfile();
  }, [location.state]);

  // Load parts for each category when it's expanded
  const loadPartsForCategory = async (category) => {
    if (availableParts[category]) return; // Already loaded
    
    setLoadingParts((prev) => ({ ...prev, [category]: true }));
    try {
      const response = await getParts({ category, size: 50, sortBy: "name", sortDir: "asc" });
      if (response.success) {
        setAvailableParts((prev) => ({
          ...prev,
          [category]: response.data.content,
        }));
      }
    } catch (error) {
      console.error(`Error loading parts for ${category}:`, error);
    } finally {
      setLoadingParts((prev) => ({ ...prev, [category]: false }));
    }
  };

  // Check compatibility whenever parts change
  useEffect(() => {
    const partIds = Object.values(selectedParts)
      .filter((p) => p)
      .map((p) => p.id);

    if (partIds.length >= 2) {
      checkCompatibilityNow(partIds);
    } else {
      setCompatibility(null);
    }
  }, [selectedParts]);

  const checkCompatibilityNow = async (partIds) => {
    try {
      const response = await checkCompatibility(partIds);
      if (response.success) {
        setCompatibility(response.data);
      }
    } catch (error) {
      console.error("Error checking compatibility:", error);
    }
  };

  const handleSelectPart = (category, part) => {
    setSelectedParts((prev) => ({
      ...prev,
      [category]: part,
    }));
  };

  const handleRemovePart = (category) => {
    setSelectedParts((prev) => {
      const newParts = { ...prev };
      delete newParts[category];
      return newParts;
    });
  };

  const handleSaveBuild = async () => {
    const partIds = Object.values(selectedParts).map((p) => p.id);
    if (partIds.length === 0) {
      alert("Vui lòng chọn ít nhất một linh kiện");
      return;
    }

    if (!buildTitle.trim()) {
      alert("Vui lòng nhập tên cấu hình");
      return;
    }

    setSaving(true);
    try {
      const response = await saveBuild({
        userId: user.id,
        title: buildTitle,
        partIds,
      });

      if (response.success) {
        alert("Lưu cấu hình thành công!");
        // Reset form
        setSelectedParts({});
        setBuildTitle("");
        setCompatibility(null);
      }
    } catch (error) {
      console.error("Error saving build:", error);
      alert("Lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  const handleShareToForum = () => {
    const partIds = Object.values(selectedParts).map((p) => p.id);
    if (partIds.length === 0) {
      alert("Vui lòng chọn ít nhất một linh kiện");
      return;
    }

    // Prepare build data
    const buildData = {
      title: buildTitle || "Cấu hình PC của tôi",
      parts: Object.values(selectedParts),
      totalPrice,
      totalWattage,
      compatible: compatibility?.compatible,
      warnings: compatibility?.warnings || [],
    };

    // Navigate to create post with build data
    navigate("/forum/create", { state: { build: buildData } });
  };

  const totalPrice = Object.values(selectedParts).reduce(
    (sum, part) => sum + (part?.price || 0),
    0
  );

  const totalWattage = Object.values(selectedParts).reduce(
    (sum, part) => sum + (part?.wattage || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Xây dựng cấu hình PC</h1>

      {initialLoading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Part Selection */}
          <div className="lg:col-span-2 space-y-4">
            {CATEGORIES.map((category) => (
              <CategorySelector
                key={category.value}
                category={category}
                selectedPart={selectedParts[category.value]}
                availableParts={availableParts[category.value]}
                loading={loadingParts[category.value]}
                onLoad={() => loadPartsForCategory(category.value)}
                onSelect={(part) => handleSelectPart(category.value, part)}
                onRemove={() => handleRemovePart(category.value)}
              />
            ))}
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Tóm tắt cấu hình</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng giá:</span>
                  <span className="font-bold text-blue-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng công suất:</span>
                  <span className="font-semibold">{totalWattage}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số linh kiện:</span>
                  <span className="font-semibold">
                    {Object.keys(selectedParts).length}
                  </span>
                </div>
              </div>

              {compatibility && (
                <div
                  className={`p-4 rounded-lg mb-4 ${
                    compatibility.compatible
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {compatibility.compatible ? "✓" : "⚠"}
                    </span>
                    <span className="font-semibold">
                      {compatibility.compatible
                        ? "Tương thích"
                        : "Có vấn đề tương thích"}
                    </span>
                  </div>
                  {compatibility.warnings && compatibility.warnings.length > 0 && (
                    <ul className="text-sm space-y-1 ml-8">
                      {compatibility.warnings.map((warning, idx) => (
                        <li key={idx} className="text-red-700">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Tên cấu hình..."
                  value={buildTitle}
                  onChange={(e) => setBuildTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveBuild}
                  disabled={
                    saving ||
                    Object.keys(selectedParts).length === 0 ||
                    !buildTitle.trim()
                  }
                  className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Đang lưu..." : "Lưu cấu hình"}
                </button>
                <button
                  onClick={handleShareToForum}
                  disabled={Object.keys(selectedParts).length === 0}
                  className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Chia sẻ lên diễn đàn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategorySelector({
  category,
  selectedPart,
  availableParts,
  loading,
  onLoad,
  onSelect,
  onRemove,
}) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    if (!expanded && !availableParts) {
      onLoad();
    }
    setExpanded(!expanded);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div
        onClick={handleToggle}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">{category.label}</span>
          {selectedPart && (
            <span className="text-sm text-green-600">✓ Đã chọn</span>
          )}
        </div>
        <button className="text-gray-500">
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 p-4">
          {selectedPart ? (
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <p className="font-semibold">{selectedPart.name}</p>
                <p className="text-sm text-gray-600">
                  {formatPrice(selectedPart.price)}
                </p>
              </div>
              <button
                onClick={onRemove}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          ) : loading ? (
            <Loading />
          ) : availableParts && availableParts.length > 0 ? (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {availableParts.map((part) => (
                <div
                  key={part.id}
                  onClick={() => onSelect(part)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-sm">{part.name}</p>
                    <p className="text-xs text-gray-600">{part.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">
                      {formatPrice(part.price)}
                    </p>
                    {part.wattage && (
                      <p className="text-xs text-gray-500">{part.wattage}W</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Không có linh kiện
            </p>
          )}
        </div>
      )}
    </div>
  );
}

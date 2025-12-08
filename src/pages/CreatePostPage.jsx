import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPost } from "../api/post";
import { getBuildDetail } from "../api/build";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";
import ImageUploader from "../components/ImageUploader";
import Loading from "../components/Loading";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrls: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [sharedBuild, setSharedBuild] = useState(null);
  const [loadingBuild, setLoadingBuild] = useState(false);

  const generateBuildContent = (build) => {
    let content = `# ${build.title}\n\n`;
    content += `**Tổng giá:** ${formatPrice(build.totalPrice)}\n`;
    content += `**Công suất:** ${build.totalWattage || build.wattageTotal}W\n`;
    content += `**Tương thích:** ${build.compatible ? "✓ Tương thích" : "⚠ Có cảnh báo"}\n\n`;
    
    if (build.warnings && build.warnings.length > 0) {
      content += `**Cảnh báo:**\n`;
      build.warnings.forEach(w => {
        content += `- ${w}\n`;
      });
      content += `\n`;
    }

    content += `## Danh sách linh kiện\n\n`;
    build.parts.forEach(part => {
      content += `### ${part.category}\n`;
      content += `**${part.name}**\n`;
      if (part.brand) content += `- Thương hiệu: ${part.brand}\n`;
      content += `- Giá: ${formatPrice(part.price)}\n`;
      if (part.wattage) content += `- Công suất: ${part.wattage}W\n`;
      content += `\n`;
    });

    return content;
  };

  // Load build data if shared from builder or profile
  useEffect(() => {
    const loadBuildData = async () => {
      const build = location.state?.build;
      const buildId = location.state?.buildId;
      const buildTitle = location.state?.buildTitle;

      if (build) {
        // Direct build data from BuilderPage
        setSharedBuild(build);
        setFormData(prev => ({
          ...prev,
          title: build.title || "Chia sẻ cấu hình PC",
          content: generateBuildContent(build),
        }));
      } else if (buildId) {
        // Load build details from ProfilePage
        setLoadingBuild(true);
        try {
          const response = await getBuildDetail(buildId);
          if (response.success) {
            const buildData = response.data;
            // Transform to match BuilderPage format
            const transformedBuild = {
              title: buildTitle || buildData.title,
              totalPrice: buildData.totalPrice,
              totalWattage: buildData.wattageTotal,
              compatible: true, // Assume compatible if saved
              warnings: [],
              parts: buildData.parts || [], // Now backend returns parts array
            };
            setSharedBuild(transformedBuild);
            setFormData(prev => ({
              ...prev,
              title: transformedBuild.title || "Chia sẻ cấu hình PC",
              content: generateBuildContent(transformedBuild),
            }));
          }
        } catch (error) {
          console.error("Error loading build:", error);
          alert("Không thể tải thông tin cấu hình");
        } finally {
          setLoadingBuild(false);
        }
      }
    };

    loadBuildData();
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }

    setSubmitting(true);
    try {
      const response = await createPost({
        userId: user.id,
        title: formData.title,
        content: formData.content,
        imageUrls: formData.imageUrls,
        buildId: null,
      });

      if (response.success) {
        alert("Bài viết đã được tạo thành công!");
        navigate(`/forum/${response.data.id || ""}`);
      } else {
        alert(response.message || "Không thể tạo bài viết");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      console.error("Request payload:", {
        userId: user.id,
        title: formData.title,
        content: formData.content,
        imageUrls: formData.imageUrls,
      });
      if (error.response?.status === 405) {
        alert("Backend chưa hỗ trợ tạo bài viết. Vui lòng thêm endpoint POST /api/posts vào ForumController.");
      } else {
        const errorMsg = error.response?.data?.message || error.message || "Lỗi khi tạo bài viết";
        alert(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (urls) => {
    console.log("handleImageUpload called with:", urls);
    setFormData((prev) => ({
      ...prev,
      imageUrls: Array.isArray(urls) ? urls : [urls],
    }));
  };

  if (loadingBuild) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        {sharedBuild ? "Chia sẻ cấu hình PC" : "Tạo bài viết mới"}
      </h1>

      {sharedBuild && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🖥️</span>
            <h3 className="font-bold text-lg">{sharedBuild.title}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tổng giá:</span>
              <div className="font-bold text-blue-600">{formatPrice(sharedBuild.totalPrice)}</div>
            </div>
            <div>
              <span className="text-gray-600">Công suất:</span>
              <div className="font-semibold">{sharedBuild.totalWattage}W</div>
            </div>
            <div>
              <span className="text-gray-600">Linh kiện:</span>
              <div className="font-semibold">{sharedBuild.parts.length}</div>
            </div>
          </div>
          {sharedBuild.compatible !== undefined && (
            <div className={`mt-3 p-2 rounded text-sm ${
              sharedBuild.compatible 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {sharedBuild.compatible ? "✓ Cấu hình tương thích" : "⚠ Có cảnh báo tương thích"}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tiêu đề bài viết..."
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Nội dung
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Chia sẻ suy nghĩ của bạn..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Hình ảnh
          </label>
          <ImageUploader onUpload={handleImageUpload} multiple />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold disabled:opacity-50"
          >
            {submitting ? "Đang đăng..." : "Đăng bài"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/forum")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

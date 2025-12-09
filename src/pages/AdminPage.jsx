import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { getParts, createPart, updatePart, deletePart, crawlPartPrice } from "../api/part";
import { getPosts } from "../api/post";
import { getAllUsers, deleteUser, updateUserRole, getAllComments, deleteComment, deletePost } from "../api/admin";
import { formatDate, formatPrice, formatRelativeTime } from "../utils/format";
import Loading from "../components/Loading";
import ImageUploader from "../components/ImageUploader";
import { invalidateCacheByPrefix } from "../api/client";

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("parts");
  const [parts, setParts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [showPartModal, setShowPartModal] = useState(false);
  const [partImageUrl, setPartImageUrl] = useState("");

  // Redirect if not admin
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (activeTab === "parts") {
      loadParts();
    } else if (activeTab === "posts") {
      loadPosts();
    } else if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "comments") {
      loadComments();
    }
  }, [activeTab]);

  const loadParts = async () => {
    setLoading(true);
    try {
      const response = await getParts({ page: 0, size: 100 });
      if (response.success) {
        setParts(response.data.content);
      }
    } catch (error) {
      console.error("Error loading parts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await getPosts({ page: 0, size: 100 });
      if (response.success) {
        setPosts(response.data.content);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await getAllComments();
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPart = (part) => {
    setEditingPart(part);
    setPartImageUrl(part.imageUrl || "");
    setShowPartModal(true);
  };

  const handleAddPart = () => {
    setEditingPart(null);
    setPartImageUrl("");
    setShowPartModal(true);
  };

  const handleSavePart = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const partData = {
      name: formData.get("name"),
      category: formData.get("category"),
      brand: formData.get("brand"),
      price: parseFloat(formData.get("price")),
      wattage: parseInt(formData.get("wattage")) || 0,
      imageUrl: partImageUrl || formData.get("imageUrl"), // Use uploaded image or manual URL
      specJson: formData.get("specJson") || "{}",
      crawlUrl: formData.get("crawlUrl"), // URL để crawl giá
    };

    try {
        if (editingPart) {
          const res = await updatePart(editingPart.id, partData);
          if (res.success) {
            alert("Cập nhật linh kiện thành công!");
            // update local parts list
            setParts((prev) => prev.map(p => p.id === editingPart.id ? res.data : p));
            // Invalidate cached GET /api/parts
            invalidateCacheByPrefix('/api/parts');
          } else {
            alert(res.message || "Lỗi khi cập nhật linh kiện");
          }
        } else {
          const res = await createPart(partData);
          if (res.success) {
            alert("Thêm linh kiện thành công!");
            // prepend new part to list for immediate feedback
            setParts((prev) => [res.data, ...prev]);
            // Invalidate cached GET /api/parts
            invalidateCacheByPrefix('/api/parts');
          } else {
            alert(res.message || "Lỗi khi tạo linh kiện");
          }
        }
        setShowPartModal(false);
        setEditingPart(null);
        setPartImageUrl("");
    } catch (error) {
      console.error("Error saving part:", error);
      alert("Lỗi khi lưu linh kiện");
    }
  };

  const handleUpdatePrice = async (partId) => {
    try {
      const response = await crawlPartPrice(partId);
        if (response.success) {
        alert("Đã gửi yêu cầu cập nhật giá!");
        invalidateCacheByPrefix('/api/parts');
        await loadParts();
      }
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Lỗi khi cập nhật giá");
    }
  };

  const handleDeletePart = async (partId) => {
    if (!confirm("Bạn có chắc muốn xóa linh kiện này?")) return;
    try {
      await deletePart(partId);
      alert("Đã xóa linh kiện!");
      invalidateCacheByPrefix('/api/parts');
      await loadParts();
    } catch (error) {
      console.error("Error deleting part:", error);
      alert("Lỗi khi xóa linh kiện");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await deletePost(postId);
      alert("Đã xóa bài viết!");
      invalidateCacheByPrefix('/api/posts');
      await loadPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Lỗi khi xóa bài viết");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await deleteUser(userId);
      alert("Đã xóa người dùng!");
      invalidateCacheByPrefix('/api/users');
      await loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Lỗi khi xóa người dùng");
    }
  };

  const handleChangeUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Đổi quyền thành ${newRole}?`)) return;
    try {
      await updateUserRole(userId, newRole);
      alert("Đã cập nhật quyền!");
      loadUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Lỗi khi cập nhật quyền");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await deleteComment(commentId);
      alert("Đã xóa bình luận!");
      invalidateCacheByPrefix('/api/comments');
      await loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Lỗi khi xóa bình luận");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Quản lý hệ thống</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("parts")}
            className={`px-6 py-3 font-medium ${
              activeTab === "parts"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Linh kiện
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-3 font-medium ${
              activeTab === "posts"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Bài viết
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium ${
              activeTab === "users"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Người dùng
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-6 py-3 font-medium ${
              activeTab === "comments"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Bình luận
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <Loading />
          ) : (
            <>
              {activeTab === "parts" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Quản lý linh kiện</h2>
                    <button
                      onClick={handleAddPart}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Thêm linh kiện
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border p-2 text-left">ID</th>
                          <th className="border p-2 text-left">Tên</th>
                          <th className="border p-2 text-left">Danh mục</th>
                          <th className="border p-2 text-left">Giá</th>
                          <th className="border p-2 text-left">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parts.map((part) => (
                          <tr key={part.id} className="hover:bg-gray-50">
                            <td className="border p-2">{part.id}</td>
                            <td className="border p-2">{part.name}</td>
                            <td className="border p-2">{part.category}</td>
                            <td className="border p-2">{formatPrice(part.price)}</td>
                            <td className="border p-2">
                              <button
                                onClick={() => handleEditPart(part)}
                                className="text-blue-600 hover:underline mr-2"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleUpdatePrice(part.id)}
                                className="text-green-600 hover:underline mr-2"
                              >
                                Cập nhật giá
                              </button>
                              <button
                                onClick={() => handleDeletePart(part.id)}
                                className="text-red-600 hover:underline"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "posts" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Quản lý bài viết</h2>
                  <div className="space-y-2">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{post.title}</h3>
                          <p className="text-sm text-gray-600">
                            {post.userName} - {formatDate(post.createdAt)}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Quản lý người dùng</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border p-2 text-left">ID</th>
                          <th className="border p-2 text-left">Email</th>
                          <th className="border p-2 text-left">Tên</th>
                          <th className="border p-2 text-left">Quyền</th>
                          <th className="border p-2 text-left">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="border p-2">{u.id}</td>
                            <td className="border p-2">{u.email}</td>
                            <td className="border p-2">{u.fullName}</td>
                            <td className="border p-2">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  u.role === "ADMIN"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="border p-2">
                              <button
                                onClick={() => handleChangeUserRole(u.id, u.role)}
                                className="text-blue-600 hover:underline mr-2"
                                disabled={u.id === user.id}
                              >
                                Đổi quyền
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-red-600 hover:underline"
                                disabled={u.id === user.id}
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "comments" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Quản lý bình luận</h2>
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700">
                            {comment.userName || "User"}
                          </p>
                          <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Bài viết: {comment.postTitle} - {formatDate(comment.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:underline ml-4"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Part Modal */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingPart ? "Sửa linh kiện" : "Thêm linh kiện"}
            </h2>
            <form onSubmit={handleSavePart} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên linh kiện</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingPart?.name}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Danh mục</label>
                <select
                  name="category"
                  defaultValue={editingPart?.category}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="CPU">CPU</option>
                  <option value="GPU">GPU</option>
                  <option value="RAM">RAM</option>
                  <option value="MAIN">Mainboard</option>
                  <option value="PSU">Nguồn</option>
                  <option value="CASE">Case</option>
                  <option value="COOLER">Tản nhiệt</option>
                  <option value="STORAGE">Ổ cứng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thương hiệu</label>
                <input
                  name="brand"
                  type="text"
                  defaultValue={editingPart?.brand}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giá (VNĐ)</label>
                <input
                  name="price"
                  type="number"
                  defaultValue={editingPart?.price}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Công suất (W)</label>
                <input
                  name="wattage"
                  type="number"
                  defaultValue={editingPart?.wattage}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hình ảnh</label>
                
                {/* Image Uploader */}
                <ImageUploader
                  onUpload={(urls) => {
                    const url = Array.isArray(urls) ? urls[0] : urls;
                    setPartImageUrl(url);
                  }}
                  maxImages={1}
                />
                
                {/* Preview uploaded image */}
                {partImageUrl && (
                  <div className="mt-2">
                    <img
                      src={partImageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                  </div>
                )}
                
                {/* Manual URL input (optional) */}
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">Hoặc nhập URL thủ công</label>
                  <input
                    name="imageUrl"
                    type="text"
                    value={partImageUrl}
                    onChange={(e) => setPartImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  URL để crawl giá (tự động)
                </label>
                <input
                  name="crawlUrl"
                  type="text"
                  placeholder="https://example.com/product/123"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hệ thống sẽ tự động crawl giá từ URL này theo lịch
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Thông số kỹ thuật (JSON)
                </label>
                <textarea
                  name="specJson"
                  defaultValue={editingPart?.specJson}
                  rows={4}
                  placeholder='{"socket": "AM5", "ramType": "DDR5"}'
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPartModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingPart ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

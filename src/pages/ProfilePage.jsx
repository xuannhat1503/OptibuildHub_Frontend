import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPosts, getUserPosts } from "../api/post";
import { getUserBuilds, deleteBuild } from "../api/build";
import { formatDate, formatPrice, formatRelativeTime } from "../utils/format";
import Loading from "../components/Loading";
import { invalidateCacheByPrefix } from "../api/client";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);

  const isOwnProfile = user && user.id === parseInt(userId);

  useEffect(() => {
    // Clear old data when userId changes
    setPosts([]);
    setBuilds([]);
    setProfileUser(null);
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user's posts using the user-specific endpoint
      const [postsResponse, buildsResponse] = await Promise.all([
        getUserPosts(userId, { page: 0, size: 20 }),
        getUserBuilds(userId)
      ]);

      if (postsResponse.success) {
        setPosts(postsResponse.data.content);
        // Get user info from first post if available
        if (postsResponse.data.content.length > 0) {
          setProfileUser({
            id: userId,
            fullName: postsResponse.data.content[0].userName || "User",
            email: postsResponse.data.content[0].userEmail || ""
          });
        } else if (isOwnProfile) {
          // If no posts and viewing own profile, use current user
          setProfileUser({
            id: user.id,
            fullName: user.fullName,
            email: user.email
          });
        }
      }

      if (buildsResponse.success) {
        setBuilds(buildsResponse.data || []);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      if (isOwnProfile) {
        // Fallback to current user for own profile
        setProfileUser({
          id: user.id,
          fullName: user.fullName,
          email: user.email
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    // TODO: Implement update profile API
    alert("Chức năng đang được phát triển");
  };

  const handleDeleteBuild = async (buildId) => {
    if (!confirm("Bạn có chắc muốn xóa cấu hình này?")) {
      return;
    }

    try {
      const response = await deleteBuild(buildId);
        if (response.success) {
        alert("Đã xóa cấu hình thành công!");
        // Invalidate relevant caches and refresh builds/posts
        invalidateCacheByPrefix('/api/builds');
        invalidateCacheByPrefix('/api/posts');
        await loadUserData();
      } else {
        alert(response.message || "Không thể xóa cấu hình");
      }
    } catch (error) {
      console.error("Error deleting build:", error);
      alert("Lỗi khi xóa cấu hình");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {(profileUser?.fullName || user?.fullName || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profileUser?.fullName || user?.fullName || "User"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user?.role === "ADMIN" ? "👑 Quản trị viên" : "👤 Người dùng"}
            </p>
            <p className="text-gray-600 mt-1">{profileUser?.email || user?.email}</p>
            {isOwnProfile && (
              <p className="text-sm text-blue-600 mt-1">Đây là trang cá nhân của bạn</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-3 font-medium ${
              activeTab === "posts"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Bài viết ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("builds")}
            className={`px-6 py-3 font-medium ${
              activeTab === "builds"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Cấu hình PC ({builds.length})
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-3 font-medium ${
                activeTab === "settings"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Cài đặt
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có bài viết nào</p>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/forum/${post.id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                  >
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>👍 {post.likeCount}</span>
                      <span>💬 {post.commentCount}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === "builds" && (
            <div className="space-y-4">
              {builds.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Chưa có cấu hình PC nào được lưu
                </p>
              ) : (
                builds.map((build) => (
                  <div
                    key={build.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {build.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="font-medium text-blue-600">
                            {formatPrice(build.totalPrice)}
                          </span>
                          <span>⚡ {build.wattageTotal}W</span>
                          <span>🔧 {build.partIds.length} linh kiện</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to="/builder"
                          state={{ build }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Xem chi tiết
                        </Link>
                        {isOwnProfile && (
                          <>
                            <Link
                              to="/forum/create"
                              state={{ buildId: build.id, buildTitle: build.title }}
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                              Chia sẻ
                            </Link>
                            <button
                              onClick={() => handleDeleteBuild(build.id)}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                            >
                              Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "settings" && isOwnProfile && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Cài đặt tài khoản</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.fullName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    placeholder="Để trống nếu không đổi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPosts } from "../api/post";
import { formatDate } from "../utils/format";
import { getImageUrl } from "../utils/api";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";

export default function ForumListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "0"));

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await getPosts({ page, size: 20 });
      if (response.success) {
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSearchParams({ page: newPage });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Diễn đàn</h1>
        <Link
          to="/forum/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
        >
          Tạo bài viết
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Chưa có bài viết nào
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex gap-4">
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={getImageUrl(post.imageUrls[0])}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    
                    {post.content && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        👤 {post.userName || "User"}
                      </span>
                      <span className="flex items-center gap-1">
                        🕒 {formatRelativeTime(post.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        👍 {post.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        👎 {post.dislikeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {post.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

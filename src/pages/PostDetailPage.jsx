import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPostDetail, addComment, addReaction, updatePost, deletePost, deleteComment } from "../api/post";
import { formatRelativeTime } from "../utils/format";
import { getImageUrl } from "../utils/api";
import { invalidateCacheByPrefix } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const response = await getPostDetail(id);
      if (response.success) {
        setPost(response.data);
      }
    } catch (error) {
      console.error("Error loading post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (type) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thực hiện");
      return;
    }
    
    try {
      const response = await addReaction(id, {
        userId: user.id,
        type: type.toUpperCase(),
      });
      
      if (response.success) {
        alert(type === 'like' ? '👍 Đã like!' : '👎 Đã dislike!');
        // Invalidate cached post(s) and reload
        invalidateCacheByPrefix('/api/posts');
        await loadPost();
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
      alert("Lỗi khi thực hiện");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Vui lòng đăng nhập để bình luận");
      return;
    }
    
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await addComment(id, {
        userId: user.id,
        content: commentText,
        parentId: replyTo,
      });

      if (response.success) {
        alert("✅ Đã thêm bình luận!");
        setCommentText("");
        setReplyTo(null);
        // Invalidate cached post(s) and reload
        invalidateCacheByPrefix('/api/posts');
        await loadPost();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Lỗi khi thêm bình luận");
      setSubmitting(false);
    }
  };

  const handleEditPost = () => {
    setEditTitle(post.title);
    setEditContent(post.content || "");
    setEditingPost(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await updatePost(id, {
        userId: user.id,
        title: editTitle,
        content: editContent,
        imageUrls: post.imageUrls || [],
      });
      if (res.success) {
        // Invalidate posts cache and reload post
        invalidateCacheByPrefix('/api/posts');
        setEditingPost(false);
        await loadPost();
      } else {
        alert(res.message || 'Lỗi khi cập nhật bài viết');
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Lỗi khi cập nhật bài viết");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await deletePost(id);
      // Invalidate posts list so forum shows updated data
      invalidateCacheByPrefix('/api/posts');
      alert("Đã xóa bài viết");
      navigate("/forum");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Lỗi khi xóa bài viết");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    try {
      await deleteComment(id, commentId);
      alert("Đã xóa bình luận!");
      invalidateCacheByPrefix('/api/posts');
      await loadPost();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Lỗi khi xóa bình luận");
    }
  };

  if (loading) return <Loading />;
  if (!post) return <div className="text-center py-12">Không tìm thấy bài viết</div>;

  // Build comment tree
  const commentTree = buildCommentTree(post.comments || []);

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/forum" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Quay lại diễn đàn
      </Link>

      {/* Post Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {!editingPost ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold flex-1">{post.title}</h1>
              {user && user.id === post.userId && (
                <div className="flex gap-2">
                  <button
                    onClick={handleEditPost}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <span>👤 {post.userName || "User"}</span>
              <span>🕒 {formatRelativeTime(post.createdAt)}</span>
            </div>

            {post.content && (
              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
            )}

            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {post.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(url)}
                    alt={`Image ${idx + 1}`}
                    loading="lazy"
                    className="w-full rounded-lg"
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleUpdatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nội dung</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => setEditingPost(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleReaction("like")}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <span>👍</span>
            <span>{post.likeCount}</span>
          </button>
          <button
            onClick={() => handleReaction("dislike")}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <span>👎</span>
            <span>{post.dislikeCount}</span>
          </button>
          <span className="flex items-center gap-2 text-gray-600">
            <span>💬</span>
            <span>{post.commentCount} bình luận</span>
          </span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Bình luận</h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="mb-8">
          {replyTo && (
            <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
              <span>Đang trả lời bình luận #{replyTo}</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-blue-600 hover:underline"
              >
                Hủy
              </button>
            </div>
          )}
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Viết bình luận..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </form>

        {/* Comments Tree */}
        {commentTree.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có bình luận nào</p>
        ) : (
          <div className="space-y-4">
            {commentTree.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={setReplyTo}
                onDelete={handleDeleteComment}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, onReply, onDelete, currentUserId, depth = 0 }) {
  const isOwner = currentUserId && currentUserId === comment.userId;

  return (
    <div className={`${depth > 0 ? "ml-8 pl-4 border-l-2 border-gray-200" : ""}`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-semibold">{comment.userName || "User"}</span>
            <span>•</span>
            <span>{formatRelativeTime(comment.createdAt)}</span>
          </div>
          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              🗑️ Xóa
            </button>
          )}
        </div>
        <p className="text-gray-800 mb-2">{comment.content}</p>
        <button
          onClick={() => onReply(comment.id)}
          className="text-sm text-blue-600 hover:underline"
        >
          Trả lời
        </button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildCommentTree(comments) {
  const map = {};
  const roots = [];

  // Create map
  comments.forEach((comment) => {
    map[comment.id] = { ...comment, replies: [] };
  });

  // Build tree
  comments.forEach((comment) => {
    if (comment.parentId && map[comment.parentId]) {
      map[comment.parentId].replies.push(map[comment.id]);
    } else {
      roots.push(map[comment.id]);
    }
  });

  return roots;
}

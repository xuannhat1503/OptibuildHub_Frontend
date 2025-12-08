import { api } from "./client";

// Admin User Management
export const getAllUsers = () =>
  api.get("/api/admin/users").then((r) => r.data);

export const deleteUser = (userId) =>
  api.delete(`/api/admin/users/${userId}`).then((r) => r.data);

export const updateUserRole = (userId, role) =>
  api.put(`/api/admin/users/${userId}/role`, { role }).then((r) => r.data);

// Admin Comment Management
export const getAllComments = () =>
  api.get("/api/admin/comments").then((r) => r.data);

export const deleteComment = (commentId) =>
  api.delete(`/api/admin/comments/${commentId}`).then((r) => r.data);

// Admin Post Management
export const deletePost = (postId) =>
  api.delete(`/api/posts/${postId}`).then((r) => r.data);

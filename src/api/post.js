import { api } from "./client";

// Posts
export const getPosts = (params) => 
  api.get("/api/posts", { params }).then((r) => r.data);

export const getPostDetail = (id) => 
  api.get(`/api/posts/${id}`).then((r) => r.data);

export const createPost = (data) => 
  api.post("/api/posts", data).then((r) => r.data);

export const updatePost = (id, data) =>
  api.put(`/api/posts/${id}`, data).then((r) => r.data);

export const deletePost = (id) =>
  api.delete(`/api/posts/${id}`).then((r) => r.data);

// Comments
export const addComment = (postId, data) => 
  api.post(`/api/posts/${postId}/comments`, data).then((r) => r.data);

export const deleteComment = (postId, commentId) =>
  api.delete(`/api/posts/${postId}/comments/${commentId}`).then((r) => r.data);

// Reactions
export const addReaction = (postId, data) => 
  api.post(`/api/posts/${postId}/reactions`, data).then((r) => r.data);
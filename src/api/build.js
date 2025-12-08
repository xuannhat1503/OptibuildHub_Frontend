import { api } from "./client";

// PC Build APIs
export const checkCompatibility = (partIds) =>
  api.post("/api/builds/check", { partIds }).then((r) => r.data);

export const saveBuild = (data) =>
  api.post("/api/builds", data).then((r) => r.data);

export const getUserBuilds = (userId) =>
  api.get(`/api/builds/user/${userId}`).then((r) => r.data);

export const getBuildDetail = (id) =>
  api.get(`/api/builds/${id}`).then((r) => r.data);

export const deleteBuild = (id) =>
  api.delete(`/api/builds/${id}`).then((r) => r.data);

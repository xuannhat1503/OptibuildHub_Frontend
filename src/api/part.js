import { api } from "./client";

// Parts
export const getParts = (params) => 
  api.get("/api/parts", { params }).then((r) => r.data);

export const getPartDetail = (id) => 
  api.get(`/api/parts/${id}`).then((r) => r.data);

export const getPartPrices = (id) => 
  api.get(`/api/parts/${id}/prices`).then((r) => r.data);

export const createPart = (data) => 
  api.post("/api/parts", data).then((r) => r.data);

export const updatePart = (id, data) => 
  api.put(`/api/parts/${id}`, data).then((r) => r.data);

export const deletePart = (id) =>
  api.delete(`/api/parts/${id}`).then((r) => r.data);

export const crawlPartPrice = (id) =>
  api.post(`/api/parts/${id}/crawl-price`).then((r) => r.data);


// Ratings
export const getPartRatings = (id) => 
  api.get(`/api/parts/${id}/ratings`).then((r) => r.data);

export const postRating = (id, payload) =>
  api.post(`/api/parts/${id}/ratings`, payload).then((r) => r.data);
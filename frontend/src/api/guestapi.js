import { apiClient } from "./api";

export function getGuests() {
  return apiClient.get("/guestprofile/").then((res) => res.data);
}

export function getGuestById(id) {
  return apiClient.get(`/guestprofile/${id}/`).then((res) => res.data);
}

export function getEpisodes() {
  return apiClient.get("/episode/").then((res) => res.data);
}

export function getEpisodeById(id) {
  return apiClient.get(`/episode/${id}/`).then((res) => res.data);
}

export default getGuests;

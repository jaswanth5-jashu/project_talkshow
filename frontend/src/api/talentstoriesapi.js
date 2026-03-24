import { apiClient } from "./api";

function getTalentStories() {
  return apiClient.get("/talent/").then((res) => res.data);
}

export function getNewTalents() {
  return apiClient.get("/talent/new/").then((res) => res.data);
}

export function getTalentById(id) {
  return apiClient.get(`/talent/${id}/`).then((res) => res.data);
}

export function submitTalent(formData) {
  return apiClient.post("/talent-submission/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((res) => res.data);
}

export function toggleLike(id, isEpisode = false) {
  return apiClient.post(`/talent/${id}/like/`, { is_episode: isEpisode }).then(res => res.data);
}

export function getComments(id, isEpisode = false) {
  return apiClient.get(`/talent/${id}/comments/?is_episode=${isEpisode}`).then(res => res.data);
}

export function postComment(id, text, isEpisode = false) {
  return apiClient.post(`/talent/${id}/comments/`, { text, is_episode: isEpisode }).then(res => res.data);
}

export function toggleSubscribe(userId) {
  return apiClient.post(`/subscribe/${userId}/`).then(res => res.data);
}

export function getUserVideos() {
  return apiClient.get('/my-videos/').then(res => res.data);
}

export function getMySubmissions() {
  return apiClient.get('/my-submissions/').then(res => res.data);
}

export function dismissSubmission(id) {
  return apiClient.post(`/dismiss-submission/${id}/`).then(res => res.data);
}

export function deleteTalent(id) {
  return apiClient.delete(`/talent/${id}/`).then(res => res.data);
}

export function deleteSubmission(id) {
  return apiClient.delete(`/delete-submission/${id}/`).then(res => res.data);
}

export function deleteComment(id) {
  return apiClient.delete(`/delete-comment/${id}/`).then(res => res.data);
}

export function getNotifications() {
  return apiClient.get('/notifications/').then(res => res.data);
}

export function markNotificationRead(id) {
  return apiClient.post(`/notifications/${id}/read/`).then(res => res.data);
}

export const searchUsers = (query) => {
    return apiClient.get(`/search-users/?q=${query}`).then(res => res.data);
};

export const searchEpisodes = (query) => {
    return apiClient.get(`/search-episodes/?q=${query}`).then(res => res.data);
};

export const searchGuests = (query) => {
    return apiClient.get(`/search-guests/?q=${query}`).then(res => res.data);
};

export const searchTalents = (query) => {
    return apiClient.get(`/search-talents/?q=${query}`).then(res => res.data);
};

export default getTalentStories;
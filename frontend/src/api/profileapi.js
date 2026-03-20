import { apiClient } from "./api";

export function updateProfileAPI(formData) {
  return apiClient.post("/update-profile/", formData)
    .then(function (res) {
      return res.data;
    });
}

export function getProfileAPI() {
  return apiClient.post("/get-profile/")
    .then(function (res) {
      return res.data;
    });
}

export function getFollowers(userId) {
  return apiClient.get(`/user/${userId}/followers/`)
    .then(res => res.data);
}

export function getFollowing(userId) {
  return apiClient.get(`/user/${userId}/following/`)
    .then(res => res.data);
}

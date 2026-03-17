import { apiClient } from "./api";

/**
 * Updates the user's profile information (profile picture, email, password)
 * @param {FormData} formData 
 */
export function updateProfileAPI(formData) {
  return apiClient.post("/update-profile/", formData)
    .then(function (res) {
      return res.data;
    });
}

export function getProfileAPI(email) {
  return apiClient.post("/get-profile/", { email })
    .then(function (res) {
      return res.data;
    });
}

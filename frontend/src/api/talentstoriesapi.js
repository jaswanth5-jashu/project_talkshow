import { apiClient } from "./api";

function getTalentStories() {
  return apiClient.get("/talent/").then((res) => res.data);
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

export default getTalentStories;
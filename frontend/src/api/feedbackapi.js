import { apiClient } from "./api";

function getFeedbacks() {
  return apiClient.get("/feedback/").then(res => res.data);
}

function submitFeedback(data) {
  return apiClient.post("/feedback/", data).then(res => res.data);
}

export { getFeedbacks, submitFeedback };

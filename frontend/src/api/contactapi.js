import { apiClient } from "./api";

function submitContact(data) {
  return apiClient.post("/contact/", data)
    .then(res => res.data);
}

export { submitContact };

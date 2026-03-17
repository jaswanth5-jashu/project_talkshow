import { apiClient } from "./api";

function getHomeStats() {
  return apiClient.get("/home/").then((res) => res.data);
}

export default getHomeStats;
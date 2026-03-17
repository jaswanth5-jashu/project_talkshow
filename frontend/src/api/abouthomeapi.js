import { apiClient } from "./api";

function getHomeaboutStats() {
  return apiClient.get("/home/").then((res) => res.data);
}

export default getHomeaboutStats;
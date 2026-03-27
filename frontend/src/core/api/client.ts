// frontend/src/core/api/client.ts
import axios from "axios";

import { API_BASE_URL } from "@/core/constants/app";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

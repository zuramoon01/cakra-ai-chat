import { PUBLIC_BACKEND_URL } from "$env/static/public";
import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: PUBLIC_BACKEND_URL,
  // withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  config.headers.Authorization = `Bearer ${token}`;

  return config;
});

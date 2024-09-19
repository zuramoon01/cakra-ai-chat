import { PUBLIC_BACKEND_URL } from "$env/static/public";
import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: PUBLIC_BACKEND_URL,
  // withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = Cookies.get("access_token");

  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

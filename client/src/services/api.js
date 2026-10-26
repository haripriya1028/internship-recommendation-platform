import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000, // fail with a clear error instead of spinning forever
});

// Attach the JWT (if we have one) to every outgoing request.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
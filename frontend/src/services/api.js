
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:5001/api"
    : "https://bizconnect-backend-pn6h.onrender.com/api",

  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT to every API request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

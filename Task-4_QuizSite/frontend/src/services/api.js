import axios from "axios";

const API = axios.create({
  baseURL: "https://quizsite-backend-8bnj.onrender.com/api",
});

// Attach JWT automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
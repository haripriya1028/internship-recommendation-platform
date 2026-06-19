import axios from "axios";

const API = axios.create({
  baseURL: "https://internship-recommendation-backend.onrender.com/api",
});

export default API;
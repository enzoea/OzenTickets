import axios from "axios";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://127.0.0.1:9000/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// helper pra setar/remover token
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

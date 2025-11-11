import axios from "axios";

const API_URL = "http://localhost:8000/auth/";

export const SignupApi = (userData) => {
  return axios.post(`${API_URL}register`, userData);
}
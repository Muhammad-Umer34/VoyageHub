import axios from "axios";

const API_URL = "http://localhost:8000/auth/";
axios.defaults.withCredentials = true;

export const SignupApi = (userData) => {
  return axios.post(`${API_URL}register`, userData);
}

export const VerifyEmail = (userData)=>{
  return axios.post(`${API_URL}verify-email`, userData);
}


export const LoginApi = (userData)=>{
  const data = new URLSearchParams();
  data.append("username", userData.email);
  data.append("password", userData.password);
  return axios.post(`${API_URL}token`, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export const SendForgetPasswordEmail = (email)=>{
  return axios.post(`${API_URL}forget-password`, {email});
}

export const VerifyForgetPassword = (token)=>{
  console.log("API call to verify token:", token);
  return axios.post(`${API_URL}verify-forget-password`, token);
}

export const ResetPassword = (userData)=>{
  return axios.post(`${API_URL}reset-password`,userData);
}

export const ResendVerificationCode = (email)=>{
  return axios.post(`${API_URL}resend-code`, {email});
}


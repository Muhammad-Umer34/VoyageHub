import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import DashBoard from "./pages/Daskboard";
import VerifyEmailForm from "./pages/VerifyEmail";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPasswordPage/>} />
        <Route path="/dashboard" element={<DashBoard/>}/>
        <Route path="/verify-email" element={<VerifyEmailForm/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

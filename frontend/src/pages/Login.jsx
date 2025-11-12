import { useState } from "react";
import Divider from "@mui/material/Divider";
import bgImage from "../assets/ian-dooley-hpTH5b6mo2s-unsplash.jpg";
import googleIcon from "../assets/search.png";
import facebookIcon from "../assets/facebook.png";
import { useNavigate } from "react-router-dom";
import { LoginApi } from "../api/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = {
      email,
      password,
    };
    console.log("Login data:", loginData);
    const response = await LoginApi(loginData);
    if (response.status === 200) {
      console.log("Login successful");
    }
    console.log(response);
  };
  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    navigate("/forget-password");
  };
  const handleCreateAccount = () => {
    console.log("Create account clicked");
    navigate("/signup");
  };
  return (
    <div
      className="flex items-center justify-center bg-cover bg-center bg-no-repeat relative py-32"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      {/* Login Form */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h1 className="text-3xl font-bold text-center text-[#13C892] mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-6">Sign in to continue</p>

        {/* Social Buttons */}
        <div className="flex flex-col gap-3 mb-4">
          <button className="relative flex items-center justify-center bg-white border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-50 transition cursor-pointer">
            <img
              src={googleIcon}
              alt="Google"
              className="w-5 h-5 absolute left-4"
            />
            <span className="font-medium text-gray-700 text-sm">
              Sign in with Google
            </span>
          </button>
          <button className="relative flex items-center justify-center bg-white border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-50 transition cursor-pointer">
            <img
              src={facebookIcon}
              alt="Facebook"
              className="w-5 h-5 absolute left-4"
            />
            <span className="font-medium text-gray-700 text-sm">
              Sign in with Facebook
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-4 text-gray-400">
          <Divider className="flex-1" />
          <span className="text-xs text-gray-500">OR</span>
          <Divider className="flex-1" />
        </div>

        <form className="space-y-3" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or Username
            </label>
            <input
              type="text"
              placeholder="Enter your email or username"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#13C892] focus:border-transparent focus:outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#13C892] focus:border-transparent focus:outline-none transition"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-3 h-3 text-[#13C892] border-gray-300 rounded focus:ring-[#13C892]"
              />
              <span className="ml-2 text-xs text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-[#13C892] hover:underline font-medium cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-[#13C892] text-white font-semibold py-2.5 rounded-full hover:bg-[#10b981] transition text-sm shadow-lg hover:shadow-xl cursor-pointer"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={handleCreateAccount}
              className="text-[#13C892] hover:underline font-medium cursor-pointer"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Divider from "@mui/material/Divider";
import { SignupApi } from "../api/auth";

const SignupForm = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const formData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    };
    const data_to_send = {
      email: email,
      password: password,
      full_name: firstName + " " + lastName,
    };
    console.log("Form Data:", formData);
    console.log("Data sent to backend:", data_to_send);
    
    try {
      const response = await SignupApi(data_to_send);
      if(response.status === 200){
        // Navigate to verify email page and pass email as state
        navigate("/verify-email", { state: { email: email } });
      }
    } catch (err) {
      // Axios throws errors for non-2xx status codes
      if (err.response) {
        // The request was made and the server responded with a status code
        if (err.response.status === 400) {
          setError("This email is already registered. Please use a different email or login.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("An error occurred. Please try again.");
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-10">
      <div className="bg-white/95 rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold text-center text-[#13C892] mb-6">
          Create New Account
        </h1>

        <div className="flex flex-col gap-6 mb-8">
          <button className="relative flex items-center justify-center bg-white border border-gray-300 rounded-full py-4 px-6 hover:bg-gray-50 transition">
            <svg className="w-6 h-6 absolute left-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700 text-lg">
              Sign up with Google
            </span>
          </button>
          <button className="relative flex items-center justify-center bg-white border border-gray-300 rounded-full py-4 px-6 hover:bg-gray-50 transition">
            <svg className="w-6 h-6 absolute left-6" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="font-medium text-gray-700 text-lg">
              Sign up with Facebook
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-1/2 border border-gray-300 rounded-md px-3 py-3 text-lg focus:ring-2 focus:ring-[#13C892] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-1/2 border border-gray-300 rounded-md px-3 py-3 text-lg focus:ring-2 focus:ring-[#13C892] focus:outline-none"
            />
          </div>

          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-3 text-lg focus:ring-2 focus:ring-[#13C892] focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-3 text-lg focus:ring-2 focus:ring-[#13C892] focus:outline-none"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-3 text-lg focus:ring-2 focus:ring-[#13C892] focus:outline-none"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-[#13C892] text-white font-semibold py-3 rounded-full hover:bg-[#10b981] transition text-lg cursor-pointer"
          >
            Create Account
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#13C892] hover:underline font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
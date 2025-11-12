import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SendForgetPasswordEmail } from "../api/auth";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    console.log("Sending reset email to:", email);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setIsEmailSent(true);
      console.log("Password reset email sent successfully");
      const response = SendForgetPasswordEmail(email);
      console.log(response);
    }, 1500);
  };

  const handleBackToLogin = () => {
    console.log("Back to login clicked");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-32">

      {/* Forget Password Form */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {!isEmailSent ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#13C892]/10 rounded-full mb-3">
                <svg
                  className="w-6 h-6 text-[#13C892]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#13C892] mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-600 text-xs">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#13C892] focus:border-transparent focus:outline-none transition"
                  required
                />
              </div>

              <button
                onClick={handleSendEmail}
                disabled={isLoading}
                className={`w-full bg-[#13C892] text-white font-semibold py-2.5 rounded-full transition text-sm shadow-lg cursor-pointer ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#10b981] hover:shadow-xl"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full text-[#13C892] font-medium py-2.5 rounded-full hover:bg-[#13C892]/5 transition text-xs cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#13C892] mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600 text-xs mb-1">
                We've sent a password reset link to
              </p>
              <p className="font-semibold text-[#13C892] text-sm mb-3">{email}</p>
              <p className="text-gray-500 text-xs">
                Please check your inbox and click on the link to reset your password. 
                If you don't see it, check your spam folder.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleBackToLogin}
                className="w-full bg-[#13C892] text-white font-semibold py-2.5 rounded-full hover:bg-[#10b981] transition text-sm shadow-lg hover:shadow-xl cursor-pointer"
              >
                Back to Login
              </button>

              <div className="text-center pt-2">
                <p className="text-gray-600 text-xs">
                  Didn't receive the email?{" "}
                  <button
                    onClick={() => {
                      setIsEmailSent(false);
                      setEmail("");
                    }}
                    className="text-[#13C892] hover:underline font-medium cursor-pointer"
                  >
                    Try Again
                  </button>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
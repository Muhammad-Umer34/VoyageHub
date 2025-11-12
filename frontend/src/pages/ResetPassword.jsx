import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VerifyForgetPassword, ResetPassword } from "../api/auth";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const tokenFromUrl = searchParams.get("token");
      
      if (!tokenFromUrl) {
        setIsVerifying(false);
        setErrorMessage("Invalid or missing token. Please request a new password reset link.");
        return;
      }

      setToken(tokenFromUrl);

      try {
        // Verify token with backend
        console.log("Verifying token:", tokenFromUrl);
        const response = await VerifyForgetPassword({ token: tokenFromUrl });
        
        if (response.status === 200) {
          setIsTokenValid(true);
          setIsVerifying(false);
        } else {
          setIsVerifying(false);
          setErrorMessage("Invalid or expired token. Please request a new password reset link.");
        }
      } catch (error) {
        setIsVerifying(false);
        setErrorMessage("An error occurred while verifying the token. Please try again.");
        console.error("Token verification error:", error);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await ResetPassword({
        token: token,
        new_password: password,
      });

      if (response.status === 200) {
        setIsSuccess(true);
        console.log("Password reset successful");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setErrorMessage("Failed to reset password. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while resetting password. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-32">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Verifying Token */}
        {isVerifying && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#13C892]/10 rounded-full mb-3">
              <svg
                className="animate-spin h-6 w-6 text-[#13C892]"
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
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Verifying Token...
            </h1>
            <p className="text-gray-600 text-xs">
              Please wait while we verify your reset link
            </p>
          </div>
        )}

        {/* Invalid Token */}
        {!isVerifying && !isTokenValid && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Invalid Token
            </h1>
            <p className="text-gray-600 text-xs mb-4">{errorMessage}</p>
            <button
              onClick={handleBackToLogin}
              className="w-full bg-[#13C892] text-white font-semibold py-2.5 rounded-full hover:bg-[#10b981] transition text-sm shadow-lg hover:shadow-xl cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="text-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600 text-xs mb-4">
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </p>
            <button
              onClick={handleBackToLogin}
              className="w-full bg-[#13C892] text-white font-semibold py-2.5 rounded-full hover:bg-[#10b981] transition text-sm shadow-lg hover:shadow-xl cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Reset Password Form */}
        {!isVerifying && isTokenValid && !isSuccess && (
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#13C892] mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600 text-xs">
                Enter your new password below
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#13C892] focus:border-transparent focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#13C892] focus:border-transparent focus:outline-none transition"
                  required
                />
              </div>

              <button
                onClick={handleResetPassword}
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
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
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
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
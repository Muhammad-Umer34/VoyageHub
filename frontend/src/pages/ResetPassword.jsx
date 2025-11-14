import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VerifyForgetPassword, ResetPassword } from "../api/auth";
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from "lucide-react";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        setErrorMessage(error.response?.data?.detail || "An error occurred while verifying the token. Please try again.");
        console.error("Token verification error:", error);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
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
        
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setErrorMessage("Failed to reset password. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "An error occurred while resetting password. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Verifying Token */}
        {isVerifying && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13C892]/10 rounded-full mb-4">
              <Loader2 className="w-8 h-8 text-[#13C892] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Verifying Token...
            </h1>
            <p className="text-gray-600 text-sm">
              Please wait while we verify your reset link
            </p>
          </div>
        )}

        {/* Invalid Token */}
        {!isVerifying && !isTokenValid && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Invalid Token
            </h1>
            <p className="text-gray-600 text-sm mb-6">{errorMessage}</p>
            <button
              onClick={handleBackToLogin}
              className="w-full bg-[#13C892] text-white font-semibold py-3 rounded-lg hover:bg-[#10b981] transition shadow-lg hover:shadow-xl"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </p>
            <button
              onClick={handleBackToLogin}
              className="w-full bg-[#13C892] text-white font-semibold py-3 rounded-lg hover:bg-[#10b981] transition shadow-lg hover:shadow-xl"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Reset Password Form */}
        {!isVerifying && isTokenValid && !isSuccess && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13C892]/10 rounded-full mb-4">
                <Lock className="w-8 h-8 text-[#13C892]" />
              </div>
              <h1 className="text-3xl font-bold text-[#13C892] mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600 text-sm">
                Enter your new password below
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13C892] focus:border-transparent outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13C892] focus:border-transparent outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#13C892] text-white font-semibold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#10b981] hover:shadow-xl"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-[#13C892] font-medium py-3 rounded-lg hover:bg-[#13C892]/5 transition text-sm"
              >
                ← Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
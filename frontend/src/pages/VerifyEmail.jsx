import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { VerifyEmail, ResendVerificationCode } from "../api/auth";
import { Mail, AlertCircle, Loader2, CheckCircle } from "lucide-react";

const VerifyEmailForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const formdata = {
      email: email,
      code: code,
    };
    
    console.log("Verifying email with:", formdata);
    
    try {
      const response = await VerifyEmail(formdata);
      if (response.status === 200) {
        console.log("Successfully verified");
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError("Invalid verification code. Please try again.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(err.response.data?.detail || "Verification failed. Please try again.");
        }
      } else {
        setError("Verification failed. Please try again.");
      }
      console.error("Verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email not found. Please go back to signup.");
      return;
    }

    setResendLoading(true);
    setError("");
    setResendMessage("");
    
    try {
      const response = await ResendVerificationCode(email);
      if (response.status === 200) {
        setResendMessage("A new verification code has been sent to your email!");
        setCode(""); // Clear the input
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-6 py-10">
        <div className="bg-white/95 rounded-2xl w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-6 py-10">
      <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13C892]/10 rounded-full mb-4">
            <Mail className="w-8 h-8 text-[#13C892]" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a verification code to{" "}
            <strong className="text-[#13C892]">{email || "your email"}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {resendMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{resendMessage}</p>
          </div>
        )}

        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Verification Code
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-4 text-2xl text-center tracking-widest focus:ring-2 focus:ring-[#13C892] focus:border-transparent outline-none transition"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-[#13C892] text-white font-semibold py-3 rounded-lg hover:bg-[#10b981] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-[#13C892] hover:underline font-medium disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
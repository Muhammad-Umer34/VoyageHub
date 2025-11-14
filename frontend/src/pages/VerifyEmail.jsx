import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { VerifyEmail } from "../api/auth";
import { ResendVerificationCode } from "../api/auth";

const VerifyEmailForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");
    
    const formdata = {
      email: email,
      code: code,
    };
    
    console.log("Verifying email with:", formdata);
    
    try {
      const response = await VerifyEmail(formdata);
      if(response.status === 200){
        console.log("Successfully verified");
        navigate("/login");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400 && err.response.data.detail === "Invalid verification code") {
          setError("Invalid verification code. Please try again.");
        }
        else if (err.response.status === 400 && err.response.data.detail === "Verification code expired") {
          setError("Verification code has expired. Please request a new code.");
        }
         else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("Verification failed. Please try again.");
        }
      } else {
        setError("Verification failed. Please try again.");
      }
      console.error("Verification error:", err);
    }
  };

  const handleResendCode = () => {
    console.log("Resend code clicked");
    ResendVerificationCode(email)
      .then((response) => {
        if (response.status === 200) {
          console.log("Verification code resent successfully");
        }
      })
      .catch((err) => {
        console.error("Error resending verification code:", err);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-10">
      <div className="bg-white/95 rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold text-center text-[#13C892] mb-6">
          Verify Your Email
        </h1>

        <p className="text-center text-gray-600 mb-8">
          We've sent a verification code to <strong>{email}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter verification code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-3 text-lg text-center tracking-widest focus:ring-2 focus:ring-[#13C892] focus:outline-none"
            maxLength={6}
          />

          <button
            onClick={handleVerifyEmail}
            className="w-full bg-[#13C892] text-white font-semibold py-3 rounded-full hover:bg-[#10b981] transition text-lg cursor-pointer"
          >
            Verify Email
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendCode}
              className="text-[#13C892] hover:underline font-medium"
            >
              Resend Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
import { useState } from "react";
import Divider from "@mui/material/Divider";
import googleIcon from "../assets/search.png";
import facebookIcon from "../assets/facebook.png";
import { SignupApi } from "../api/auth";
const SignupForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

 const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    };
    const data_to_send = {
      email : email,
      password : password,
      full_name : firstName + " " + lastName,
    }
    console.log(formData);
    console.log("The data sent to backend is : ",data_to_send);
    const response = await SignupApi(data_to_send);
    console.log(response);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-10">
      <div className="bg-white/95 rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold text-center text-[#13C892] mb-6">
          Create New Account
        </h1>

        <div className="flex flex-col gap-6 mb-8">
          <button className="relative flex items-center justify-center bg-white border border-gray-300 rounded-full py-4 px-6 hover:bg-gray-50 transition">
            <img
              src={googleIcon}
              alt="Google"
              className="w-6 h-6 absolute left-6"
            />
            <span className="font-medium text-gray-700 text-lg">
              Sign up with Google
            </span>
          </button>
          <button className="relative flex items-center justify-center bg-white border border-gray-300 rounded-full py-4 px-6 hover:bg-gray-50 transition">
            <img
              src={facebookIcon}
              alt="Facebook"
              className="w-6 h-6 absolute left-6"
            />
            <span className="font-medium text-gray-700 text-lg">
              Sign up with Facebook
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-6 text-gray-400">
          <Divider className="flex-1" />
          <span className="text-sm text-gray-500">OR</span>
          <Divider className="flex-1" />
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            type="submit"
            className="w-full bg-[#13C892] text-white font-semibold py-3 rounded-full hover:bg-[#10b981] transition text-lg cursor-pointer"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;

import SignupForm from "../components/SignupForm";
import bgImage from "../assets/ian-dooley-hpTH5b6mo2s-unsplash.jpg";

const Signup = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <SignupForm />
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={bgImage}
          alt="Hot air balloons"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-[#13C892]/20 via-teal-500/10 to-blue-600/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <h1 className="text-5xl font-bold mb-4 text-center drop-shadow-lg">
            Join Us Today!
          </h1>
          <p className="text-xl text-center drop-shadow-md max-w-md">
            Create your account and start your amazing journey
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
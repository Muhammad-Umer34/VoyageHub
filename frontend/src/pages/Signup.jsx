import SignupForm from "../components/SignupForm";
import bgImage from "../assets/ian-dooley-hpTH5b6mo2s-unsplash.jpg";

const Signup = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 w-full h-64 md:h-auto relative overflow-hidden">
        <img
          src={bgImage}
          alt="Signup background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-blue-900/20 to-black/40"></div>
      </div>
      <div className="md:w-1/2 w-full flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
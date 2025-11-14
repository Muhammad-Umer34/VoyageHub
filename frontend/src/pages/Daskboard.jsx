import { useNavigate } from "react-router-dom";
import { User, Mail, CheckCircle, LogOut } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! You're successfully logged in.</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 font-medium mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-emerald-900">1,234</p>
                </div>
                <div className="bg-emerald-200 p-3 rounded-full">
                  <User className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Active Sessions</p>
                  <p className="text-3xl font-bold text-blue-900">567</p>
                </div>
                <div className="bg-blue-200 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Messages</p>
                  <p className="text-3xl font-bold text-purple-900">89</p>
                </div>
                <div className="bg-purple-200 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">🎉 Authentication System Active</h2>
            <p className="mb-6 opacity-90">
              Your complete authentication system is now fully functional with:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Secure login with JWT tokens
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                User registration with email verification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Password reset flow
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Professional UI/UX design
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { Provider, useSelector } from "react-redux";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import Sidebar from "./components/SideBar";
import Topbar from "./components/TopBar";
import Dashboard from "./pages/Daskboard";
import Settings from "./pages/Settings";
import store from "../store";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import VerifyEmailForm from "./pages/VerifyEmail";
import Trip from "./pages/Trip";
import Activity from "./pages/Activity";
import Hotel from "./pages/Hotel";
import Resturant from "./pages/Resturant";
import Chat from "./pages/Chat";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#16181d] overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

// Wrapper component to access Redux state for userId
const AppContent = () => {
  const user = useSelector((state) => state.profile);
  const userId = user?.id || user?.user_id;

  return (
    <WebSocketProvider userId={userId}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailForm />} />

        {/* Protected Routes with DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
   
        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />

        <Route
          path="/trips"
          element={
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Trips Page
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Coming soon...
                </p>
              </div>
            </DashboardLayout>
          }
        />

        <Route
          path="/countries"
          element={
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Countries Page
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Coming soon...
                </p>
              </div>
            </DashboardLayout>
          }
        />
         
        {/* Trip-specific Routes (without DashboardLayout) */}
        <Route path="/trips/:id/sightseeing" element={<Activity />} />
        <Route path="/trips/:id/accommodation" element={<Hotel />} />
        <Route path="/trips/:id/meal" element={<Resturant />} />
        <Route path="/trips/:id/chat" element={<Chat />} />
        <Route path="/trips/:id" element={<Trip />} />
        
        <Route
          path="/profile"
          element={
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Profile Page
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Coming soon...
                </p>
              </div>
            </DashboardLayout>
          }
        />

        <Route
          path="/articles"
          element={
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Articles Page
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Coming soon...
                </p>
              </div>
            </DashboardLayout>
          }
        />

        <Route
          path="/restaurants"
          element={
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Restaurants Page
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Coming soon...
                </p>
              </div>
            </DashboardLayout>
          }
        />

        <Route
          path="/places"
          element={
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Places Page
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Coming soon...
                </p>
              </div>
            </DashboardLayout>
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </WebSocketProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ProfileProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ProfileProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
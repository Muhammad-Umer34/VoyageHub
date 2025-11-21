import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  Plane,
  Compass,
  FileText,
  UtensilsCrossed,
  Bed,
  Settings as SettingsIcon,
  Share2,
  Search,
  MapPin,
  Camera,
} from "lucide-react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../features/ProfileSlice";
import { UpdateProfilePhoto } from "../api/auth";
import axios from "axios";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const CLOUDINARY_CLOUD_NAME = "dbslrfquo";
  const CLOUDINARY_UPLOAD_PRESET = "Voyage_Hub";

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          withCredentials: false, // Explicitly disable credentials for Cloudinary
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      // Upload new image to Cloudinary
      const newImageUrl = await uploadToCloudinary(file);
      console.log("New image uploaded:", newImageUrl);

      // Update profile photo in backend
      const response = await UpdateProfilePhoto(newImageUrl);

      if (response.status === 200) {
        // Update Redux store with new profile photo
        dispatch(
          updateProfile({
            ...profile,
            profile_photo: newImageUrl,
          })
        );

        alert("Profile photo updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
      } else {
        alert("Failed to update profile photo. Please try again.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const getInitials = () => {
    if (!profile?.full_name) return "U";
    const names = profile.full_name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const menuItems = [
    { icon: Plane, label: "Trips", path: "/trips", count: 0 },
    {
      icon: Compass,
      label: "Countries",
      path: "/countries",
      count: profile?.countries || 0,
    },
    { icon: FileText, label: "Articles", path: "/articles", count: 0 },
    {
      icon: UtensilsCrossed,
      label: "Restaurants",
      path: "/restaurants",
      count: 0,
    },
    { icon: Bed, label: "Places", path: "/places", count: 0 },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1e2028] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                TravelPlan
              </h1>
              <p className="text-xs text-gray-500">Plan & Explore</p>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                {profile?.profile_photo ? (
                  <img
                    src={profile.profile_photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                @{profile?.username || "username"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {profile?.followers || 0}
              </p>
              <p className="text-xs text-gray-500">followers</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {profile?.following || 0}
              </p>
              <p className="text-xs text-gray-500">following</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {profile?.countries || 0}
              </p>
              <p className="text-xs text-gray-500">countries</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 transition-all text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-teal-500" : ""}`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    {item.count}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <motion.button
            whileHover={{ x: 2 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium text-sm">Share profile</span>
          </motion.button>
          <NavLink
            to="/settings"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`
            }
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

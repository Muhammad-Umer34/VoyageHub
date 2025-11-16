import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  User,
  Bell,
  Lock,
  Eye,
  Camera,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState(null);
  const [notifications, setNotifications] = useState({
    tripPlanning: true,
    destinations: true,
    rewards: true,
    memories: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Eye },
  ];

  const notificationLabels = {
    tripPlanning: 'Trip Management & Planning',
    destinations: 'Destination recommendations',
    rewards: 'Travel Services & Rewards',
    memories: 'Travel Journaling & Memories'
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-[#16181d]">
      <div className="max-w-5xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-white dark:bg-[#1e2028] rounded-xl p-2 border border-gray-200 dark:border-gray-800">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-all text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3"
          >
            <div className="bg-white dark:bg-[#1e2028] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile Settings</h2>
                  
                  {/* Profile Picture Upload */}
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg overflow-hidden">
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span>S</span>
                        )}
                      </div>
                      <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sachal</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@sachal2508</p>
                      <label className="mt-1 inline-block text-sm font-semibold text-teal-500 hover:text-teal-600 cursor-pointer">
                        Upload new photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        defaultValue="sachal2508"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Your name
                      </label>
                      <input
                        type="text"
                        defaultValue="Sachal"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Measurement System
                      </label>
                      <div className="flex gap-3">
                        <button className="flex-1 py-2.5 bg-teal-500 text-white rounded-lg font-semibold">
                          Metric (km)
                        </button>
                        <button className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                          Imperial (miles)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Who can follow you?
                      </label>
                      <div className="flex gap-3">
                        <button className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                          Everyone
                        </button>
                        <button className="flex-1 py-2.5 bg-teal-500 text-white rounded-lg font-semibold">
                          Only people I approve
                        </button>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Save settings
                  </motion.button>
                </motion.div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Email settings</h2>
                  
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{notificationLabels[key]}</h3>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          value ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <motion.div
                          animate={{ x: value ? 28 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                        />
                      </motion.button>
                    </div>
                  ))}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Save settings
                  </motion.button>
                </motion.div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Change Password</h2>
                  
                  <div className="space-y-4">
                    {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                      <div key={label}>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {label}
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Update Password
                  </motion.button>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button className="text-red-500 hover:text-red-600 font-semibold text-sm">
                      🗑️ Delete my account
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !isDark && toggleTheme()}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        !isDark
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Sun className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                      <p className="font-semibold text-gray-900 dark:text-white">Light Mode</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => isDark && toggleTheme()}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        isDark
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Moon className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                      <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                    </motion.button>
                  </div>

                  <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      🎨 <strong>Pro Tip:</strong> Dark mode reduces eye strain and saves battery on OLED screens!
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
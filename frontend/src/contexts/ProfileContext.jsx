import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const ProfileContext = createContext();

axios.defaults.withCredentials = true;
const API_URL = 'http://localhost:8000';

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({
    id: null,
    name: '',
    username: '',
    email: '',
    profileImage: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const [stats, setStats] = useState({
    trips: 0,
    countries: 0,
    articles: 0,
    restaurants: 0,
    places: 0,
  });

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/me`);
      const user = response.data;
      
      setProfileData({
        id: user.id,
        name: user.full_name || user.username,
        username: user.username,
        email: user.email,
        profileImage: user.profile_image,
        isLoading: false,
        isAuthenticated: true,
      });

      // Fetch stats
      await fetchStats();
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileData(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  };

  // Fetch user stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/me/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/me/profile`, updates);
      const user = response.data;
      
      setProfileData(prev => ({
        ...prev,
        name: user.full_name || user.username,
        username: user.username,
        profileImage: user.profile_image,
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update profile' 
      };
    }
  };

  // Upload profile image
  const uploadProfileImage = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size must be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result;
        
        // Update on backend
        const result = await updateProfile({ profile_image: imageData });
        
        if (result.success) {
          resolve(imageData);
        } else {
          reject(new Error(result.error));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove profile image
  const removeProfileImage = async () => {
    await updateProfile({ profile_image: null });
  };

  // Get user initials
  const getInitials = () => {
    return profileData.name ? profileData.name.charAt(0).toUpperCase() : '?';
  };

  // Refresh stats
  const refreshStats = async () => {
    await fetchStats();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ 
      profileData, 
      stats,
      updateProfile, 
      uploadProfileImage,
      removeProfileImage,
      getInitials,
      refreshStats,
      refetchProfile: fetchProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};
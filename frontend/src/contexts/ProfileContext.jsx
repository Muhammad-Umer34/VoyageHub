import { createContext, useContext, useEffect, useState } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('profileData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
    return {
      name: 'Sachal',
      username: 'sachal2508',
      email: 'sachalkool@gmail.com',
      profileImage: null,
      followers: 0,
      following: 0,
      countries: 0,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('profileData', JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  }, [profileData]);

  const updateProfile = (updates) => {
    setProfileData(prev => ({ ...prev, ...updates }));
  };

  const uploadProfileImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size must be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setProfileData(prev => ({ ...prev, profileImage: imageData }));
        resolve(imageData);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeProfileImage = () => {
    setProfileData(prev => ({ ...prev, profileImage: null }));
  };

  const getInitials = () => {
    return profileData.name.charAt(0).toUpperCase();
  };

  return (
    <ProfileContext.Provider value={{ 
      profileData, 
      updateProfile, 
      uploadProfileImage,
      removeProfileImage,
      getInitials 
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
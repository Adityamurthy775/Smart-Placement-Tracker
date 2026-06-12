import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const normalizeRole = (role) => {
  const value = String(role || '').toLowerCase();
  if (value === 'hr') return 'HR';
  if (value === 'teacher') return 'Teacher';
  if (value === 'admin') return 'Admin';
  return 'Student';
};

const normalizeUser = (data) => ({
  ...data,
  id: data?.id || data?._id || data?.Id,
  Id: data?.Id || data?.id || data?._id,
  role: normalizeRole(data?.role),
  profileCompleted: Boolean(data?.profileCompleted),
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);

  // Configure Axios instance
  const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
  });

  // Fetch from backend on init to persist session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user-api/me');
        if (response.data && response.data.user) {
          setUser(normalizeUser(response.data.user));
          setProfileDetails(response.data.profileDetails || null);
        }
      } catch (err) {
        // Not logged in or invalid token
        console.log("No active session found.");
      }
    };
    fetchUser();
  }, []);

  const registerUser = async (data) => {
    try {
      const payload = { ...data, role: normalizeRole(data.role) };
      const response = await api.post('/user-api/user', payload);
      const newUser = normalizeUser(response.data.user || response.data.payload || payload);
      const newProfile = response.data.profileDetails || null;
      setUser(newUser);
      setProfileDetails(newProfile);
      return { success: true, data: newUser };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const loginUser = async (data) => {
    try {
      const response = await api.post('/user-api/login', data);
      const loggedInUser = normalizeUser(response.data.user);
      const loggedInProfile = response.data.profileDetails || null;
      setUser(loggedInUser);
      setProfileDetails(loggedInProfile);
      return { success: true, data: loggedInUser };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const googleLoginUser = async (credential, role = null) => {
    try {
      const response = await api.post('/user-api/google-login', { credential, role });
      const loggedInUser = normalizeUser(response.data.user);
      const loggedInProfile = response.data.profileDetails || null;
      setUser(loggedInUser);
      setProfileDetails(loggedInProfile);
      return { success: true, data: loggedInUser };
    } catch (error) {
      console.error('Google Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Google Login failed',
        requiresSignup: error.response?.data?.requiresSignup 
      };
    }
  };

  const saveProfileDetails = async (data) => {
    const nextProfile = {
      ...profileDetails,
      ...data,
      profileImage: data.profileImage || profileDetails?.profileImage || user?.profileImage || '',
    };
    const nextUser = normalizeUser({
      ...user,
      name: data.name || user?.name,
      email: data.email || user?.email,
      profileImage: nextProfile.profileImage,
      profileCompleted: true,
    });

    try {
      const response = await api.post('/user-api/profile', {
        ...nextProfile,
        name: nextUser.name,
        email: nextUser.email,
        userId: user?.id || user?._id || user?.Id,
      });
      const savedUser = normalizeUser(response.data.user || nextUser);
      const savedProfile = response.data.profileDetails || nextProfile;
      setUser(savedUser);
      setProfileDetails(savedProfile);
      return { success: true, data: savedProfile };
    } catch (error) {
      console.error('Failed to save profile details:', error);
      setUser(nextUser);
      setProfileDetails(nextProfile);
      return { success: false, error: error.response?.data?.message || 'Failed to save profile' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/user-api/logout');
    } catch (err) {
      console.error('Logout API failed:', err);
    }
    setUser(null);
    setProfileDetails(null);
  };

  return (
    <UserContext.Provider value={{ user, profileDetails, registerUser, loginUser, googleLoginUser, saveProfileDetails, logout }}>
      {children}
    </UserContext.Provider>
  );
};

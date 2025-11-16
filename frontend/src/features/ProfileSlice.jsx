import {createSlice} from '@reduxjs/toolkit';

export const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    full_name: 'Sachal',
    username: 'sachal2508',
    email: 'sachalkool@gmail.com',
    profile_photo:null,
    profileImage: null,
    followers: 0,
    following: 0,
    countries: 0,
  },
  reducers: {
    updateProfile: (state, action) => {
      return {...state, ...action.payload};
    },
  },
});

export const { updateProfile } = profileSlice.actions;

export default profileSlice.reducer;
import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./src/features/ProfileSlice.jsx";


export const store = configureStore({
  reducer: {
    profile: profileReducer,
  },
});

export default store;

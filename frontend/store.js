import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./src/features/ProfileSlice.jsx";
import itineraryReducer from "./src/features/ItinerarySlice.jsx";



export const store = configureStore({
  reducer: {
    profile: profileReducer,
    itinerary: itineraryReducer,
  },
});

export default store;

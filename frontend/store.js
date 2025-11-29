import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./src/features/ProfileSlice.jsx";
import itineraryReducer from "./src/features/ItinerarySlice.jsx";
import activitiesReducer from "./src/features/ActivitiesSlice.jsx";



export const store = configureStore({
  reducer: {
    profile: profileReducer,
    itinerary: itineraryReducer,
    activities: activitiesReducer,
  },
});

export default store;

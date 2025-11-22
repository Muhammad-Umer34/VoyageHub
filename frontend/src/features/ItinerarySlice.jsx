import { createSlice } from "@reduxjs/toolkit";
export const itinerarySlice = createSlice({
  name: "itinerary",
  initialState: {
    itineraries: [],
  },
  reducers: {
    setItineraries: (state, action) => {
      state.itineraries = action.payload;
    },
    addItinerary: (state, action) => {
      state.itineraries.push(action.payload);
    },
    removeItinerary: (state, action) => {
      state.itineraries = state.itineraries.filter(
        (itinerary) => itinerary.id !== action.payload
      );
    },
  },
});

export const { setItineraries, addItinerary, removeItinerary } = itinerarySlice.actions;

export default itinerarySlice.reducer;
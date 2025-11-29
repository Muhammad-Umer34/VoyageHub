import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  activities: [],
};

export const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    addActivity: (state, action) => {
      state.activities.push(action.payload);
    },
    removeActivity: (state, action) => {
      state.activities = state.activities.filter(
        (activity) => activity.id !== action.payload
      );
    },
    setActivities: (state, action) => {
      state.activities = action.payload;
    }
  },
});
export const { addActivity, removeActivity, setActivities } = activitiesSlice.actions;

export default activitiesSlice.reducer;
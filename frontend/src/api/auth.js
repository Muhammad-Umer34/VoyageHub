import axios from "axios";

const API_URL = "http://localhost:8000/auth/";


axios.defaults.withCredentials = true;

export const SignupApi = (userData) => {
  return axios.post(`${API_URL}register`, userData);
}

export const VerifyEmail = (userData) => {
  return axios.post(`${API_URL}verify-email`, userData);
}

export const LoginApi = (userData) => {
  const data = new URLSearchParams();
  data.append("username", userData.email);
  data.append("password", userData.password);
  return axios.post(`${API_URL}token`, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export const SendForgetPasswordEmail = (email) => {
  return axios.post(`${API_URL}forget-password`, { email });
}

export const VerifyForgetPassword = (token) => {
  console.log("API call to verify token:", token);
  return axios.post(`${API_URL}verify-forget-password`, token);
}

export const ResetPassword = (userData) => {
  return axios.post(`${API_URL}reset-password`, userData);
}

export const ResendVerificationCode = (email) => {
  return axios.post(`${API_URL}resend-code`, { email });
}

export const UpdateProfilePhoto = (profilePhotoUrl) => {
  return axios.post(
    `${API_URL}update-profile-photo`,
    { profile_photo: profilePhotoUrl }
  );
};

export const ProfileInfo = () => {
  return axios.get(`${API_URL}profile_info`);
};


export const Create_Itinerary = (itineraryData) => {
  return axios.post(`http://localhost:8000/itineraries/create`, itineraryData);
}


export const Get_Itineraries = () => {
  return axios.get(`http://localhost:8000/itineraries/get-itineraries`);
}

export const Invite_Collaborator = (inviteData) => {
  return axios.post(`http://localhost:8000/itineraries/invite`, inviteData);
}


export const Get_Invitations = () => {
  return axios.get(`http://localhost:8000/itineraries/invitations`);
}

export const Post_Sightseeing_Activity = (sightseeingData) => {
  return axios.post(`http://localhost:8000/itineraries/add/sightseeking-activity`, sightseeingData);
}

export const Get_all_activities = (itinerary_id) => {
  return axios.get(`http://localhost:8000/itineraries/get_all_activities_of_itinerary/${itinerary_id}`);
}

export const Post_Meal_Activity = (mealData) => {
  return axios.post(`http://localhost:8000/itineraries/add/meal-activity`, mealData);
}
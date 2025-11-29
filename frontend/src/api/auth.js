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

export const Post_Accommodation_Activity = (accommodationData) => {
  return axios.post(`http://localhost:8000/itineraries/add/accommodation-activity`, accommodationData);
}

export const Delete_Activity = (itinerary_id, day_id, activity_id) => {
  return axios.delete(`http://localhost:8000/itineraries/${itinerary_id}/days/${day_id}/activities/${activity_id}`);
}



export const Get_All_Collaborators = (itinerary_id) => {
  return axios.get(`http://localhost:8000/itineraries/get_all_collaborators/${itinerary_id}`);
}


export const Send_Chat_Message = (messageData) => {
  return axios.post(`http://localhost:8000/itineraries/add/text-message`, messageData);
}

export const Get_Chat_Messages = (itinerary_id) => {
  return axios.get(`http://localhost:8000/itineraries/get_chat_messages/${itinerary_id}`);
}


export const Create_Poll_Message = (pollData) => {
  return axios.post(`http://localhost:8000/itineraries/add/poll-message`, pollData);
}

export const Cast_Vote = (voteData) => {
  return axios.post(`http://localhost:8000/itineraries/cast_vote`, voteData);
}

export const Did_I_Vote = (poll_id) => {
  return axios.get(`http://localhost:8000/itineraries/did_i_vote/${poll_id}`);
}
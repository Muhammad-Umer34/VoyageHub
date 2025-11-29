import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

import { Create_Itinerary, Get_Itineraries } from '../api/auth';
import { addItinerary, setItineraries } from '../features/ItinerarySlice';
import TripsList from '../components/TripCard';
import Notifications from '../components/Notification';
import EmptyState from '../components/EmptyState';
import CreateTripModal from '../components/CreateTripModal';

const Dashboard = () => {
  const dispatch = useDispatch();

  const itineraries = useSelector((state) => state.itinerary.itineraries);
  const user = useSelector((state) => state.profile); 
  
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});
  
  const UNSPLASH_ACCESS_KEY = 'RyIsnHO9fVcTI_H4NHRq7zYLVXkKTGRVNJkgpkHdHfQ';
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await Get_Itineraries();
        dispatch(setItineraries(response.data));
        
      } catch (error) {
        console.error('Error fetching itineraries:', error);
        setError('Failed to load trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [dispatch]);

  const unsplashAxios = axios.create({
    withCredentials: false,
  });

  const getCityImage = async (cityName) => {
    try {
      const response = await unsplashAxios.get(
        `https://api.unsplash.com/search/photos`,
        {
          params: {
            query: cityName,
            per_page: 1,
            orientation: "landscape"
          },
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      return response.data.results[0]?.urls?.regular;
    } catch (error) {
      console.error("Error fetching Unsplash image", error);
      return null;
    }
  };

  const CreateItinerary = async () => {
    try {
      const photo = await getCityImage(destination);
      
      const tripData = {
        title: tripName,
        destination: destination,
        description: description,
        start_date: startDate,
        end_date: endDate,
        cover_image: photo,
      };
      
      const response = await Create_Itinerary(tripData);
      
      dispatch(addItinerary(response.data));
      
      setTripName('');
      setDestination('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setErrors({});
      setShowModal(false);
    } catch (error) {
      console.error('Error creating itinerary:', error);
      setErrors({ submit: 'Error creating trip. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-[#16181d]">
        <div className="text-gray-600 dark:text-gray-400">Loading trips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-[#16181d]">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header Bar with Notifications */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {user?.name || user?.email || 'Traveler'}!
              </p>
            </div>
            
            {/* Notifications Component - No longer needs userId prop */}
            <div className="flex items-center gap-3">
              <Notifications />
              
              {itineraries.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Create Trip
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#16181d]">
        <div className="max-w-7xl mx-auto p-6">
          {itineraries.length === 0 ? (
            <EmptyState onCreateTrip={handleOpenModal} />
          ) : (
            <>
              <TripsList />
            </>
          )}
        </div>
      </div>

      <CreateTripModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onCreate={CreateItinerary}
        tripName={tripName}
        setTripName={setTripName}
        destination={destination}
        setDestination={setDestination}
        description={description}
        setDescription={setDescription}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        errors={errors}
        setErrors={setErrors}
        today={today}
      />
    </div>
  );
};

export default Dashboard;
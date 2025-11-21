import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

import { Create_Itinerary } from '../api/auth';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});
  const UNSPLASH_ACCESS_KEY = 'RyIsnHO9fVcTI_H4NHRq7zYLVXkKTGRVNJkgpkHdHfQ';

  const today = new Date().toISOString().split('T')[0];

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

  const validateForm = () => {
    const newErrors = {};

    if (!tripName.trim()) {
      newErrors.tripName = 'Please enter a trip name';
    }

    if (!destination.trim()) {
      newErrors.destination = 'Please enter a destination';
    }

    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    }

    if (!endDate) {
      newErrors.endDate = 'Please select an end date';
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field === 'tripName') setTripName(value);
    if (field === 'destination') setDestination(value);
    if (field === 'description') setDescription(value);
    if (field === 'startDate') setStartDate(value);
    if (field === 'endDate') setEndDate(value);

    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const CreateItinerary = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const photo = await getCityImage(destination);
      console.log('City photo URL:', photo);
      
      // Create trip object
      const tripData = {
        title: tripName,
        destination: destination,
        description: description,
        start_date: startDate,
        end_date: endDate,
        cover_image: photo,
      };

      console.log('Trip data:', tripData);
      
      const response = await Create_Itinerary(tripData);
      console.log('Trip created successfully:', response.data);
      
      // Reset form
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

  return (
    <div className="h-full flex">
      {/* Content Area - Full Width */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#16181d]">
        <div className="max-w-4xl mx-auto p-6">
          {/* Empty State - Create First Trip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mb-8">
              <div className="w-40 h-40 mx-auto mb-6 opacity-20">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#14b8a6',stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
                    </linearGradient>
                  </defs>
                  {/* Eiffel Tower */}
                  <path d="M100 40 L90 160 L110 160 Z" fill="url(#grad)" />
                  <rect x="85" y="90" width="30" height="3" fill="url(#grad)" />
                  <rect x="88" y="120" width="24" height="3" fill="url(#grad)" />
                  {/* Big Ben */}
                  <rect x="135" y="70" width="10" height="90" fill="url(#grad)" opacity="0.7" />
                  <circle cx="140" cy="65" r="6" fill="url(#grad)" />
                  {/* Windmill */}
                  <circle cx="60" cy="110" r="4" fill="url(#grad)" opacity="0.6" />
                  <line x1="60" y1="110" x2="52" y2="95" stroke="url(#grad)" strokeWidth="2" />
                  <line x1="60" y1="110" x2="68" y2="95" stroke="url(#grad)" strokeWidth="2" />
                  <line x1="60" y1="110" x2="52" y2="125" stroke="url(#grad)" strokeWidth="2" />
                  <line x1="60" y1="110" x2="68" y2="125" stroke="url(#grad)" strokeWidth="2" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Create your first trip
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-base">
                Planning is where the adventure starts. Create your first trip and start yours! 🚀
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
            >
              Create first trip
            </motion.button>
          </motion.div>

          {/* Save Places Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center py-16 border-t border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Save all your places & articles
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 text-base">
              Collect all your favorite articles, places to sleep, activities and restaurants in one place.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 text-gray-900 dark:text-white rounded-lg font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Add place or article
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Create Trip Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Trip
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Trip Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => handleInputChange('tripName', e.target.value)}
                    placeholder="e.g., Summer in Europe"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                  />
                  {errors.tripName && (
                    <p className="text-red-500 text-sm mt-1">{errors.tripName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    placeholder="e.g., Paris, France"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                  />
                  {errors.destination && (
                    <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell us about your trip plans..."
                    rows="4"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white resize-none"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={today}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={startDate || today}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="flex-1 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={CreateItinerary}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Create Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
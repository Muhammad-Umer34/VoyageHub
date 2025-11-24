import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Plus, Hotel, Utensils, Plane, Eye, Clock, X, Trash2, ChevronDown, ChevronUp, Search, Star, Navigation } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TripDestinationPlanner() {
const GEOAPIFY_API_KEY = "f585e0fb666142df93df8439bfba9423";
  const navigate = useNavigate();
  const [tripData] = useState({
    title: "Plan Your Trip",
    coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2000"
  });
  const [days, setDays] = useState([
    {
      id: 1,
      date: "Day 1",
      dayNumber: 1,
      destinations: [],
      expanded: true
    }
  ]);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [isSearchingDestinations, setIsSearchingDestinations] = useState(false);
  const [destinationError, setDestinationError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const activityTypes = [
    { value: 'meal', label: 'Meal', icon: Utensils },
    { value: 'sightseeing', label: 'Sightseeing', icon: Eye },
    { value: 'accommodation', label: 'Accommodation', icon: Hotel },
    { value: 'transport', label: 'Transport', icon: Plane }
  ];

  const getActivityColor = (type) => {
    const colors = {
      meal: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      sightseeing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      accommodation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      transport: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };


const searchDestination = async (query) => {
  if (query.length < 2) return;

  setIsSearchingDestinations(true);
  setDestinationError('');

  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      query
    )}&format=json&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const place = data.results[0];

      const newDestination = {
        id: Date.now(),
        name: place.formatted || query,
        latitude: place.lat,
        longitude: place.lon,
        country: place.country || "Unknown",
        activities: [],
      };

      // Add destination to selected day
      setDays((days) =>
        days.map((day) =>
          day.id === selectedDay
            ? { ...day, destinations: [...day.destinations, newDestination] }
            : day
        )
      );

      setShowDestinationModal(false);
      setDestinationSearch("");
    } else {
      setDestinationError("No location found. Try a different search term.");
    }
  } catch (error) {
    console.error("Destination search error:", error);
    setDestinationError("Failed to fetch location. Please try again.");
  } finally {
    setIsSearchingDestinations(false);
  }
};

  const deleteDestination = (dayId, destinationId) => {
    setDays((days) =>
      days.map((day) =>
        day.id === dayId
          ? { ...day, destinations: day.destinations.filter((d) => d.id !== destinationId) }
          : day
      )
    );
  };

  const toggleDay = (dayId) => {
    setDays((days) =>
      days.map((day) =>
        day.id === dayId ? { ...day, expanded: !day.expanded } : day
      )
    );
  };

  const addNewDay = () => {
    const newDay = {
      id: Date.now(),
      date: `Day ${days.length + 1}`,
      dayNumber: days.length + 1,
      destinations: [],
      expanded: true
    };
    setDays([...days, newDay]);
  };

const handleActivityClick = (activityType, destination) => {
  navigate(`/trips/${1}/${activityType}`, {
    state: {
      dayId: selectedDay,
      activityType,
      destinationId: destination.id,
      latitude: destination.latitude,
      longitude: destination.longitude,
      destinationName: destination.name,
      country: destination.country
    }
  });
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <div className="relative h-80 overflow-hidden">
        <img src={tripData.coverImage} alt={tripData.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-bold text-white mb-4">{tripData.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                {days.length} {days.length === 1 ? 'Day' : 'Days'}
              </div>
              <button
                onClick={addNewDay}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Day
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Days */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 cursor-pointer"
                onClick={() => toggleDay(day.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-2xl font-bold text-teal-600">{day.dayNumber}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{day.date}</h2>
                      <p className="text-white/90 text-sm">{day.destinations.length} destination(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDay(day.id);
                        setShowDestinationModal(true);
                      }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Add Destination
                    </button>
                    {day.expanded ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {day.expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {day.destinations.length === 0 ? (
                      <div className="p-12 text-center">
                        <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">No destinations added yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Start by adding your first destination</p>
                        <button
                          onClick={() => {
                            setSelectedDay(day.id);
                            setShowDestinationModal(true);
                          }}
                          className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                        >
                          Add First Destination
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 space-y-6">
                        {day.destinations.map((destination) => {
                          const hasAccommodation = destination.activities.some((a) => a.type === 'accommodation');
                          return (
                            <div key={destination.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                                      <Navigation className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{destination.name}</h3>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Lat: {destination.latitude.toFixed(4)}, Lng: {destination.longitude.toFixed(4)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteDestination(day.id, destination.id)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                              </div>
                              {destination.activities.length === 0 ? (
                                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                  <p className="text-center text-gray-500 dark:text-gray-400 mb-4">No activities yet</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {activityTypes.map((type) => {
                                      const IconComponent = type.icon;
                                      const isDisabled = type.value === 'accommodation' && hasAccommodation;
                                      return (
                                        <button
                                          key={type.value}
                                          onClick={() => !isDisabled && handleActivityClick(type.value, destination)}
                                          disabled={isDisabled}
                                          className={`p-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-teal-500 transition-all shadow-sm hover:shadow-md ${
                                            isDisabled
                                              ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                                              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                          }`}
                                        >
                                          <div className={`w-12 h-12 mx-auto mb-2 ${getActivityColor(type.value)} rounded-lg flex items-center justify-center`}>
                                            <IconComponent className="w-6 h-6" />
                                          </div>
                                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {type.label}
                                          </p>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="space-y-3 mb-4">
                                    {destination.activities.map((activity) => {
                                      const IconComponent = activity.icon;
                                      return (
                                        <div key={activity.id} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700 group hover:shadow-md transition-shadow">
                                          <div className={`w-12 h-12 ${getActivityColor(activity.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <IconComponent className="w-6 h-6" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <h4 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                                              {activity.rating && (
                                                <div className="flex items-center gap-1">
                                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                  <span className="text-sm font-semibold">{activity.rating}</span>
                                                </div>
                                              )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{activity.details}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                              <Clock className="w-3 h-3" />
                                              <span>{activity.time}</span>
                                              {activity.duration && <span>• {activity.duration}</span>}
                                              {activity.price && <span>• {activity.price}</span>}
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => deleteActivity(day.id, destination.id, activity.id)}
                                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {activityTypes.map((type) => {
                                      const IconComponent = type.icon;
                                      const isDisabled = type.value === 'accommodation' && hasAccommodation;
                                      return (
                                        <button
                                          key={type.value}
                                          onClick={() => !isDisabled && handleActivityClick(type.value, destination)}
                                          disabled={isDisabled}
                                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md ${
                                            isDisabled
                                              ? 'bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed text-gray-500'
                                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-teal-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                          }`}
                                        >
                                          <IconComponent className="w-4 h-4" />
                                          Add {type.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Add Destination Modal */}
      <AnimatePresence>
        {showDestinationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDestinationModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Add Destination</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter a city or place name</p>
                </div>
                <button
                  onClick={() => setShowDestinationModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={destinationSearch}
                    onChange={(e) => setDestinationSearch(e.target.value)}
                    placeholder="e.g., Paris, Tokyo, University of Michigan Ann Arbor"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                    autoFocus
                  />
                </div>
                {destinationError && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{destinationError}</p>
                )}
                <button
                  onClick={() => searchDestination(destinationSearch)}
                  disabled={isSearchingDestinations || destinationSearch.length < 2}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {isSearchingDestinations ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Searching...
                    </div>
                  ) : (
                    'Add Destination'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
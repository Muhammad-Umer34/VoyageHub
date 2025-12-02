import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  MapPin,
  Utensils,
  Eye,
  Hotel,
  Plane,
  X,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Get_all_activities } from "../api/auth";
import { setActivities } from "../features/ActivitiesSlice";
import { useDispatch } from "react-redux";
import Day from "./Day";
import {Delete_Activity} from "../api/auth";

export default function TripDestinationPlanner() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const itineraries = useSelector((state) => state.itinerary.itineraries);
  const activitiesState = useSelector((state) => state.activities.activities);
  const itinerary = itineraries.find(
    (itinerary) => itinerary.id === parseInt(id)
  );

  const [activities, setLocalActivities] = useState([]);

  const fetchActivities = async () => {
    try {
      console.log("Fetching activities for itinerary ID:", itinerary.id);
      const response = await Get_all_activities(itinerary.id);
      console.log("Fetched activities:", response.data);
      const newActivities = response.data || [];
      setLocalActivities(newActivities);
      dispatch(setActivities(newActivities));
      console.log(newActivities);
    } catch (error) {
      console.error("Fetch error:", error);
      setLocalActivities([]);
    }
  };

  useEffect(() => {
    if (!itinerary?.id) return;
    fetchActivities();
  }, []);

  const calculateTotalDays = () => {
    if (!itinerary?.start_date || !itinerary?.end_date) return 1;

    const startDate = new Date(itinerary.start_date);
    const endDate = new Date(itinerary.end_date);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  };

  const totalDays = calculateTotalDays();

  const getDateForDay = (dayNumber) => {
    if (!itinerary?.start_date) return `Day ${dayNumber}`;

    const startDate = new Date(itinerary.start_date);
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + (dayNumber - 1));

    const options = { month: "short", day: "numeric", year: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  const navigate = useNavigate();

  const [tripData] = useState({
    title: itinerary?.title || "Plan Your Trip",
    coverImage:
      itinerary?.cover_image ||
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2000",
  });

  const [days, setDays] = useState([]);

  const iconComponents = {
    meal: Utensils,
    sightseeing: Eye,
    accommodation: Hotel,
    transport: Plane,
  };

  const fetchCoords = async (locationName) => {
    try {
      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        locationName
      )}&format=json&apiKey=f585e0fb666142df93df8439bfba9423`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch coordinates");
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        return {
          lat: place.lat,
          lon: place.lon,
          country: place.country || "",
        };
      }
    } catch (error) {
      console.error("Geocode error:", error);
    }
    return { lat: null, lon: null, country: "" };
  };

useEffect(() => {
    const buildDays = async () => {
      if (!itinerary) return;

      if (activities.length === 0) {
        setDays([]);
        return;
      }
      
      // Don't filter by totalDays - use all activities that have a day_schedule
      const validActivities = activities.filter(
        (act) => act.day_schedule_id && act.day_schedule
      );

      if (validActivities.length === 0) {
        setDays([]);
        return;
      }

      const dayScheduleIds = [
        ...new Set(validActivities.map((act) => act.day_schedule_id)),
      ].sort((a, b) => a - b);

      const newDays = [];
      for (let dsId of dayScheduleIds) {
        const dayActs = validActivities.filter(
          (act) => act.day_schedule_id === dsId
        );

        if (dayActs.length === 0) {
          continue;
        }
        const dayNumber = dayActs[0].day_schedule?.day_number || 1;

        const day = {
          id: dsId,
          date: getDateForDay(dayNumber),
          dayNumber: dayNumber,
          destinations: [],
          expanded: true,
        };
        const locGroups = {};
        dayActs.forEach((act) => {
          const typeLower = act.type?.toLowerCase();
          const specificActivity = act[`${typeLower}_activity`];
          let location = "Unknown Location";

          if (typeLower === "meal") {
            location = specificActivity?.restaurant_name || "Unknown Location";
          } else if (typeLower === "sightseeing") {
            location = specificActivity?.location_name || "Unknown Location";
          } else if (typeLower === "accommodation") {
            location =
              specificActivity?.hotel_name ||
              specificActivity?.location_name ||
              "Unknown Location";
          } else if (typeLower === "transport") {
            location =
              specificActivity?.to_location ||
              specificActivity?.location_name ||
              "Unknown Location";
          }

          if (!locGroups[location]) {
            locGroups[location] = {
              id: `${dsId}-${location.replace(/[^a-zA-Z0-9]/g, "-")}`,
              name: location,
              latitude: null,
              longitude: null,
              country: "",
              activities: [],
            };
          }
          const uiActivity = {
            id: act.id,
            title: act.title || "Untitled Activity",
            details: act.description || "",
            type: typeLower || "unknown",
            icon: iconComponents[typeLower] || null,
            price:
              specificActivity?.entry_fee || specificActivity?.cost || null,
            coverImage: act.cover_image || null,
          };

          locGroups[location].activities.push(uiActivity);
        });

        const destPromises = Object.keys(locGroups).map(async (locName) => {
          const group = locGroups[locName];
          const { lat, lon, country } = await fetchCoords(locName);
          return {
            ...group,
            latitude: lat,
            longitude: lon,
            country,
          };
        });

        const destinations = await Promise.all(destPromises);
        day.destinations = destinations;
        newDays.push(day);
      }

      setDays(newDays);
      console.log("New Days built: ", newDays);
      console.log("Activities used: ", activities);
    };

    buildDays();
  }, [activities, itinerary, totalDays]);

  const activityTypes = [
    { value: "meal", label: "Meal", icon: iconComponents.meal },
    {
      value: "sightseeing",
      label: "Sightseeing",
      icon: iconComponents.sightseeing,
    },
    {
      value: "accommodation",
      label: "Accommodation",
      icon: iconComponents.accommodation,
    },
    { value: "transport", label: "Transport", icon: iconComponents.transport },
  ];

  const getActivityColor = (type) => {
    const colors = {
      meal: "bg-amber-100 text-amber-800",
      sightseeing: "bg-blue-100 text-blue-800",
      accommodation: "bg-purple-100 text-purple-800",
      transport: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const toggleDay = (dayId) => {
    setDays((days) =>
      days.map((day) =>
        day.id === dayId ? { ...day, expanded: !day.expanded } : day
      )
    );
  };

  const addNewDay = () => {
    if (days.length >= totalDays) {
      alert(
        `You cannot add more than ${totalDays} days for this trip (${itinerary.start_date} to ${itinerary.end_date})`
      );
      return;
    }

    const newDayNumber =
      days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) + 1 : 1;
    if (newDayNumber > totalDays) {
      alert(`You cannot add more than ${totalDays} days for this trip.`);
      return;
    }

    const newDay = {
      id: Date.now(),
      date: getDateForDay(newDayNumber),
      dayNumber: newDayNumber,
      destinations: [],
      expanded: true,
    };
    setDays((prevDays) => [...prevDays, newDay]);
  };

  const handleActivityClick = (activityType, destination, day) => {
    navigate(`/trips/${id}/${activityType}`, {
      state: {
        dayId: day.id,
        activityType,
        destinationId: destination.id,
        latitude: destination.latitude,
        longitude: destination.longitude,
        destinationName: destination.name,
        country: destination.country,
        dayNumber: day.dayNumber,
        date: day.date,
      },
    });
  };

  const handleAddDestination = (dayId, newDestination) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              destinations: [...day.destinations, newDestination],
              expanded: true,
            }
          : day
      )
    );
  };

  const handleDeleteDestination = (dayId, destinationId) => {
    console.log("Deleting destination:", { dayId, destinationId });
  };
  

  const handleDeleteActivity = async (dayId, destinationId, activityId) => {
    
    console.log("Deleting activity:", { dayId, destinationId, activityId });
    try {
      const response = await Delete_Activity(itinerary.id, dayId, activityId);
      console.log(response);
      if (response) {
        await fetchActivities();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
   
  };

  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationSearch, setDestinationSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSearchingDestinations, setIsSearchingDestinations] = useState(false);
  const [destinationError, setDestinationError] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);

  const GEOAPIFY_API_KEY = "f585e0fb666142df93df8439bfba9423";

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        query
      )}&apiKey=${GEOAPIFY_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.features) {
        setSuggestions(
          data.features.map((item) => ({
            name: item.properties.formatted,
            lat: item.properties.lat,
            lon: item.properties.lon,
            country: item.properties.country,
          }))
        );
      }
    } catch (error) {
      console.error("Auto-suggest error:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const searchDestination = async (query) => {
    if (query.length < 2) return;

    setIsSearchingDestinations(true);
    setDestinationError("");

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
        handleAddDestination(selectedDay, newDestination);
        setShowDestinationModal(false);
        setDestinationSearch("");
        setSuggestions([]);
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

  const onOpenAddDestination = (dayId) => {
    setSelectedDay(dayId);
    setShowDestinationModal(true);
  };

  if (days.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={tripData.coverImage}
            alt={tripData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl font-bold text-white mb-4">
                {tripData.title}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  0 of {totalDays} {totalDays === 1 ? "Day" : "Days"}
                </div>
                <button
                  onClick={addNewDay}
                  className="px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 bg-teal-500 hover:bg-teal-600"
                >
                  <Plus className="w-5 h-5" />
                  Add Day 1
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Starter */}
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Your trip is ready to plan!
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No days have been added yet. Start by adding your first day to begin
            planning your itinerary.
          </p>
          <button
            onClick={addNewDay}
            className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            Add Day 1
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={tripData.coverImage}
          alt={tripData.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              {tripData.title}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                {days.length} of {totalDays} {totalDays === 1 ? "Day" : "Days"}
              </div>
              <button
                onClick={addNewDay}
                disabled={days.length >= totalDays}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  days.length >= totalDays
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-teal-500 hover:bg-teal-600"
                }`}
              >
                <Plus className="w-5 h-5" />
                Add Day {days.length >= totalDays && "(Max Reached)"}
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
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 cursor-pointer"
                onClick={() => toggleDay(day.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-2xl font-bold text-teal-600">
                        {day.dayNumber}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Day {day.dayNumber}
                      </h2>
                      <p className="text-white/90 text-sm">
                        {day.date} • {day.destinations.length} destination(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {day.destinations.length === 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddDestination(day.id);
                        }}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        Add Destination
                      </button>
                    )}
                    {day.expanded ? (
                      <ChevronUp className="w-6 h-6 text-white" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {day.expanded && (
                <Day
                  day={day}
                  onOpenAddDestination={onOpenAddDestination}
                  onDeleteDestination={handleDeleteDestination}
                  onDeleteActivity={handleDeleteActivity}
                  onActivityClick={handleActivityClick}
                  activityTypes={activityTypes}
                  getActivityColor={getActivityColor}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Destination Modal */}
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
              className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Add Destination
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a city or place name
                  </p>
                </div>
                <button
                  onClick={() => setShowDestinationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={destinationSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDestinationSearch(value);
                      fetchSuggestions(value);
                    }}
                    placeholder="e.g., Paris, Tokyo, University of Michigan Ann Arbor"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900"
                    autoFocus
                  />
                  {suggestions.length > 0 && (
                    <div className="bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto shadow-lg absolute w-full mt-1 z-10">
                      {suggestions.map((s, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setDestinationSearch(s.name);
                            setSuggestions([]);

                            const newDestination = {
                              id: Date.now(),
                              name: s.name,
                              latitude: s.lat,
                              longitude: s.lon,
                              country: s.country || "Unknown",
                              activities: [],
                            };

                            handleAddDestination(selectedDay, newDestination);

                            setShowDestinationModal(false);
                            setDestinationSearch("");
                          }}
                          className="p-3 cursor-pointer hover:bg-gray-100"
                        >
                          <p className="text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.country}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {destinationError && (
                  <p className="text-red-500 text-sm">{destinationError}</p>
                )}
                <button
                  onClick={() => searchDestination(destinationSearch)}
                  disabled={
                    isSearchingDestinations || destinationSearch.length < 2
                  }
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {isSearchingDestinations ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Searching...
                    </div>
                  ) : (
                    "Add Destination"
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
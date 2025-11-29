// Day.jsx (Updated)
import { motion } from "framer-motion";
import {
  Clock,
  Trash2,
  Star,
  Navigation,
  MapPin,
  Users,
  ChevronRight,
} from "lucide-react";
import SightseeingActivity from "../components/SightseeingActivity";
import MealActivity from "../components/MealActivity";
import AccommodationActivity from "../components/AccomodationActivity";
import TransportActivity from "../components/TransportActivity";
import { useEffect } from "react";

const Day = ({ day, onOpenAddDestination, onDeleteDestination, onDeleteActivity, onActivityClick, activityTypes, getActivityColor }) => {
  const hasAccommodation = (destination) =>
    destination.activities.some((a) => a.type === "accommodation");

  const dayHasAccommodation = day.destinations.some(hasAccommodation);

  const handleActivityClick = (activityType, destination) => {
    if (!destination.latitude || !destination.longitude) {
      alert("Location coordinates not available. Please update the destination.");
      return;
    }

    onActivityClick(activityType, destination, day);
  };

  const handleDayLevelActivityClick = (activityType) => {
    if (dayHasAccommodation && activityType === "accommodation") {
      return; 
    }
    const primaryDestination = day.destinations[0]; 
    if (!primaryDestination) {
      alert("No destinations available.");
      return;
    }
    handleActivityClick(activityType, primaryDestination);
  };
  
  useEffect(() => {
    console.log("What we recive is : ",day);
  },[])

  const renderActivityCard = (activity, destinationId) => {
    const location = day.destinations[0]?.name || day.destinations[0]?.country || "Unknown Location";
    
    if (activity.type === "sightseeing") {
      return (
        <SightseeingActivity
          key={activity.id}
          activity={{
            title: activity.title,
            description: activity.details || activity.description,
            coverImage: activity.coverImage,
            price: activity.entryFee || activity.price,
            location: location,
          }}
          onDelete={() => onDeleteActivity(day.id, destinationId, activity.id)}
        />
      );
    }

    if (activity.type === "meal") {
      return (
        <MealActivity
          key={activity.id}
          activity={{
            title: activity.title,
            coverImage: activity.coverImage,
            location: location,
            dayDate: activity.dayDate || activity.date,
            restaurantName: activity.restaurantName || activity.restaurant,
          }}
          onDelete={() => onDeleteActivity(day.id, destinationId, activity.id)}
        />
      );
    }

    if (activity.type === "accommodation") {
      return (
        <AccommodationActivity
          key={activity.id}
          activity={{
            title: activity.title || activity.name,
            coverImage: activity.coverImage,
            address: activity.address || location,
            checkIn: activity.checkIn,
            checkOut: activity.checkOut,
            price: activity.price || activity.pricePerNight,
          }}
          onDelete={() => onDeleteActivity(day.id, destinationId, activity.id)}
        />
      );
    }

    if (activity.type === "transport") {
      return (
        <TransportActivity
          key={activity.id}
          activity={{
            title: activity.title,
            description: activity.details || activity.description,
            coverImage: activity.coverImage,
            from: activity.from,
            to: activity.to,
            time: activity.time,
            price: activity.price,
          }}
          onDelete={() => onDeleteActivity(day.id, destinationId, activity.id)}
        />
      );
    }

    // Fallback for other types (simple card)
    const IconComponent = activity.icon;
    return (
      <div
        key={activity.id}
        className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200 group hover:shadow-md transition-shadow"
      >
        <div
          className={`w-12 h-12 ${getActivityColor(
            activity.type
          )} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          {IconComponent && <IconComponent className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">
              {activity.title}
            </h4>
            {activity.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">
                  {activity.rating}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">
            {activity.details}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{activity.time || "N/A"}</span>
            {activity.duration && (
              <span>
                • {activity.duration}
              </span>
            )}
            {activity.price && (
              <span>• {activity.price}</span>
            )}
          </div>
        </div>
        <button
          onClick={() =>
            onDeleteActivity(
              day.id,
              destinationId,
              activity.id
            )
          }
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    );
  };

  const renderDestination = (destination) => {
    return (
      <div
        key={destination.id}
        className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {destination.name}
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              Lat: {destination.latitude?.toFixed(4) || "N/A"}, Lng:{" "}
              {destination.longitude?.toFixed(4) || "N/A"}
            </p>
          </div>
          <button
            onClick={() => onDeleteDestination(day.id, destination.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-all group"
            title="Delete destination"
          >
            <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>

        {destination.activities.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-center text-gray-500">
              No activities yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mb-6">
            {destination.activities.map((activity) => renderActivityCard(activity, destination.id))}
          </div>
        )}
      </div>
    );
  };

  if (day.destinations.length === 0) {
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        className="overflow-hidden"
      >
        <div className="p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">
            No destinations added yet
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Start by adding your first destination
          </p>
          <button
            onClick={() => onOpenAddDestination(day.id)}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            Add First Destination
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className="overflow-hidden"
    >
      <div className="p-6 space-y-6">
        {day.destinations.map(renderDestination)}

        {/* Day-level Add Buttons */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <p className="text-center text-gray-600 mb-4 font-medium">Add More Activities</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {activityTypes.map((type) => {
              const IconComponent = type.icon;
              const isDisabled = type.value === "accommodation" && dayHasAccommodation;
              return (
                <button
                  key={type.value}
                  onClick={() => !isDisabled && handleDayLevelActivityClick(type.value)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md ${
                    isDisabled
                      ? "bg-gray-200 opacity-50 cursor-not-allowed text-gray-500"
                      : "bg-white border border-gray-200 hover:border-teal-500 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  Add {type.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Day;
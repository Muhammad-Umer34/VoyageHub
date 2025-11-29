// components/SightseeingActivity.jsx
import { Trash2, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const SightseeingActivity = ({ activity, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxDescriptionLength = 100;
  const truncatedDescription = activity.description
    ? activity.description.length > maxDescriptionLength
      ? `${activity.description.substring(0, maxDescriptionLength)}...`
      : activity.description
    : '';
  const fullDescription = activity.description || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200 group"
    >
      {activity.coverImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onDelete}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-lg">{activity.title}</h4>
          {!activity.coverImage && (
            <button
              onClick={onDelete}
              className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
        {fullDescription && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              {isExpanded ? fullDescription : truncatedDescription}
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-teal-500 text-sm font-medium flex items-center gap-1 mt-1 hover:underline"
            >
              {isExpanded ? 'Show Less' : 'View More'}
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{activity.location}</span>
          </div>
          {activity.price && (
            <span className="font-semibold text-teal-600">${activity.price}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SightseeingActivity;
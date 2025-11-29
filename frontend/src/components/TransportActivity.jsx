// components/TransportActivity.jsx
import { Trash2, MapPin, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

const TransportActivity = ({ activity, onDelete }) => {
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
        {activity.description && (
          <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
        )}
        <div className="space-y-2 text-sm">
          {activity.from && activity.to && (
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{activity.from} <ArrowRight className="w-4 h-4" /> {activity.to}</span>
            </div>
          )}
          {activity.time && (
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{activity.time}</span>
            </div>
          )}
          {activity.price && (
            <span className="font-semibold text-teal-600 block">{activity.price}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TransportActivity;
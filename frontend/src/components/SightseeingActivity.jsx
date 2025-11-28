// SightseeingActivity.jsx
import { motion } from "framer-motion";
import { useState, useEffect} from "react";
import { Eye, MapPin, Clock, DollarSign, Star, Play, Trash2, Users, ChevronRight, ChevronUp } from "lucide-react";

const SightseeingActivity = ({ activity, onDelete }) => {
  const { title, description, coverImage, price, location } = activity;
  const [showFull, setShowFull] = useState(false);

  const truncatedDescription = description.length > 150 
    ? `${description.substring(0, 150)}...` 
    : description;

  const toggleDescription = () => {
    setShowFull(!showFull);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <Play className="w-4 h-4 text-red-500" />
          <span className="text-sm font-semibold text-gray-800">Audio Tour</span>
        </div>
        {price && (
          <div className="absolute bottom-4 left-4 bg-teal-500 text-white px-3 py-1 rounded-full">
            <DollarSign className="w-3 h-3 inline mr-1" />
            <span className="text-sm font-semibold">{price}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
            {Array.from({ length: 4 }, (_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 inline" />
            ))}
            <Star className="w-4 h-4 text-gray-300 inline" />
            <span className="ml-1 text-sm text-gray-500">(4.5)</span>
          </div>
          <button
            onClick={onDelete}
            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all ml-2"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>

        <p className={`text-gray-600 text-sm leading-relaxed mb-4 transition-all duration-300 ${
          showFull ? 'max-h-none' : 'max-h-20 overflow-hidden'
        }`}>
          {showFull ? description : truncatedDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>2-3 hours</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Family-friendly</span>
            </div>
          </div>
          <button 
            onClick={toggleDescription}
            className="text-teal-600 font-semibold text-sm hover:underline flex items-center gap-1"
          >
            {showFull ? 'Read Less' : 'View Details'}
            {showFull ? <ChevronUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SightseeingActivity;
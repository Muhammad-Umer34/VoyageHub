import { motion } from "framer-motion";
import { Trash2, Utensils, MapPin, Calendar } from "lucide-react";
import { useEffect } from "react";

const MealActivity = ({ activity, onDelete }) => {
  let { title, cover_image: coverImage, meal_activity, day_schedule } = activity;
  coverImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D"
  const restaurantName = meal_activity?.restaurant_name || '';
  const date = day_schedule?.date || '';
  useEffect(() => {
    console.log(activity);
  },[])
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full">
          <Utensils className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-gray-800">Meal</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">{title}</h3>
          <button
            onClick={onDelete}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
        
        {restaurantName && (
          <p className="text-sm text-gray-600 mb-2">{restaurantName}</p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>Paris, IDF, France</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MealActivity;
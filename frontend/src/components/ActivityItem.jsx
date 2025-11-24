import { motion } from 'framer-motion';
import { Star, Clock, MapPinned, Edit2, Trash2 } from 'lucide-react';

function ActivityItem({ 
  activity, 
  index, 
  totalActivities, 
  getActivityColor, 
  onEdit, 
  onDelete, 
  dayId 
}) {
  const IconComponent = activity.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative pl-12"
    >
      {index < totalActivities - 1 && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600" />
      )}
      <div className="flex items-start gap-4">
        <div className={`absolute left-0 w-12 h-12 bg-gradient-to-br ${getActivityColor(activity.type)} rounded-xl flex items-center justify-center shadow-lg z-10`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
          {activity.image && (
            <img src={activity.image} alt={activity.title} className="w-full h-32 object-cover" />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
                    {activity.type}
                  </span>
                  {activity.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{activity.rating}</span>
                    </div>
                  )}
                  {activity.price && (
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{activity.price}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {activity.title}
                </h3>
                {activity.address && (
                  <div className="flex items-start gap-1 mb-2">
                    <MapPinned className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.address}</p>
                  </div>
                )}
                {activity.details && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {activity.details}
                  </p>
                )}
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{activity.time || 'Time not set'}</span>
                  {activity.duration && (
                    <span className="text-gray-400">• {activity.duration}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(dayId, activity);
                  }}
                  className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(dayId, activity.id);
                  }}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ActivityItem;
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import ActivityItem from './ActivityItem';

function DaySchedule({ 
  day, 
  index, 
  activityTypes, 
  getActivityColor, 
  onToggleDay, 
  onOpenSearch, 
  onOpenManualAdd, 
  onEditActivity, 
  onDeleteActivity 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
    >
      <div
        className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 cursor-pointer"
        onClick={() => onToggleDay(day.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-600">{day.dayNumber}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Day {day.dayNumber}</h2>
              <p className="text-white/90">{day.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
              {day.activities.length} activities
            </span>
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
            {day.activities.length === 0 ? (
              <div className="p-12">
                <div className="text-center mb-6">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No activities planned yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Search and add activities from Amadeus</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {activityTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => onOpenSearch(day.id, type)}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all group"
                      >
                        <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${type.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Add {type.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Search via Amadeus
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {day.activities.map((activity, actIndex) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      index={actIndex}
                      totalActivities={day.activities.length}
                      getActivityColor={getActivityColor}
                      onEdit={onEditActivity}
                      onDelete={onDeleteActivity}
                      dayId={day.id}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {activityTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => onOpenSearch(day.id, type)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        <IconComponent className="w-4 h-4" />
                        Add {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DaySchedule;
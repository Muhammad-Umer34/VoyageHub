import { motion } from 'framer-motion';
import { X } from 'lucide-react';

function ActivityFormModal({ 
  isOpen, 
  onClose, 
  activityForm, 
  setActivityForm, 
  isEditing, 
  onSave, 
  activityTypes 
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Activity' : 'Add Activity Details'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {activityForm.image && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img src={activityForm.image} alt={activityForm.title} className="w-full h-48 object-cover" />
          </div>
        )}
        <div className="space-y-4">
          {/* Activity Type Selector */}
          {!activityForm.image && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Activity Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {activityTypes.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setActivityForm({ ...activityForm, type: type.value, icon: type.icon })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        activityForm.type === type.value
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-br ${type.color} rounded-lg flex items-center justify-center`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {type.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={activityForm.title}
              onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
              placeholder="e.g., Visit Eiffel Tower"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
            />
          </div>
          {/* Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={activityForm.time}
                onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Duration
              </label>
              <input
                type="text"
                value={activityForm.duration}
                onChange={(e) => setActivityForm({ ...activityForm, duration: e.target.value })}
                placeholder="e.g., 2h 30m"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
          </div>
          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={activityForm.address}
              onChange={(e) => setActivityForm({ ...activityForm, address: e.target.value })}
              placeholder="Enter address"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
            />
          </div>
          {/* Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Details
            </label>
            <textarea
              value={activityForm.details}
              onChange={(e) => setActivityForm({ ...activityForm, details: e.target.value })}
              placeholder="Add notes or additional information..."
              rows="3"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white resize-none"
            />
          </div>
          {/* Price and Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Price
              </label>
              <input
                type="text"
                value={activityForm.price}
                onChange={(e) => setActivityForm({ ...activityForm, price: e.target.value })}
                placeholder="e.g., $$$"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <input
                type="text"
                value={activityForm.rating}
                onChange={(e) => setActivityForm({ ...activityForm, rating: e.target.value })}
                placeholder="e.g., 4.5"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!activityForm.title || !activityForm.time}
            className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            {isEditing ? 'Update' : 'Add to Day'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ActivityFormModal;
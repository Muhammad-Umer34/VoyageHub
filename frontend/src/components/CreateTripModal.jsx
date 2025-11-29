import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

const CreateTripModal = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  tripName, 
  setTripName, 
  destination, 
  setDestination, 
  description, 
  setDescription, 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate, 
  errors, 
  setErrors,
  today 
}) => {
  const [localErrors, setLocalErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!tripName.trim()) {
      newErrors.tripName = 'Please enter a trip name';
    }

    if (!destination.trim()) {
      newErrors.destination = 'Please enter a destination';
    }

    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    }

    if (!endDate) {
      newErrors.endDate = 'Please select an end date';
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field === 'tripName') setTripName(value);
    if (field === 'destination') setDestination(value);
    if (field === 'description') setDescription(value);
    if (field === 'startDate') setStartDate(value);
    if (field === 'endDate') setEndDate(value);

    setLocalErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCreate = () => {
    if (!validateForm()) {
      return;
    }

    onCreate();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Trip
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Trip Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => handleInputChange('tripName', e.target.value)}
                placeholder="e.g., Summer in Europe"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
              />
              {localErrors.tripName && (
                <p className="text-red-500 text-sm mt-1">{localErrors.tripName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Destination <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="e.g., Paris, France"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
              />
              {localErrors.destination && (
                <p className="text-red-500 text-sm mt-1">{localErrors.destination}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your trip plans..."
                rows="4"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white resize-none"
              />
              {localErrors.description && (
                <p className="text-red-500 text-sm mt-1">{localErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={today}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                />
                {localErrors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{localErrors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={startDate || today}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                />
                {localErrors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{localErrors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                onClose();
                setLocalErrors({});
              }}
              className="flex-1 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate}
              className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Create Trip
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateTripModal;
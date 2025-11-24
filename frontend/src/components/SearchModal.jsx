import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Star } from 'lucide-react';

function SearchModal({ 
  isOpen, 
  onClose, 
  selectedActivityType, 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  isSearching, 
  onSearch, 
  onAddFromSearch, 
  onManualAdd, 
  tripData,
  selectedDay 
}) {
  if (!isOpen || !selectedActivityType) return null;

  const IconComponent = selectedActivityType.icon;

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
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[80vh] shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${selectedActivityType.color} rounded-lg flex items-center justify-center`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Search {selectedActivityType.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Powered by Amadeus API
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              placeholder={`Search ${selectedActivityType.label.toLowerCase()} in ${tripData.destination}...`}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
            />
            <button
              onClick={onSearch}
              disabled={isSearching}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {searchResults.length === 0 && !isSearching && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No results yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Click search to find activities via Amadeus API</p>
              <button
                onClick={() => {
                  onClose();
                  onManualAdd(selectedDay, selectedActivityType.value);
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
              >
                Or Add Manually
              </button>
            </div>
          )}
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => onAddFromSearch(result)}
              >
                <img src={result.image} alt={result.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{result.name}</h4>
                    {result.rating && (
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{result.rating}</span>
                      </div>
                    )}
                  </div>
                  {result.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">{result.address}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">{result.price}</span>
                    <button className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg font-semibold transition-colors">
                      Select
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SearchModal;
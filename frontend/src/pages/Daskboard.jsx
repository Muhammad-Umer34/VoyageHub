import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [showMap, setShowMap] = useState(true);

  return (
    <div className="h-full flex">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#16181d]">
        <div className="max-w-3xl mx-auto p-6">
          {/* Empty State - Create First Trip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto mb-4 opacity-20">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#14b8a6',stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
                    </linearGradient>
                  </defs>
                  {/* Eiffel Tower */}
                  <path d="M100 40 L90 160 L110 160 Z" fill="url(#grad)" />
                  <rect x="85" y="90" width="30" height="3" fill="url(#grad)" />
                  <rect x="88" y="120" width="24" height="3" fill="url(#grad)" />
                  {/* Big Ben */}
                  <rect x="135" y="70" width="10" height="90" fill="url(#grad)" opacity="0.7" />
                  <circle cx="140" cy="65" r="6" fill="url(#grad)" />
                  {/* Windmill */}
                  <circle cx="60" cy="110" r="4" fill="url(#grad)" opacity="0.6" />
                  <line x1="60" y1="110" x2="52" y2="95" stroke="url(#grad)" strokeWidth="2" />
                  <line x1="60" y1="110" x2="68" y2="95" stroke="url(#grad)" strokeWidth="2" />
                  <line x1="60" y1="110" x2="52" y2="125" stroke="url(#grad)" strokeWidth="2" />
                  <line x1="60" y1="110" x2="68" y2="125" stroke="url(#grad)" strokeWidth="2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Create your first trip
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
                Planning is where the adventure starts. Create your first trip and start yours! 🚀
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Create first trip
            </motion.button>
          </motion.div>

          {/* Save Places Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center py-12 border-t border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Save all your places & articles
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4 text-sm">
              Collect all your favorite articles, places to sleep, activities and restaurants in one place.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 text-gray-900 dark:text-white rounded-lg font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              Add place or article
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Map Area - ANIMATED GLOBE */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ x: 600, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 600, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="hidden lg:block w-1/2 xl:w-2/5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {/* Hide Map Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMap(false)}
              className="absolute top-4 right-4 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all z-10 flex items-center gap-2"
            >
              <span>↗</span> Hide map
            </motion.button>

            {/* Animated Rotating Earth */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="relative w-80 h-80"
              >
                <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <radialGradient id="earthGradient" cx="40%" cy="40%">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e40af" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Earth Globe */}
                  <circle cx="200" cy="200" r="150" fill="url(#earthGradient)" filter="url(#glow)" />
                  
                  {/* Continents - Simplified */}
                  <g fill="#10b981" opacity="0.8">
                    {/* North America */}
                    <path d="M 100 120 Q 80 100 90 80 Q 110 70 130 90 Q 140 110 130 130 Q 110 140 100 120 Z" />
                    
                    {/* South America */}
                    <path d="M 120 180 Q 110 160 120 140 L 140 160 Q 145 190 130 210 Q 120 200 120 180 Z" />
                    
                    {/* Europe */}
                    <path d="M 200 100 L 220 95 L 230 110 L 215 120 L 200 115 Z" />
                    
                    {/* Africa */}
                    <path d="M 210 140 Q 200 130 210 120 L 240 130 Q 250 170 230 200 Q 210 190 210 140 Z" />
                    
                    {/* Asia */}
                    <path d="M 250 90 Q 270 80 290 95 Q 300 120 280 140 Q 260 135 250 120 Z" />
                    
                    {/* Australia */}
                    <path d="M 280 220 Q 290 210 300 220 Q 295 240 280 235 Z" />
                  </g>
                  
                  {/* Grid Lines */}
                  <g stroke="white" strokeWidth="0.5" opacity="0.2" fill="none">
                    <circle cx="200" cy="200" r="150" />
                    <circle cx="200" cy="200" r="120" />
                    <circle cx="200" cy="200" r="90" />
                    <circle cx="200" cy="200" r="60" />
                    <line x1="50" y1="200" x2="350" y2="200" />
                    <line x1="200" y1="50" x2="200" y2="350" />
                    <ellipse cx="200" cy="200" rx="150" ry="75" />
                    <ellipse cx="200" cy="200" rx="150" ry="50" />
                  </g>
                  
                  {/* Shiny highlight */}
                  <ellipse cx="170" cy="150" rx="40" ry="50" fill="white" opacity="0.15" />
                </svg>
              </motion.div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show Map Button (when hidden) */}
      {!showMap && (
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMap(true)}
          className="fixed bottom-6 right-6 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-semibold shadow-2xl z-50 flex items-center gap-2"
        >
          <span>🗺️</span> Show map
        </motion.button>
      )}

      {/* Create Trip Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Trip
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Trip Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Summer in Europe"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Paris, France"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Trip created! 🎉');
                    setShowModal(false);
                  }}
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all text-sm"
                >
                  Create Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
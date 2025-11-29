import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const EmptyState = ({ onCreateTrip }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="mb-8">
          <div className="w-40 h-40 mx-auto mb-6 opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#14b8a6',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
                </linearGradient>
              </defs>
              <path d="M100 40 L90 160 L110 160 Z" fill="url(#grad)" />
              <rect x="85" y="90" width="30" height="3" fill="url(#grad)" />
              <rect x="88" y="120" width="24" height="3" fill="url(#grad)" />
              <rect x="135" y="70" width="10" height="90" fill="url(#grad)" opacity="0.7" />
              <circle cx="140" cy="65" r="6" fill="url(#grad)" />
              <circle cx="60" cy="110" r="4" fill="url(#grad)" opacity="0.6" />
              <line x1="60" y1="110" x2="52" y2="95" stroke="url(#grad)" strokeWidth="2" />
              <line x1="60" y1="110" x2="68" y2="95" stroke="url(#grad)" strokeWidth="2" />
              <line x1="60" y1="110" x2="52" y2="125" stroke="url(#grad)" strokeWidth="2" />
              <line x1="60" y1="110" x2="68" y2="125" stroke="url(#grad)" strokeWidth="2" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Create your first trip
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-base">
            Planning is where the adventure starts. Create your first trip and start yours! 🚀
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateTrip}
          className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
        >
          Create first trip
        </motion.button>
      </motion.div>

      {/* Save Places Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center py-16 border-t border-gray-200 dark:border-gray-800"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Save all your places & articles
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 text-base">
          Collect all your favorite articles, places to sleep, activities and restaurants in one place.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 text-gray-900 dark:text-white rounded-lg font-semibold transition-all"
        >
          <Plus className="w-5 h-5" />
          Add place or article
        </motion.button>
      </motion.div>
    </>
  );
};

export default EmptyState;
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Calendar, MapPin, UserPlus, X, Clock, Heart } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Invite_Collaborator } from '../api/auth';

const TripsList = () => {
  const itineraries = useSelector((state) => state.itinerary.itineraries);

  const SingleTripCard = ({ itinerary, onShare }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [friendInput, setFriendInput] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const userName = `User ${itinerary.owner_id}`;
    const userInitial = userName.charAt(0).toUpperCase();

    const nights = Math.ceil(
      (new Date(itinerary.end_date) - new Date(itinerary.start_date)) / (1000 * 60 * 60 * 24)
    );

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      });
    };

    const formatDateRange = () => {
      return `${formatDate(itinerary.start_date)} - ${formatDate(itinerary.end_date)}`;
    };

    const handleAddFriend = async () => {
      // Clear any previous errors
      setError('');
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(friendInput.trim())) {
        setError('Please enter a valid email address');
        return;
      }

      setIsLoading(true);

      try {
        console.log('Sending invite with:', {
          email: friendInput.trim(),
          itinerary_id: itinerary.id
        });

        const response = await Invite_Collaborator({
          email: friendInput.trim(),
          itinerary_id: itinerary.id,
        });

        console.log('Invite response:', response);
        
        // Success - close modal and reset
        setFriendInput('');
        setShowAddFriendModal(false);
        setError('');
        
        // Optional: Show success message to user
        alert(`Invitation sent successfully to ${friendInput.trim()}!`);
      } catch (error) {
        console.error('Error inviting collaborator:', error);
        setError(error.response?.data?.message || 'Failed to send invitation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl overflow-hidden w-full group transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Landscape Layout - Image on Left, Content on Right */}
          <div className="flex flex-col sm:flex-row h-full">
            {/* Image Section - Takes 40% width on desktop */}
            <div className="relative sm:w-2/5 h-48 sm:h-auto overflow-hidden">
              <img
                src={itinerary.cover_image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
                alt={itinerary.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
              
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
                className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg transition-colors z-10"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    isFavorite 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} 
                />
              </motion.button>

              {/* Duration Badge */}
              <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {nights} {nights === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            </div>

            {/* Content Section - Takes 60% width on desktop */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              {/* Header with User Info */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {userInitial}
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {userName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddFriendModal(true);
                        setError(''); // Clear errors when opening modal
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Invite collaborator"
                    >
                      <UserPlus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare();
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Share trip"
                    >
                      <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Title and Destination */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {itinerary.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {itinerary.destination}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {itinerary.description}
                </p>
              </div>

              {/* Footer with Date */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatDateRange()}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  View Trip
                </motion.button>
              </div>
            </div>
          </div>

          {/* Hover Overlay Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-teal-500/5 pointer-events-none"
          />
        </motion.div>

        {/* Add Friend Modal */}
        <AnimatePresence>
          {showAddFriendModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddFriendModal(false);
                setError('');
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Invite Friend
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Share "{itinerary.title}" with a friend
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddFriendModal(false);
                      setError('');
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Friend's Email
                    </label>
                    <input
                      type="email"
                      value={friendInput}
                      onChange={(e) => {
                        setFriendInput(e.target.value);
                        setError(''); // Clear error on input change
                      }}
                      placeholder="friend@example.com"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white"
                      autoFocus
                      disabled={isLoading}
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Display itinerary ID for reference */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    Itinerary ID: {itinerary.id}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddFriendModal(false);
                      setFriendInput('');
                      setError('');
                    }}
                    disabled={isLoading}
                    className="flex-1 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFriend}
                    disabled={!friendInput.trim() || isLoading}
                    className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  if (!itineraries || itineraries.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-5">
        {itineraries.map((itinerary) => (
          <SingleTripCard
            key={itinerary.id}
            itinerary={itinerary}
            onShare={() => {
              console.log('Share trip:', itinerary.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TripsList;
const DiscoverView = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="w-48 h-48 mx-auto mb-6">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-500/30 flex items-center justify-center backdrop-blur-sm animate-pulse">
            <Compass className="w-24 h-24 text-teal-500/50" />
          </div>
        </div>
        <div className="max-w-md mx-auto mb-6">
          <input
            type="text"
            placeholder="Search destinations.."
            className="w-full px-6 py-4 bg-white dark:bg-gray-800 border-0 rounded-full shadow-lg focus:ring-2 focus:ring-teal-500 transition-all text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RestaurantCard from "../components/ResturantCard";


export default function Restaurant() {
  const location = useLocation();
  const { latitude, longitude, destinationName, country } = location.state || {};

  const API_KEY = "f585e0fb666142df93df8439bfba9423"; 
  const radius = 5000; 

  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${longitude},${latitude},${radius}&limit=50&apiKey=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data?.features) {
        setAllRestaurants(data.features);
      } else {
        setError("No restaurants found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch restaurants.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchRestaurants();
    }
  }, [latitude, longitude]);

  return (
    <div className="min-h-screen bg-white">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#13C892] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#13C892] opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-6 md:px-12 lg:px-16">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-12 bg-[#13C892] rounded-full"></div>
            <div>
              <p className="text-sm font-semibold text-[#13C892] uppercase tracking-wide mb-1">
                Discover Dining
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Restaurants near <span className="text-[#13C892]">{destinationName || "your location"}</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-8 flex-wrap">
            {country && (
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <svg className="w-5 h-5 text-[#13C892]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-sm font-medium text-gray-600">Country:</span>
                <span className="px-3 py-1 bg-[#13C892] text-white rounded-lg font-semibold text-sm">
                  {country}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl">
              <svg className="w-5 h-5 text-[#13C892]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              <span className="text-sm font-medium text-gray-600">Radius:</span>
              <span className="px-3 py-1 bg-[#13C892] text-white rounded-lg font-semibold text-sm">
                5 km
              </span>
            </div>
            
            {!loading && !error && allRestaurants.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-sm font-semibold text-gray-900">
                  {allRestaurants.length} {allRestaurants.length === 1 ? 'Restaurant' : 'Restaurants'} Found
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#13C892] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-lg font-semibold text-gray-700">
              Finding the best restaurants for you...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border-2 border-red-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="h-2 bg-red-500"></div>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Restaurants */}
        {!loading && !error && (
          <>
            {allRestaurants.length === 0 ? (
              <div className="text-center py-24">
                <div className="max-w-md mx-auto bg-gray-50 rounded-3xl border-2 border-gray-200 p-12">
                  <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Restaurants Found</h3>
                  <p className="text-gray-600">Try searching in a different area or increase the search radius.</p>
                </div>
              </div>
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {allRestaurants.slice(0, visibleCount).map((restaurant) => (
                  <RestaurantCard key={restaurant.properties.place_id} restaurant={restaurant} />
                ))}
              </section>
            )}

            {/* Load More */}
            {visibleCount < allRestaurants.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-[#13C892] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#10b67f] transition-all duration-300 transform hover:scale-105"
                >
                  <span>Load More Restaurants</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
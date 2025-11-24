import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ActivityCard from "../components/ActivityCard";
import { MapPin, Search } from 'lucide-react';

const ACCENT_COLOR = "#13C892";

export default function Activity() {
  const location = useLocation();
  const { latitude, longitude, destinationName, activityType } = location.state || {};
  const CLIENT_ID = "E1xbQwZTAZEfkZxmFOYYvQQnGmTHGqeg";
  const CLIENT_SECRET = "bbr626Xv7hxJErlw";
  const radius = 10;

  const [allActivities, setAllActivities] = useState([]);
  const [visibleActivities, setVisibleActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);

  const getAccessToken = async () => {
    const url = "https://test.api.amadeus.com/v1/security/oauth2/token";
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await response.json();
    return data.access_token;
  };

  const fetchActivities = async () => {
    try {
      const token = await getAccessToken();
      const url = `https://test.api.amadeus.com/v1/shopping/activities?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result?.data) {
        setAllActivities(result.data);
        setVisibleActivities(result.data.slice(0, 20));
      } else {
        setError("No activities found for this location.");
      }
    } catch (err) {
      setError("Something went wrong while fetching activities.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    const newLimit = limit + 20;
    setLimit(newLimit);
    setVisibleActivities(allActivities.slice(0, newLimit));
    setLoadingMore(false);
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchActivities();
    }
  }, [latitude, longitude]);

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 text-center lg:text-left">
        <div
          className="bg-white rounded-3xl p-8 shadow-md border border-gray-200"
          style={{ boxShadow: `0 4px 12px rgb(19 200 146 / 0.15)` }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
          >
            Discover activities near{' '}
            <span
              className="text-transparent bg-clip-text font-extrabold"
              style={{
                backgroundImage: `linear-gradient(90deg, ${ACCENT_COLOR} 0%, #0FAE7D 100%)`,
              }}
            >
              {destinationName || "your location"}
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center text-gray-700">
            <p className="text-lg font-medium">
              Activity Type:{' '}
              <span
                className="inline-flex items-center px-4 py-2 rounded-full font-semibold shadow-sm text-sm"
                style={{
                  backgroundColor: "#D7F4EB",
                  color: ACCENT_COLOR,
                }}
              >
                {activityType || "All"}
              </span>
            </p>
            <div className="flex items-center text-sm" style={{ color: "#4B5563" }}>
              <MapPin className="w-4 h-4 mr-1" stroke={ACCENT_COLOR} />
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </div>
          </div>
        </div>
      </header>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <div className="relative">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin border-t-transparent"
              style={{
                borderColor: "#D1F2E6",
                borderTopColor: ACCENT_COLOR,
              }}
            ></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping"
              style={{ borderColor: "#D1F2E6" }}
            ></div>
          </div>
          <p className="text-lg text-gray-600">Loading activities...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow"
          style={{ color: "#B00020" }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8" stroke="#B00020" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
          <p className="mb-6">{error}</p>
          <button
            onClick={fetchActivities}
            className="inline-flex items-center px-6 py-3 bg-[#13C892] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:bg-[#10a67a]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Activities Grid */}
      {!loading && !error && (
        <section className="max-w-7xl mx-auto">
          {visibleActivities.length === 0 ? (
            <div className="text-center py-20 space-y-4 text-gray-600">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12" stroke="#9CA3AF" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">
                No activities found
              </h3>
              <p className="max-w-md mx-auto">
                It looks like there aren't any activities available in this area right now. Try searching in a different location!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {visibleActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {visibleActivities.length < allActivities.length && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center px-8 py-4 bg-[#13C892] text-white font-semibold rounded-2xl shadow hover:shadow-lg transition-all duration-300 hover:bg-[#10a67a] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading more...
                  </>
                ) : (
                  <>
                    Load More Activities
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Footer Gradient Accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top, #ffffff, transparent)`,
        }}
      />
    </div>
  );
}

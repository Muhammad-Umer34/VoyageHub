import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import ActivityCard from "../components/ActivityCard";
import { MapPin, Search } from "lucide-react";
import { Post_Sightseeing_Activity } from "../api/auth";
import { useNavigate } from "react-router-dom";
const ACCENT_COLOR = "#13C892";
const ITEMS_PER_PAGE = 20;

export default function Activity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { latitude, longitude, destinationName, activityType, dayNumber, date } =
    location.state || {};
  const { id } = useParams();
  const itinerary_id = id;
const params = useParams();
  
  const CLIENT_ID = "E1xbQwZTAZEfkZxmFOYYvQQnGmTHGqeg";
  const CLIENT_SECRET = "bbr626Xv7hxJErlw";
  const radius = 10;

  const [selectedActivities, setSelectedActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const toggleSelect = (activity) => {
    setSelectedActivities((prev) => {
      const exists = prev.find((a) => a.id === activity.id);
      if (exists) {
        return prev.filter((a) => a.id !== activity.id);
      }
      return [...prev, activity];
    });
  };

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSelectedActivities = async () => {
    if (selectedActivities.length === 0) {
      alert("Please select at least one activity");
      return;
    }
    
    if (!itinerary_id || !dayNumber || !date) {
      alert("Missing required information: itinerary_id, dayNumber, or date");
      return;
    }

    setSaving(true);

    try {
      const promises = selectedActivities.map(async (activity) => {
        const locationName = destinationName || "Unknown Location";
        
        const entryFee = activity.price ? parseFloat(activity.price.amount) : null;
      
        const coverImage = activity.pictures && activity.pictures.length > 0 
          ? activity.pictures[0] 
          : null;
        
        const description = stripHtml(activity.description) || null;
      
        const time = activity.minimumDuration || null;

        const activityData = {
          title: activity.name,
          location_name: locationName,
          entry_fee: entryFee,
          cover_image: coverImage,
          time: time,
          description: description,
          type: "sightseeing",
          itinerary_id: parseInt(itinerary_id),
          day_number: parseInt(dayNumber),
          date: date 
        };

        const response = await Post_Sightseeing_Activity(activityData);
        return response;
      });

      const results = await Promise.all(promises);
      setSelectedActivities([]);
      navigate(-1);
      
    } catch (error) {
      console.error("Error saving activities:", error);
      alert("Failed to save activities. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
      setLoading(true);

      const token = await getAccessToken();
      const categoryMap = {
        meal: "restaurant",
        sightseeing: "sightseeing",
        accommodation: "spa",
        transport: "tour",
      };

      let url = `https://test.api.amadeus.com/v1/shopping/activities?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
      
      if (activityType && categoryMap[activityType]) {
        url += `&categories=${categoryMap[activityType]}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();


      if (result?.data && result.data.length > 0) {
        
        setAllActivities(result.data);
        setDisplayedActivities(result.data.slice(0, ITEMS_PER_PAGE));
        setError("");
      } else {
        setError("No activities found for this location.");
        setAllActivities([]);
        setDisplayedActivities([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong while fetching activities.");
      setAllActivities([]);
      setDisplayedActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * ITEMS_PER_PAGE;
    
    setDisplayedActivities(allActivities.slice(startIndex, endIndex));
    setCurrentPage(nextPage);
  };

  const hasMore = displayedActivities.length < allActivities.length;

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentPage(1);
      setAllActivities([]);
      setDisplayedActivities([]);
      setError("");
      fetchActivities();
    }
  }, [latitude, longitude, activityType]);

  return (
    <div className="relative min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 text-center lg:text-left">
        <div
          className="bg-white rounded-3xl p-8 shadow-md border border-gray-200"
          style={{ boxShadow: `0 4px 12px rgb(19 200 146 / 0.15)` }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Discover activities near{" "}
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
              Activity Type:{" "}
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
            <div
              className="flex items-center text-sm"
              style={{ color: "#4B5563" }}
            >
              <MapPin className="w-4 h-4 mr-1 text-[#13C892]" />
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </div>
            {dayNumber && (
              <div className="text-sm font-medium text-gray-600">
                Day {dayNumber} • {date}
              </div>
            )}
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
            <Search className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Oops! Something went wrong
          </h3>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchActivities();
            }}
            className="inline-flex items-center px-6 py-3 bg-[#13C892] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:bg-[#10a67a]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Activities Grid */}
      {!loading && !error && (
        <section className="max-w-7xl mx-auto">
          {displayedActivities.length === 0 ? (
            <div className="text-center py-20 space-y-4 text-gray-600">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">
                No activities found
              </h3>
              <p className="max-w-md mx-auto">
                It looks like there aren't any activities available in this area
                right now. Try searching in a different location!
              </p>
            </div>
          ) : (
            <>
              {/* Activities Count Info */}
              <div className="mb-6 text-center">
                <p className="text-gray-600 text-sm">
                  Showing <span className="font-semibold text-[#13C892]">{displayedActivities.length}</span> of{" "}
                  <span className="font-semibold text-gray-900">{allActivities.length}</span> activities
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {displayedActivities.map((activity, index) => (
                  <ActivityCard
                    key={`${activity.id}-${index}`}
                    activity={activity}
                    toggleSelect={toggleSelect}
                    isSelected={selectedActivities.some(
                      (a) => a.id === activity.id
                    )}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center">
                  <button
                    onClick={loadMore}
                    className="inline-flex items-center px-8 py-4 bg-[#13C892] text-white font-semibold rounded-2xl shadow hover:shadow-lg transition-all duration-300 hover:bg-[#10a67a] transform hover:scale-105"
                  >
                    Load More Activities
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                </div>
              )}

              {/* No More Activities Message */}
              {!hasMore && displayedActivities.length > 0 && (
                <div className="text-center py-8 text-gray-600">
                  <p className="text-lg font-medium">
                    🎉 You've reached the end! No more activities to load.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Floating Save Button */}
      {selectedActivities.length > 0 && (
        <button
          onClick={handleSelectedActivities}
          disabled={saving}
          className="fixed bottom-8 right-8 bg-[#13C892] text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:bg-[#10a67a] transition-all hover:scale-105 z-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            `Save (${selectedActivities.length})`
          )}
        </button>
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
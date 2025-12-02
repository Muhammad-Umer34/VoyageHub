import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import HotelCard from "../components/HotelCard";
import { Post_Accommodation_Activity } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Hotel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const {
    latitude,
    longitude,
    destinationName,
    country,
    activityType,
    dayNumber,
    date
  } = location.state || {};

  const CLIENT_ID = "E1xbQwZTAZEfkZxmFOYYvQQnGmTHGqeg";
  const CLIENT_SECRET = "bbr626Xv7hxJErlw";

  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // get access token
  const getAccessToken = async () => {
    const response = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      }
    );
    const data = await response.json();
    return data.access_token;
  };

  // fetch hotels
  const fetchHotels = async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getAccessToken();

      if (!latitude || !longitude) {
        setError("Location coordinates missing.");
        setLoading(false);
        return;
      }

      const url = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=${latitude}&longitude=${longitude}&radius=10`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!result?.data) {
        setError("No hotels found for this location.");
        setLoading(false);
        return;
      }

      setAllHotels(result.data);
    } catch (err) {
      setError("Something went wrong while fetching hotels.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => setVisibleCount((p) => p + 20);

  // SAVE ACTIVITY
  const handleSave = async () => {
    if (!selectedHotel) return;

    const hotelName = selectedHotel.name || "Hotel";

    const fullAddress = [
      selectedHotel.address?.lines?.[0],
      selectedHotel.address?.cityName,
      selectedHotel.address?.stateCode,
      selectedHotel.address?.postalCode,
      selectedHotel.address?.countryCode,
    ]
      .filter(Boolean)
      .join(", ");

    const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
      hotelName
    )}`;

    const payload = {
      title: `Stay at ${hotelName}`,
      type: "accommodation",
      cover_image:
        "https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&auto=format&fit=crop&q=60",
      description: `Accommodation at ${hotelName}`,
      hotel_name: hotelName,
      address: fullAddress,
      booking_link: bookingUrl,
      itinerary_id: Number(id),
      day_number: Number(dayNumber),
      date: date,
    };

    console.log("FINAL PAYLOAD →", payload);

    await Post_Accommodation_Activity(payload);
    navigate(`/trips/${id}`);
  };

  useEffect(() => {
    if (latitude && longitude) fetchHotels();
  }, [latitude, longitude]);

  return (
    <div className="min-h-screen bg-white">
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
                Find Your Stay
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Hotels near{" "}
                <span className="text-[#13C892]">
                  {destinationName || "your location"}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 flex-wrap">
            {country && (
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-sm font-medium text-gray-600">
                  Country:
                </span>
                <span className="px-3 py-1 bg-[#13C892] text-white rounded-lg font-semibold text-sm">
                  {country}
                </span>
              </div>
            )}

            {!loading && !error && allHotels.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-sm font-semibold text-gray-900">
                  {allHotels.length} Hotels Found
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
              Finding the best hotels for you...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border-2 border-red-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="h-2 bg-red-500"></div>
              <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hotels */}
        {!loading && !error && (
          <>
            {allHotels.length === 0 ? (
              <div className="text-center py-24">
                <div className="max-w-md mx-auto bg-gray-50 rounded-3xl border-2 border-gray-200 p-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Hotels Found
                  </h3>
                  <p className="text-gray-600">
                    Try searching in a different area or increase the search
                    radius.
                  </p>
                </div>
              </div>
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {allHotels
                  .slice(0, visibleCount)
                  .map((hotel) => (
                    <HotelCard
                      key={hotel.hotelId}
                      hotel={hotel}
                      selected={selectedHotel?.hotelId === hotel.hotelId}
                      onSelect={setSelectedHotel}
                    />
                  ))}
              </section>
            )}

            {/* Load More */}
            {visibleCount < allHotels.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  className="px-8 py-4 bg-[#13C892] text-white font-bold rounded-xl shadow-lg hover:bg-[#10b67f] transition-all"
                >
                  Load More Hotels
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedHotel && (
        <button
          onClick={handleSave}
          className="fixed bottom-8 right-8 bg-[#13C892] text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:bg-[#10a67a] transition-all hover:scale-105 z-50"
        >
          Save (1)
        </button>
      )}
    </div>
  );
}

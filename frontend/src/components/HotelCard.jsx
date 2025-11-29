import { MapPin, Navigation, Building2, ExternalLink } from "lucide-react";
import { useEffect } from "react";

export default function HotelCard({ hotel, selected, onSelect }) {
  const hotelName = hotel.name || "Hotel";
  const city = hotel.address?.cityName || "";
  const country = hotel.address?.countryCode || "";
  const fullAddress = [
    hotel.address?.lines?.[0],
    hotel.address?.cityName,
    hotel.address?.stateCode,
    hotel.address?.postalCode,
    hotel.address?.countryCode
  ].filter(Boolean).join(", ");

  const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
    hotelName + " " + city
  )}`;
  useEffect(() => {
    console.log("Hotel Data: ", hotelName, fullAddress);
    console.log("Booking URL: ", bookingUrl);
  }, []);
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-row">
      {/* Hotel Icon/Image Section */}
      <div className="relative w-2/5 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Building2 className="w-10 h-10 text-[#13C892]" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {hotel.chainCode || "Hotel"}
            </p>
            {hotel.distance && (
              <div className="flex items-center justify-center gap-1.5 mt-3 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <Navigation className="w-3.5 h-3.5 text-[#13C892]" />
                <span className="text-xs font-semibold text-gray-900">
                  {hotel.distance.value} {hotel.distance.unit}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Title with Radio */}
        <div className="flex items-start gap-3 mb-3">
          <input
            type="radio"
            id={`hotel-${hotel.hotelId}`}
            checked={selected}
            onChange={() => onSelect(hotel)}
            className="mt-1 w-4 h-4 text-[#13C892] bg-gray-100 border-gray-300 focus:ring-[#13C892] focus:ring-2"
          />
          <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-[#13C892] transition-colors flex-1">
            {hotelName}
          </h3>
        </div>

        {/* Address */}
        {fullAddress && (
          <div className="flex items-start gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#13C892] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 leading-relaxed">
              {fullAddress}
            </p>
          </div>
        )}

        {/* Hotel Details */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {hotel.iataCode && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs font-medium text-gray-500">IATA:</span>
              <span className="text-xs font-bold text-gray-900">{hotel.iataCode}</span>
            </div>
          )}
          {hotel.hotelId && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs font-medium text-gray-500">ID:</span>
              <span className="text-xs font-bold text-gray-900">{hotel.hotelId}</span>
            </div>
          )}
        </div>

        {/* Book Button */}
        <div className="mt-auto">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-[#13C892] hover:bg-[#10b67f] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg items-center gap-2 group"
          >
            <span>Search on Booking.com</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
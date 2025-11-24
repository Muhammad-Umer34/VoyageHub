import { MapPin, Clock, DollarSign, ExternalLink, ImageOff } from "lucide-react";
import { useState } from "react";

export default function ActivityCard({ activity }) {
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const description = stripHtml(
    activity.description || activity.shortDescription || ""
  );

  // Determine if description is long enough to show toggle
  const isLongDescription = description.length > 150;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-50">
        {!imageError && activity.pictures && activity.pictures.length > 0 ? (
          <img
            src={activity.pictures[0]}
            alt={activity.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageOff className="w-14 h-14 text-gray-300" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Price */}
        {activity.price && (
          <div className="absolute top-4 right-4 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-100">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-[#13C892]" />
              <span className="text-xl font-bold text-gray-900">
                {activity.price.amount}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {activity.price.currencyCode}
              </span>
            </div>
          </div>
        )}

        {/* Duration */}
        {activity.minimumDuration && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#13C892]" />
              <span className="text-sm font-semibold text-gray-900">
                {activity.minimumDuration}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#13C892] transition-colors">
          {activity.name}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={`text-sm text-gray-600 leading-relaxed mb-4 transition-max-height duration-500 ease-in-out overflow-hidden ${
              showFullDescription ? "max-h-[1000px]" : "max-h-[4.5rem]" 
            }`}
          >
            {description}
          </p>
        )}

        {isLongDescription && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-[#13C892] text-sm font-semibold mb-4 hover:underline flex items-center gap-1"
          >
            {showFullDescription ? "Show less" : "Read more"}
            <svg
              className={`w-4 h-4 transition-transform ${showFullDescription ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-grow" />

        {/* Book Button */}
        {activity.bookingLink && (
          <a
            href={activity.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#13C892] hover:bg-[#10b67f] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Book Now</span>
            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        )}
      </div>
    </div>
  );
}

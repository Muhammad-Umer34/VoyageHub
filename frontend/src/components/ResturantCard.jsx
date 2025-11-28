import { MapPin, Phone, ExternalLink, Globe } from "lucide-react";
import { useState } from "react";
import ResturantImagePlaceHolder from "../assets/premium_photo-1723491285855-f1035c4c703c.jpg";

export default function RestaurantCard({ restaurant, isSelected, onToggleSelect }) {
  const [imageError, setImageError] = useState(false);
  
  const props = restaurant.properties || {};
  const name = props.name || "Restaurant";
  const address = props.formatted || props.address_line2 || "";
  const phone = props.contact?.phone || "";
  const website = props.website || props.datasource?.raw?.website || "";
  const cuisine = props.catering?.cuisine || "Restaurant";
  const categories = props.categories || [];
  const placeId = props.place_id;
  
  const location = [props.city, props.state_code, props.country_code?.toUpperCase()]
    .filter(Boolean)
    .join(", ");

  const handleCheckboxChange = (e) => {
    onToggleSelect(placeId, e.target.checked);
  };

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border-2 group overflow-hidden ${
      isSelected 
        ? 'border-blue-500 ring-4 ring-blue-100' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      
      {/* Checkbox - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <label className="cursor-pointer group/checkbox">
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={handleCheckboxChange}
            className="peer sr-only"
          />
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
            isSelected 
              ? 'bg-blue-600 border-blue-600 scale-110' 
              : 'bg-white/90 backdrop-blur-sm border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}>
            {isSelected && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
        </label>
      </div>

      {/* Selection Badge - Top Left (below checkbox) */}
      {isSelected && (
        <div className="absolute top-14 left-4 z-10">
          <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg animate-in slide-in-from-left-2 duration-200">
            Selected
          </div>
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {!imageError && restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isSelected ? 'scale-105 brightness-95' : 'group-hover:scale-110'
            }`}
          />
        ) : (
          <img
            src={ResturantImagePlaceHolder}
            alt={name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isSelected ? 'scale-105 brightness-95' : 'group-hover:scale-110'
            }`}
          />
        )}
        
        {/* Overlay when selected */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[0.5px]"></div>
        )}
        
        {/* Cuisine Badge */}
        {cuisine && (
          <div className="absolute top-4 right-4">
            <span className="inline-block px-4 py-1.5 bg-white/95 backdrop-blur-sm text-[#13C892] text-xs font-bold rounded-full shadow-md border border-gray-100">
              {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Restaurant Name */}
        <h3 className={`text-xl font-bold mb-2 leading-tight line-clamp-2 min-h-[3.5rem] transition-colors ${
          isSelected ? 'text-blue-600' : 'text-gray-900 group-hover:text-[#13C892]'
        }`}>
          {name}
        </h3>

        {/* Location */}
        {location && (
          <div className="flex items-start gap-2 mb-3 pb-3 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 line-clamp-2">
              {location}
            </p>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {phone && (
            <a 
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#13C892] transition-colors"
            >
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{phone}</span>
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group/btn ${
                isSelected
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-[#13C892] hover:bg-[#10b67f] text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Visit Website</span>
              <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          ) : (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group/btn ${
                isSelected
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-900 hover:bg-[#13C892] text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>View on Maps</span>
              <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
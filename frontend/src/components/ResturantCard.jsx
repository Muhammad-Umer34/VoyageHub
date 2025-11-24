import { MapPin, Phone, ExternalLink, Utensils, Globe } from "lucide-react";
import { useState } from "react";
import ResturantImagePlaceHolder from "../assets/premium_photo-1723491285855-f1035c4c703c.jpg";

export default function RestaurantCard({ restaurant }) {
  const [imageError, setImageError] = useState(false);
  
  const props = restaurant.properties || {};
  const name = props.name || "Restaurant";
  const address = props.formatted || props.address_line2 || "";
  const phone = props.contact?.phone || "";
  const website = props.website || props.datasource?.raw?.website || "";
  const cuisine = props.catering?.cuisine || "Restaurant";
  const categories = props.categories || [];
  
  const location = [props.city, props.state_code, props.country_code?.toUpperCase()]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {!imageError && props.image ? (
          <img
            src={props.image}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <img
            src={ResturantImagePlaceHolder}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
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
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-[#13C892] transition-colors">
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
              className="flex-1 bg-[#13C892] hover:bg-[#10b67f] text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Globe className="w-4 h-4" />
              <span>Visit Website</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          ) : (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-900 hover:bg-[#13C892] text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <MapPin className="w-4 h-4" />
              <span>View on Maps</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
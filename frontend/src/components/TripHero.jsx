import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';

function TripHero({ tripData, days }) {
  return (
    <div className="relative h-80 overflow-hidden">
      <img src={tripData.coverImage} alt={tripData.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-teal-400" />
            <span className="text-white/90 font-medium">{tripData.destination}</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">{tripData.title}</h1>
          <div className="flex items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{tripData.startDate} - {tripData.endDate}</span>
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              {days.length} Days
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TripHero;
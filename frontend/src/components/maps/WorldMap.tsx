import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sample water quality data for Indian regions
const waterQualityHotspots = [
  {
    id: 1,
    name: "Delhi",
    position: [28.6139, 77.2090],
    hmpi: 85.2,
    wqi: 45.3,
    status: "critical",
    parameters: {
      arsenic: 0.15,
      lead: 0.08,
      chromium: 0.12,
      mercury: 0.02,
      cadmium: 0.05
    },
    population: "32.9M",
    description: "High heavy metal contamination in groundwater"
  },
  {
    id: 2,
    name: "Kolkata",
    position: [22.5726, 88.3639],
    hmpi: 78.5,
    wqi: 52.1,
    status: "critical",
    parameters: {
      arsenic: 0.18,
      lead: 0.06,
      chromium: 0.08,
      mercury: 0.015,
      cadmium: 0.04
    },
    population: "14.9M",
    description: "Severe arsenic contamination in West Bengal"
  },
  {
    id: 3,
    name: "Mumbai",
    position: [19.0760, 72.8777],
    hmpi: 72.3,
    wqi: 58.7,
    status: "unsafe",
    parameters: {
      arsenic: 0.08,
      lead: 0.12,
      chromium: 0.15,
      mercury: 0.025,
      cadmium: 0.07
    },
    population: "20.4M",
    description: "Industrial pollution affecting water quality"
  },
  {
    id: 4,
    name: "Chennai",
    position: [13.0827, 80.2707],
    hmpi: 68.9,
    wqi: 62.4,
    status: "unsafe",
    parameters: {
      arsenic: 0.05,
      lead: 0.09,
      chromium: 0.11,
      mercury: 0.018,
      cadmium: 0.06
    },
    population: "10.9M",
    description: "Coastal contamination and industrial discharge"
  },
  {
    id: 5,
    name: "Bangalore",
    position: [12.9716, 77.5946],
    hmpi: 65.2,
    wqi: 65.8,
    status: "unsafe",
    parameters: {
      arsenic: 0.04,
      lead: 0.07,
      chromium: 0.09,
      mercury: 0.012,
      cadmium: 0.05
    },
    population: "12.3M",
    description: "IT hub with emerging water quality issues"
  },
  {
    id: 6,
    name: "Hyderabad",
    position: [17.3850, 78.4867],
    hmpi: 61.8,
    wqi: 68.2,
    status: "unsafe",
    parameters: {
      arsenic: 0.06,
      lead: 0.08,
      chromium: 0.07,
      mercury: 0.015,
      cadmium: 0.04
    },
    population: "9.7M",
    description: "Pharmaceutical industry impact on water"
  },
  {
    id: 7,
    name: "Pune",
    position: [18.5204, 73.8567],
    hmpi: 58.4,
    wqi: 71.5,
    status: "moderate",
    parameters: {
      arsenic: 0.03,
      lead: 0.05,
      chromium: 0.08,
      mercury: 0.01,
      cadmium: 0.03
    },
    population: "7.1M",
    description: "Automotive industry affecting local water sources"
  },
  {
    id: 8,
    name: "Ahmedabad",
    position: [23.0225, 72.5714],
    hmpi: 72.1,
    wqi: 55.9,
    status: "critical",
    parameters: {
      arsenic: 0.12,
      lead: 0.11,
      chromium: 0.13,
      mercury: 0.022,
      cadmium: 0.08
    },
    population: "8.1M",
    description: "Textile industry pollution in Gujarat"
  },
  {
    id: 9,
    name: "Kanpur",
    position: [26.4499, 80.3319],
    hmpi: 89.3,
    wqi: 38.7,
    status: "critical",
    parameters: {
      arsenic: 0.22,
      lead: 0.15,
      chromium: 0.18,
      mercury: 0.035,
      cadmium: 0.12
    },
    population: "3.2M",
    description: "Leather industry causing severe water contamination"
  },
  {
    id: 10,
    name: "Varanasi",
    position: [25.3176, 82.9739],
    hmpi: 76.8,
    wqi: 48.2,
    status: "critical",
    parameters: {
      arsenic: 0.16,
      lead: 0.09,
      chromium: 0.14,
      mercury: 0.028,
      cadmium: 0.09
    },
    population: "1.5M",
    description: "Ganga river pollution and industrial waste"
  }
];

// Custom icons for different water quality statuses
const createCustomIcon = (status: string) => {
  const colors = {
    safe: '#34C759',      // Green
    moderate: '#FFA500',  // Orange
    unsafe: '#FF6B35',    // Red-Orange
    critical: '#FF3B30'   // Red
  };

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${colors[status as keyof typeof colors]};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Get color based on HMPI value
const getHMPIColor = (hmpi: number) => {
  if (hmpi >= 80) return '#FF3B30'; // Critical - Red
  if (hmpi >= 60) return '#FF6B35'; // Unsafe - Red-Orange
  if (hmpi >= 40) return '#FFA500'; // Moderate - Orange
  return '#34C759'; // Safe - Green
};

interface WorldMapProps {
  className?: string;
  height?: string;
}

const WorldMap: React.FC<WorldMapProps> = ({ 
  className = "", 
  height = "500px" 
}) => {
  useEffect(() => {
    // Ensure Leaflet CSS is loaded
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Map Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
            India Water Quality Hotspots
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            Heavy Metal Pollution Index (HMPI) and Water Quality Index (WQI) across major Indian cities
          </p>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-gray-700">Status Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Safe (HMPI &lt; 40)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Moderate (40-60)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Unsafe (60-80)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="text-gray-600">Critical (&gt; 80)</span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <MapContainer
            center={[20.5937, 78.9629]} // Center on India
            zoom={5}
            style={{ height: '400px', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {waterQualityHotspots.map((hotspot) => (
              <CircleMarker
                key={hotspot.id}
                center={hotspot.position}
                radius={Math.max(8, Math.min(20, hotspot.hmpi / 4))} // Size based on HMPI
                pathOptions={{
                  fillColor: getHMPIColor(hotspot.hmpi),
                  color: 'white',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[300px]">
                    <h4 className="font-bold text-lg text-gray-800 mb-2">
                      {hotspot.name}
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">HMPI:</span>
                        <span className={`font-bold ${
                          hotspot.hmpi >= 80 ? 'text-red-600' :
                          hotspot.hmpi >= 60 ? 'text-orange-600' :
                          hotspot.hmpi >= 40 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {hotspot.hmpi}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">WQI:</span>
                        <span className={`font-bold ${
                          hotspot.wqi >= 80 ? 'text-green-600' :
                          hotspot.wqi >= 60 ? 'text-yellow-600' :
                          hotspot.wqi >= 40 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {hotspot.wqi}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Population:</span>
                        <span className="text-sm text-gray-800">{hotspot.population}</span>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-600 block mb-1">
                          Key Contaminants:
                        </span>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {Object.entries(hotspot.parameters).map(([param, value]) => (
                            <div key={param} className="flex justify-between">
                              <span className="capitalize text-gray-600">{param}:</span>
                              <span className="font-medium text-gray-800">{value} mg/L</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-700 italic">
                          {hotspot.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Map Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Data represents Heavy Metal Pollution Index (HMPI) and Water Quality Index (WQI)</span>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;

import React, { useState, useEffect, useRef } from 'react';

type Flight = {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  groundSpeed: number;
  status: string;
  aircraft?: string;
  airline?: string;
  estimatedArrival?: string;
  scheduledDeparture?: string;
  progress?: number;
};

type FlightRadarProps = {
  flights: Flight[];
  centerPosition?: [number, number]; // [lat, lng]
  range?: number; // range in km
  darkMode?: boolean;
  showLabels?: boolean;
  onFlightSelect?: (flight: Flight | null) => void;
  selectedFlight?: Flight | null;
};

const FlightRadar: React.FC<FlightRadarProps> = ({
  flights,
  centerPosition = [35.6892, 51.3890], // Tehran by default
  range = 200, // 200km by default
  darkMode = false,
  showLabels = true,
  onFlightSelect,
  selectedFlight
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredFlight, setHoveredFlight] = useState<Flight | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0); // In degrees, 0 = North up
  
  // Set canvas dimensions on component mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current?.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ 
          width: width,
          height: height < 400 ? 400 : height // Minimum height of 400px
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw radar and flights on canvas
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Calculate radius of the radar
    const radius = Math.min(dimensions.width, dimensions.height) / 2 * 0.9;
    
    // Calculate center point
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw radar background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    if (darkMode) {
      ctx.fillStyle = '#1f2937'; // Dark background
      ctx.strokeStyle = '#4b5563';
    } else {
      ctx.fillStyle = '#f1f5f9'; // Light background
      ctx.strokeStyle = '#94a3b8';
    }
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw radar concentric circles
    const numCircles = 4;
    for (let i = 1; i <= numCircles; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * (i / numCircles), 0, Math.PI * 2);
      ctx.strokeStyle = darkMode ? '#4b5563' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Label the range
      const rangeText = `${Math.round(range * (i / numCircles))} km`;
      ctx.font = '12px Arial';
      ctx.fillStyle = darkMode ? '#94a3b8' : '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(rangeText, centerX, centerY - radius * (i / numCircles) - 5);
    }
    
    // Draw compass directions (N, E, S, W) with consideration for rotation
    const directions = [
      { label: 'N', angle: 0 + rotation },
      { label: 'E', angle: 90 + rotation },
      { label: 'S', angle: 180 + rotation },
      { label: 'W', angle: 270 + rotation }
    ];
    
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    directions.forEach(dir => {
      const x = centerX + Math.sin(dir.angle * Math.PI / 180) * (radius + 20);
      const y = centerY - Math.cos(dir.angle * Math.PI / 180) * (radius + 20);
      
      ctx.fillStyle = darkMode ? '#f3f4f6' : '#1f2937';
      ctx.fillText(dir.label, x, y);
    });
    
    // Draw radar sweeping line
    const now = Date.now();
    const rotationSpeed = 3; // seconds per rotation
    const angle = ((now / (rotationSpeed * 1000)) % 1) * Math.PI * 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.sin(angle) * radius,
      centerY - Math.cos(angle) * radius
    );
    ctx.strokeStyle = darkMode ? 'rgba(74, 222, 128, 0.5)' : 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw radar sweep gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(74, 222, 128, 0)');
    gradient.addColorStop(1, darkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)');
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle - Math.PI / 6, angle);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw flights
    flights.forEach(flight => {
      // Calculate flight position relative to center position
      const latDiff = flight.latitude - centerPosition[0];
      const lngDiff = flight.longitude - centerPosition[1];
      
      // Convert to km (rough approximation)
      const kmPerLatDegree = 111; // Approximate km per degree of latitude
      const kmPerLngDegree = 111 * Math.cos(centerPosition[0] * Math.PI / 180); // Adjusts for longitude distortion
      
      const distanceX = lngDiff * kmPerLngDegree;
      const distanceY = latDiff * kmPerLatDegree;
      
      // Check if flight is within range
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      if (distance > range) return; // Skip if out of range
      
      // Calculate position on radar
      const x = centerX + (distanceX / range) * radius;
      const y = centerY - (distanceY / range) * radius; // Invert Y for canvas coordinates
      
      // Determine flight color based on status and altitude
      let flightColor;
      
      if (flight.status === 'Delayed') {
        flightColor = '#f59e0b'; // Amber for delayed
      } else if (flight.status === 'In Air') {
        if (flight.altitude < 10000) {
          flightColor = '#10b981'; // Emerald for low altitude
        } else if (flight.altitude < 30000) {
          flightColor = '#3b82f6'; // Blue for medium altitude
        } else {
          flightColor = '#8b5cf6'; // Purple for high altitude
        }
      } else if (flight.status === 'Landing') {
        flightColor = '#ef4444'; // Red for landing
      } else {
        flightColor = '#6b7280'; // Gray for other statuses
      }
      
      // Check if this flight is hovered or selected
      const isSelected = selectedFlight?.id === flight.id;
      const isHovered = hoveredFlight?.id === flight.id;
      
      // Draw flight icon (plane symbol rotated in the direction of heading)
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((flight.heading * Math.PI) / 180);
      
      // Draw the plane shape
      ctx.beginPath();
      
      // Plane size adjustment based on selection/hover state
      const planeSize = isSelected || isHovered ? 12 : 8;
      
      // Draw plane icon (simple triangle)
      ctx.moveTo(planeSize, 0);
      ctx.lineTo(-planeSize / 2, planeSize / 2);
      ctx.lineTo(-planeSize / 3, 0);
      ctx.lineTo(-planeSize / 2, -planeSize / 2);
      ctx.closePath();
      
      if (isSelected) {
        // Add highlight for selected flight
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = flightColor;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      } else if (isHovered) {
        // Add subtle highlight for hovered flight
        ctx.fillStyle = flightColor;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        
        // Add outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        // Normal flight
        ctx.fillStyle = flightColor;
        ctx.fill();
      }
      
      ctx.restore();
      
      // Draw labels if enabled
      if (showLabels && (isSelected || isHovered)) {
        const labelText = `${flight.flightNumber} - ${Math.round(flight.altitude / 100) * 100}ft`;
        
        ctx.font = isSelected ? 'bold 12px Arial' : '12px Arial';
        ctx.fillStyle = darkMode ? '#ffffff' : '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(labelText, x, y - 18);
        
        if (flight.airline) {
          ctx.font = '10px Arial';
          ctx.fillStyle = darkMode ? '#d1d5db' : '#6b7280';
          ctx.fillText(`${flight.origin} → ${flight.destination}`, x, y - 6);
        }
      }
    });
    
    // Request animation frame to keep the radar animation going
    requestAnimationFrame(() => {
      // This recursive call will update the radar sweep
      if (canvasRef.current) {
        const parentElement = canvasRef.current.parentElement;
        if (parentElement && parentElement.contains(canvasRef.current)) {
          // Only redraw if the component is still mounted
          draw();
        }
      }
    });
  }, [flights, dimensions, darkMode, showLabels, hoveredFlight, selectedFlight, centerPosition, range, rotation, scale]);
  
  // Handle mouse events for flight interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate center and radius
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) / 2 * 0.9;
    
    // Find if mouse is over any flight
    let foundFlight = null;
    
    for (const flight of flights) {
      // Calculate flight position (same as in drawing logic)
      const latDiff = flight.latitude - centerPosition[0];
      const lngDiff = flight.longitude - centerPosition[1];
      
      const kmPerLatDegree = 111;
      const kmPerLngDegree = 111 * Math.cos(centerPosition[0] * Math.PI / 180);
      
      const distanceX = lngDiff * kmPerLngDegree;
      const distanceY = latDiff * kmPerLatDegree;
      
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      if (distance > range) continue; // Skip if out of range
      
      const flightX = centerX + (distanceX / range) * radius;
      const flightY = centerY - (distanceY / range) * radius;
      
      // Check if mouse is close to this flight (within 10 pixels)
      const dx = flightX - x;
      const dy = flightY - y;
      const mouseDistance = Math.sqrt(dx * dx + dy * dy);
      
      if (mouseDistance < 15) { // Increased hit area for touch friendliness
        foundFlight = flight;
        break;
      }
    }
    
    setHoveredFlight(foundFlight);
  };
  
  const handleMouseLeave = () => {
    setHoveredFlight(null);
  };
  
  const handleClick = () => {
    if (hoveredFlight && onFlightSelect) {
      onFlightSelect(hoveredFlight.id === selectedFlight?.id ? null : hoveredFlight);
    }
  };
  
  // Function to draw radar (used by animation frame)
  const draw = () => {
    // The drawing logic is moved to the useEffect above
    // This function is kept as a reference for the requestAnimationFrame
  };
  
  return (
    <div className="relative w-full h-full" dir="ltr">
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      
      {/* Controls */}
      <div className={`absolute bottom-4 left-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded-lg shadow-md flex items-center gap-2`}>
        {/* Zoom controls */}
        <button
          className={`w-8 h-8 flex items-center justify-center rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
        >
          −
        </button>
        <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {Math.round(scale * 100)}%
        </span>
        <button
          className={`w-8 h-8 flex items-center justify-center rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
        >
          +
        </button>
        
        <div className="w-px h-6 mx-2 bg-gray-300" />
        
        {/* Rotation controls */}
        <button
          className={`w-8 h-8 flex items-center justify-center rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          onClick={() => setRotation(prev => (prev - 45) % 360)}
        >
          ↺
        </button>
        <button
          className={`w-8 h-8 flex items-center justify-center rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          onClick={() => setRotation(prev => (prev + 45) % 360)}
        >
          ↻
        </button>
        
        <button
          className={`ml-2 px-2 py-1 text-xs rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'}`}
          onClick={() => {
            setRotation(0);
            setScale(1);
          }}
        >
          Reset
        </button>
      </div>
      
      {/* Flight info panel (when a flight is selected) */}
      {selectedFlight && (
        <div 
          className={`absolute top-4 right-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-3 rounded-lg shadow-lg max-w-xs w-full`}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-bold">{selectedFlight.flightNumber}</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => onFlightSelect && onFlightSelect(null)}
            >
              ×
            </button>
          </div>
          
          <div className="text-xs mt-1 flex justify-between">
            <span>{selectedFlight.airline}</span>
            <span className={
              selectedFlight.status === 'In Air' ? 'text-green-500' :
              selectedFlight.status === 'Delayed' ? 'text-yellow-500' :
              selectedFlight.status === 'Landing' ? 'text-blue-500' :
              'text-gray-500'
            }>
              {selectedFlight.status}
            </span>
          </div>
          
          <div className="mt-2 flex justify-between">
            <div className="text-center">
              <div className="text-xs text-gray-500">From</div>
              <div>{selectedFlight.origin}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">To</div>
              <div>{selectedFlight.destination}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div>
              <div className="text-xs text-gray-500">Altitude</div>
              <div>{selectedFlight.altitude.toLocaleString()} ft</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Speed</div>
              <div>{selectedFlight.groundSpeed} kts</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Heading</div>
              <div>{selectedFlight.heading}°</div>
            </div>
          </div>
          
          {selectedFlight.progress !== undefined && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Progress</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${selectedFlight.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{selectedFlight.origin}</span>
                <span>{selectedFlight.progress}%</span>
                <span>{selectedFlight.destination}</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Legend */}
      <div className={`absolute top-4 left-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-2 rounded-lg shadow-md text-xs`}>
        <div className="font-bold mb-1">Legend</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1" />
            <span>&lt;10,000 ft</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
            <span>10k-30k ft</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-1" />
            <span>&gt;30,000 ft</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-1" />
            <span>Delayed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1" />
            <span>Landing</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-500 mr-1" />
            <span>Other</span>
          </div>
        </div>
      </div>
      
      {/* Flights count */}
      <div className={`absolute bottom-4 right-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} px-3 py-1 rounded-lg shadow-md text-sm`}>
        {flights.filter(f => {
          // Calculate if flight is within radar range
          const latDiff = f.latitude - centerPosition[0];
          const lngDiff = f.longitude - centerPosition[1];
          
          const kmPerLatDegree = 111;
          const kmPerLngDegree = 111 * Math.cos(centerPosition[0] * Math.PI / 180);
          
          const distanceX = lngDiff * kmPerLngDegree;
          const distanceY = latDiff * kmPerLatDegree;
          
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          return distance <= range;
        }).length} flights in range
      </div>
    </div>
  );
};

export default FlightRadar;
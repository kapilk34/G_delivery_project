import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, Polyline, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import L, { LatLngExpression } from 'leaflet'
import ReactDOMServer from 'react-dom/server'
import { Truck, MapPin, Store as StoreIcon } from 'lucide-react'

interface MapComponentProps {
  deliveryLocation: [number, number] | null
  destinationLocation: [number, number] | null
  isPickedUp: boolean
  onRouteCalculated?: (data: { distanceKm: number; durationMin: number }) => void
}

// Function to generate Leaflet divIcons using React Lucide components
const createCustomIcon = (IconComponent: any, bgColor: string) => {
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div style={{
        backgroundColor: bgColor,
        color: 'white',
        borderRadius: '50%',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {ReactDOMServer.renderToString(<IconComponent size={18} />)}
      </div>
    ),
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const MapUpdater: React.FC<{ 
  deliveryLocation: [number, number] | null; 
  destinationLocation: [number, number] | null;
}> = ({ deliveryLocation, destinationLocation }) => {
  const map = useMap()
  
  useEffect(() => {
    if (deliveryLocation && destinationLocation) {
      // Fit map to show both markers with some padding
      const bounds = L.latLngBounds([deliveryLocation, destinationLocation])
      map.fitBounds(bounds, { padding: [40, 40] })
    } else if (deliveryLocation) {
      map.setView(deliveryLocation as LatLngExpression, 14, { animate: true })
    } else if (destinationLocation) {
      map.setView(destinationLocation as LatLngExpression, 14, { animate: true })
    }
  }, [deliveryLocation, destinationLocation, map])

  return null
}

const DeliveryMapComponent: React.FC<MapComponentProps> = ({ 
  deliveryLocation, 
  destinationLocation, 
  isPickedUp,
  onRouteCalculated
}) => {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])

  // Store/pickup location is computed as a fixed offset from customer location for simulation realism
  const storeLocation = useMemo<[number, number] | null>(() => {
    if (!destinationLocation) return null
    return [destinationLocation[0] + 0.003, destinationLocation[1] - 0.004]
  }, [destinationLocation])

  useEffect(() => {
    if (!destinationLocation || !storeLocation) return

    const fetchRoute = async () => {
      let url = ""
      if (deliveryLocation) {
        if (!isPickedUp) {
          // Route: Delivery Boy -> Store -> Customer
          url = `https://router.project-osrm.org/route/v1/driving/${deliveryLocation[1]},${deliveryLocation[0]};${storeLocation[1]},${storeLocation[0]};${destinationLocation[1]},${destinationLocation[0]}?overview=full&geometries=geojson`
        } else {
          // Route: Delivery Boy -> Customer
          url = `https://router.project-osrm.org/route/v1/driving/${deliveryLocation[1]},${deliveryLocation[0]};${destinationLocation[1]},${destinationLocation[0]}?overview=full&geometries=geojson`
        }
      } else {
        // No delivery boy assigned yet or in preparing phase: Route Store -> Customer
        url = `https://router.project-osrm.org/route/v1/driving/${storeLocation[1]},${storeLocation[0]};${destinationLocation[1]},${destinationLocation[0]}?overview=full&geometries=geojson`
      }

      try {
        const res = await fetch(url)
        const data = await res.json()
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number])
          setRouteCoords(coords)
          
          if (onRouteCalculated) {
            const distanceKm = data.routes[0].distance / 1000
            const durationMin = Math.round(data.routes[0].duration / 60)
            onRouteCalculated({ distanceKm, durationMin })
          }
        }
      } catch (err) {
        console.error("OSRM Route fetching error:", err)
        // Fallback straight line polyline
        const fallback = deliveryLocation
          ? (!isPickedUp ? [deliveryLocation, storeLocation, destinationLocation] : [deliveryLocation, destinationLocation])
          : [storeLocation, destinationLocation]
        setRouteCoords(fallback)

        if (onRouteCalculated) {
          // Calculate straight line distance fallback
          const distanceKm = deliveryLocation ? (isPickedUp ? 1.5 : 2.5) : 0.8
          onRouteCalculated({ distanceKm, durationMin: Math.round(distanceKm * 3) })
        }
      }
    }

    fetchRoute()
  }, [deliveryLocation, destinationLocation, storeLocation, isPickedUp, onRouteCalculated])

  if (!destinationLocation || !storeLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500">
        Waiting for order coordinates...
      </div>
    )
  }

  const defaultCenter = (deliveryLocation || storeLocation) as LatLngExpression

  // Create markers using custom divIcons
  const customerIcon = createCustomIcon(MapPin, '#ef4444') // Red MapPin
  const shopIcon = createCustomIcon(StoreIcon, '#f59e0b') // Amber Store
  const truckIcon = createCustomIcon(Truck, '#2563eb') // Blue Truck

  return (
    <MapContainer center={defaultCenter} zoom={14} scrollWheelZoom={true} className="w-full h-full z-0 relative">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Route Line */}
      {routeCoords.length > 0 && (
        <Polyline 
          positions={routeCoords} 
          pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.8, dashArray: isPickedUp ? undefined : '5, 5' }} 
        />
      )}

      {/* Customer Marker */}
      <Marker position={destinationLocation as LatLngExpression} icon={customerIcon} />
      
      {/* Store/Pickup Marker */}
      <Marker position={storeLocation as LatLngExpression} icon={shopIcon} />
      
      {/* Delivery Boy Marker */}
      {deliveryLocation && (
        <Marker position={deliveryLocation as LatLngExpression} icon={truckIcon} />
      )}

      <MapUpdater deliveryLocation={deliveryLocation} destinationLocation={destinationLocation} />
    </MapContainer>
  )
}

export default DeliveryMapComponent

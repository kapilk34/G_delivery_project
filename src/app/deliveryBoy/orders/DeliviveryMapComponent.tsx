"use client"

import React, { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, Polyline, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import L, { LatLngExpression } from 'leaflet'

const deliveryIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const destinationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface DeliveryMapProps {
  deliveryLocation: [number, number] | null
  destinationLocation: [number, number] | null
  isPickedUp: boolean
  onRouteCalculated: (data: { distanceKm: number; durationMin: number }) => void
}

const MapUpdater: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true })
  }, [center, map])
  return null
}

const DeliveryMapComponent: React.FC<DeliveryMapProps> = ({
  deliveryLocation,
  destinationLocation,
  isPickedUp,
  onRouteCalculated,
}) => {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])

  useEffect(() => {
    if (!deliveryLocation || !destinationLocation) return

    const fetchRoute = async () => {
      try {
        const [dLat, dLng] = deliveryLocation
        const [destLat, destLng] = destinationLocation
        const url = `https://router.project-osrm.org/route/v1/driving/${dLng},${dLat};${destLng},${destLat}?overview=full&geometries=geojson`
        const res = await fetch(url)
        const data = await res.json()
        if (data.routes && data.routes[0]) {
          const route = data.routes[0]
          const coords: [number, number][] = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          )
          setRouteCoords(coords)
          onRouteCalculated({
            distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
            durationMin: Math.round(route.duration / 60),
          })
        }
      } catch {
        // silently fail — map still shows markers without route
      }
    }

    fetchRoute()
  }, [deliveryLocation, destinationLocation])

  if (!deliveryLocation && !destinationLocation) return null

  const center: LatLngExpression = deliveryLocation
    ? (deliveryLocation as LatLngExpression)
    : (destinationLocation as LatLngExpression)

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="w-full h-full" style={{ zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      {deliveryLocation && (
        <Marker position={deliveryLocation as LatLngExpression} icon={deliveryIcon} />
      )}
      {destinationLocation && (
        <Marker position={destinationLocation as LatLngExpression} icon={destinationIcon} />
      )}
      {routeCoords.length > 0 && (
        <Polyline positions={routeCoords} color="#4f46e5" weight={4} opacity={0.8} />
      )}
    </MapContainer>
  )
}

export default DeliveryMapComponent

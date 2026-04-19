import React, { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import L, { LatLngExpression } from 'leaflet'

const markerIcon = new L.Icon({
  iconUrl: "https://thumbs.dreamstime.com/b/gps-icon-vector-logo-design-map-pointer-pin-location-symbol-flat-style-navigation-icons-web-mobile-place-marker-travel-158027525.jpg",
  iconSize: [35, 41],
  iconAnchor: [12, 41]
})

interface MapComponentProps {
  position: [number, number] | null
  setPosition: (pos: [number, number]) => void
}

const DraggableMarker: React.FC<{ position: [number, number]; setPosition: (pos: [number, number]) => void }> = ({ position, setPosition }) => {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position as LatLngExpression, 15, { animate: true })
    }
  }, [position, map])

  return (
    <Marker
      icon={markerIcon}
      position={position as LatLngExpression}
      draggable={true}
      eventHandlers={{
        dragend: (e: L.LeafletEvent) => {
          const marker = e.target as L.Marker
          const { lat, lng } = marker.getLatLng()
          setPosition([lat, lng])
        }
      }}
    />
  )
}

const MapComponent: React.FC<MapComponentProps> = ({ position, setPosition }) => {
  if (!position) return null

  return (
    <MapContainer center={position as LatLngExpression} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker position={position} setPosition={setPosition} />
    </MapContainer>
  )
}

export default MapComponent
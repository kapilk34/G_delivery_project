import { LatLngExpression } from 'leaflet'
import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

function MapView({position} : {position:[number,number] | null}) {
    if(!position) return null
  return (
    <MapContainer center={position as LatLngExpression} zoom={13} scrollWheelZoom={false} className='w-full h-full'>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  </MapContainer>
  )
}

export default MapView
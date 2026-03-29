'use client'

import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { getSocket } from '@/lib/socket'

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

type AssignmentItem = {
  _id: string;
  status: 'broadcasted' | 'assigned' | 'completed';
  order: {
    _id: string;
    orderStatus: 'pending' | 'Out of Delivery' | 'delivered';
    address: {
      fullAddress: string;
      latitude: number;
      longitude: number;
    };
  };
};

type LatLng = [number, number];

function DeliveryBoyDashboard() {
  const [assignment, setAssignment] = useState<AssignmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null)

  const fetchAssignment = async () => {
    try {
      const result = await axios.get("/api/delivery/getAssignments")
      setAssignment(result.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error('Geolocation failed', err);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [])

  const respondToAssignment = async (assignmentId: string, action: 'accept' | 'reject') => {
    try {
      await axios.post('/api/delivery/respond-assignment', { assignmentId, action })
      await fetchAssignment()
    } catch (error) {
      console.error(`Failed to ${action} assignment`, error)
    }
  }

  const completeDelivery = async (assignmentId: string) => {
    try {
      await axios.post('/api/delivery/deliver-order', { assignmentId })
      await fetchAssignment()
    } catch (error) {
      console.error('Failed to complete delivery', error)
    }
  }

  const activeAssignment = useMemo(
    () => assignment.find((item) => item.status === 'assigned') ?? null,
    [assignment]
  )

  useEffect(() => {
    fetchAssignment()

    const socket = getSocket()
    const handleAssignmentUpdate = async () => {
      await fetchAssignment()
    }

    socket.on('order-status-update', handleAssignmentUpdate)

    return () => {
      socket.off('order-status-update', handleAssignmentUpdate)
    }
  }, [])

  return (
    <div className='w-full min-h-screen bg-gray-50 p-4'>
      <div className='max-w-3xl mx-auto'>
        <h1 className='text-2xl font-bold mt-30 mb-7.5'>Delivery Assignments</h1>
        {loading ? (
          <div className='py-20 text-center text-gray-600'>Loading assignments...</div>
        ) : assignment.length === 0 ? (
          <div className='py-20 text-center text-gray-600'>No current delivery assignments.</div>
        ) : (
          assignment.map((a) => (
            <div key={a._id} className='p-5 bg-white rounded-xl shadow mb-4 border'>
              <div className='flex flex-col gap-2'>
                <p><b>Order Id</b> #{a?.order?._id?.toString().slice(-6)}</p>
                <p className='text-gray-600'>{a?.order?.address?.fullAddress}</p>
                <div className='flex flex-wrap gap-2'>
                  <span className='text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700'>Assignment: {a.status}</span>
                  <span className='text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700'>Order: {a?.order?.orderStatus}</span>
                </div>
              </div>

              <div className='flex gap-3 mt-4'>
                {a.status === 'broadcasted' && (
                  <>
                    <button
                      className='flex-1 bg-green-600 text-white py-2 rounded-lg'
                      onClick={() => respondToAssignment(a._id, 'accept')}
                    >
                      Accept
                    </button>
                    <button
                      className='flex-1 bg-red-600 text-white py-2 rounded-lg'
                      onClick={() => respondToAssignment(a._id, 'reject')}
                    >
                      Reject
                    </button>
                  </>
                )}

                {a.status === 'assigned' && (
                  <button
                    className='flex-1 bg-green-600 text-white py-2 rounded-lg'
                    onClick={() => completeDelivery(a._id)}
                  >
                    Mark Delivered
                  </button>
                )}

                {a.status === 'completed' && (
                  <button className='flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg cursor-not-allowed' disabled>
                    Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {activeAssignment && (
          <div className='p-5 bg-white rounded-xl shadow border mt-6'>
            <h2 className='text-lg font-semibold mb-4'>Live route for accepted delivery</h2>
            <div className='h-80 rounded-2xl overflow-hidden'>
              <MapContainer
                center={currentPosition ?? [activeAssignment.order.address.latitude, activeAssignment.order.address.longitude]}
                zoom={13}
                scrollWheelZoom={true}
                className='h-full w-full'
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <Marker position={[activeAssignment.order.address.latitude, activeAssignment.order.address.longitude]} />
                {currentPosition && <Marker position={currentPosition} />}
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoyDashboard
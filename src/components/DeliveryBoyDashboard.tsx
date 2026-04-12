'use client'

import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from "next-auth/react"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { getSocket } from '@/lib/socket'
import { MapPin, Package, Navigation, CheckCircle, XCircle, Check } from 'lucide-react'

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
  const { data: session } = useSession()
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
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCurrentPosition([lat, lon]);
        if (session?.user?.id) {
          const socket = getSocket();
          socket.emit("updateLocation", {
            userId: session.user.id,
            latitude: lat,
            longitude: lon
          });
        }
      },
      (err) => {
        console.error('Geolocation failed', err);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [session?.user?.id])

  const respondToAssignment = async (assignmentId: string, action: 'accept' | 'reject') => {
    try {
      await axios.post('/api/delivery/respond-assignment', { assignmentId, action })
      await fetchAssignment()
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      alert(`Failed to ${action} assignment: ${msg}`)
      console.error(`Failed to ${action} assignment`, error)
    }
  }

  const completeDelivery = async (assignmentId: string) => {
    try {
      await axios.post('/api/delivery/deliver-order', { assignmentId })
      await fetchAssignment()
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      alert(`Failed to complete delivery: ${msg}`)
      console.error('Failed to complete delivery', error)
    }
  }

  // Register socket connection and listen for updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = getSocket();
    // Register socket connection with backend
    socket.emit("identity", session.user.id);

    const handleAssignmentUpdate = async () => {
      await fetchAssignment();
    };

    socket.on('order-status-update', handleAssignmentUpdate);

    return () => {
      socket.off('order-status-update', handleAssignmentUpdate);
    };
  }, [session?.user?.id]);

  // Polling fallback - refresh assignments every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAssignment();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchAssignment();
    }
  }, [session?.user?.id])

  return (
    <div className='w-full min-h-screen bg-gray-100 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center justify-between mb-8 mt-10 md:mt-2'>
          <h1 className='text-3xl font-extrabold text-gray-800 tracking-tight'>Delivery Dashboard</h1>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20 text-gray-500'>
            <div className='animate-pulse flex items-center gap-2'>
              <Navigation className='w-5 h-5 animate-spin' /> Loading assignments...
            </div>
          </div>
        ) : assignment.length === 0 ? (
          <div className='py-32 text-center flex flex-col items-center gap-4 bg-white rounded-3xl shadow-sm border border-gray-100'>
            <Package className='w-16 h-16 text-gray-300' />
            <p className='text-xl font-medium text-gray-600'>No current delivery assignments.</p>
            <p className='text-sm text-gray-400'>You will receive a notification when an order is assigned to you.</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {assignment.map((a) => (
              <div key={a._id} className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'>
                {/* Card Header */}
                <div className='p-5 sm:p-6'>
                  <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
                    <div className='flex items-start gap-4'>
                      <div className={`p-4 rounded-full ${a.status === 'assigned' ? 'bg-blue-100 text-blue-600' : a.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-green-100 text-green-600'}`}>
                        <Package className='w-6 h-6' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-500 font-medium'>Order #{a?.order?._id?.toString().slice(-6)}</p>
                        <h3 className='text-lg font-bold text-gray-800 mt-1 flex items-center gap-2'>
                          <MapPin className='w-4 h-4 text-gray-400' /> Delivery Address
                        </h3>
                        <p className='text-gray-600 mt-1 max-w-sm'>{a?.order?.address?.fullAddress}</p>
                      </div>
                    </div>

                    <div className='flex flex-col items-start sm:items-end gap-2'>
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide
                        ${a.status === 'assigned' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' 
                        : a.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'}`}>
                        {a.status}
                      </span>
                      <span className='text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md'>
                        Order: {a?.order?.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='mt-6 flex flex-wrap gap-3'>
                    {a.status === 'broadcasted' && (
                      <>
                        <button
                          className='flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 transition shadow-sm text-white px-6 py-2.5 rounded-xl font-semibold'
                          onClick={() => respondToAssignment(a._id, 'accept')}
                        >
                          <CheckCircle className='w-5 h-5' /> Accept
                        </button>
                        <button
                          className='flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 transition px-6 py-2.5 rounded-xl font-semibold'
                          onClick={() => respondToAssignment(a._id, 'reject')}
                        >
                          <XCircle className='w-5 h-5' /> Reject
                        </button>
                      </>
                    )}

                    {a.status === 'assigned' && (
                      <button
                        className='w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-blue-700 shadow-md transition text-white px-8 py-3 rounded-xl font-medium text-lg'
                        onClick={() => completeDelivery(a._id)}
                      >
                        <CheckCircle className='w-6 h-6' /> Mark Delivered
                      </button>
                    )}

                    {a.status === 'completed' && (
                      <button className='w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 text-gray-400 px-8 py-3 rounded-xl font-medium' disabled>
                        <CheckCircle className='w-5 h-5' /> Delivered Successfully
                      </button>
                    )}
                  </div>
                </div>

                {/* Map Section if Assigned */}
                {a.status === 'assigned' && (
                  <div className='border-t border-gray-100 bg-gray-50/50 p-4 sm:p-6'>
                    <div className='flex items-center gap-2 mb-4'>
                      <Navigation className='w-5 h-5 text-blue-600' />
                      <h2 className='text-sm font-bold text-gray-700 uppercase tracking-wide'>Live Route Navigation</h2>
                    </div>
                    <div className='h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 ring-4 ring-white'>
                      <MapContainer
                        center={currentPosition ?? [a.order.address.latitude, a.order.address.longitude]}
                        zoom={15}
                        scrollWheelZoom={true}
                        className='h-full w-full'
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        />
                        <Marker position={[a.order.address.latitude, a.order.address.longitude]} />
                        {currentPosition && <Marker position={currentPosition} />}
                      </MapContainer>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoyDashboard
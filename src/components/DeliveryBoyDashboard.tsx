'use client'

import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from "next-auth/react"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { getSocket } from '@/lib/socket'
import { MapPin, Package, Navigation, CheckCircle, XCircle, Wallet, TrendingUp, Bell, User, Clock, Truck, Award, Zap, IndianRupee } from 'lucide-react'

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

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const statusConfig = {
  broadcasted: {
    border: 'border-l-amber-400',
    headerBg: 'bg-gradient-to-r from-amber-50 to-orange-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    label: 'New Request',
    dot: true,
  },
  assigned: {
    border: 'border-l-blue-500',
    headerBg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    label: 'In Progress',
    dot: false,
  },
  completed: {
    border: 'border-l-emerald-500',
    headerBg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    label: 'Completed',
    dot: false,
  },
}

function DeliveryBoyDashboard() {
  const { data: session } = useSession()
  const [assignment, setAssignment] = useState<AssignmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null)
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: '', type: '' })
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  
  const PER_DELIVERY_AMOUNT = 120

  const { completedDeliveries, totalEarnings, completionRate } = useMemo(() => {
    const completed = assignment.filter(a => a.status === 'completed').length
    const total = assignment.length
    const rate = total > 0 ? (completed / total) * 100 : 0
    return {
      completedDeliveries: completed,
      totalEarnings: completed * PER_DELIVERY_AMOUNT,
      completionRate: rate
    }
  }, [assignment])

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
  }

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
      showNotification(`Successfully ${action}ed the delivery!`, 'success')
    } catch (error: unknown) {
      const err = error as AxiosError
      const msg = err?.response?.data?.message || err?.message;
      showNotification(`Failed to ${action} assignment: ${msg}`, 'error')
      console.error(`Failed to ${action} assignment`, error)
    }
  }

  const completeDelivery = async (assignmentId: string) => {
    try {
      await axios.post('/api/delivery/deliver-order', { assignmentId })
      await fetchAssignment()
      showNotification('Delivery completed successfully! 🎉', 'success')
    } catch (error: unknown) {
      const err = error as AxiosError
      const msg = err?.response?.data?.message || err?.message;
      showNotification(`Failed to complete delivery: ${msg}`, 'error')
      console.error('Failed to complete delivery', error)
    }
  }

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = getSocket();
    socket.emit("identity", session.user.id);

    const handleAssignmentUpdate = async () => {
      await fetchAssignment();
      showNotification('New assignment available!', 'info')
    };

    socket.on('order-status-update', handleAssignmentUpdate);

    return () => {
      socket.off('order-status-update', handleAssignmentUpdate);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAssignment();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAssignment();
    }
  }, [session?.user?.id])

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200'>
      {/* Notification Toast */}
      {notification.show && (
        <div className='fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300'>
          <div className={`rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' :
            notification.type === 'error' ? 'bg-rose-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {notification.type === 'success' && <CheckCircle className='w-5 h-5' />}
            {notification.type === 'error' && <XCircle className='w-5 h-5' />}
            {notification.type === 'info' && <Bell className='w-5 h-5' />}
            <p className='font-medium'>{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className='sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md'>
                <Truck className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
                  Delivery Dashboard
                </h1>
                <p className='text-sm text-gray-500'>Welcome back, {session?.user?.name || 'Driver'}</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl'>
                <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                <span className='text-sm font-medium text-green-700'>Online</span>
              </div>
              <button className='p-2 hover:bg-gray-100 rounded-xl transition-colors'>
                <User className='w-5 h-5 text-gray-600' />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500'></div>
            <div className='relative p-6 text-white'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                  <Wallet className='w-6 h-6' />
                </div>
                <TrendingUp className='w-5 h-5 opacity-75' />
              </div>
              <p className='text-sm font-medium opacity-90'>Total Earnings</p>
              <p className='text-4xl font-bold mt-2'>₹{totalEarnings}</p>
              <p className='text-xs opacity-80 mt-3'>₹{PER_DELIVERY_AMOUNT} per delivery</p>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-emerald-100 rounded-xl'>
                <CheckCircle className='w-6 h-6 text-emerald-600' />
              </div>
              <Award className='w-5 h-5 text-gray-400' />
            </div>
            <p className='text-sm font-medium text-gray-600'>Completed</p>
            <p className='text-3xl font-bold text-gray-800 mt-2'>{completedDeliveries}</p>
            <div className='mt-3 flex items-center gap-2'>
              <div className='flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                <div className='h-full bg-emerald-500 rounded-full transition-all duration-500' style={{ width: `${completionRate}%` }}></div>
              </div>
              <span className='text-xs font-medium text-gray-500'>{completionRate.toFixed(0)}%</span>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-blue-100 rounded-xl'>
                <Navigation className='w-6 h-6 text-blue-600' />
              </div>
              <Clock className='w-5 h-5 text-gray-400' />
            </div>
            <p className='text-sm font-medium text-gray-600'>In Progress</p>
            <p className='text-3xl font-bold text-gray-800 mt-2'>{assignment.filter(a => a.status === 'assigned').length}</p>
            <p className='text-xs text-gray-500 mt-3'>Active deliveries</p>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-amber-100 rounded-xl'>
                <Bell className='w-6 h-6 text-amber-600' />
              </div>
              <Zap className='w-5 h-5 text-gray-400' />
            </div>
            <p className='text-sm font-medium text-gray-600'>Pending</p>
            <p className='text-3xl font-bold text-gray-800 mt-2'>{assignment.filter(a => a.status === 'broadcasted').length}</p>
            <p className='text-xs text-gray-500 mt-3'>Awaiting response</p>
          </div>
        </div>

        {/* Section Header */}
        <div className='flex items-center justify-between mb-5'>
          <div>
            <h2 className='text-lg font-bold text-gray-800'>My Deliveries</h2>
            <p className='text-sm text-gray-500'>{assignment.length} assignment{assignment.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        {/* Assignments Section */}
        {loading ? (
          <div className='flex flex-col items-center justify-center py-32'>
            <div className='relative'>
              <div className='w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin'></div>
              <Truck className='w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
            </div>
            <p className='mt-4 text-gray-500 font-medium'>Loading your deliveries...</p>
          </div>
        ) : assignment.length === 0 ? (
          <div className='bg-white rounded-3xl shadow-sm border border-gray-200 py-20 text-center'>
            <div className='relative inline-block'>
              <div className='absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20'></div>
              <Package className='w-20 h-20 text-gray-300 mx-auto relative' />
            </div>
            <h3 className='text-xl font-semibold text-gray-700 mt-6'>No Active Deliveries</h3>
            <p className='text-gray-500 mt-2 max-w-sm mx-auto'>You&apos;re all caught up! New assignments will appear here automatically.</p>
            <div className='mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-sm text-gray-600'>Waiting for new orders...</span>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {assignment.map((a, index) => {
              const cfg = statusConfig[a.status]
              return (
                <div
                  key={a._id}
                  className={`bg-white rounded-2xl shadow-md border border-gray-100 border-l-4 ${cfg.border} overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Header Band */}
                  <div className={`${cfg.headerBg} px-4 py-3 flex items-center justify-between gap-2 border-b border-gray-100`}>
                    <div className='flex items-center gap-2'>
                      <div className={`relative p-2 ${cfg.iconBg} rounded-lg`}>
                        <Package className={`w-4 h-4 ${cfg.iconColor}`} />
                        {a.status === 'broadcasted' && (
                          <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white'></span>
                        )}
                      </div>
                      <span className='text-xs font-mono bg-white/70 border border-gray-200 px-2 py-0.5 rounded-md text-gray-600 tracking-wider'>
                        #ORD-{a?.order?._id?.toString().slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className='p-4 flex flex-col flex-1 gap-4'>
                    {/* Meta row */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                        <Clock className='w-3.5 h-3.5' />
                        <span className='capitalize'>{a?.order?.orderStatus}</span>
                      </div>
                      <div className='flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg'>
                        <IndianRupee className='w-3 h-3 text-emerald-600' />
                        <span className='text-xs font-bold text-emerald-700'>{PER_DELIVERY_AMOUNT}</span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className='flex items-start gap-2'>
                      <div className='mt-0.5 p-1.5 bg-gray-100 rounded-lg shrink-0'>
                        <MapPin className='w-3.5 h-3.5 text-gray-500' />
                      </div>
                      <div>
                        <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5'>Delivery Address</p>
                        <p className='text-sm text-gray-800 font-medium leading-snug line-clamp-2'>{a?.order?.address?.fullAddress}</p>
                      </div>
                    </div>

                    {/* Ready for pickup badge */}
                    {a.status === 'assigned' && (
                      <div className='flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg w-fit'>
                        <Truck className='w-3.5 h-3.5 text-green-600 animate-pulse' />
                        <span className='text-xs font-semibold text-green-700'>Ready for Pickup</span>
                      </div>
                    )}

                    {/* Action Buttons — pushed to bottom */}
                    <div className='flex flex-col gap-2 mt-auto pt-2 border-t border-gray-100'>
                      {a.status === 'broadcasted' && (
                        <>
                          <button
                            className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95'
                            onClick={() => respondToAssignment(a._id, 'accept')}
                          >
                            <CheckCircle className='w-4 h-4' /> Accept Delivery
                          </button>
                          <button
                            className='w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-300 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95'
                            onClick={() => respondToAssignment(a._id, 'reject')}
                          >
                            <XCircle className='w-4 h-4' /> Decline
                          </button>
                        </>
                      )}

                      {a.status === 'assigned' && (
                        <button
                          className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95'
                          onClick={() => completeDelivery(a._id)}
                        >
                          <CheckCircle className='w-4 h-4' /> Mark as Delivered
                        </button>
                      )}

                      {a.status === 'completed' && (
                        <div className='w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 rounded-xl text-sm font-semibold'>
                          <CheckCircle className='w-4 h-4 text-emerald-500' /> Delivered Successfully
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Section */}
                  {a.status === 'assigned' && (
                    <div className='border-t border-gray-100'>
                      <div className='p-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-1.5'>
                            <div className='p-1 bg-blue-100 rounded-md'>
                              <Navigation className='w-3.5 h-3.5 text-blue-600' />
                            </div>
                            <span className='text-xs font-bold text-gray-700 uppercase tracking-wide'>Live Map</span>
                          </div>
                          <button
                            onClick={() => setSelectedAssignment(selectedAssignment === a._id ? null : a._id)}
                            className='text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors'
                          >
                            {selectedAssignment === a._id ? '↑ Minimize' : '↓ Expand'}
                          </button>
                        </div>
                        <div className={`transition-all duration-500 overflow-hidden rounded-xl ${selectedAssignment === a._id ? 'h-64' : 'h-40'}`}>
                          <MapContainer
                            center={currentPosition ?? [a.order.address.latitude, a.order.address.longitude]}
                            zoom={14}
                            scrollWheelZoom={true}
                            className='h-full w-full'
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                            />
                            <Marker
                              position={[a.order.address.latitude, a.order.address.longitude]}
                              title="Delivery Location"
                            />
                            {currentPosition && (
                              <Marker
                                position={currentPosition}
                                title="Your Location"
                              />
                            )}
                          </MapContainer>
                        </div>
                        {currentPosition && (
                          <div className='mt-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between'>
                            <p className='text-xs text-gray-500'>{currentPosition[0].toFixed(4)}, {currentPosition[1].toFixed(4)}</p>
                            <div className='flex items-center gap-1'>
                              <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
                              <span className='text-xs text-green-600 font-medium'>Live</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoyDashboard;

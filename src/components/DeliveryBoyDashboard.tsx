'use client'

import axios from 'axios'
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useSession } from "next-auth/react"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { getSocket } from '@/lib/socket'
import { MapPin, Package, Navigation, CheckCircle, XCircle, Bell, User, Clock, Truck, IndianRupee, Mail, Phone, Calendar, Edit3, Home, Briefcase, Plus, Trash2, X, Crown, Sparkles, Check, Building, Camera, Loader2, AlertCircle, Shield, Save, MapPinned, Pin } from 'lucide-react'
import Chatbot from './Chatbot'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'

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

interface IAddress {
  _id?: string;
  homeAddress?: string;
  workAddress?: string;
  otherAddress?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

interface UserData {
  name?: string;
  email?: string;
  mobile?: string;
  membershipStatus?: 'Regular' | 'Premium' | 'Gold';
  role?: string;
  image?: string;
  createdAt?: string;
  addresses?: IAddress[];
}

function PremiumInput({ id, label, icon: Icon, value, onChange, onBlur, error, touched, placeholder, type = 'text', required = false }: any) {
  const hasError = touched && error;
  return (
    <div className='group'>
      <label htmlFor={id} className='mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:text-slate-800'>
        {label}{required && <span className='text-rose-500'>*</span>}
      </label>
      <div className='relative'>
        <span className={`absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors ${hasError ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-slate-600'}`}>
          <Icon className='h-[18px] w-[18px]' />
        </span>
        <input type={type} id={id} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder}
          className={`w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 ${hasError ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5'}`}
        />
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className='flex items-center gap-1.5 overflow-hidden text-xs font-medium text-rose-500 mt-1.5'>
            <AlertCircle className='h-3.5 w-3.5 flex-shrink-0' /><span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PremiumModal({ isOpen, onClose, title, icon: Icon, children, maxWidth = 'md' }: any) {
  const maxWidths: Record<string, string> = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6'>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='absolute inset-0 bg-slate-950/40 backdrop-blur-sm' onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidths[maxWidth]} overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl`}>
            <div className='flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4'>
              <h3 className='flex items-center gap-2.5 text-lg font-bold text-slate-900'>
                {Icon && <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white'><Icon className='h-4 w-4' /></span>}
                {title}
              </h3>
              <button onClick={onClose} className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600'>
                <X className='h-4 w-4' />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DeliveryBoyDashboard() {
  const { data: session } = useSession()
  const dispatch = useDispatch<AppDispatch>()
  const userData = useSelector((state: RootState) => state.user.userData) as UserData | null
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard')
  const [assignment, setAssignment] = useState<AssignmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null)
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: '', type: '' })
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)

  // Profile state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null)
  const [profileForm, setProfileForm] = useState({ name: '', mobile: '', membershipStatus: 'Regular' as 'Regular' | 'Premium' | 'Gold', image: '' })
  const [addressForm, setAddressForm] = useState({ homeAddress: '', workAddress: '', otherAddress: '', city: '', state: '', pincode: '', landmark: '', isDefault: false })
  const [profileErrors, setProfileErrors] = useState({ name: '', mobile: '' })
  const [addressErrors, setAddressErrors] = useState({ city: '', state: '', pincode: '', addressLines: '' })
  const [profileTouched, setProfileTouched] = useState({ name: false, mobile: false })
  const [addressTouched, setAddressTouched] = useState({ city: false, state: false, pincode: false, addressLines: false })

  const validateProfile = useCallback((form: typeof profileForm) => {
    const errors = { name: '', mobile: '' };
    if (!form.name.trim()) errors.name = 'Full Name is required';
    else if (form.name.trim().length < 2) errors.name = 'Must be at least 2 characters';
    else if (!/^[A-Za-z\s'\-]+$/.test(form.name.trim())) errors.name = 'Only letters, spaces, and hyphens allowed';
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) errors.mobile = 'Must be exactly 10 digits';
    setProfileErrors(errors);
    return !errors.name && !errors.mobile;
  }, []);

  const validateAddress = useCallback((form: typeof addressForm) => {
    const errors = { city: '', state: '', pincode: '', addressLines: '' };
    if (!form.city.trim()) errors.city = 'City is required';
    else if (!/^[A-Za-z\s.\-]+$/.test(form.city.trim())) errors.city = 'Invalid city name';
    if (!form.state.trim()) errors.state = 'State is required';
    else if (!/^[A-Za-z\s.\-]+$/.test(form.state.trim())) errors.state = 'Invalid state name';
    if (!form.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode)) errors.pincode = 'Must be 6 digits';
    if (!form.homeAddress.trim() && !form.workAddress.trim() && !form.otherAddress.trim()) errors.addressLines = 'At least one address type required';
    setAddressErrors(errors);
    return !errors.city && !errors.state && !errors.pincode && !errors.addressLines;
  }, []);

  useEffect(() => { validateProfile(profileForm); }, [profileForm, validateProfile]);
  useEffect(() => { validateAddress(addressForm); }, [addressForm, validateAddress]);

  useEffect(() => {
    if (userData) {
      setProfileForm({ name: userData.name || '', mobile: userData.mobile || '', membershipStatus: userData.membershipStatus || 'Regular', image: userData.image || '' });
    }
  }, [userData]);

  useEffect(() => {
    if (!userData && activeTab === 'profile') {
      axios.get('/api/me').then(res => dispatch(setUserData(res.data))).catch(console.error);
    }
  }, [userData, activeTab, dispatch]);

  const openEditProfile = () => {
    setProfileForm({ name: userData?.name || '', mobile: userData?.mobile || '', membershipStatus: userData?.membershipStatus || 'Regular', image: userData?.image || '' });
    setProfileTouched({ name: false, mobile: false });
    setProfileErrors({ name: '', mobile: '' });
    setIsEditProfileOpen(true);
  };

  const openAddressModal = (address: IAddress | null) => {
    setEditingAddress(address);
    setAddressForm(address ? { homeAddress: address.homeAddress || '', workAddress: address.workAddress || '', otherAddress: address.otherAddress || '', city: address.city || '', state: address.state || '', pincode: address.pincode || '', landmark: address.landmark || '', isDefault: address.isDefault || false } : { homeAddress: '', workAddress: '', otherAddress: '', city: '', state: '', pincode: '', landmark: '', isDefault: false });
    setAddressTouched({ city: false, state: false, pincode: false, addressLines: false });
    setAddressErrors({ city: '', state: '', pincode: '', addressLines: '' });
    setIsAddressModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }
    const formData = new FormData();
    formData.append('image', file);
    setIsUploadingImage(true);
    const id = toast.loading('Uploading...');
    try {
      const res = await axios.post('/api/user/profile/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch(setUserData(res.data));
      toast.success('Profile photo updated!', { id });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed.', { id });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileTouched({ name: true, mobile: true });
    if (!validateProfile(profileForm)) { toast.error('Please fix the errors before saving.'); return; }
    try {
      const res = await axios.put('/api/user/profile', profileForm);
      dispatch(setUserData(res.data));
      toast.success('Profile updated successfully!');
      setIsEditProfileOpen(false);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Update failed.'); }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressTouched({ city: true, state: true, pincode: true, addressLines: true });
    if (!validateAddress(addressForm)) { toast.error('Please fix the errors before saving.'); return; }
    try {
      if (editingAddress) {
        const res = await axios.put('/api/user/address', { addressId: editingAddress._id, ...addressForm });
        dispatch(setUserData(res.data)); toast.success('Address updated!');
      } else {
        const res = await axios.post('/api/user/address', addressForm);
        dispatch(setUserData(res.data)); toast.success('Address added!');
      }
      setIsAddressModalOpen(false); setEditingAddress(null);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Save failed.'); }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await axios.delete('/api/user/address', { data: { addressId } });
      dispatch(setUserData(res.data)); toast.success('Address deleted.');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Delete failed.'); }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await axios.patch('/api/user/address', { addressId });
      dispatch(setUserData(res.data)); toast.success('Default address updated!');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Update failed.'); }
  };

  const getMembershipConfig = (status?: string) => {
    switch (status) {
      case 'Gold': return { badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Crown className='h-3.5 w-3.5 text-amber-600' />, ring: 'ring-amber-400/30' };
      case 'Premium': return { badge: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Sparkles className='h-3.5 w-3.5 text-purple-600' />, ring: 'ring-purple-400/30' };
      default: return { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <Check className='h-3.5 w-3.5 text-emerald-600' />, ring: 'ring-emerald-400/30' };
    }
  };

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

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
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md'>
                <Truck className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
                  {activeTab === 'profile' ? 'My Profile' : 'Delivery Dashboard'}
                </h1>
                <p className='text-sm text-gray-500'>Welcome back, {session?.user?.name || 'Driver'}</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              {activeTab === 'dashboard' && (
                <div className='flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  <span className='text-sm font-medium text-green-700'>Online</span>
                </div>
              )}
              <button
                onClick={() => setActiveTab(activeTab === 'profile' ? 'dashboard' : 'profile')}
                className={`p-2 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <User className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Profile Header Card */}
          <div className='relative overflow-hidden rounded-3xl border border-white/60 bg-white shadow-xl mb-6'>
            <div className='flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8'>
              {/* Avatar */}
              <div className='relative flex-shrink-0'>
                <div
                  className={`group relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-4 border-white shadow-xl ring-4 ${getMembershipConfig(userData?.membershipStatus).ring} sm:h-32 sm:w-32`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {userData?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userData.image} alt={userData.name} className='h-full w-full object-cover' />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center bg-slate-100'>
                      <User className='h-14 w-14 text-slate-400' />
                    </div>
                  )}
                  <div className='absolute inset-0 flex flex-col items-center justify-center bg-slate-950/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                    <Camera className='h-6 w-6 text-white' />
                    <span className='mt-1 text-[10px] font-bold uppercase tracking-wider text-white/90'>Change</span>
                  </div>
                  {isUploadingImage && (
                    <div className='absolute inset-0 flex items-center justify-center bg-slate-950/60'>
                      <Loader2 className='h-6 w-6 animate-spin text-white' />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-lg transition-colors hover:bg-slate-800'
                >
                  <Camera className='h-4 w-4' />
                </button>
                <input type='file' ref={fileInputRef} onChange={handleImageUpload} accept='image/*' className='hidden' />
              </div>

              {/* Info */}
              <div className='flex-1 text-center sm:text-left'>
                <div className='flex flex-col items-center gap-3 sm:flex-row sm:justify-between'>
                  <div>
                    <div className='flex flex-wrap items-center justify-center gap-3 sm:justify-start'>
                      <h2 className='text-2xl font-bold tracking-tight text-slate-900'>{userData?.name}</h2>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getMembershipConfig(userData?.membershipStatus).badge}`}>
                        {getMembershipConfig(userData?.membershipStatus).icon}
                        {userData?.membershipStatus || 'Regular'}
                      </span>
                    </div>
                    <p className='mt-1 text-sm font-medium text-slate-500 capitalize'>{userData?.role} Account</p>
                  </div>
                  <button
                    onClick={openEditProfile}
                    className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors'
                  >
                    <Edit3 className='h-4 w-4' /> Edit Profile
                  </button>
                </div>

                <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  {[
                    { icon: Mail, label: 'Email', value: userData?.email },
                    { icon: Phone, label: 'Mobile', value: userData?.mobile || 'Not provided' },
                    { icon: Calendar, label: 'Joined', value: formatDate(userData?.createdAt) },
                  ].map((item) => (
                    <div key={item.label} className='flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5'>
                      <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm'>
                        <item.icon className='h-4 w-4 text-slate-600' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>{item.label}</p>
                        <p className='truncate text-sm font-semibold text-slate-700'>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 mb-10'>
            {[
              { icon: MapPinned, label: 'Saved Addresses', value: (userData?.addresses || []).length, color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-200/50' },
              { icon: IndianRupee, label: 'Total Earnings', value: `₹${completedDeliveries * PER_DELIVERY_AMOUNT}`, color: 'from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-200/50' },
              { icon: Clock, label: 'Member Since', value: userData?.createdAt ? new Date(userData.createdAt).getFullYear() : 'N/A', color: 'from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-200/50' },
              { icon: Shield, label: 'Account Status', value: userData?.membershipStatus || 'Regular', color: 'from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-200/50' },
            ].map((stat) => (
              <div key={stat.label} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${stat.color} p-5`}>
                <div className='flex items-start justify-between'>
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-wider opacity-60'>{stat.label}</p>
                    <p className='mt-1 text-2xl font-bold tracking-tight'>{stat.value}</p>
                  </div>
                  <div className='rounded-xl p-2.5 bg-white/60 shadow-sm'>
                    <stat.icon className='h-5 w-5' />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Addresses Section */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white'>
                <MapPin className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-xl font-bold text-slate-900'>Delivery Locations</h3>
                <p className='text-sm text-slate-500'>Manage your saved addresses</p>
              </div>
            </div>
            <button
              onClick={() => openAddressModal(null)}
              className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm'
            >
              <Plus className='h-4 w-4' /> Add Address
            </button>
          </div>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            <AnimatePresence mode='popLayout'>
              {(userData?.addresses || []).length > 0 ? (
                (userData?.addresses || []).map((address, index) => (
                  <motion.div layout key={address._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${address.isDefault ? 'border-emerald-300/60 ring-1 ring-emerald-500/10' : 'border-slate-200/80 hover:border-slate-300'}`}>
                    {address.isDefault && (
                      <div className='absolute -right-8 top-4 rotate-45 bg-emerald-500 px-8 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white'>Default</div>
                    )}
                    <div className='mb-4 flex items-start justify-between'>
                      <div className='flex flex-wrap gap-1.5'>
                        {address.homeAddress?.trim() && <span className='inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 border border-blue-100'><Home className='h-3 w-3' />HOME</span>}
                        {address.workAddress?.trim() && <span className='inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 border border-purple-100'><Building className='h-3 w-3' />WORK</span>}
                        {address.otherAddress?.trim() && <span className='inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 border border-amber-100'><Briefcase className='h-3 w-3' />OTHER</span>}
                      </div>
                      <div className='flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
                        <button onClick={() => openAddressModal(address)} className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'><Edit3 className='h-3.5 w-3.5' /></button>
                        <button onClick={() => handleDeleteAddress(address._id!)} className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600'><Trash2 className='h-3.5 w-3.5' /></button>
                      </div>
                    </div>
                    <div className='space-y-2.5 text-sm'>
                      {address.homeAddress?.trim() && <div><p className='text-[10px] font-bold uppercase tracking-wider text-blue-500'>Home</p><p className='mt-0.5 font-semibold text-slate-800'>{address.homeAddress}</p></div>}
                      {address.workAddress?.trim() && <div><p className='text-[10px] font-bold uppercase tracking-wider text-purple-500'>Work</p><p className='mt-0.5 font-semibold text-slate-800'>{address.workAddress}</p></div>}
                      {address.otherAddress?.trim() && <div><p className='text-[10px] font-bold uppercase tracking-wider text-amber-500'>Other</p><p className='mt-0.5 font-semibold text-slate-800'>{address.otherAddress}</p></div>}
                      {address.landmark?.trim() && (
                        <div className='rounded-xl border border-slate-100 bg-slate-50/80 p-2.5'>
                          <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Landmark</p>
                          <p className='mt-0.5 text-xs font-medium text-slate-600'>{address.landmark}</p>
                        </div>
                      )}
                      <div className='flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600'>
                        <MapPin className='h-3.5 w-3.5 text-emerald-500' />
                        {address.city}, {address.state} — {address.pincode}
                      </div>
                    </div>
                    {!address.isDefault && (
                      <button onClick={() => handleSetDefault(address._id!)} className='mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-500 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700'>
                        <Pin className='h-3.5 w-3.5' /> Set as Default
                      </button>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 px-6 text-center'>
                  <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50'>
                    <MapPin className='h-8 w-8 text-slate-300' />
                  </div>
                  <h3 className='text-lg font-bold text-slate-800'>No Addresses Saved</h3>
                  <p className='mt-1 max-w-xs text-sm text-slate-500'>Add your delivery locations for faster checkouts.</p>
                  <button onClick={() => openAddressModal(null)} className='mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors'>
                    <Plus className='h-4 w-4' /> Add Your First Address
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500'></div>
            <div className='relative p-6 text-white'>
              {/* <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                  <Wallet className='w-6 h-6' />
                </div>
                <TrendingUp className='w-5 h-5 opacity-75' />
              </div> */}
              <p className='text-sm font-medium opacity-90'>Total Earnings</p>
              <p className='text-4xl font-bold mt-2'>₹{totalEarnings}</p>
              <p className='text-xs opacity-80 mt-3'>₹{PER_DELIVERY_AMOUNT} per delivery</p>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'>
            {/* <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-emerald-100 rounded-xl'>
                <CheckCircle className='w-6 h-6 text-emerald-600' />
              </div>
              <Award className='w-5 h-5 text-gray-400' />
            </div> */}
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
            {/* <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-blue-100 rounded-xl'>
                <Navigation className='w-6 h-6 text-blue-600' />
              </div>
              <Clock className='w-5 h-5 text-gray-400' />
            </div> */}
            <p className='text-sm font-medium text-gray-600'>In Progress</p>
            <p className='text-3xl font-bold text-gray-800 mt-2'>{assignment.filter(a => a.status === 'assigned').length}</p>
            <p className='text-xs text-gray-500 mt-3'>Active deliveries</p>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'>
            {/* <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-amber-100 rounded-xl'>
                <Bell className='w-6 h-6 text-amber-600' />
              </div>
              <Zap className='w-5 h-5 text-gray-400' />
            </div> */}
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
      )}

      <Chatbot />
    </div>
  )
}

export default DeliveryBoyDashboard;

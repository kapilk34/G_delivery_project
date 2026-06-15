"use client";

export const dynamic = 'force-dynamic';

import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSession } from "next-auth/react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { getSocket } from '@/lib/socket';
import {
  MapPin, Package, Navigation, CheckCircle, XCircle, Bell, User, Clock,
  Truck, IndianRupee, Mail, Phone, Calendar, Edit3, Home, Briefcase, Plus,
  Trash2, X, Crown, Sparkles, Check, Building, Camera, Loader2, AlertCircle,
  Shield, Save, MapPinned, Pin, TrendingUp, Wallet, Zap, Award, ChevronRight,
  Star, ArrowUpRight, ArrowDownRight, Activity, Layers, Target, Route,
  ChevronDown, Expand, Minimize2, LocateFixed, Timer, DollarSign, Hash,
  GripVertical, MoreHorizontal, Eye, Ban, PhoneCall
} from 'lucide-react';
import Chatbot from './Chatbot';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { setUserData } from '@/redux/userSlice';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import NewSection from './DeliveryStatistics';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

type AssignmentItem = {
  _id: string;
  status: 'broadcasted' | 'assigned' | 'completed';
  order: {
    _id: string;
    orderStatus: 'pending' | 'Out of Delivery' | 'delivered';
    isPickedUp?: boolean;
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
    border: 'border-l-4 border-l-amber-500',
    headerBg: 'bg-amber-50/50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'New Request',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/20',
    pulse: true,
  },
  assigned: {
    border: 'border-l-4 border-l-blue-500',
    headerBg: 'bg-blue-50/50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'In Progress',
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'shadow-blue-500/20',
    pulse: false,
  },
  completed: {
    border: 'border-l-4 border-l-emerald-500',
    headerBg: 'bg-emerald-50/50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Completed',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
    pulse: false,
  },
};

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

/* ─── Premium Input ─── */
function PremiumInput({ id, label, icon: Icon, value, onChange, onBlur, error, touched, placeholder, type = 'text', required = false }: any) {
  const hasError = touched && error;
  return (
    <div className='group relative'>
      <label htmlFor={id} className='mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-all duration-300 group-focus-within:text-indigo-500 group-focus-within:tracking-[0.2em]'>
        {label}{required && <span className='text-rose-500'>*</span>}
      </label>
      <div className='relative'>
        <span className={`absolute inset-y-0 left-0 flex items-center pl-4 transition-all duration-300 ${hasError ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`}>
          <Icon className='h-[18px] w-[18px]' />
        </span>
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-2xl border bg-white/80 backdrop-blur-sm py-3 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all duration-300 placeholder:font-normal placeholder:text-slate-400 ${hasError ? 'border-rose-300 bg-rose-50/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200/80 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
        />
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className='flex items-center gap-1.5 overflow-hidden text-xs font-bold text-rose-500 mt-2'
          >
            <AlertCircle className='h-3.5 w-3.5 flex-shrink-0' />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Premium Modal ─── */
function PremiumModal({ isOpen, onClose, title, icon: Icon, children, maxWidth = 'md' }: any) {
  const maxWidths: Record<string, string> = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6'
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-slate-950/60 backdrop-blur-md'
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className={`relative w-full ${maxWidths[maxWidth]} overflow-hidden rounded-3xl border border-white/30 bg-white/95 backdrop-blur-xl shadow-2xl`}
          >
            <div className='flex items-center justify-between border-b border-slate-100/80 bg-gradient-to-r from-slate-50/80 to-white/80 px-6 py-4'>
              <h3 className='flex items-center gap-3 text-lg font-bold text-slate-900'>
                {Icon && (
                  <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg'>
                    <Icon className='h-4 w-4' />
                  </span>
                )}
                {title}
              </h3>
              <button
                onClick={onClose}
                className='flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 hover:rotate-90'
              >
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

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const start = displayValue;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(start + (end - start) * easeOut));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{displayValue}{suffix}</span>;
}

/* ─── Horizontal Delivery Card ─── */
function HorizontalDeliveryCard({
  assignment,
  index,
  currentPosition,
  selectedAssignment,
  setSelectedAssignment,
  respondToAssignment,
  completeDelivery,
  pickupOrder,
  PER_DELIVERY_AMOUNT,
}: {
  assignment: AssignmentItem;
  index: number;
  currentPosition: LatLng | null;
  selectedAssignment: string | null;
  setSelectedAssignment: (id: string | null) => void;
  respondToAssignment: (id: string, action: 'accept' | 'reject') => void;
  completeDelivery: (id: string) => void;
  pickupOrder: (id: string) => void;
  PER_DELIVERY_AMOUNT: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[assignment.status];
  const orderId = assignment?.order?._id?.toString() || '';
  const shortId = orderId.slice(-6).toUpperCase();

  const getStatusIcon = () => {
    switch (assignment.status) {
      case 'broadcasted': return <Bell className="w-5 h-5" />;
      case 'assigned': return <Truck className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden ${cfg.border}`}
    >
      {/* Main Horizontal Layout */}
      <div className="flex flex-col lg:flex-row">
        
        {/* Left Section: Status & Order Info */}
        <div className={`flex-1 p-5 ${cfg.headerBg}`}>
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className={`relative flex-shrink-0 w-14 h-14 ${cfg.iconBg} rounded-2xl flex items-center justify-center shadow-sm`}>
              {getStatusIcon()}
              {cfg.pulse && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md animate-pulse" />
              )}
            </div>

            {/* Order Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-sm font-bold text-slate-700 bg-white/80 border border-slate-200/60 px-3 py-1 rounded-lg tracking-wider">
                  #{shortId}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
                  {cfg.label}
                </span>
                {assignment.status === 'assigned' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <Timer className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="line-clamp-1 max-w-[300px]">{assignment?.order?.address?.fullAddress}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Just now
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  ₹{PER_DELIVERY_AMOUNT}
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <Package className="w-3.5 h-3.5" />
                  {assignment?.order?.orderStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Quick Actions */}
        <div className="flex items-center gap-3 px-5 py-4 lg:py-0 lg:border-l border-slate-100 bg-white">
          {assignment.status === 'broadcasted' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => respondToAssignment(assignment._id, 'accept')}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => respondToAssignment(assignment._id, 'reject')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl text-sm font-bold transition-all"
              >
                <Ban className="w-4 h-4" />
                Decline
              </motion.button>
            </>
          )}

          {assignment.status === 'assigned' && (
            <div className="flex items-center gap-3 flex-wrap">
              {!assignment.order.isPickedUp && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => pickupOrder(assignment._id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Package className="w-4 h-4" />
                  Pick Up Order
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => completeDelivery(assignment._id)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Delivered
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
              >
                <Navigation className="w-4 h-4" />
                {expanded ? 'Hide Map' : 'Navigate'}
              </motion.button>
            </div>
          )}

          {assignment.status === 'completed' && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-700">Delivered</p>
                <p className="text-xs text-emerald-600">+₹{PER_DELIVERY_AMOUNT} earned</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Expand & More */}
        <div className="flex items-center gap-2 px-5 py-4 lg:py-0 lg:border-l border-slate-100 bg-white">
          {assignment.status === 'assigned' && (
            <div className="hidden lg:flex flex-col items-end mr-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <LocateFixed className="w-3.5 h-3.5 text-green-500" />
                <span>Live</span>
              </div>
              {currentPosition && (
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {currentPosition[0].toFixed(4)}, {currentPosition[1].toFixed(4)}
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
          >
            {expanded ? <Minimize2 className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Map Section */}
      <AnimatePresence>
        {expanded && assignment.status === 'assigned' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 320, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Route className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Live Navigation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-xs font-bold text-green-700">Tracking Active</span>
                  </div>
                </div>
              </div>
              <div className="h-[240px] rounded-xl border border-slate-200 overflow-hidden shadow-inner">
                <MapContainer
                  center={currentPosition ?? [assignment.order.address.latitude, assignment.order.address.longitude]}
                  zoom={14}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  />
                  <Marker
                    position={[assignment.order.address.latitude, assignment.order.address.longitude]}
                    title="Delivery Location"
                  />
                  {currentPosition && (
                    <Marker position={currentPosition} title="Your Location" />
                  )}
                </MapContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Details for Completed/Broadcasted */}
      <AnimatePresence>
        {expanded && assignment.status !== 'assigned' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Address</p>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">{assignment?.order?.address?.fullAddress}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {assignment?.order?.address?.latitude.toFixed(4)}, {assignment?.order?.address?.longitude.toFixed(4)}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Order Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Order ID</span>
                    <span className="font-mono font-semibold text-slate-700">#{shortId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="font-semibold text-slate-700 capitalize">{assignment?.order?.orderStatus}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Earnings</span>
                    <span className="font-bold text-emerald-600">₹{PER_DELIVERY_AMOUNT}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Actions</p>
                <div className="space-y-2">
                  {assignment.status === 'broadcasted' && (
                    <>
                      <button
                        onClick={() => respondToAssignment(assignment._id, 'accept')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept Delivery
                      </button>
                      <button
                        onClick={() => respondToAssignment(assignment._id, 'reject')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all"
                      >
                        <Ban className="w-4 h-4" />
                        Decline
                      </button>
                    </>
                  )}
                  {assignment.status === 'completed' && (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                      <Award className="w-5 h-5" />
                      <div>
                        <p className="text-sm font-bold">Completed Successfully</p>
                        <p className="text-xs text-emerald-600">Payment: ₹{PER_DELIVERY_AMOUNT}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Dashboard ─── */
function DeliveryBoyDashboard() {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.userData) as UserData | null;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');
  const [assignment, setAssignment] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: '', type: '' });
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Profile state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);
  const [profileForm, setProfileForm] = useState({ name: '', mobile: '', membershipStatus: 'Regular' as 'Regular' | 'Premium' | 'Gold', image: '' });
  const [addressForm, setAddressForm] = useState({ homeAddress: '', workAddress: '', otherAddress: '', city: '', state: '', pincode: '', landmark: '', isDefault: false });
  const [profileErrors, setProfileErrors] = useState({ name: '', mobile: '' });
  const [addressErrors, setAddressErrors] = useState({ city: '', state: '', pincode: '', addressLines: '' });
  const [profileTouched, setProfileTouched] = useState({ name: false, mobile: false });
  const [addressTouched, setAddressTouched] = useState({ city: false, state: false, pincode: false, addressLines: false });

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
      case 'Gold': return {
        badge: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200',
        icon: <Crown className='h-3.5 w-3.5 text-amber-600' />,
        ring: 'ring-amber-400/40',
        gradient: 'from-amber-500 to-yellow-500',
        shadow: 'shadow-amber-500/30'
      };
      case 'Premium': return {
        badge: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200',
        icon: <Sparkles className='h-3.5 w-3.5 text-purple-600' />,
        ring: 'ring-purple-400/40',
        gradient: 'from-purple-500 to-indigo-500',
        shadow: 'shadow-purple-500/30'
      };
      default: return {
        badge: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200',
        icon: <Check className='h-3.5 w-3.5 text-emerald-600' />,
        ring: 'ring-emerald-400/40',
        gradient: 'from-emerald-500 to-teal-500',
        shadow: 'shadow-emerald-500/30'
      };
    }
  };

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const PER_DELIVERY_AMOUNT = 120;

  const { completedDeliveries, totalEarnings, completionRate, inProgressCount, pendingCount } = useMemo(() => {
    const completed = assignment.filter(a => a.status === 'completed').length;
    const inProgress = assignment.filter(a => a.status === 'assigned').length;
    const pending = assignment.filter(a => a.status === 'broadcasted').length;
    const total = assignment.length;
    const rate = total > 0 ? (completed / total) * 100 : 0;
    return {
      completedDeliveries: completed,
      totalEarnings: completed * PER_DELIVERY_AMOUNT,
      completionRate: rate,
      inProgressCount: inProgress,
      pendingCount: pending
    };
  }, [assignment]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const fetchAssignment = async () => {
    try {
      const result = await axios.get("/api/delivery/getAssignments");
      setAssignment(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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
  }, [session?.user?.id]);

  const respondToAssignment = async (assignmentId: string, action: 'accept' | 'reject') => {
    try {
      await axios.post('/api/delivery/respond-assignment', { assignmentId, action });
      await fetchAssignment();
      showNotification(`Successfully ${action}ed the delivery!`, 'success');
    } catch (error: unknown) {
      const err = error as AxiosError;
      const msg = err?.response?.data?.message || err?.message;
      showNotification(`Failed to ${action} assignment: ${msg}`, 'error');
      console.error(`Failed to ${action} assignment`, error);
    }
  };

  const completeDelivery = async (assignmentId: string) => {
    try {
      await axios.post('/api/delivery/deliver-order', { assignmentId });
      await fetchAssignment();
      showNotification('Delivery completed successfully! 🎉', 'success');
    } catch (error: unknown) {
      const err = error as AxiosError;
      const msg = err?.response?.data?.message || err?.message;
      showNotification(`Failed to complete delivery: ${msg}`, 'error');
      console.error('Failed to complete delivery', error);
    }
  };

  const pickupOrder = async (assignmentId: string) => {
    try {
      await axios.post('/api/delivery/pickup-order', { assignmentId });
      await fetchAssignment();
      showNotification('Order picked up successfully! 📦', 'success');
    } catch (error: unknown) {
      const err = error as AxiosError;
      const msg = err?.response?.data?.message || err?.message;
      showNotification(`Failed to pick up order: ${msg}`, 'error');
      console.error('Failed to pick up order', error);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = getSocket();
    socket.emit("identity", session.user.id);

    const handleAssignmentUpdate = async () => {
      await fetchAssignment();
      showNotification('New assignment available!', 'info');
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
  }, [session?.user?.id]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden'>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className='fixed top-6 right-6 z-50'
          >
            <div className={`rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 backdrop-blur-md border ${
              notification.type === 'success' ? 'bg-emerald-500/95 text-white border-emerald-400/50' :
              notification.type === 'error' ? 'bg-rose-500/95 text-white border-rose-400/50' :
              'bg-blue-500/95 text-white border-blue-400/50'
            }`}>
              <div className="p-1 bg-white/20 rounded-lg">
                {notification.type === 'success' && <CheckCircle className='w-5 h-5' />}
                {notification.type === 'error' && <XCircle className='w-5 h-5' />}
                {notification.type === 'info' && <Bell className='w-5 h-5' />}
              </div>
              <p className='font-bold text-sm'>{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 mt-20'>
          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* Earnings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className='group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-500'
            >
              <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700' />
              <div className='absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16' />
              <div className='relative p-6 text-white'>
                <p className='text-sm font-bold opacity-80 uppercase tracking-wider'>Total Earnings</p>
                <p className='text-4xl font-medium mt-2 tracking-tight'>
                  <AnimatedCounter value={totalEarnings} prefix="₹ " />
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold opacity-80 bg-white/10 rounded-xl px-3 py-2 w-fit">
                  <IndianRupee className="w-3 h-3" />
                  <span>{PER_DELIVERY_AMOUNT} per delivery</span>
                </div>
              </div>
            </motion.div>

            {/* Completed Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className='group relative overflow-hidden bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-all duration-500'
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className='relative p-6'>
                <p className='text-sm font-bold text-slate-500 uppercase tracking-wider'>Completed</p>
                <p className='text-4xl font-medium text-slate-800 mt-2 tracking-tight'>
                  <AnimatedCounter value={completedDeliveries} />
                </p>
                <div className='mt-4 flex items-center gap-2'>
                  <div className='flex-1 h-2 bg-slate-100 rounded-full overflow-hidden'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className='h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full'
                    />
                  </div>
                  <span className='text-xs font-black text-slate-500'>{completionRate.toFixed(0)}%</span>
                </div>
              </div>
            </motion.div>

            {/* In Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className='group relative overflow-hidden bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-all duration-500'
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className='relative p-6'>
                <p className='text-sm font-bold text-slate-500 uppercase tracking-wider'>In Progress</p>
                <p className='text-4xl font-medium text-slate-800 mt-2 tracking-tight'>
                  <AnimatedCounter value={inProgressCount} />
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl px-3 py-2 w-fit">
                  <Truck className="w-3.5 h-3.5 animate-pulse" />
                  <span>Active deliveries</span>
                </div>
              </div>
            </motion.div>

            {/* Pending Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className='group relative overflow-hidden bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-all duration-500'
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className='relative p-6'>
                <p className='text-sm font-bold text-slate-500 uppercase tracking-wider'>Pending</p>
                <p className='text-4xl font-medium text-slate-800 mt-2 tracking-tight'>
                  <AnimatedCounter value={pendingCount} />
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 rounded-xl px-3 py-2 w-fit">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting response</span>
                </div>
              </div>
            </motion.div>
          </div>

          <NewSection />

          {/* Section Header */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
                <Layers className="w-5 h-5 text-indigo-600" />
                My Deliveries
              </h2>
              <p className='text-sm font-semibold text-slate-500 mt-1'>
                {assignment.length} assignment{assignment.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-100">
              <Target className="w-3.5 h-3.5" />
              Live Updates
            </div>
          </div>

          {/* Horizontal Assignment Cards */}
          {loading ? (
            <div className='flex flex-col items-center justify-center py-32'>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className='relative'
              >
                <div className='w-20 h-20 border-4 border-slate-200 border-t-indigo-500 rounded-full' />
                <Truck className='w-7 h-7 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
              </motion.div>
              <p className='mt-6 text-slate-500 font-bold text-lg'>Loading your deliveries...</p>
              <p className="text-sm text-slate-400 mt-1">Fetching real-time data</p>
            </div>
          ) : assignment.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100 py-24 text-center'
            >
              <div className='relative inline-block'>
                <div className='absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse' />
                <Package className='w-24 h-24 text-slate-300 mx-auto relative' />
              </div>
              <h3 className='text-2xl font-black text-slate-700 mt-8'>No Active Deliveries</h3>
              <p className='text-slate-500 mt-2 max-w-sm mx-auto font-semibold'>You're all caught up! New assignments will appear here automatically.</p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='mt-8 inline-flex items-center gap-2 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl'
              >
                <div className='relative'>
                  <div className='w-2.5 h-2.5 bg-emerald-500 rounded-full' />
                  <div className='absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping' />
                </div>
                <span className='text-sm font-bold text-emerald-700'>Waiting for new orders...</span>
              </motion.div>
            </motion.div>
          ) : (
            <div className='space-y-4'>
              {assignment.map((a, index) => (
                <HorizontalDeliveryCard
                  key={a._id}
                  assignment={a}
                  index={index}
                  currentPosition={currentPosition}
                  selectedAssignment={selectedAssignment}
                  setSelectedAssignment={setSelectedAssignment}
                  respondToAssignment={respondToAssignment}
                  completeDelivery={completeDelivery}
                  pickupOrder={pickupOrder}
                  PER_DELIVERY_AMOUNT={PER_DELIVERY_AMOUNT}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Chatbot />
    </div>
  );
}

export default DeliveryBoyDashboard;
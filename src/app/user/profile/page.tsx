"use client"

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
import NavBar from "@/components/Nav";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit3,
  MapPin,
  Home,
  Briefcase,
  Plus,
  Trash2,
  Star,
  X,
  Crown,
  Sparkles,
  Check,
  Building,
  ArrowLeft,
  Camera,
  Loader2
} from "lucide-react";

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

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.userData);

  // File Input Ref for direct profile image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Modals visibility state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Active address being edited (null for adding new)
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);

  // Profile Form State (used inside modal)
  const [profileForm, setProfileForm] = useState({
    name: "",
    mobile: "",
    membershipStatus: "Regular" as "Regular" | "Premium" | "Gold",
    image: "",
  });

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    homeAddress: "",
    workAddress: "",
    otherAddress: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false,
  });

  // Sync profile form when userData changes
  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || "",
        mobile: userData.mobile || "",
        membershipStatus: userData.membershipStatus || "Regular",
        image: userData.image || "",
      });
    }
  }, [userData]);

  // Sync address form when editingAddress changes
  useEffect(() => {
    if (editingAddress) {
      setAddressForm({
        homeAddress: editingAddress.homeAddress || "",
        workAddress: editingAddress.workAddress || "",
        otherAddress: editingAddress.otherAddress || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        pincode: editingAddress.pincode || "",
        landmark: editingAddress.landmark || "",
        isDefault: editingAddress.isDefault || false,
      });
    } else {
      setAddressForm({
        homeAddress: "",
        workAddress: "",
        otherAddress: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        isDefault: false,
      });
    }
  }, [editingAddress]);

  // Fetch / Sync user data
  useEffect(() => {
    if (userData) {
      setIsLoading(false);
    } else {
      const fetchUserDataDirectly = async () => {
        try {
          const res = await axios.get("/api/me");
          dispatch(setUserData(res.data));
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      const t = setTimeout(() => {
        if (!userData) {
          fetchUserDataDirectly();
        } else {
          setIsLoading(false);
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [userData, dispatch]);

  // Direct Profile Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type checking
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, JPEG, WebP).");
      return;
    }

    // Size checking (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should not exceed 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploadingImage(true);
    const uploadToastId = toast.loading("Uploading image to Cloudinary...");

    try {
      const response = await axios.post("/api/user/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(setUserData(response.data));
      toast.success("Profile image uploaded successfully!", { id: uploadToastId });
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to upload profile picture.",
        { id: uploadToastId }
      );
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle profile form submit (Modal)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (profileForm.mobile && !/^\d{10}$/.test(profileForm.mobile)) {
      toast.error("Mobile Number must be exactly 10 digits");
      return;
    }

    try {
      const response = await axios.put("/api/user/profile", profileForm);
      dispatch(setUserData(response.data));
      toast.success("Profile details updated successfully!");
      setIsEditProfileOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Handle Address form submit (Create or Update)
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.city.trim() || !addressForm.state.trim() || !addressForm.pincode.trim()) {
      toast.error("City, State, and Pincode are required");
      return;
    }
    if (!/^\d{6}$/.test(addressForm.pincode)) {
      toast.error("Pincode must be a 6-digit number");
      return;
    }
    if (!addressForm.homeAddress.trim() && !addressForm.workAddress.trim() && !addressForm.otherAddress.trim()) {
      toast.error("At least one address field (Home Address, Work Address, or Other Address) is required");
      return;
    }

    try {
      if (editingAddress) {
        // Update Address
        const response = await axios.put("/api/user/address", {
          addressId: editingAddress._id,
          ...addressForm,
        });
        dispatch(setUserData(response.data));
        toast.success("Address updated successfully!");
      } else {
        // Add New Address
        const response = await axios.post("/api/user/address", addressForm);
        dispatch(setUserData(response.data));
        toast.success("New address added successfully!");
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save address");
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const response = await axios.delete("/api/user/address", {
        data: { addressId },
      });
      dispatch(setUserData(response.data));
      toast.success("Address deleted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  // Set Default Address
  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await axios.patch("/api/user/address", { addressId });
      dispatch(setUserData(response.data));
      toast.success("Default address set successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to set default address");
    }
  };

  const getMembershipStyle = (status?: string) => {
    switch (status) {
      case "Gold":
        return {
          bg: "bg-amber-50 border border-amber-200",
          text: "text-amber-700",
          icon: <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />,
        };
      case "Premium":
        return {
          bg: "bg-purple-50 border border-purple-200",
          text: "text-purple-700",
          icon: <Sparkles className="w-4 h-4 text-purple-500 fill-purple-500" />,
        };
      default:
        return {
          bg: "bg-green-50 border border-green-200",
          text: "text-green-700",
          icon: <Check className="w-4 h-4 text-green-500" />,
        };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-green-100">
        <NavBar user={userData as any} />
        <div className="flex justify-center items-center h-[70vh]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-green-600 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-green-100 flex flex-col">
        <NavBar user={null} />
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-20 text-center">
          <MapPin className="w-20 h-20 text-green-300 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 max-w-md mb-6">
            Please log in to your account to view and manage your profile details and addresses.
          </p>
          <Link
            href="/login"
            className="px-8 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium transition-all shadow-md"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  const membership = getMembershipStyle(userData.membershipStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 pb-20">
      {/* Global Navigation Header */}
      <NavBar user={userData as any} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-32 relative z-10">
        
        {/* Back to Home Button */}
        <div className="mb-6 flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-950 font-bold transition-all group bg-white/90 hover:bg-green-50 px-5 py-2.5 rounded-full border border-green-200/60 shadow-xs text-sm"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-green-800">My Account</h1>
          <p className="text-gray-500 mt-1">Manage your basic profile details and delivery locations</p>
        </div>

        {/* 1. Basic User Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-6 sm:p-8 mb-10 overflow-hidden relative"
        >
          {/* Decorative Background Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/30 rounded-full blur-3xl -z-10 translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl -z-10 -translate-x-20 translate-y-20"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Interactive Profile Picture (Direct Upload Enabled) */}
            <div className="relative group flex-shrink-0 cursor-pointer" title="Click to upload profile photo directly">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 rounded-full overflow-hidden border-4 border-green-500/35 bg-green-50 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 relative"
              >
                {userData.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userData.image}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 text-green-600" />
                )}

                {/* Hover Camera Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-6 h-6 text-white mb-0.5" />
                  <span className="text-[9px] text-white font-bold uppercase tracking-wider">Change</span>
                </div>

                {/* Uploading Spinner */}
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Hidden direct file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Floating Camera Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-md border-2 border-white transition-colors"
                title="Directly Upload Profile Photo"
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Info Fields */}
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-center sm:text-left">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex flex-col sm:flex-row items-center gap-3">
                    {userData.name}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold ${membership.bg} ${membership.text}`}
                    >
                      {membership.icon}
                      {userData.membershipStatus || "Regular"}
                    </span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-1 capitalize font-medium">Role: {userData.role}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-6 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md shadow-green-600/10 transition-all text-sm flex items-center justify-center gap-2 self-center sm:self-start border border-green-700/10"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </motion.button>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                  <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</p>
                    <p className="text-gray-800 font-semibold text-sm">{userData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                  <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Mobile Number</p>
                    <p className="text-gray-800 font-semibold text-sm">{userData.mobile || "Not Provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 sm:col-span-2 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                  <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Account Created On</p>
                    <p className="text-gray-800 font-semibold text-sm">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. Delivery Addresses Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-green-600" />
              Delivery Addresses
            </h2>
            <p className="text-sm text-gray-400 mt-0.5 font-medium">Manage your saved locations for deliveries</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setEditingAddress(null);
              setIsAddressModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-white hover:bg-green-50 text-green-700 border border-green-200 px-6 py-2.5 rounded-full font-semibold transition-all shadow-xs"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </motion.button>
        </div>

        {/* Addresses Grid (Guarantees visible displays of added addresses) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userData.addresses && userData.addresses.length > 0 ? (
            userData.addresses.map((address) => {
              // Decide primary icon and label based on filled properties
              let AddressIcon = MapPin;
              let hasHome = !!address.homeAddress?.trim();
              let hasWork = !!address.workAddress?.trim();
              let hasOther = !!address.otherAddress?.trim();

              return (
                <motion.div
                  layout
                  key={address._id}
                  className={`bg-white rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between group shadow-sm hover:shadow-md ${
                    address.isDefault
                      ? "border-green-500 ring-4 ring-green-500/10"
                      : "border-gray-200/80 hover:border-green-300"
                  }`}
                >
                  <div>
                    {/* Header: Icon, Tags, Actions */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {hasHome && (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                            <Home className="w-3 h-3" />
                            HOME
                          </span>
                        )}
                        {hasWork && (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-purple-100">
                            <Building className="w-3 h-3" />
                            WORK
                          </span>
                        )}
                        {hasOther && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-100">
                            <Briefcase className="w-3 h-3" />
                            OTHER
                          </span>
                        )}
                        {address.isDefault && (
                          <span className="bg-green-500 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            Default
                          </span>
                        )}
                      </div>

                      {/* Edit / Delete Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingAddress(address);
                            setIsAddressModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit Location Address"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id!)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Location Address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Visible Address Details */}
                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      {hasHome && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Home Address Line</p>
                          <p className="text-gray-800 font-medium text-[13px]">{address.homeAddress}</p>
                        </div>
                      )}
                      {hasWork && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-purple-500 tracking-wider">Work Address Line</p>
                          <p className="text-gray-800 font-medium text-[13px]">{address.workAddress}</p>
                        </div>
                      )}
                      {hasOther && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Other Address Line</p>
                          <p className="text-gray-800 font-medium text-[13px]">{address.otherAddress}</p>
                        </div>
                      )}

                      {address.landmark?.trim() && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-2 text-xs text-gray-500">
                          <span className="font-bold text-gray-400 uppercase text-[9px] block mb-0.5">Landmark</span>
                          {address.landmark}
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-green-500" />
                        <span>{address.city}, {address.state} - {address.pincode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Set Default Button */}
                  {!address.isDefault && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSetDefault(address._id!)}
                      className="w-full mt-2 py-2 px-4 rounded-xl border border-gray-200 hover:border-green-300 text-gray-500 hover:text-green-700 text-xs font-bold flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-green-50 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Set as Default Location
                    </motion.button>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-16 bg-white rounded-3xl border border-dashed border-gray-300 flex flex-col justify-center items-center text-center px-6">
              <MapPin className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No Addresses Saved</h3>
              <p className="text-gray-400 max-w-sm text-sm mt-1 mb-6 font-medium">
                Please add your delivery locations to enable faster checkouts and precise grocery dispatches.
              </p>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all shadow-md"
              >
                Add Your First Address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Edit Profile Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-9999 px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-green-50/50">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <User className="text-green-600 w-5 h-5" />
                  Edit Profile Details
                </h3>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="p-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="p-name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="p-mobile" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="p-mobile"
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>

                {/* Profile Picture URL */}
                <div>
                  <label htmlFor="p-image" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    id="p-image"
                    value={profileForm.image}
                    onChange={(e) => setProfileForm({ ...profileForm, image: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {/* Membership Status Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Membership Status Tier
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["Regular", "Premium", "Gold"] as const).map((tier) => {
                      const isSelected = profileForm.membershipStatus === tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, membershipStatus: tier })}
                          className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-600/15"
                              : "border-gray-200 text-gray-600 hover:border-green-300"
                          }`}
                        >
                          {tier === "Gold" ? (
                            <Crown className="w-3.5 h-3.5" />
                          ) : tier === "Premium" ? (
                            <Sparkles className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          {tier}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 font-semibold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add/Edit Address Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-9999 px-4 py-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden my-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-green-50/50">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <MapPin className="text-green-600 w-5 h-5" />
                  {editingAddress ? "Edit Address Location" : "Add New Address Location"}
                </h3>
                <button
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setEditingAddress(null);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-100 text-xs font-semibold space-y-0.5">
                  <p className="font-bold uppercase tracking-wider text-[10px]">Important Note</p>
                  <p>Please specify at least one of the main address type fields below (Home Address, Work Address, or Other Address).</p>
                </div>

                {/* Home Address */}
                <div>
                  <label htmlFor="ad-home" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Home Address Line
                  </label>
                  <input
                    type="text"
                    id="ad-home"
                    value={addressForm.homeAddress}
                    onChange={(e) => setAddressForm({ ...addressForm, homeAddress: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                    placeholder="e.g. House No. / Flat No. / Street Name"
                  />
                </div>

                {/* Work Address */}
                <div>
                  <label htmlFor="ad-work" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Work Address Line
                  </label>
                  <input
                    type="text"
                    id="ad-work"
                    value={addressForm.workAddress}
                    onChange={(e) => setAddressForm({ ...addressForm, workAddress: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                    placeholder="e.g. Office Name / Tech Park / Floor / Cabin"
                  />
                </div>

                {/* Other Address */}
                <div>
                  <label htmlFor="ad-other" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Other Address Line
                  </label>
                  <input
                    type="text"
                    id="ad-other"
                    value={addressForm.otherAddress}
                    onChange={(e) => setAddressForm({ ...addressForm, otherAddress: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                    placeholder="e.g. Secondary address or description"
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label htmlFor="ad-landmark" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Landmark
                  </label>
                  <input
                    type="text"
                    id="ad-landmark"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                    placeholder="e.g. Near supermarket or Metro station"
                  />
                </div>

                {/* City, State, Pincode in a grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="ad-city" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      id="ad-city"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                      placeholder="e.g. Mumbai"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="ad-state" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      id="ad-state"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                      placeholder="e.g. Maharashtra"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="ad-pincode" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Pincode
                    </label>
                    <input
                      type="text"
                      id="ad-pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-800 text-sm transition-all"
                      placeholder="e.g. 400001"
                      required
                    />
                  </div>
                </div>

                {/* Checkbox: Set Default */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="ad-isdefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="ad-isdefault" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Set as default delivery address
                  </label>
                </div>

                {/* Save button */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddressModalOpen(false);
                      setEditingAddress(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 font-semibold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors shadow-md"
                  >
                    {editingAddress ? "Save Address" : "Add Address"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
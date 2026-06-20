"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
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
  Loader2,
  AlertCircle,
  Shield,
  Clock,
  Package,
  ChevronRight,
  Upload,
  Save,
  MapPinned,
  BadgeCheck,
  MoreHorizontal,
  Pin
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

interface UserData {
  name?: string;
  email?: string;
  mobile?: string;
  membershipStatus?: "Regular" | "Premium" | "Gold";
  role?: string;
  image?: string;
  createdAt?: string;
  addresses?: IAddress[];
}

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const step = value / (duration * 60);
          const interval = setInterval(() => {
            start += step;
            if (start >= value) {
              setCount(value);
              clearInterval(interval);
            } else {
              setCount(Math.floor(start));
            }
          }, 1000 / 60);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{count}</span>;
}

/** Premium stat card */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  delay?: number;
}) {
  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-200/50",
    blue: "from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-200/50",
    amber: "from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-200/50",
    purple: "from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-200/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorMap[color]} p-5 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
          </p>
        </div>
        <div className={`rounded-xl p-2.5 bg-white/60 shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

/** Premium section divider */
function SectionDivider({ title, subtitle, icon: Icon, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}

/** Premium input field */
function PremiumInput({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  type = "text",
  required = false,
}: any) {
  const hasError = touched && error;

  return (
    <div className="group">
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:text-slate-800"
      >
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <span
          className={`absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors ${hasError ? "text-rose-400" : "text-slate-400 group-focus-within:text-slate-600"
            }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 ${hasError
              ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
              : "border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5"
            }`}
        />
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex items-center gap-1.5 overflow-hidden text-xs font-medium text-rose-500"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Premium button */
function PremiumButton({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
  icon: Icon,
  className = "",
  isLoading = false,
}: any) {
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]",
    danger:
      "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98]",
    ghost: "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 active:scale-[0.98]",
    emerald:
      "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </motion.button>
  );
}

/** Premium modal wrapper */
function PremiumModal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  maxWidth = "md",
}: any) {
  const maxWidths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidths[maxWidth as keyof typeof maxWidths]} overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl shadow-slate-950/10`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                {Icon && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                {title}
              </h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.userData) as UserData | null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);


  const [profileForm, setProfileForm] = useState({
    name: "",
    mobile: "",
    membershipStatus: "Regular" as "Regular" | "Premium" | "Gold",
    image: "",
  });

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

  const [profileErrors, setProfileErrors] = useState({ name: "", mobile: "" });
  const [addressErrors, setAddressErrors] = useState({
    city: "",
    state: "",
    pincode: "",
    addressLines: "",
  });

  const [profileTouched, setProfileTouched] = useState({ name: false, mobile: false });
  const [addressTouched, setAddressTouched] = useState({
    city: false,
    state: false,
    pincode: false,
    addressLines: false,
  });

  const validateProfile = useCallback((form: typeof profileForm) => {
    const errors = { name: "", mobile: "" };
    if (!form.name.trim()) {
      errors.name = "Full Name is required";
    } else if (form.name.trim().length < 2) {
      errors.name = "Must be at least 2 characters";
    } else if (!/^[A-Za-z\s'\-]+$/.test(form.name.trim())) {
      errors.name = "Only letters, spaces, and hyphens allowed";
    }
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) {
      errors.mobile = "Must be exactly 10 digits";
    }
    setProfileErrors(errors);
    return !errors.name && !errors.mobile;
  }, []);

  const validateAddress = useCallback((form: typeof addressForm) => {
    const errors = { city: "", state: "", pincode: "", addressLines: "" };
    if (!form.city.trim()) errors.city = "City is required";
    else if (!/^[A-Za-z\s.\-]+$/.test(form.city.trim())) errors.city = "Invalid city name";

    if (!form.state.trim()) errors.state = "State is required";
    else if (!/^[A-Za-z\s.\-]+$/.test(form.state.trim())) errors.state = "Invalid state name";

    if (!form.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) errors.pincode = "Must be 6 digits";

    if (!form.homeAddress.trim() && !form.workAddress.trim() && !form.otherAddress.trim()) {
      errors.addressLines = "At least one address type required";
    }

    setAddressErrors(errors);
    return !errors.city && !errors.state && !errors.pincode && !errors.addressLines;
  }, []);

  useEffect(() => { validateProfile(profileForm); }, [profileForm, validateProfile]);
  useEffect(() => { validateAddress(addressForm); }, [addressForm, validateAddress]);

  const openEditProfile = () => {
    setProfileForm({
      name: userData?.name || "",
      mobile: userData?.mobile || "",
      membershipStatus: userData?.membershipStatus || "Regular",
      image: userData?.image || "",
    });
    setProfileTouched({ name: false, mobile: false });
    setProfileErrors({ name: "", mobile: "" });
    setIsEditProfileOpen(true);
  };

  const openAddressModal = (address: IAddress | null) => {
    setEditingAddress(address);
    if (address) {
      setAddressForm({
        homeAddress: address.homeAddress || "",
        workAddress: address.workAddress || "",
        otherAddress: address.otherAddress || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        landmark: address.landmark || "",
        isDefault: address.isDefault || false,
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
    setAddressTouched({ city: false, state: false, pincode: false, addressLines: false });
    setAddressErrors({ city: "", state: "", pincode: "", addressLines: "" });
    setIsAddressModalOpen(true);
  };

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
    }
  }, [editingAddress]);

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
        if (!userData) fetchUserDataDirectly();
        else setIsLoading(false);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [userData, dispatch]);

  // ─── Handlers ───────────────────────────────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setIsUploadingImage(true);
    const uploadToastId = toast.loading("Uploading...");

    try {
      const response = await axios.post("/api/user/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(setUserData(response.data));
      toast.success("Profile photo updated!", { id: uploadToastId });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Upload failed.", { id: uploadToastId });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileTouched({ name: true, mobile: true });
    if (!validateProfile(profileForm)) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    try {
      const response = await axios.put("/api/user/profile", profileForm);
      dispatch(setUserData(response.data));
      toast.success("Profile updated successfully!");
      setIsEditProfileOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed.");
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressTouched({ city: true, state: true, pincode: true, addressLines: true });
    if (!validateAddress(addressForm)) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    try {
      if (editingAddress) {
        const response = await axios.put("/api/user/address", {
          addressId: editingAddress._id,
          ...addressForm,
        });
        dispatch(setUserData(response.data));
        toast.success("Address updated!");
      } else {
        const response = await axios.post("/api/user/address", addressForm);
        dispatch(setUserData(response.data));
        toast.success("Address added!");
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Save failed.");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const response = await axios.delete("/api/user/address", { data: { addressId } });
      dispatch(setUserData(response.data));
      toast.success("Address deleted.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete failed.");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await axios.patch("/api/user/address", { addressId });
      dispatch(setUserData(response.data));
      toast.success("Default address updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed.");
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────

  const getMembershipConfig = (status?: string) => {
    switch (status) {
      case "Gold":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200/60",
          text: "text-amber-800",
          icon: <Crown className="h-3.5 w-3.5 text-amber-600" />,
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          ring: "ring-amber-400/30",
          shadow: "shadow-amber-500/10",
        };
      case "Premium":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200/60",
          text: "text-purple-800",
          icon: <Sparkles className="h-3.5 w-3.5 text-purple-600" />,
          badge: "bg-purple-100 text-purple-800 border-purple-200",
          ring: "ring-purple-400/30",
          shadow: "shadow-purple-500/10",
        };
      default:
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200/60",
          text: "text-emerald-800",
          icon: <Check className="h-3.5 w-3.5 text-emerald-600" />,
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          ring: "ring-emerald-400/30",
          shadow: "shadow-emerald-500/10",
        };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const addresses = userData?.addresses || [];
  const membership = getMembershipConfig(userData?.membershipStatus);

  // ─── Loading State ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-4 border-t-slate-900 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ─── Unauthenticated State ──────────────────────────────────────

  if (!userData) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        {/* <NavBar user={null} /> */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100"
          >
            <Shield className="h-10 w-10 text-slate-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Please log in to view and manage your profile details and delivery addresses.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
          >
            Login Now
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      {/* <NavBar user={userData as any} /> */}

      {/* Hero Background */}
      <div className="relative h-30 overflow-hidden bg-slate-900 sm:h-35">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8 -mt-24 sm:-mt-28">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-white/60 bg-white shadow-xl shadow-slate-200/50"
        >
          <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`group relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-4 border-white shadow-xl ${membership.shadow} ring-4 ${membership.ring} sm:h-32 sm:w-32`}
                onClick={() => fileInputRef.current?.click()}
              >
                {userData.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userData.image}
                    alt={userData.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <User className="h-14 w-14 text-slate-400" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/90">
                    Change
                  </span>
                </div>

                {/* Uploading Spinner */}
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </motion.div>

              {/* Floating Camera Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-lg transition-colors hover:bg-slate-800"
              >
                <Camera className="h-4 w-4" />
              </motion.button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {userData.name}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${membership.badge}`}
                    >
                      {membership.icon}
                      {userData.membershipStatus || "Regular"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-500 capitalize">
                    {userData.role} Account
                  </p>
                </div>

                <PremiumButton variant="primary" onClick={openEditProfile} icon={Edit3}>
                  Edit Profile
                </PremiumButton>
              </div>

              {/* Contact Grid */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: Mail, label: "Email", value: userData.email },
                  { icon: Phone, label: "Mobile", value: userData.mobile || "Not provided" },
                  { icon: Calendar, label: "Joined", value: formatDate(userData.createdAt) },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition-colors hover:border-slate-200 hover:bg-slate-100/50"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <item.icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.label}
                      </p>
                      <p className="truncate text-sm font-semibold text-slate-700">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={MapPinned}
            label="Saved Addresses"
            value={addresses.length}
            color="emerald"
            delay={0.3}
          />
          <StatCard
            icon={Package}
            label="Total Orders"
            value={0}
            color="blue"
            delay={0.4}
          />
          <StatCard
            icon={Clock}
            label="Member Since"
            value={userData.createdAt ? new Date(userData.createdAt).getFullYear() : "N/A"}
            color="amber"
            delay={0.5}
          />
          <StatCard
            icon={Shield}
            label="Account Status"
            value={userData.membershipStatus || "Regular"}
            color="purple"
            delay={0.6}
          />
        </div>

        {/* Addresses Section */}
        <div className="mt-12">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionDivider
              title="Delivery Locations"
              subtitle="Manage your saved addresses for faster checkout"
              icon={MapPin}
              delay={0.4}
            />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <PremiumButton
                variant="secondary"
                onClick={() => openAddressModal(null)}
                icon={Plus}
              >
                Add Address
              </PremiumButton>
            </motion.div>
          </div>

          {/* Address Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {addresses.length > 0 ? (
                addresses.map((address, index) => {
                  const hasHome = !!address.homeAddress?.trim();
                  const hasWork = !!address.workAddress?.trim();
                  const hasOther = !!address.otherAddress?.trim();

                  return (
                    <motion.div
                      layout
                      key={address._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${address.isDefault
                          ? "border-emerald-300/60 shadow-emerald-500/5 ring-1 ring-emerald-500/10"
                          : "border-slate-200/80 hover:border-slate-300"
                        }`}
                    >
                      {/* Default Badge */}
                      {address.isDefault && (
                        <div className="absolute -right-8 top-4 rotate-45 bg-emerald-500 px-8 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                          Default
                        </div>
                      )}

                      {/* Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {hasHome && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 border border-blue-100">
                              <Home className="h-3 w-3" />
                              HOME
                            </span>
                          )}
                          {hasWork && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 border border-purple-100">
                              <Building className="h-3 w-3" />
                              WORK
                            </span>
                          )}
                          {hasOther && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 border border-amber-100">
                              <Briefcase className="h-3 w-3" />
                              OTHER
                            </span>
                          )}
                        </div>

                        {/* Actions Dropdown */}
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openAddressModal(address)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id!)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Address Content */}
                      <div className="space-y-2.5 text-sm">
                        {hasHome && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                              Home
                            </p>
                            <p className="mt-0.5 font-semibold text-slate-800">{address.homeAddress}</p>
                          </div>
                        )}
                        {hasWork && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">
                              Work
                            </p>
                            <p className="mt-0.5 font-semibold text-slate-800">{address.workAddress}</p>
                          </div>
                        )}
                        {hasOther && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                              Other
                            </p>
                            <p className="mt-0.5 font-semibold text-slate-800">{address.otherAddress}</p>
                          </div>
                        )}

                        {address.landmark?.trim() && (
                          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Landmark
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-slate-600">{address.landmark}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                          {address.city}, {address.state} — {address.pincode}
                        </div>
                      </div>

                      {/* Set Default */}
                      {!address.isDefault && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSetDefault(address._id!)}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-500 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
                        >
                          <Pin className="h-3.5 w-3.5" />
                          Set as Default
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 px-6 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                    <MapPin className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No Addresses Saved</h3>
                  <p className="mt-1 max-w-xs text-sm text-slate-500">
                    Add your delivery locations to enable faster checkouts and precise dispatches.
                  </p>
                  <PremiumButton
                    variant="primary"
                    onClick={() => openAddressModal(null)}
                    icon={Plus}
                    className="mt-6"
                  >
                    Add Your First Address
                  </PremiumButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Edit Profile Modal ────────────────────────────────────── */}
      <PremiumModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
        icon={User}
        maxWidth="md"
      >
        <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
          <PremiumInput
            id="p-name"
            label="Full Name"
            icon={User}
            value={profileForm.name}
            onChange={(e: any) => {
              setProfileForm({ ...profileForm, name: e.target.value });
              setProfileTouched({ ...profileTouched, name: true });
            }}
            onBlur={() => setProfileTouched({ ...profileTouched, name: true })}
            error={profileErrors.name}
            touched={profileTouched.name}
            placeholder="Enter your full name"
            required
          />

          <PremiumInput
            id="p-mobile"
            label="Mobile Number"
            icon={Phone}
            value={profileForm.mobile}
            onChange={(e: any) => {
              setProfileForm({ ...profileForm, mobile: e.target.value });
              setProfileTouched({ ...profileTouched, mobile: true });
            }}
            onBlur={() => setProfileTouched({ ...profileTouched, mobile: true })}
            error={profileErrors.mobile}
            touched={profileTouched.mobile}
            placeholder="10-digit mobile number"
            type="tel"
          />

          {/* Membership Tier */}
          <div>
            <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Membership Tier
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["Regular", "Premium", "Gold"] as const).map((tier) => {
                const isSelected = profileForm.membershipStatus === tier;
                const configs: Record<string, any> = {
                  Regular: {
                    icon: Check,
                    active: "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20",
                    inactive: "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/30",
                    iconColor: isSelected ? "text-white" : "text-emerald-500",
                  },
                  Premium: {
                    icon: Sparkles,
                    active: "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20",
                    inactive: "border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50/30",
                    iconColor: isSelected ? "text-white" : "text-purple-500",
                  },
                  Gold: {
                    icon: Crown,
                    active: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20",
                    inactive: "border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50/30",
                    iconColor: isSelected ? "text-white" : "text-amber-500",
                  },
                };
                const cfg = configs[tier];
                const TierIcon = cfg.icon;

                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, membershipStatus: tier })}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition-all active:scale-95 ${isSelected ? cfg.active : cfg.inactive
                      }`}
                  >
                    <TierIcon className={`h-4 w-4 ${cfg.iconColor}`} />
                    {tier}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-100 pt-5">
            <PremiumButton
              variant="secondary"
              className="flex-1"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              variant="primary"
              type="submit"
              className="flex-1"
              icon={Save}
              disabled={!!(profileErrors.name || profileErrors.mobile)}
            >
              Save Changes
            </PremiumButton>
          </div>
        </form>
      </PremiumModal>

      {/* ─── Address Modal ─────────────────────────────────────────── */}
      <PremiumModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        icon={MapPin}
        maxWidth="lg"
      >
        <form onSubmit={handleAddressSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Alert */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-bold text-amber-800">Important</p>
              <p className="mt-0.5 text-amber-700/80">
                Fill at least one address type (Home, Work, or Other) below.
              </p>
            </div>
          </div>

          {/* Address Lines */}
          <PremiumInput
            id="ad-home"
            label="Home Address"
            icon={Home}
            value={addressForm.homeAddress}
            onChange={(e: any) => {
              setAddressForm({ ...addressForm, homeAddress: e.target.value });
              setAddressTouched({ ...addressTouched, addressLines: true });
            }}
            onBlur={() => setAddressTouched({ ...addressTouched, addressLines: true })}
            error={addressErrors.addressLines}
            touched={addressTouched.addressLines}
            placeholder="House / Flat / Street"
          />

          <PremiumInput
            id="ad-work"
            label="Work Address"
            icon={Building}
            value={addressForm.workAddress}
            onChange={(e: any) => {
              setAddressForm({ ...addressForm, workAddress: e.target.value });
              setAddressTouched({ ...addressTouched, addressLines: true });
            }}
            onBlur={() => setAddressTouched({ ...addressTouched, addressLines: true })}
            error={addressErrors.addressLines}
            touched={addressTouched.addressLines}
            placeholder="Office / Tech Park / Floor"
          />

          <PremiumInput
            id="ad-other"
            label="Other Address"
            icon={Briefcase}
            value={addressForm.otherAddress}
            onChange={(e: any) => {
              setAddressForm({ ...addressForm, otherAddress: e.target.value });
              setAddressTouched({ ...addressTouched, addressLines: true });
            }}
            onBlur={() => setAddressTouched({ ...addressTouched, addressLines: true })}
            error={addressErrors.addressLines}
            touched={addressTouched.addressLines}
            placeholder="Secondary address"
          />

          <PremiumInput
            id="ad-landmark"
            label="Landmark"
            icon={Sparkles}
            value={addressForm.landmark}
            onChange={(e: any) => setAddressForm({ ...addressForm, landmark: e.target.value })}
            placeholder="Near supermarket or Metro station"
          />

          {/* City, State, Pincode */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PremiumInput
              id="ad-city"
              label="City"
              icon={MapPin}
              value={addressForm.city}
              onChange={(e: any) => {
                setAddressForm({ ...addressForm, city: e.target.value });
                setAddressTouched({ ...addressTouched, city: true });
              }}
              onBlur={() => setAddressTouched({ ...addressTouched, city: true })}
              error={addressErrors.city}
              touched={addressTouched.city}
              placeholder="Mumbai"
              required
            />
            <PremiumInput
              id="ad-state"
              label="State"
              icon={MapPin}
              value={addressForm.state}
              onChange={(e: any) => {
                setAddressForm({ ...addressForm, state: e.target.value });
                setAddressTouched({ ...addressTouched, state: true });
              }}
              onBlur={() => setAddressTouched({ ...addressTouched, state: true })}
              error={addressErrors.state}
              touched={addressTouched.state}
              placeholder="Maharashtra"
              required
            />
            <PremiumInput
              id="ad-pincode"
              label="Pincode"
              icon={MapPin}
              value={addressForm.pincode}
              onChange={(e: any) => {
                setAddressForm({ ...addressForm, pincode: e.target.value });
                setAddressTouched({ ...addressTouched, pincode: true });
              }}
              onBlur={() => setAddressTouched({ ...addressTouched, pincode: true })}
              error={addressErrors.pincode}
              touched={addressTouched.pincode}
              placeholder="400001"
              required
            />
          </div>

          {/* Default Checkbox */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <input
              type="checkbox"
              id="ad-isdefault"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              className="h-5 w-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900/20"
            />
            <label htmlFor="ad-isdefault" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">
              Set as default delivery address
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-100 pt-5">
            <PremiumButton
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsAddressModalOpen(false);
                setEditingAddress(null);
              }}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              variant="primary"
              type="submit"
              className="flex-1"
              icon={Save}
              disabled={!!(
                addressErrors.city ||
                addressErrors.state ||
                addressErrors.pincode ||
                addressErrors.addressLines
              )}
            >
              {editingAddress ? "Save Changes" : "Add Address"}
            </PremiumButton>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
}
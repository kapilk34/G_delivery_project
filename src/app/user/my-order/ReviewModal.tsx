"use client";

import React, { useState } from "react";
import { Star, X, Send, Truck, CheckCircle } from "lucide-react";
import axios from "axios";

interface ReviewModalProps {
  orderId: string;
  deliveryBoyName: string;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const ReviewModal: React.FC<ReviewModalProps> = ({ orderId, deliveryBoyName, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/user/review", { orderId, rating, suggestion });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess(orderId);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const active = hovered || rating;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {submitted ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">Thank you for your review!</p>
            <p className="text-sm text-gray-500">Your feedback helps us improve our delivery service.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Rate your delivery</h2>
                <p className="text-xs text-gray-500">
                  Delivered by <span className="font-semibold text-gray-700">{deliveryBoyName}</span>
                </p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex flex-col items-center gap-2 py-4 bg-gray-50 rounded-xl mb-4">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => { setRating(star); setError(""); }}
                    className="transition-transform duration-100 hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors duration-100 ${
                        star <= active
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className={`text-sm font-semibold h-5 transition-all duration-150 ${active ? "text-amber-600" : "text-gray-400"}`}>
                {active ? STAR_LABELS[active] : "Tap a star to rate"}
              </p>
            </div>

            {/* Suggestion (optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Share your experience <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Was the delivery fast? Was the delivery partner polite? Any other feedback..."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all bg-white text-gray-800 placeholder-gray-400"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{suggestion.length}/300</p>
            </div>

            {/* Quick tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {["Fast delivery", "Polite partner", "On time", "Handled carefully", "Great service"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSuggestion((prev) => prev ? `${prev}, ${tag}` : tag)}
                  className="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-all"
                >
                  + {tag}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-600 mb-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || rating === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;

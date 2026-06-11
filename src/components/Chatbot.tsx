"use client"

import React, { useState, useEffect } from "react";
import { X, Bot } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);

  // Directly use the Botpress link provided
  const chatbotUrl = "https://cdn.botpress.cloud/webchat/v3.6/shareable.html?configUrl=https://files.bpcontent.cloud/2026/06/09/16/20260609160508-EFRVSNZ7.json";

  // Automatically hide the speech bubble after 12 seconds if not interacted with
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpeechBubble(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans flex flex-col items-end">
      {/* Speech Bubble / Help Message Line */}
      {showSpeechBubble && !isOpen && (
        <div className="mr-3 mb-3 bg-white/95 backdrop-blur-md text-gray-800 text-xs font-semibold px-4 py-2.5 rounded-2xl rounded-br-none shadow-xl border border-gray-100 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[280px]">
          <span className="text-green-600 font-bold shrink-0">💬 Help:</span>
          <span className="leading-snug truncate">Track orders or chat with us!</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowSpeechBubble(false);
            }}
            className="p-0.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0 ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowSpeechBubble(false);
        }}
        className="flex items-center justify-center w-16 h-16 rounded-full shadow-2xl hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-green-500 bg-white relative overflow-hidden cursor-pointer"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? (
          <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white transition-all duration-300">
            <X className="w-7 h-7" />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Professional Robot Support Avatar Image */}
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
              alt="Support Avatar"
              className="w-12 h-12 object-contain"
            />
            {/* Online Indicator Badge */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
          </div>
        )}
      </button>

      {/* Chat Window Container */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-0.5 bg-white rounded-xl shadow-inner shrink-0">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
                  alt="Bot Avatar" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">G-Delivery Live Support</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-green-100 font-medium">Support Agent is Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Content - Botpress Live Iframe */}
          <div className="flex-1 w-full h-full bg-gray-50 relative">
            <iframe
              src={chatbotUrl}
              title="Support Chatbot"
              className="w-full h-full border-0 absolute inset-0"
              allow="microphone; camera; geolocation"
            />
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  type?: "default" | "card" | "list" | "profile" | "table";
  count?: number;
}

export default function SkeletonLoader({ type = "default", count = 1 }: SkeletonLoaderProps) {
  const elements = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-gray-200"></div>
            {/* Content Placeholder */}
            <div className="p-4 space-y-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
              </div>
            </div>
          </div>
        );
      
      case "list":
        return (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="w-20">
              <div className="h-5 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xl shadow-slate-200/50 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-200 rounded-full border-4 border-white flex-shrink-0"></div>
              <div className="flex-1 w-full space-y-4 text-center sm:text-left mt-4 sm:mt-0">
                <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto sm:mx-0"></div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <div className="h-16 bg-gray-200 rounded-2xl"></div>
                  <div className="h-16 bg-gray-200 rounded-2xl"></div>
                  <div className="h-16 bg-gray-200 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case "table":
        return (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm animate-pulse space-y-4">
             <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/6"></div>
             </div>
             <div className="space-y-3">
               {[1, 2, 3, 4, 5].map((i) => (
                 <div key={i} className="flex justify-between gap-4">
                   <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                   <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                   <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                   <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                 </div>
               ))}
             </div>
          </div>
        )

      case "default":
      default:
        return (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`w-full ${type === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}`}>
      {elements.map((_, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </div>
  );
}

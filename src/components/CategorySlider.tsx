'use client'

import { Apple, Milk, Wheat, Cookie, Coffee, Sparkles, Home, Baby, PawPrint } from "lucide-react";
import React, { useEffect, useRef } from 'react'

function CategorySlider() {
    const scrollRef = useRef(null)
    const speed = 0.5 // smoother speed

    const categories = [
        { id: 1, name: "Fruits & Vegetables", icon: Apple, color: "bg-green-100" },
        { id: 2, name: "Dairy & Eggs", icon: Milk, color: "bg-yellow-100" },
        { id: 3, name: "Rice, Atta & Biscuits", icon: Wheat, color: "bg-orange-100" },
        { id: 4, name: "Snacks & Branded Foods", icon: Cookie, color: "bg-red-100" },
        { id: 5, name: "Beverages", icon: Coffee, color: "bg-blue-100" },
        { id: 6, name: "Personal Care", icon: Sparkles, color: "bg-pink-100" },
        { id: 7, name: "Household & Cleaning", icon: Home, color: "bg-purple-100" },
        { id: 8, name: "Baby Care", icon: Baby, color: "bg-indigo-100" },
        { id: 9, name: "Pet Care", icon: PawPrint, color: "bg-teal-100" },
    ]

    const infiniteCategories = [...categories, ...categories]

    useEffect(() => {
        const slider = scrollRef.current
        let animationId

        const animate = () => {
            if (!slider) return

            slider.scrollLeft += speed

            // safer reset condition
            if (slider.scrollLeft >= slider.scrollWidth / 2) {
                slider.scrollLeft = 0
            }

            animationId = requestAnimationFrame(animate)
        }

        animationId = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationId)
    }, [])

    return (
        <div className="w-[90%] md:w-[80%] mx-auto mt-10 relative">
            <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
                Shop by Category
            </h2>

            <div
                ref={scrollRef}
                className="flex gap-5 overflow-hidden pb-4"
            >
                {infiniteCategories.map((category, index) => {
                    const Icon = category.icon
                    return (
                        <div
                            key={index}
                            className={`flex flex-col items-center justify-center min-w-[130px] md:min-w-[150px] p-5 rounded-2xl ${category.color} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
                        >
                            <div className="bg-white p-3 rounded-full shadow-sm">
                                <Icon size={28} className="text-gray-700" />
                            </div>
                            <span className="mt-3 text-sm font-semibold text-gray-800 text-center">
                                {category.name}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CategorySlider
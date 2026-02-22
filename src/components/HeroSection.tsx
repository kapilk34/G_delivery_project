"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import Link from "next/link";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const HeroSection = () => {
  const heroSlides = [
    {
      id: 1,
      title: "Fresh Groceries Delivered",
      subtitle: "to Your Doorstep",
      description:"Shop from the comfort of your home and get fresh groceries delivered in minutes with premium quality guarantee.",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      image:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2070&q=80",
    },
    {
      id: 2,
      title: "Organic & Fresh",
      subtitle: "Farm to Table",
      description:"Handpicked organic fruits and vegetables sourced directly from trusted local farms.",
      buttonText: "Explore Organic",
      buttonLink: "/organic",
      image:"https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=2070&q=80",
    },
    {
      id: 3,
      title: "Lightning Fast Delivery",
      subtitle: "30 Minutes or Less",
      description: "Experience ultra-fast delivery with real-time tracking and instant updates.",
      buttonText: "Order Now",
      buttonLink: "/delivery",
      image:"https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=2070&q=80",
    },
  ];

  return (
    <section className="relative w-80% h-[calc(100vh-80px)] overflow-hidden rounded-2xl mt-30 ml-10 mr-10">
      <Swiper modules={[Autoplay, Pagination, Navigation, EffectFade]} effect="fade" slidesPerView={1} loop={true} navigation={false} pagination={{ clickable: true }} autoplay={{delay: 5000, disableOnInteraction: false}} className="h-full hero-swiper">
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <motion.div initial={{ scale: 1 }} animate={{ scale: 1.08 }} transition={{ duration: 8, ease: "easeOut" }} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}/>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60" />
                    <div className="relative z-10 h-full flex items-center justify-center px-6">
                        <div className="max-w-5xl text-center">
                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-block px-5 py-2 mb-5 text-sm font-semibold bg-green-500/90 text-white rounded-full shadow-lg">
                                    {slide.subtitle}
                                </motion.span>

                                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                    {slide.title}
                                </motion.h1>

                                <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
                                    {slide.description}
                                </motion.p>

                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href={slide.buttonLink} className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/40 transition-all duration-300 hover:scale-105">
                                        {slide.buttonText}
                                    </Link>

                                    <Link href="/categories" className="px-8 py-4 bg-white/10 border border-white/30 backdrop-blur-lg text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                                    Browse Categories
                                    </Link>
                                </motion.div>

                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="grid grid-cols-3 gap-4 mt-12">
                                  {[
                                    { value: "30min", label: "Delivery" },
                                    { value: "5000+", label: "Products" },
                                    { value: "24/7", label: "Support" },
                                  ].map((stat, index) => (
                                    <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                                      <div className="text-2xl md:text-3xl font-bold text-green-400">{stat.value}</div>
                                      <div className="text-sm text-gray-300">{stat.label}</div>
                                    </div>
                                  ))}
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx global>{`.hero-swiper .swiper-button-next, .hero-swiper .swiper-button-prev {color: white} .hero-swiper .swiper-pagination-bullet {background: white opacity: 0.5} .hero-swiper .swiper-pagination-bullet-active {background: #22c55e opacity: 1}`}</style>
    </section>
  );
};

export default HeroSection;
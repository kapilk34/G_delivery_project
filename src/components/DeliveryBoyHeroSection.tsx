// app/page.tsx (or app/components/HeroSection.tsx)
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Award, Leaf, ShoppingBag } from "lucide-react";

// --- Reusable Components ---

const Badge = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-xs font-medium tracking-widest text-green-700 uppercase bg-green-100/80 rounded-full backdrop-blur-sm border border-green-200/50"
  >
    {children}
  </motion.div>
);

const FeatureCard = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    className="flex items-start gap-4 p-4 transition-all duration-300 bg-white/80 rounded-xl shadow-sm backdrop-blur-sm border border-white/50 hover:shadow-lg hover:bg-white/95"
  >
    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-green-600 shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </motion.div>
);

// --- Floating Elements ---

const FloatingDiscountBadge = () => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
    className="absolute -top-6 -right-6 z-20 flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-2xl shadow-green-500/30 text-white"
  >
    <span className="text-[8px] font-bold tracking-widest uppercase">Up to</span>
    <span className="text-2xl font-extrabold leading-none">50%</span>
    <span className="text-[8px] font-bold tracking-widest uppercase">OFF</span>
  </motion.div>
);

const FloatingBlurCircle = ({
  size,
  color,
  top,
  right,
  left,
  bottom,
  blur,
  opacity,
}: {
  size: number;
  color: string;
  top?: string;
  right?: string;
  left?: string;
  bottom?: string;
  blur?: number;
  opacity?: number;
}) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      background: color,
      top,
      right,
      left,
      bottom,
      filter: `blur(${blur || 80}px)`,
      opacity: opacity || 0.4,
    }}
  />
);

// --- Main Hero Section ---

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-[#F8FFF9] via-white to-[#F0FDF4]">
      {/* --- Background Decorative Elements --- */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingBlurCircle
          size={500}
          color="#22C55E"
          top="-10%"
          right="-5%"
          blur={120}
          opacity={0.12}
        />
        <FloatingBlurCircle
          size={350}
          color="#15803D"
          bottom="-5%"
          left="10%"
          blur={100}
          opacity={0.06}
        />
        <FloatingBlurCircle
          size={250}
          color="#DCFCE7"
          top="30%"
          right="20%"
          blur={90}
          opacity={0.2}
        />

        {/* Organic wave shapes - right side */}
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-100/20 to-transparent rounded-tl-[100%] pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-br from-green-50/15 to-transparent rounded-bl-[100%] pointer-events-none" />
      </div>

      <div className="container relative z-10 flex flex-col items-center px-4 py-12 mx-auto md:px-8 lg:py-16 xl:py-20 2xl:py-24 max-w-7xl lg:flex-row lg:items-center gap-10 lg:gap-14 xl:gap-18">
        {/* --- Left Column: Content --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 w-full lg:max-w-xl xl:max-w-2xl"
        >
          <motion.div variants={itemVariants}>
            <Badge>
              <span className="text-base">🌿</span> Fresh Groceries, Delivered
            </Badge>
          </motion.div>

          <motion.h4
            variants={itemVariants}
            className="font-display text-xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            <span className="">Fresh Groceries,</span>
            <span className="block mt-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Delivered to You
            </span>
          </motion.h4>

          <motion.p
            variants={itemVariants}
            className="max-w-lg mt-6 text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl"
          >
            Get the best quality products at unbeatable prices. Fast delivery to
            your doorstep.
          </motion.p>

          {/* --- CTA Buttons --- */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition-all duration-300 bg-green-500 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:bg-green-600"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wide text-gray-700 uppercase transition-all duration-300 bg-white border rounded-xl border-gray-200/80 hover:border-green-400 hover:bg-green-50/50 hover:text-green-700 shadow-sm"
            >
              <ShoppingBag className="w-5 h-5 text-green-500" />
              Explore Deals
            </motion.button>
          </motion.div>

          {/* --- Feature Cards --- */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 gap-3 mt-10 sm:grid-cols-3"
          >
            <motion.div variants={itemVariants}>
              <FeatureCard
                icon={<Truck className="w-5 h-5" />}
                title="Free Delivery"
                subtitle="On orders above $25"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FeatureCard
                icon={<Award className="w-5 h-5" />}
                title="Best Prices"
                subtitle="Affordable every day"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FeatureCard
                icon={<Leaf className="w-5 h-5" />}
                title="Fresh Quality"
                subtitle="100% guaranteed"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* --- Right Column: Illustration --- */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          className="relative flex-1 w-full lg:max-w-xl xl:max-w-2xl"
        >
          {/* Floating Grocery Bag with Items */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="relative aspect-square w-full max-w-[450px] mx-auto"
          >
            {/* Soft green glow behind the bag */}
            <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-[85%] h-[85%] bg-green-200/40 blur-3xl" />

            {/* Shopping Bag Illustration */}
            <div className="relative w-full h-full">
              <Image
                src="/images/grocery-bag.png"
                alt="Premium grocery shopping bag with fresh produce"
                fill
                className="object-contain drop-shadow-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Floating Items (decorative) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse" }}
                className="absolute -top-3 -left-3 w-14 h-14 md:w-16 md:h-16"
              >
                <Image
                  src="/images/tomato.png"
                  alt="Tomato"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute -bottom-2 -right-3 w-16 h-16 md:w-20 md:h-20"
              >
                <Image
                  src="/images/broccoli.png"
                  alt="Broccoli"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-1/4 -left-6 w-12 h-12 md:w-14 md:h-14"
              >
                <Image
                  src="/images/leafy-green.png"
                  alt="Lettuce"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute bottom-1/3 -right-5 w-12 h-12 md:w-14 md:h-14"
              >
                <Image
                  src="/images/bell-pepper.png"
                  alt="Bell Pepper"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-1/2 -left-8 w-10 h-10 md:w-12 md:h-12"
              >
                <Image
                  src="/images/garlic.png"
                  alt="Garlic"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, repeatType: "reverse" }}
                className="absolute bottom-6 -left-2 w-14 h-14 md:w-16 md:h-16"
              >
                <Image
                  src="/images/apple.png"
                  alt="Apple"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4.1, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-6 -right-3 w-14 h-14 md:w-16 md:h-16"
              >
                <Image
                  src="/images/orange.png"
                  alt="Orange"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 3.9, repeat: Infinity, repeatType: "reverse" }}
                className="absolute bottom-1/4 -right-6 w-12 h-12 md:w-14 md:h-14"
              >
                <Image
                  src="/images/banana.png"
                  alt="Banana"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 4.3, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-0 right-1/4 w-14 h-14 md:w-16 md:h-16"
              >
                <Image
                  src="/images/bread.png"
                  alt="Bread"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{ duration: 3.3, repeat: Infinity, repeatType: "reverse" }}
                className="absolute bottom-0 left-1/3 w-10 h-16 md:w-12 md:h-20"
              >
                <Image
                  src="/images/milk.png"
                  alt="Milk Bottle"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>

              {/* Floating Discount Badge */}
              <FloatingDiscountBadge />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
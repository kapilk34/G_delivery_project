'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Snowflake,
  Sun,
  Wind,
  Heart,
  Star,
  ArrowRight,
  Timer,
  TrendingUp
} from 'lucide-react';

// --- Types ---
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  unit: string;
  inStock: boolean;
}

interface SeasonData {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  accentColor: string;
  description: string;
  products: Product[];
}

// --- Mock Data ---
const seasonalData: SeasonData[] = [
  {
    id: 'summer',
    name: 'Summer Harvest',
    icon: <Sun className="w-5 h-5" />,
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-orange-50',
    accentColor: 'bg-amber-500',
    description: 'Fresh picks for sunny days',
    products: [
      {
        id: 's1',
        name: 'Organic Watermelon',
        description: 'Sweet, juicy, and perfectly ripe',
        price: 5.99,
        originalPrice: 7.99,
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop',
        rating: 4.8,
        reviews: 234,
        badge: 'Best Seller',
        unit: 'each',
        inStock: true,
      },
      {
        id: 's2',
        name: 'Fresh Strawberries',
        description: 'Locally sourced, hand-picked',
        price: 3.49,
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop',
        rating: 4.9,
        reviews: 189,
        badge: 'Fresh Arrival',
        unit: 'lb',
        inStock: true,
      },
      {
        id: 's3',
        name: 'Sweet Corn',
        description: 'Farm-fresh golden corn',
        price: 0.79,
        originalPrice: 1.29,
        image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop',
        rating: 4.6,
        reviews: 156,
        unit: 'each',
        inStock: true,
      },
      {
        id: 's4',
        name: 'Heirloom Tomatoes',
        description: 'Colorful, flavorful variety pack',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 98,
        badge: 'Limited',
        unit: 'pack',
        inStock: true,
      },
    ],
  },
  {
    id: 'autumn',
    name: 'Autumn Bounty',
    icon: <Leaf className="w-5 h-5" />,
    color: 'text-orange-700',
    bgGradient: 'from-orange-50 to-red-50',
    accentColor: 'bg-orange-600',
    description: 'Cozy flavors of the season',
    products: [
      {
        id: 'a1',
        name: 'Butternut Squash',
        description: 'Perfect for roasting and soups',
        price: 2.49,
        originalPrice: 3.49,
        image: 'https://images.unsplash.com/photo-1570586437263-162f27db78a5?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 145,
        badge: 'Seasonal',
        unit: 'each',
        inStock: true,
      },
      {
        id: 'a2',
        name: 'Honeycrisp Apples',
        description: 'Crisp, sweet, and refreshing',
        price: 2.99,
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
        rating: 4.9,
        reviews: 312,
        badge: 'Top Rated',
        unit: 'lb',
        inStock: true,
      },
      {
        id: 'a3',
        name: 'Pumpkin Spice Bundle',
        description: 'Everything you need for fall baking',
        price: 12.99,
        originalPrice: 16.99,
        image: 'https://images.unsplash.com/photo-1506917728037-b6af011dc951?w=400&h=400&fit=crop',
        rating: 4.5,
        reviews: 89,
        unit: 'bundle',
        inStock: true,
      },
      {
        id: 'a4',
        name: 'Fresh Cranberries',
        description: 'Tart and vibrant for sauces',
        price: 3.99,
        image: 'https://images.unsplash.com/photo-1623227866882-c005c207758f?w=400&h=400&fit=crop',
        rating: 4.6,
        reviews: 67,
        unit: 'bag',
        inStock: true,
      },
    ],
  },
  {
    id: 'winter',
    name: 'Winter Comfort',
    icon: <Snowflake className="w-5 h-5" />,
    color: 'text-slate-700',
    bgGradient: 'from-slate-50 to-blue-50',
    accentColor: 'bg-slate-600',
    description: 'Warm up with hearty essentials',
    products: [
      {
        id: 'w1',
        name: 'Navel Oranges',
        description: 'Sweet, seedless, vitamin-packed',
        price: 1.99,
        originalPrice: 2.99,
        image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop',
        rating: 4.8,
        reviews: 201,
        badge: 'Vitamin C Boost',
        unit: 'lb',
        inStock: true,
      },
      {
        id: 'w2',
        name: 'Kale Bunch',
        description: 'Organic, nutrient-dense greens',
        price: 2.29,
        image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=400&h=400&fit=crop',
        rating: 4.5,
        reviews: 134,
        unit: 'bunch',
        inStock: true,
      },
      {
        id: 'w3',
        name: 'Sweet Potatoes',
        description: 'Versatile, healthy, and delicious',
        price: 1.49,
        originalPrice: 1.99,
        image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 178,
        badge: 'Popular',
        unit: 'lb',
        inStock: true,
      },
      {
        id: 'w4',
        name: 'Pomegranate',
        description: 'Ruby-red antioxidant powerhouse',
        price: 3.49,
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop',
        rating: 4.6,
        reviews: 92,
        unit: 'each',
        inStock: true,
      },
    ],
  },
  {
    id: 'spring',
    name: 'Spring Fresh',
    icon: <Wind className="w-5 h-5" />,
    color: 'text-emerald-700',
    bgGradient: 'from-emerald-50 to-green-50',
    accentColor: 'bg-emerald-500',
    description: 'Light, crisp, and rejuvenating',
    products: [
      {
        id: 'sp1',
        name: 'Asparagus Spears',
        description: 'Tender, green, and flavorful',
        price: 3.99,
        originalPrice: 5.49,
        image: 'https://images.unsplash.com/photo-1515471209610-dae1c92d8777?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 167,
        badge: 'Spring Special',
        unit: 'bunch',
        inStock: true,
      },
      {
        id: 'sp2',
        name: 'Fresh Peas',
        description: 'Sweet and crisp garden peas',
        price: 2.99,
        image: 'https://images.unsplash.com/photo-1592321675774-3de57f3ee0dc?w=400&h=400&fit=crop',
        rating: 4.5,
        reviews: 88,
        unit: 'lb',
        inStock: true,
      },
      {
        id: 'sp3',
        name: 'Radish Bunch',
        description: 'Peppery crunch, beautiful color',
        price: 1.99,
        image: 'https://images.unsplash.com/photo-1590412699129-2d24696e3a4c?w=400&h=400&fit=crop',
        rating: 4.4,
        reviews: 56,
        unit: 'bunch',
        inStock: true,
      },
      {
        id: 'sp4',
        name: 'Artichokes',
        description: 'Premium globe artichokes',
        price: 2.49,
        originalPrice: 3.99,
        image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=400&h=400&fit=crop',
        rating: 4.6,
        reviews: 73,
        badge: 'Chef\'s Pick',
        unit: 'each',
        inStock: true,
      },
    ],
  },
];

// --- Components ---

const ProductCard: React.FC<{ product: Product; seasonColor: string; accentColor: string }> = ({
  product,
  accentColor,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && (
            <span className={`${accentColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm`}>
              -{discount}%
            </span>
          )}
          {product.badge && !discount && (
            <span className={`${accentColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm`}>
              {product.badge}
            </span>
          )}
          {product.badge && discount && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1">
            {product.name}
          </h3>
        </div>

        <p className="text-gray-500 text-sm mb-3 line-clamp-1">{product.description}</p>
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>
      </div>
    </div>
  );
};

const SeasonalProducts: React.FC = () => {
  const [activeSeason, setActiveSeason] = useState<string>('summer');
  const currentSeason = seasonalData.find((s) => s.id === activeSeason)!;

  return (
    <section className="w-full py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-5 text-center">
            Trending Grocery of the Season
          </h2>
        </div>

        {/* Season Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {seasonalData.map((season) => {
            const isActive = activeSeason === season.id;
            return (
              <button
                key={season.id}
                onClick={() => setActiveSeason(season.id)}
                className={`
                  relative flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300
                  ${isActive
                    ? `${season.color} bg-white shadow-lg scale-105 ring-2 ring-offset-2 ring-gray-100`
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-md bg-white/50'
                  }
                `}
              >
                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                  {season.icon}
                </span>
                <span>{season.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-full border-2 ${season.color.replace('text-', 'border-')}`}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {currentSeason.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                seasonColor={currentSeason.color}
                accentColor={currentSeason.accentColor}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default SeasonalProducts;
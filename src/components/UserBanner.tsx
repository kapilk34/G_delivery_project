'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Truck, 
  Leaf, 
  ArrowRight, 
  Star,
  Play
} from 'lucide-react';
import Image from 'next/image';

const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return count;
};

const orbitProducts = [
  {
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&h=200&fit=crop',
    label: 'Fresh Fruits',
    size: 'w-16 h-16',
    orbitDuration: '68s',
    orbitDelay: '0s',
    orbitRadius: 210, // pixels from center
    orbitDirection: 'normal',
  },
  {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop',
    label: 'Vegetables',
    size: 'w-14 h-14',
    orbitDuration: '44s',
    orbitDelay: '-6s',
    orbitRadius: 180,
    orbitDirection: 'reverse',
  },
  {
    image: 'https://images.unsplash.com/photo-1628102491629-778571d893a3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z3JvY2VyeXxlbnwwfHwwfHx8MA%3D%3D',
    label: 'Meat',
    size: 'w-12 h-12',
    orbitDuration: '30s',
    orbitDelay: '-12s',
    orbitRadius: 240,
    orbitDirection: 'normal',
  },
  {
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=200&h=200&fit=crop',
    label: 'Dairy',
    size: 'w-14 h-14',
    orbitDuration: '24s',
    orbitDelay: '-3s',
    orbitRadius: 160,
    orbitDirection: 'reverse',
  },
  {
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200&h=200&fit=crop',
    label: 'Bakery',
    size: 'w-12 h-12',
    orbitDuration: '36s',
    orbitDelay: '-9s',
    orbitRadius: 200,
    orbitDirection: 'normal',
  },
];

// Floating cards data
const floatingCards = [
  {
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&h=100&fit=crop',
    title: 'Organic Avocado',
    price: '$2.49',
    tag: 'Fresh',
    position: 'top-4 -right-4',
  },
  {
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100&h=100&fit=crop',
    title: 'Red Apples',
    price: '$3.99',
    tag: 'Best Seller',
    position: '-left-8 top-1/3',
  },
  {
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100&h=100&fit=crop',
    title: 'Fresh Bread',
    price: '$4.29',
    tag: 'Hot',
    position: 'bottom-8 -right-2',
  },
];

export default function GroceryBanner() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [orbitAngles, setOrbitAngles] = useState<number[]>(orbitProducts.map(() => 0));
  
  const happyCustomers = useCountUp(50000);
  const deliveryTime = useCountUp(15);
  
  const features = [
    { icon: Zap, label: "Express Delivery", desc: "Under 15 mins" },
    { icon: Leaf, label: "Farm Fresh", desc: "100% Organic" },
    { icon: Truck, label: "Free Shipping", desc: "Orders $35+" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const startTimes = orbitProducts.map((p) => Date.now() + parseFloat(p.orbitDelay) * 1000);
    
    const animate = () => {
      const now = Date.now();
      const newAngles = orbitProducts.map((product, index) => {
        const effectiveTime = now - startTimes[index];
        const duration = parseFloat(product.orbitDuration) * 1000;
        const progress = (effectiveTime % duration) / duration;
        const angle = progress * 360 * (product.orbitDirection === 'reverse' ? -1 : 1);
        return angle;
      });
      setOrbitAngles(newAngles);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[700px] overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`,
            }}
          >
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 z-10">
            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fresh Groceries{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-emerald-600">Delivered</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-300 -z-0" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
                <br />
                to Your Door
              </h1>
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Farm-fresh produce, premium meats, and daily essentials delivered in under 15 minutes. Experience the future of grocery shopping.
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex gap-8">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {happyCustomers.toLocaleString()}+
                </div>
                <div className="text-sm text-gray-500 font-medium">Happy Customers</div>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {deliveryTime}
                </div>
                <div className="text-sm text-gray-500 font-medium">Min Delivery</div>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-500 font-medium">App Rating</div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-500 cursor-default ${
                    activeFeature === index 
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm scale-105' 
                      : 'bg-white/60 border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <feature.icon className={`w-4 h-4 ${activeFeature === index ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative w-[520px] h-[520px] lg:w-[580px] lg:h-[580px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200/20 to-orange-200/20 blur-3xl scale-110" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[420px] h-[420px] rounded-full border-2 border-dashed border-emerald-200/30 animate-spin-slow" style={{ animationDuration: '40s' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[360px] h-[360px] rounded-full border border-orange-200/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[320px] h-[320px] rounded-full border border-emerald-100/30" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[480px] h-[480px] rounded-full border border-dashed border-orange-100/20" style={{ animationDuration: '50s' }} />
              </div>
              
              {/* Main Circle Background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-emerald-50 to-orange-50 backdrop-blur-sm shadow-inner" />
              </div>
              
              {/* Center Main Image */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="relative w-52 h-52 lg:w-60 lg:h-60">
                  {/* Glow behind image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-orange-400/20 rounded-full blur-xl scale-125" />
                  
                  <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white ring-4 ring-emerald-100">
                    <Image
                      src="https://gvu57hqxi3.ufs.sh/f/FOd38ztMu1UwL1xocXfy8AqV9TDIL3MsQnbwrJgB15lmcjU0"
                      alt="Fresh groceries basket"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              {orbitProducts.map((product, index) => {
                const angleRad = (orbitAngles[index] * Math.PI) / 180;
                const centerX = 260; // half of 520px container
                const centerY = 260;
                const x = centerX + product.orbitRadius * Math.cos(angleRad);
                const y = centerY + product.orbitRadius * Math.sin(angleRad);
                
                return (
                  <div
                    key={index}
                    className="absolute transition-none"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className={`${product.size} rounded-full overflow-hidden shadow-lg border-2 border-white hover:scale-125 transition-transform duration-300 cursor-pointer group z-20`}>
                      <Image
                        src={product.image}
                        alt={product.label}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-30">
                        <span className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">{product.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {floatingCards.map((card, index) => (
                <div
                  key={index}
                  className={`absolute ${card.position} animate-float-card z-20`}
                  style={{ animationDelay: `${index * 0.7}s` }}
                >
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-3 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                        <Image
                          src={card.image}
                          alt={card.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{card.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">{card.tag}</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{card.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Decorative dots around */}
              <div className="absolute top-12 left-16 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <div className="absolute bottom-20 right-12 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/4 right-8 w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-1/3 left-10 w-2 h-2 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 40s linear infinite;
        }
        .animate-float-card {
          animation: float-card 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
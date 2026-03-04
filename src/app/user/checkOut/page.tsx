'use client'

import { RootState } from '@/redux/store'
import { ArrowLeft, CreditCard, MapPin, Truck, Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'motion/react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

function CheckOutPage() {
  const router = useRouter()

  const { cartData, subTotal, deliveryFee, finalTotal } =
    useSelector((state: RootState) => state.cart)

  const [address, setAddress] = useState('')
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (cartData.length === 0) {
      router.push('/user/cart')
    }
  }, [cartData, router])

  // 📍 Auto Fetch Location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported')
      return
    }

    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        setLocation({ lat: latitude, lng: longitude })

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`
          )
          const data = await res.json()
          setAddress(data.results[0]?.formatted_address || '')
        } catch (err) {
          alert('Unable to fetch address')
        }

        setLoadingLocation(false)
      },
      () => {
        alert('Location permission denied')
        setLoadingLocation(false)
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-10">
      <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] mx-auto">
        <button
          onClick={() => router.push("/user/cart")}
          className="flex items-center gap-2 text-green-700 hover:text-green-900 font-semibold transition-all mb-8"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-10">
          Secure Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">

            {/* Delivery Section */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="text-green-600" />
                  <h2 className="text-xl font-semibold text-green-800">
                    Delivery Address
                  </h2>
                </div>

                <button
                  onClick={handleDetectLocation}
                  className="text-sm bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 transition flex items-center gap-2"
                >
                  {loadingLocation ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    'Detect Location'
                  )}
                </button>
              </div>

              {/* Live Google Map */}
              {location && (
                <div className="mb-4">
                  <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                    <GoogleMap
                      mapContainerStyle={{
                        width: '100%',
                        height: '300px',
                        borderRadius: '16px'
                      }}
                      center={location}
                      zoom={15}
                    >
                      <Marker position={location} />
                    </GoogleMap>
                  </LoadScript>
                </div>
              )}

              <input
                type="text"
                placeholder="Full Name"
                className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              />

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your delivery address"
                rows={3}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
              />
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-green-600" />
                <h2 className="text-xl font-semibold text-green-800">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-4">

                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-green-50">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  Cash on Delivery
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-green-50">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  UPI Payment
                </label>

                {paymentMethod === 'upi' && (
                  <input
                    type="text"
                    placeholder="Enter UPI ID"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
                  />
                )}

                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-green-50">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  Credit / Debit Card
                </label>

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100 h-fit">

            <div className="flex items-center gap-3 mb-6">
              <Truck className="text-green-600" />
              <h2 className="text-xl font-semibold text-green-800">
                Order Summary
              </h2>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {cartData.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x ₹{item.price}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-green-700">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-green-800">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold text-lg transition-all shadow-md hover:shadow-lg"
              onClick={() => alert(`Order placed using ${paymentMethod.toUpperCase()} 🎉`)}
            >
              Place Order
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckOutPage;
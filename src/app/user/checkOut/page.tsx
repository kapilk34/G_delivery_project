'use client'

import { RootState } from '@/redux/store'
import { ArrowLeft, CreditCard, MapPin, Truck, Loader2, User, Phone, Home, Building, Navigation, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { address } from 'motion/react-client'
import { motion } from 'motion/react'
import MapView from '@/components/MapView'


function CheckOutPage() {
  const router = useRouter()
  const {userData} = useSelector((state:RootState)=>state.user)
  const [address, setAddress] = useState({
    fullName:"",
    mobile:"",
    city:"",
    state:"",
    pincode:"",
    fullAddress:"",
  })

  const [position, setPosition] = useState<[number,number] | null>(null)
  useEffect(() =>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos)=>{
        const {latitude,longitude} = pos.coords
        setPosition([latitude,longitude])
      })
    }
  },[])

  useEffect(() =>{
    if(userData){
      setAddress((prev)=>({...prev,fullName:userData.name || ""}))
      setAddress((prev)=>({...prev,mobile:userData.mobile || ""}))
    }
  }, [userData])

  const { cartData, subTotal, deliveryFee, finalTotal } =
    useSelector((state: RootState) => state.cart)

  const [paymentMethod, setPaymentMethod] = useState('cod')
  

  useEffect(() => {
    if (cartData.length === 0) {
      router.push('/user/cart')
    }
  }, [cartData, router])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-10">
      <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] mx-auto">
        <button onClick={() => router.push("/user/cart")}
          className="flex items-center gap-2 text-green-700 hover:text-green-900 font-semibold transition-all mb-8">
          <ArrowLeft size={18} />
          Back to Cart
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-10">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-green-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <MapPin className="text-green-700" />
                Delivery Address
              </h2>

              <div className='space-y-4'>
                <div className='relative'>
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={address.fullName} onChange={(e)=>setAddress((prev)=>({...prev,fullName:address.fullName}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm'/>
                </div>

                <div className='relative'>
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={address.mobile} onChange={(e)=>setAddress((prev)=>({...prev,mobile:address.mobile}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                </div>

                <div className='relative'>
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={address.fullAddress} placeholder='Full Address' onChange={(e)=>setAddress((prev)=>({...prev,fullAddress:address.fullAddress}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                </div>
                
                <div className='grid grid-cols-3 gap-3'>
                  <div className='relative'>
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" value={address.city} placeholder='City' onChange={(e)=>setAddress((prev)=>({...prev,fullAddress:address.city}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                  </div>
                  <div className='relative'>
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" value={address.state} placeholder='State' onChange={(e)=>setAddress((prev)=>({...prev,fullAddress:address.state}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                  </div>
                  <div className='relative'>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" value={address.pincode} placeholder='Pincode' onChange={(e)=>setAddress((prev)=>({...prev,fullAddress:address.pincode}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                  </div>
                </div>

                <div className='flex gap-2 mt-3'>
                  <input type='text' placeholder='search city and area...' className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"/>
                  <button className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200">Search</button>
                </div>

                <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-md border border-gray-200">
                  <MapView position={position}/>
                </div>
              </div>
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
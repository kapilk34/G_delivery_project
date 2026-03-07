'use client'

import { RootState } from '@/redux/store'
import { ArrowLeft, CreditCard, MapPin, Truck, Loader2, User, Phone, Home, Building, Navigation, Search, LocateFixed, CreditCardIcon,TruckIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'motion/react'
import { MapContainer, Marker, TileLayer, useMap} from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import L, { LatLngExpression } from 'leaflet'
import axios from 'axios'
import { OpenStreetMapProvider } from 'leaflet-geosearch'

const markerIcon = new L.Icon({
  iconUrl: "https://thumbs.dreamstime.com/b/gps-icon-vector-logo-design-map-pointer-pin-location-symbol-flat-style-navigation-icons-web-mobile-place-marker-travel-158027525.jpg",
  iconSize: [35, 41],
  iconAnchor: [12, 41]
})

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

  const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod")

  const [position, setPosition] = useState<[number,number] | null>(null)
  useEffect(() =>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos)=>{
        const {latitude,longitude} = pos.coords
        setPosition([latitude,longitude])
      },(err)=>{console.log("location error", err)},{enableHighAccuracy:true, maximumAge:0, timeout:10000})
    }
  },[])

  useEffect(() =>{
    if(userData){
      setAddress((prev)=>({...prev,fullName:userData.name || ""}))
      setAddress((prev)=>({...prev,mobile:userData.mobile || ""}))
    }
  }, [userData])

  const DraggableMarker:React.FC = ()=>{
    const map = useMap()
    useEffect(()=>{
      map.setView(position as LatLngExpression, 15, {animate:true})
    },[position,map])

    return <Marker icon={markerIcon} position={position as LatLngExpression}  draggable={true} eventHandlers={{
              dragend:(e:L.LeafletEvent)=>{
                const marker = e.target as L.Marker 
                const {lat, lng} = marker.getLatLng()
                setPosition([lat,lng])
              }
            }}/>
  }

  const { cartData, subTotal, deliveryFee, finalTotal } = useSelector((state: RootState) => state.cart)
  
  const handleSearchQuery = async()=>{
    setSearchLoading(true)
    const provider = new OpenStreetMapProvider()
    const result = await provider.search({query: searchQuery});
    if(result){
      setSearchLoading(false)
      setPosition([result[0].y, result[0].x])
    }
  }

  useEffect(() => {
    if (cartData.length === 0) {
      router.push('/user/cart')
    }
  }, [cartData, router])

  useEffect(() => {
    const fetchAddress = async () => {
    if (!position) return
    try {
      const result = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`)
      const addr = result.data?.address || {}

      setAddress(prev => ({
        ...prev,
        city: addr.city || addr.town || addr.village || "",
        state: addr.state || "",
        pincode: addr.postcode || "",
        fullAddress: result.data?.display_name || ""
      }))

    } catch (error) {
      console.log("Address fetch error:", error)
    }
  }
  fetchAddress()
}, [position])

  const handleCurrentLocation = ()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos)=>{
        const {latitude,longitude} = pos.coords
        setPosition([latitude,longitude])
      },(err)=>{console.log("location error", err)},{enableHighAccuracy:true, maximumAge:0, timeout:10000})
    }
  }
  
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

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-green-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <MapPin className="text-green-700" />
                Delivery Address
              </h2>

              <div className='space-y-4'>
                <div className='relative'>
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={address.fullName} onChange={(e)=>setAddress((prev)=>({...prev,fullName:e.target.value}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm'/>
                </div>

                <div className='relative'>
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={address.mobile} onChange={(e)=>setAddress((prev)=>({...prev,mobile:e.target.value}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                </div>

                <div className='relative'>
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={address.fullAddress} placeholder='Full Address' onChange={(e)=>setAddress((prev)=>({...prev,fullAddress:e.target.value}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                </div>
                
                <div className='grid grid-cols-3 gap-3'>
                  <div className='relative'>
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" value={address.city} placeholder='City' onChange={(e)=>setAddress((prev)=>({...prev,fullAddress:e.target.value}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                  </div>
                  <div className='relative'>
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" value={address.state} placeholder='State' onChange={(e)=>setAddress((prev)=>({...prev,fullAddress:e.target.value}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                  </div>
                  <div className='relative'>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" value={address.pincode} placeholder='Pincode' onChange={(e)=>setAddress((prev)=>({...prev,fullAddress:e.target.value}))} className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm'/>
                  </div>
                </div>

                <div className='flex gap-2 mt-3'>
                  <input type='text' placeholder='search city and area...' className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/>
                  <button className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200" onClick={handleSearchQuery}>{searchLoading?<Loader2 size={22} className="animate-spin"/> : "Search"}</button>
                </div>

                <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-md border border-gray-200">
                  {position && <>
                    <MapContainer center={position as LatLngExpression} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <DraggableMarker/>
                    </MapContainer>
                    <motion.button whileTap={{scale:0.92}} className="absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-999" onClick={handleCurrentLocation}>
                      <LocateFixed size={20} />
                    </motion.button>
                  </>}
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-8'>
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                <button onClick={()=>setPaymentMethod("online")} className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${
                  paymentMethod === "online" ? "border-green-600 bg-green-50 shadow-sm" : "hover:bg-gray-50"
                }`}>
                  <CreditCardIcon className='text-green-600'/>
                  <span className='font-medium text-gray-700'>Online Payment (stripe)</span>
                </button>
                <button onClick={()=>setPaymentMethod("cod")} className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${
                  paymentMethod === "cod" ? "border-green-600 bg-green-50 shadow-sm" : "hover:bg-gray-50"
                }`}>
                  <TruckIcon className='text-green-600'/>
                  <span className='font-medium text-gray-700'>Cash on Delivery (stripe)</span>
                </button>

                <div className="border-t mt-6 pt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className='text-green-600 font-medium'>₹{subTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className='text-green-600 font-medium'>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-800">
                    <span>Total</span>
                    <span className='text-green-600'>₹{finalTotal}</span>
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold text-lg transition-all shadow-md hover:shadow-lg" onClick={() =>(``)}>Place Order</motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckOutPage;
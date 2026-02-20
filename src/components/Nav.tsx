import React, { useState } from "react"
import mongoose from "mongoose"
import Link from "next/link"
import { Search, ShoppingCart } from "lucide-react"
import User from "@/models/userModel"
import Image from "next/image"

interface Iuser {
  _id?: mongoose.Types.ObjectId
  name: string
  email: string
  password?: string
  mobile?: string
  role: "user" | "deliveryBoy" | "admin"
  image?: string
}

function NavBar({ user }: { user: Iuser }) {
    const [open,setOpen] = useState(false)
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[96%] max-w-7xl z-50">

      {/* Main Container */}
      <div className="flex items-center justify-between px-5 md:px-8 py-4 rounded-2xl bg-linear-to-r from-green-600 via-green-500 to-emerald-600 shadow-xl shadow-black/20 backdrop-blur-md border border-white/10">
        <Link href="/" className="text-white font-semibold text-xl md:text-2xl tracking-wide hover:scale-105 transition duration-300">G_Delivery</Link>

        <form className="hidden md:flex items-center bg-white/95 backdrop-blur-md rounded-full px-4 py-2 w-[45%] max-w-lg shadow-md focus-within:ring-2 focus-within:ring-green-400 transition">
          <Search className="text-gray-500 w-5 h-5 mr-2" />
          <input type="text" placeholder="Search groceries, fruits, vegetables..." className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm"/>
        </form>

        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/cart" className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 transition duration-300">
            <ShoppingCart className="text-white w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium shadow-md">0</span>
          </Link>

          <div></div>
          <div className="relative w-9 h-9 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-white/40 transition" onClick={() => setOpen(prev=>!prev)}>
            {user.image ? (<Image src={user.image} alt='user' fill className="object-cover rounded-full"/>) : (<User/>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavBar
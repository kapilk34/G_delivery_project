'use client'

import React, { useState, useEffect, useRef } from "react"
import mongoose from "mongoose"
import Link from "next/link"
import { Box, Clipboard, LogOut, Menu, Package, PlusCircle, Search, SearchIcon, ShoppingCart, User, X } from "lucide-react"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { createPortal } from "react-dom"
import { AnimatePresence } from "motion/react"
import { motion } from "motion/react"

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
  const [open, setOpen] = useState(false)
  const profileDropDown = useRef<HTMLDivElement>(null)
  const [searchBarOpen, setSearchBarOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() =>{
    const handleClickOutside = (e:MouseEvent) =>{
      if(profileDropDown.current && !profileDropDown.current.contains(e.target as Node)){
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return ()=>document.removeEventListener("mousedown", handleClickOutside)
  },[])

  const sideBar = menuOpen ? createPortal(
    <AnimatePresence>
      <motion.div initial={{x:-100,opacity:0}} animate={{x:0, opacity:1}} exit={{x:100, opacity:0}} transition={{type:"spring", stiffness:100, damping:14}} className="fixed top-0 left-0 h-full w-[75%] sm:w-[60%] z-9999 bg-linear-to-b from-green-800/90 via-green-700/80 to-green-900/90 backdrop-blur-xl border-r border-green-400/20 shadow-[0_0_50px_-10px_rgba(0,255,100,0.3)] flex flex-col p-6 text-white">
        <div className="flex justify-between items-center mb-2">
          <h1 className="flex justify-between items-center mb-2">Admin Panel</h1>
          <button className="text-white/80 hover:text-red-400 text-2xl font-bold transition" onClick={() =>setMenuOpen(false)}>
            <X/>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>, document.body
  ) : null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[96%] max-w-7xl z-50">
      <div className="flex items-center justify-between px-5 md:px-8 py-4 rounded-2xl bg-linear-to-r from-green-600 via-green-500 to-emerald-600 shadow-xl shadow-black/20 backdrop-blur-md border border-white/10">
        <Link href={"/"} className="text-white font-semibold text-xl md:text-2xl tracking-wide hover:scale-105 transition duration-300">G_Delivery</Link>

        {user.role == "user" && 
          <form className="hidden md:flex items-center bg-white/95 backdrop-blur-md rounded-full px-4 py-2 w-[45%] max-w-lg shadow-md focus-within:ring-2 focus-within:ring-green-400 transition">
            <Search className="text-gray-500 w-5 h-5 mr-2" />
            <input type="text" placeholder="Search groceries, fruits, vegetables..." className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm" />
          </form>
        }

        <div className="flex items-center gap-4 md:gap-6">
          {user.role == "user" && <>
            <div className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition cursor-pointer md:hidden" onClick={() => setSearchBarOpen(true)}>
            <Search className="text-green-600 w-6 h-6" />
            </div>

            {searchBarOpen && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex justify-center items-start pt-24">
                <div ref={searchRef} className="bg-white w-[90%] max-w-xl rounded-full shadow-2xl flex items-center px-4 py-3 gap-3 animate-in fade-in zoom-in duration-300">
                  <Search className="text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Search anything..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent" autoFocus/>
                  <button onClick={() => setSearchBarOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            )}

            <Link href="/cart" className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 transition duration-300">
              <ShoppingCart className="text-white w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium shadow-md">0</span>
            </Link>
          </>}

          {user.role == "admin" && <>
            <div className="hidden md:flex items-center gap-4">
              <Link href={""} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <PlusCircle className="w-5 h-5"/>
                Add Grocery
              </Link>
              <Link href={""} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <Box className="w-5 h-5"/>
                View Grocery
              </Link>
              <Link href={""} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <Clipboard className="w-5 h-5"/>
                Manage Grocery
              </Link>
            </div>

            <div className="md:hidden bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md" onClick={()=>setMenuOpen(prev => !prev)}>
              <Menu className="text-green-600 w-6 h-6"/>
            </div>
          </>}

          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-white/40 transition" onClick={() => setOpen((prev) => !prev)}>
              {user.image ? (<Image src={user.image} alt='user' fill className="object-cover rounded-full" />) : (<User />)}
            </div>

            <div className="relative" ref={profileDropDown}>
              {open && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14">
                      {user.image ? (<Image src={user.image} alt="user" fill className="object-cover rounded-full border-2 border-gray-200"/>
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 border-2 border-gray-200">
                          <User className="text-gray-500 w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-gray-900 font-semibold text-base">{user.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {user.role == "user" && 
                      <Link href="/profile" className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-green-600 transition text-sm font-medium text-gray-700">
                        <Package/>
                        My Orders
                      </Link>
                    }

                    <button className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition text-sm font-medium text-gray-700" onClick={() => {setOpen(false); signOut({callbackUrl:"/login"})}}>
                      <LogOut/>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {sideBar}
    </div>
  )
}

export default NavBar;
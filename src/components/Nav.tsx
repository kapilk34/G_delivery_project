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
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "@/redux/store"
import { setSearchQuery } from "@/redux/searchSlice"

interface Iuser {
  _id?: mongoose.Types.ObjectId
  name: string
  email: string
  password?: string
  mobile?: string
  role: "user" | "deliveryBoy" | "admin"
  image?: string
}

interface IGrocery {
  _id: string
  name: string
  category: string
}

function NavBar({ user }: { user: Iuser | null }) {
  const [open, setOpen] = useState(false)
  const profileDropDown = useRef<HTMLDivElement>(null)
  const [searchBarOpen, setSearchBarOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)
  const desktopSearchRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState("")
  const [searchError, setSearchError] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [groceries, setGroceries] = useState<IGrocery[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const { cartData } = useSelector((state: RootState) => state.cart)
  const dispatch = useDispatch<AppDispatch>()

  // Fetch groceries once for autocomplete
  useEffect(() => {
    if (user?.role !== "user") return
    fetch("/api/user/groceries")
      .then((r) => r.json())
      .then((data: IGrocery[]) => setGroceries(data))
      .catch(() => {})
  }, [user])

  // Debounced suggestion generation — 300ms after typing stops
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || /^[0-9]+$/.test(trimmed)) {
      setSuggestions([])
      setActiveSuggestion(-1)
      return
    }
    const timer = setTimeout(() => {
      const lower = trimmed.toLowerCase()
      const matched = Array.from(
        new Set(
          groceries
            .filter(
              (g) =>
                g.name.toLowerCase().includes(lower) ||
                g.category.toLowerCase().includes(lower)
            )
            .map((g) => g.name)
        )
      ).slice(0, 6)
      setSuggestions(matched)
      setActiveSuggestion(-1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, groceries])

  // Close suggestions on outside click (desktop)
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        profileDropDown.current &&
        !profileDropDown.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        setSuggestions([])
        setActiveSuggestion(-1)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  const validateQuery = (val: string): string => {
    const trimmed = val.trim()
    if (!trimmed) return ""
    if (/^[0-9]+$/.test(trimmed)) return "Search must contain letters, not only numbers."
    if (trimmed.length > 70) return "Search cannot exceed 70 characters."
    return ""
  }

  const commitSearch = (val: string) => {
    const error = validateQuery(val)
    if (error) { setSearchError(error); return }
    setSearchError("")
    setSuggestions([])
    setActiveSuggestion(-1)
    dispatch(setSearchQuery(val.trim()))
    setSearchBarOpen(false)
  }

  const handleSearch = () => commitSearch(query)

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    commitSearch(suggestion)
  }

  const handleQueryChange = (val: string) => {
    if (val.length > 70) return
    setQuery(val)
    setSearchError(validateQuery(val))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestion((p) => Math.min(p + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestion((p) => Math.max(p - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        const chosen = suggestions[activeSuggestion]
        setQuery(chosen)
        commitSearch(chosen)
      } else {
        handleSearch()
      }
    } else if (e.key === "Escape") {
      setSuggestions([])
      setActiveSuggestion(-1)
    }
  }

  // Shared suggestion list UI
  const SuggestionList = ({ mobile = false }: { mobile?: boolean }) =>
    suggestions.length > 0 ? (
      <ul
        className={
          mobile
            ? "w-[90%] max-w-xl mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
            : "absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 z-50"
        }
      >
        {suggestions.map((s, i) => (
          <li
            key={s}
            onMouseDown={() => handleSuggestionClick(s)}
            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${
              i === activeSuggestion
                ? "bg-green-50 text-green-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>
              {s.toLowerCase().includes(query.trim().toLowerCase()) ? (
                <>
                  {s.substring(0, s.toLowerCase().indexOf(query.trim().toLowerCase()))}
                  <span className="text-green-600 font-semibold">
                    {s.substring(
                      s.toLowerCase().indexOf(query.trim().toLowerCase()),
                      s.toLowerCase().indexOf(query.trim().toLowerCase()) + query.trim().length
                    )}
                  </span>
                  {s.substring(s.toLowerCase().indexOf(query.trim().toLowerCase()) + query.trim().length)}
                </>
              ) : (
                s
              )}
            </span>
          </li>
        ))}
      </ul>
    ) : null

  const sideBar = menuOpen ? createPortal(
    <AnimatePresence>
      <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100 }} transition={{ type: "spring", stiffness: 100, damping: 14 }} className="fixed top-0 left-0 h-full w-[75%] sm:w-[60%] z-9999 bg-linear-to-b from-green-800/90 via-green-700/80 to-green-900/90 backdrop-blur-xl border-r border-green-400/20 shadow-[0_0_50px_-10px_rgba(0,255,100,0.3)] flex flex-col p-6 text-white">
        <div className="flex justify-between items-center mb-2">
          <h1 className="flex justify-between items-center mb-2">Admin Panel</h1>
          <button className="text-white/80 hover:text-red-400 text-2xl font-bold transition" onClick={() => setMenuOpen(false)}>
            <X />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 mt-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all shadow-inner">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-green-400/60 shadow-lg">{user?.image ? <Image src={user.image} alt="user" fill className="object-cover rounded-full" /> : <User />}</div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
            <p className="text-xs text-green-200 capitalize tracking-wide">{user?.role}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 font-medium mt-6">
          <Link href={"/admin/add-grocery"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 hover:pl-4 transition-all">
            <PlusCircle className="w-5 h-5" />
            Add Grocery
          </Link>
          <Link href={"/admin/view-grocery"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 hover:pl-4 transition-all">
            <Box className="w-5 h-5" />
            View Grocery
          </Link>
          <Link href={"/admin/manage-orders"} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 hover:pl-4 transition-all">
            <Clipboard className="w-5 h-5" />
            Manage Orders
          </Link>
        </div>

        <div className="my-5 border-t border-white/20"></div>
        <div className="flex items-center gap-3 text-red-300 font-semibold mt-auto hover:bg-red-500 p-3 rounded-lg transition-all" onClick={async () => await signOut({ callbackUrl: "/" })}>
          <LogOut className="w-5 h-5 text-red-200" />
          LogOut
        </div>
      </motion.div>
    </AnimatePresence>, document.body
  ) : null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[96%] max-w-7xl z-50">
      <div className="flex items-center justify-between px-5 md:px-8 py-4 rounded-2xl bg-linear-to-r from-green-600 via-green-500 to-emerald-600 shadow-xl shadow-black/20 backdrop-blur-md border border-white/10">
        <Link href={"/"} className="text-white font-semibold text-xl md:text-2xl tracking-wide hover:scale-105 transition duration-300">FreshKart</Link>

        {!user && (
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-2 rounded-full transition-all">
              Login
            </Link>
            <Link href="/register" className="flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-2 rounded-full hover:bg-green-100 transition-all">
              Sign Up
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4 md:gap-6">
          {user && user.role == "user" && <div className="relative flex items-center gap-4 md:gap-6">

            {/* Desktop search */}
            <div ref={desktopSearchRef} className="relative hidden md:block">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition">
                <Search className="text-white/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search your grocery..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent outline-none text-white placeholder-white/80 w-48 md:w-64"
                />
                <button type="button" onClick={handleSearch} className="text-white/90 hover:text-white px-2 py-1 rounded-full">
                  <SearchIcon className="w-4 h-4" />
                </button>
              </form>
              {searchError && (
                <p className="absolute top-full left-0 mt-1 text-xs text-red-200 bg-red-600/80 rounded-lg px-3 py-1 whitespace-nowrap z-50">
                  {searchError}
                </p>
              )}
              <SuggestionList />
            </div>

            {/* Mobile search trigger */}
            <div className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition cursor-pointer md:hidden" onClick={() => setSearchBarOpen(true)}>
              <Search className="text-green-600 w-6 h-6" />
            </div>

            {/* Mobile search modal */}
            {searchBarOpen && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex flex-col items-center pt-24">
                <div ref={searchRef} className="bg-white w-[90%] max-w-xl rounded-full shadow-2xl flex items-center px-4 py-3 gap-3 animate-in fade-in zoom-in duration-300">
                  <Search className="text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                    autoFocus
                  />
                  <button onClick={() => { setSearchBarOpen(false); setSearchError(""); setSuggestions([]) }} className="p-1 hover:bg-gray-100 rounded-full transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {searchError && (
                  <p className="mt-3 text-xs text-red-200 bg-red-500/80 rounded-lg px-4 py-1.5 font-medium">
                    {searchError}
                  </p>
                )}
                <SuggestionList mobile />
              </div>
            )}

            <Link href="/user/cart" className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 transition duration-300">
              <ShoppingCart className="text-white w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium shadow-md">{cartData.length}</span>
            </Link>
          </div>}

          {user && user.role == "admin" && <>
            <div className="hidden md:flex items-center gap-4">
              <Link href={"/admin/add-grocery"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <PlusCircle className="w-5 h-5" />
                Add Grocery
              </Link>
              <Link href={"/admin/view-grocery"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <Box className="w-5 h-5" />
                View Grocery
              </Link>
              <Link href={"/admin/manage-orders"} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-100 transition-all">
                <Clipboard className="w-5 h-5" />
                Manage Orders
              </Link>
            </div>

            <div className="md:hidden bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md" onClick={() => setMenuOpen(prev => !prev)}>
              <Menu className="text-green-600 w-6 h-6" />
            </div>
          </>}

          {user && <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-white/40 transition" onClick={() => setOpen((prev) => !prev)}>
              {user.image ? (<Image src={user.image} alt='user' fill className="object-cover rounded-full" />) : (<User />)}
            </div>

            <div className="relative" ref={profileDropDown}>
              {open && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14">
                      {user.image ? (<Image src={user.image} alt="user" fill className="object-cover rounded-full border-2 border-gray-200" />
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
                      <Link href="/user/my-order" className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-green-600 transition text-sm font-medium text-gray-700">
                        <Package />
                        My Orders
                      </Link>
                    }

                    <button className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition text-sm font-medium text-gray-700" onClick={() => { setOpen(false); signOut({ callbackUrl: "/login" }) }}>
                      <LogOut />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>}
        </div>
      </div>
      {sideBar}
    </div>
  )
}

export default NavBar;

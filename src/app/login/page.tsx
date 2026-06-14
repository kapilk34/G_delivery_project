"use client"

import { EyeIcon, EyeOff, Loader2, LogIn, Mail, Lock } from 'lucide-react'
import React, { FormEvent, useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import Image from 'next/image'
import Google from "@/assets/Google.png"
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/"
      })
      if (result?.ok) {
        router.push(result.url || "/")
      } else {
        setError(result?.error || "Invalid credentials. Please try again.")
      }
      setLoading(false)
    } catch (error) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const isFormValid = email.trim() !== "" && password.trim() !== ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 tracking-tight"
          >
            Welcome back
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 mt-2 text-sm"
          >
            Sign in to continue to your account
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 p-8 space-y-5"
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 overflow-hidden"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Email address
              </label>
              <motion.div 
                animate={{ 
                  scale: focusedField === 'email' ? 1.01 : 1,
                  boxShadow: focusedField === 'email' 
                    ? "0 0 0 4px rgba(22, 163, 74, 0.1)" 
                    : "0 0 0 0px rgba(22, 163, 74, 0)"
                }}
                className="relative rounded-xl transition-shadow"
              >
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedField === 'email' ? 'text-green-600' : 'text-gray-400'}`} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  value={email}
                  required
                />
              </motion.div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <motion.div 
                animate={{ 
                  scale: focusedField === 'password' ? 1.01 : 1,
                  boxShadow: focusedField === 'password' 
                    ? "0 0 0 4px rgba(22, 163, 74, 0.1)" 
                    : "0 0 0 0px rgba(22, 163, 74, 0)"
                }}
                className="relative rounded-xl transition-shadow"
              >
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-green-600' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  value={password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={isFormValid && !loading ? { scale: 1.02 } : {}}
              whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
              disabled={!isFormValid || loading}
              className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg inline-flex items-center justify-center gap-2 group
                ${isFormValid && !loading
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-600/25 hover:shadow-green-600/40" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  {/* <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /> */}
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-gray-400 font-medium tracking-wider">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Google Button */}
          <motion.button
            whileHover={{ scale: 1.01, backgroundColor: "rgb(249, 250, 251)" }}
            whileTap={{ scale: 0.99 }}
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 py-3 rounded-xl text-gray-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Image src={Google} width={20} height={20} alt="Google" className="rounded-sm" />
            <span>Continue with Google</span>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          Don't have an account?{' '}
          <button 
            onClick={() => router.push("/register")}
            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold transition-colors hover:underline underline-offset-4"
          >
            Sign up
            <LogIn className="w-4 h-4" />
          </button>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Login
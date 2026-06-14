import { ArrowLeft, EyeIcon, EyeOff, Loader2, LogIn, User, Mail, Lock, CheckCircle2, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import Image from 'next/image'
import Google from "@/assets/Google.png"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type propType = {
  previousStep: (s: number) => void
}

const Register = ({ previousStep }: propType) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()

  // Validation
  const isValidEmail = email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  const isPasswordValid = password.length >= 6
  const isFormValid = name.trim() !== "" && email.trim() !== "" && password.trim() !== "" && isValidEmail && isPasswordValid

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const result = await axios.post("/api/auth/register", {
        name, email, password
      })
      setSuccess("Account created successfully!")
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ x: -4 }}
        onClick={() => previousStep(1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 hover:border-green-200 shadow-sm z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium text-sm">Back</span>
      </motion.button>

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
            Create account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 mt-2 text-sm"
          >
            Join us and start your journey today
          </motion.p>
        </div>

        {/* Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 overflow-hidden"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3 overflow-hidden"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 p-8 space-y-5"
        >
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Full name
              </label>
              <motion.div
                animate={{
                  scale: focusedField === 'name' ? 1.01 : 1,
                  boxShadow: focusedField === 'name'
                    ? "0 0 0 4px rgba(22, 163, 74, 0.1)"
                    : "0 0 0 0px rgba(22, 163, 74, 0)"
                }}
                className="relative rounded-xl transition-shadow"
              >
                <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedField === 'name' ? 'text-green-600' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  value={name}
                  required
                />
              </motion.div>
            </div>

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
              {email && !isValidEmail && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 ml-1"
                >
                  Please enter a valid email address
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Password
              </label>
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
                  placeholder="Create a password"
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
              
              <p className="text-xs text-gray-400 ml-1">
                Minimum 6 characters required
              </p>
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
                  Create account
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
          Already have an account?{' '}
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold transition-colors hover:underline underline-offset-4"
          >
            Sign in
            <LogIn className="w-4 h-4" />
          </button>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Register
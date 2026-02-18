import { ArrowLeft, EyeIcon, EyeOff, Loader2, LogIn } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from "motion/react";
import Image from 'next/image';
import Google from "@/assets/Google.png"
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

type propType = {
    previousStep: (s: number) => void
}

const Register = ({ previousStep }: propType) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const handleRegister = async (e:React.FormEvent) =>{
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const result = await axios.post("/api/auth/register", {
        name,email,password
      })
      setSuccess("Registration successful! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError("Registration failed. Please try again.")
      }
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative'>

      <div
        className='absolute top-6 left-6 flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors cursor-pointer'
        onClick={() => previousStep(1)}
      >
        <ArrowLeft className='w-5 h-5'/>
        <span className='font-medium'>Back</span>
      </div>

      <motion.h1 className='text-4xl font-extrabold text-green-700 mb-6'>
        Create Account
      </motion.h1>

      {error && (
        <motion.div className='w-full max-w-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4'>
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div className='w-full max-w-md bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4'>
          {success}
        </motion.div>
      )}

      {/* Form */}
      <motion.form onSubmit={handleRegister} className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 space-y-4 border'>
        <div>
          <label className='block text-sm font-medium mb-1'>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600'
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Email</label>
          <input type="email" placeholder="Enter your email" className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600' onChange={(e) => setEmail(e.target.value)} value={email}/>
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Password</label>
          <div className='relative'>
            <input type={showPassword ? "text" : "password"} placeholder="Enter your password" className='w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600' onChange={(e) => setPassword(e.target.value)} value={password}/>
            {
              showPassword ? (<EyeOff className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer' onClick={() => setShowPassword(false)}/>) : (<EyeIcon className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer' onClick={() => setShowPassword(true)}/>)
            }
          </div>
          <p className='text-xs text-gray-500 mt-1'>Minimum 6 characters</p>
        </div>

        {
          (() => {
            const isValidEmail = email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            const isPasswordValid = password.length >= 6;
            const formValidation = name !== "" && email !=="" && password !== "" && isValidEmail && isPasswordValid;
            return <button disabled={!formValidation || loading} className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${formValidation ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
              {loading ? <Loader2 className='w-5 h-5 animate-spin'/> : "Register"}
            </button>
          })()
        }

        <div className='flex items-center gap-2 text-gray-400 text-sm mt-2'>
          <span className='flex-1 h-px bg-gray-200'></span>
          OR 
          <span className='flex-1 h-px bg-gray-200'></span>
        </div>

        <div className='w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-medium transition-all duration-200' onClick={()=>signIn("google",{callbackUrl:"/"})}>
          <Image src={Google} width={20} height={20} alt='google'/>
          Continue with Google
        </div>
      </motion.form>
      <p className='cursor-pointer text-gray-600 mt-6 text-sm flex items-center gap-1' onClick={()=>router.push("/login")}>Already have an account ? <LogIn className='w-4 h-4'/><span className='text-green-600'>Sign In</span></p>
    </div>
  )
}

export default Register

import { ArrowLeft, EyeIcon, EyeOff, Loader, Loader2, LogIn } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from "motion/react";
import Image from 'next/image';
import Google from "@/assets/Google.png"
import axios from 'axios';

type propType = {
    previousStep: (s: number) => void
}

const Register = ({ previousStep }: propType) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleRegister = async (e:React.FormEvent) =>{
    e.preventDefault()
    setLoading(true)
    try {
      const result = await axios.post("/api/auth/register", {
        name,email,password
      })
      console.log(result.data);
      setLoading(false)
    } catch (error) {
      console.log(error);
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
        </div>

        {
          (() => {
            const formValidation = name !== "" && email !=="" && password !== "";
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

        <button className='w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-medium transition-all duration-200'>
          <Image src={Google} width={20} height={20} alt='google'/>
          Continue with Google
        </button>
      </motion.form>
      <p className='cursor-pointer text-gray-600 mt-6 text-sm flex items-center gap-1'>Already have an account ? <LogIn className='w-4 h-4'/><span className='text-green-600'>Sign In</span></p>
    </div>
  )
}

export default Register

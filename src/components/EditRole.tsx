'use client'
import { Bike, User, UserCog } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from 'motion/react'
import axios from 'axios'
import { redirect } from 'next/navigation'

function EditRole() {
  const [roles,setRoles] = useState([
    {id:"admin", label:"Admin", icon:UserCog},
    {id:"user", label:"User", icon:User},
    {id:"deliveryBoy", label:"Delivery Boy", icon:Bike}
  ])
  
  const [selectedRole, setSelectedRole] = useState("")
  const [mobile, setMobile] = useState("")
  const handleEdit = async ()=>{
    try {
      const result = await axios.post("/api/user/edit-role",{
        role:selectedRole,
        mobile
      })
      redirect("/")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='flex flex-col min-h-screen items-center p-6 w-full'>
      <h1 className='text-3xl md:text-4xl font-extrabold text-green-700 text-center mt-8'>Select Your role</h1>

      <div className='flex flex-col md:flex-row justify-center items-center gap-6 mt-10'>
        {roles.map((role) =>{
          const Icon = role.icon
          const isSelected = selectedRole == role.id
          return (
            <motion.div whileTap={{scale:0.94}} key={role.id} onClick={()=> setSelectedRole(role.id)} className={`flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 transition-all ${isSelected ? "border-green-600 bg-green-100 shadow-lg" : "border-gray-300 bg-white hover:border-green-400"}`}>
              <Icon/>
              <span>{role.label}</span>
            </motion.div>
          )
        })}
      </div>

      <div className='flex flex-col items-center mt-10'>
        <label htmlFor='mobile' className='text-gray-700 font-medium mb-2'>Enter your Mobile No.</label>
        <input type='tel' id='mobile' className='w-64 md:w-80 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800' placeholder='eg. 0000000000' onChange={(e) =>setMobile(e.target.value)}/>
      </div>

      <button onClick={handleEdit} disabled={mobile.length !== 10 || !selectedRole} className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-2xl shodow-md transition-all duraction-200 w-[180px] mt-20 ${selectedRole && mobile.length === 10 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>Go to Home</button>
    </div>
  )
}

export default EditRole;
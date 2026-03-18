'use client'

import axios from 'axios'
import React, { useEffect, useState } from 'react'

function DeliveryBoyDashboard() {
  const [assignment,setAssignment] = useState<any[]>([])
  
  useEffect(()=>{
    const fetchAssignment = async ()=>{
      try {
        const result = await axios.get("/api/delivery/getAssignments")
        setAssignment(result.data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchAssignment()
  },[])

  return (
    <div className='w-full min-h-screen bg-gray-50 p-4'>
      <div className='max-w-3xl mx-auto'>
        <h1 className='text-2xl font-bold mt-[120px] mb-[30px]'>Delivery Assignments</h1>
        {assignment.map(a=>(
          <div key={a._id} className='p-5 bg-white rounded-xl shadow mb-4 border'>
            <p><b>Order Id </b> #{a?.order?._id?.slice(-6)}</p>
            <p className='text-gray-600'>{a.order.address.fullAddress}</p>

            <div className='flex gap-3 mt-4'>
              <button className='flex-1 bg-green-600 text-white py-2 rounded-lg'>Accept</button>
              <button className='flex-1 bg-red-600 text-white py-2 rounded-lg'>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeliveryBoyDashboard
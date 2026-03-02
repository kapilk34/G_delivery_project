'use client'

import { RootState } from '@/redux/store';
import { ArrowLeft, ShoppingBasket } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import { useSelector } from 'react-redux';
import Image from 'next/image';

function CartPage() {
  const cartData = useSelector((state: RootState) => state.cart?.cartData || []);

  return (
    <div className="w-[95%] sm:w-[90%] md:w-[80%] mx-auto mt-8 mb-24 relative">
      <Link href={"/"} className="absolute top-2 left-0 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-all">
        <ArrowLeft size={20}/>
        <span className='hidden sm:inline'>Back To Home</span>
      </Link>

      <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 text-center mb-10'>Your Shopping Cart</h2>

      {cartData.length === 0 ? (
        <div className='text-center py-20 bg-white rounded-2xl shadow-md'>
          <ShoppingBasket className='w-16 h-16 text-gray-400 mx-auto mb-4'/>
          <p className='text-gray-600 text-lg mb-6'>
            Your cart is empty. Add some groceries to continue shopping!
          </p>
          <Link href={"/"} className='bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-all inline-block font-medium'>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div>
            {cartData.map((item, index) => (
              <div key={index} className='flex flex-col sm:flex-row items-center bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition-all duration-300 border border-gray-100'>
                <div className='relative w-20 h-28 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50'>
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage;
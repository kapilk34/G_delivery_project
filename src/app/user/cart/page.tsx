'use client'

import { AppDispatch, RootState } from '@/redux/store';
import { ArrowLeft, Minus, Plus, ShoppingBasket, Trash } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import { motion } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { increaseQuantity, decreaseQuantity, removeFromCart } from "@/redux/cartSlice";
import { useRouter } from 'next/navigation';

function CartPage() {
  const { cartData, subTotal, deliveryFee, finalTotal } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-10">
      <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] mx-auto relative">
        <Link href={"/"} className="flex items-center gap-2 text-green-700 hover:text-green-900 font-semibold transition-all mb-6">
          <ArrowLeft size={20} />
          <span>Back To Home</span>
        </Link>

        <h2 className='text-3xl sm:text-4xl font-bold text-center text-green-800 mb-12'>Your Shopping Cart</h2>
        {cartData.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-3xl shadow-xl border border-green-100'>
            <ShoppingBasket className='w-20 h-20 text-green-300 mx-auto mb-6' />
            <p className='text-gray-600 text-lg mb-6'>Your cart is empty. Add some groceries to continue shopping!</p>
            <Link href={"/"} className='bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-all inline-block font-medium shadow-md hover:shadow-lg'>Continue Shopping</Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
            <div className='lg:col-span-2 space-y-6'>
              {cartData.map((item, index) => (
                <div key={index} className='flex flex-col sm:flex-row items-center bg-white rounded-3xl shadow-md hover:shadow-xl p-6 transition-all duration-300 border border-gray-100'>
                  <div className='relative w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100'>
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className='mt-4 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left'>
                    <h3 className='text-lg font-semibold text-gray-800 line-clamp-1'>{item.name}</h3>
                    <p className='text-sm text-gray-500 mt-1'>{item.unit}</p>
                    <p className='text-green-700 font-bold mt-2 text-lg'>₹{Number(item.price) * item.quantity}</p>
                  </div>
                  <div className='flex items-center gap-3 mt-4 sm:mt-0 bg-green-50 px-4 py-2 rounded-full shadow-inner'>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-green-200 transition-all shadow" onClick={() => dispatch(decreaseQuantity(item._id))}><Minus size={16} className="text-green-700" /></button>
                    <span className="text-base font-semibold text-gray-800">{item.quantity}</span>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-green-200 transition-all shadow" onClick={() => dispatch(increaseQuantity(item._id))}><Plus size={16} className="text-green-700" /></button>
                  </div>
                  <button className='sm:ml-6 mt-4 sm:mt-0 text-red-500 hover:text-red-700 transition-all' onClick={() => dispatch(removeFromCart(item._id))}><Trash size={20} /></button>
                </div>
              ))}
            </div>

            <div className='bg-white rounded-3xl shadow-xl p-8 h-fit border border-green-100'>
              <h3 className='text-xl font-semibold text-gray-800 mb-6'>Order Summary</h3>
              <div className='flex justify-between mb-3 text-gray-600'>
                <span>SubTotal</span>
                <span>₹{subTotal}</span>
              </div>
              <div className='flex justify-between mb-3 text-gray-600'>
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className='border-t pt-4 mt-4 flex justify-between text-lg font-bold text-green-700'>
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
              <motion.button whileTap={{scale:0.95}} className='w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all font-medium shadow-md hover:shadow-lg' onClick={()=>router.push("/user/checkOut")}>Proceed to Checkout</motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage;
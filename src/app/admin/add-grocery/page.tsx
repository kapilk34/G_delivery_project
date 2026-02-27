"use client";

import React, { ChangeEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader, PlusCircle, Upload } from "lucide-react";
import Image from "next/image";
import axios from "axios";

const categories=[
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Rice, Atta & Biscuits",
    "Snacks & Branded Foods",
    "Beverages",
    "Personal Care",
    "Household & Cleaning",
    "Baby Care",
    "Pet Care",
]

const units =[
    "kg", "g", "liter", "ml", "piece", "pack"
]

function AddGrocery() {
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [unit, setUnit] = useState("")
    const [price, setPrice] = useState("")
    const [loading, setLoading] = useState(false)
    const [frontendImage, setFrontendImage] = useState<string | null>()
    const [backendImage, setBackendImage] = useState<File | null>()
    const handleImageChange=(e:ChangeEvent<HTMLInputElement>) =>{
        const files = e.target.files 
        if (!files || files.length === 0) return;
        const file = files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) =>{
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("category", category)
            formData.append("price", price)
            formData.append("unit", unit)
            if(backendImage){
                formData.append("image", backendImage)
            }
            const result = await axios.post("/api/admin/add-grocery", formData)
            console.log(result.data)
            setLoading(false)
        } catch (error) {
            console.log(error);
            setLoading(false)
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white py-16 px-4 relative">
        <Link href={"/"} className="absolute top-6 left-6 flex items-center gap-2 text-green-700 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 hover:shadow-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:flex">Back to Home</span>
        </Link>

        <div className="bg-white w-full max-w-2xl shadow-2xl rounded-3xl border border-green-100 p-8">
            <div className="flex flex-col items-center mb-8">
                <div className="flex items-center gap-2 cursor-pointer hover:text-green-700 transition">
                    <PlusCircle className="text-green-600 w-6 h-6" />
                    <h1 className="text-lg font-semibold">Add Your Grocery</h1>
                </div>
                <p className="text-gray-500 text-sm mt-2 text-center">Fill out the details bolow to add a new grocery item.</p>
            </div>

            <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Grocery Name<span>*</span></label>
                    <input type="text" placeholder="Eg: Sweets, Milk, rice..." onChange={(e) =>setName(e.target.value)} value={name} id="name" name="name" required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category<span>*</span></label>
                        <select id="category" name="category" value={category} required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" onChange={(e) =>setCategory(e.target.value)}>
                            <option value="">Select a category</option>
                            {categories.map(cat =>(
                                <option value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit<span>*</span></label>
                        <select id="unit" name="unit" value={unit} required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" onChange={(e) =>setUnit(e.target.value)}>
                            <option value="">Select Unit</option>
                            {units.map(cat =>(
                                <option value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Price<span>*</span></label>
                    <input type="text" placeholder="Eg: 120/-" onChange={(e) =>setPrice(e.target.value)} value={price} id="name" name="name" required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                    <label htmlFor="Image" className="cursor-pointer flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-xl px-6 py-3 hover:bg-green-100 transition-all w-full sm:w-auto">
                        <Upload/>
                        Upload Image
                    </label>
                    <input type="file" id='Image' accept="image/*" hidden onChange={handleImageChange} />
                    {frontendImage && <Image src={frontendImage} alt="image"  width={100} height={100} className="rounded-xl  mt-2 shadow-md border border-gray-200 object-cover"/>}
                </div>

                <button disabled={loading} className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader className='w-5 h-5 animate-spin'/> : "Add Grocery"}
                </button>
            </form>

        </div>
    </div>
  );
}

export default AddGrocery;

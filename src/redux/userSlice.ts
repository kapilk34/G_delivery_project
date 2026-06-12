import { createSlice } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface IAddress {
    _id?: string;
    homeAddress?: string;
    workAddress?: string;
    otherAddress?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault: boolean;
}

interface Iuser{
    _id?:mongoose.Types.ObjectId | string
    name:string
    email:string
    password?:string
    mobile?:string
    role:"user" | "deliveryBoy" | "admin"
    image?:string
    membershipStatus?: "Regular" | "Premium" | "Gold"
    addresses?: IAddress[]
    createdAt?: string
    updatedAt?: string
}

interface IuserSlice{
    userData : Iuser | null
}

const initialState:IuserSlice={
    userData:null
}

const userSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        setUserData:(state,action)=>{
            state.userData = action.payload
        }
    }
})

export const {setUserData} = userSlice.actions
export default userSlice.reducer
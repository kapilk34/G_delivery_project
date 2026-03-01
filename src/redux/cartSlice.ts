import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface IGrocery{
    _id ? : mongoose.Types.ObjectId,
    name:string,
    category:string,
    price:string,
    unit:string,
    quantity : number,
    image:string,
    createdAt ? : Date,
    updatedAt ? : Date
}

interface IcartSlice{
    cartData: IGrocery[]
}

const initialState:IcartSlice={
    cartData : []
}

const cartSlice = createSlice({
    name:"cart",
    initialState,
    reducers:{
        addToCart : (state, action : PayloadAction<IGrocery>) =>{
            state.cartData.push(action.payload)
        }
    }
})

export const {addToCart} = cartSlice.actions
export default cartSlice.reducer
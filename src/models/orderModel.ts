import mongoose from "mongoose";

interface IOrder{
    _id?:mongoose.Types.ObjectId,
    user:mongoose.Types.ObjectId,
    items:[
        {
            grocery:mongoose.Types.ObjectId,
            name:string,
            price:string,
            unit:string,
            image:string,
            quantity:number
        }
    ],
    isPaid:boolean,
    totalAmmount:number,
    paymentMethod:"cod" | "online",
    address:{
        fullName : string,
        mobile: string,
        city : string,
        state : string,
        pincode : string,
        fullAddress : string,
        latitude : number,
        longitude : number
    }
    orderStatus:"pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
    createdAt?: Date,
    updatedAt?: Date
}

const orderSchema = new mongoose.Schema<IOrder>({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[
        {
            grocery:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Grocery",
                required:true
            },
            name:String,
            price:String,
            unit:String,
            image:String,
            quantity:Number
        }
    ],
    paymentMethod:{
        type:String,
        enum:["cod","online"],
        default:"cod"
    },
    isPaid:{
        type:Boolean,
        default:false
    },
    totalAmmount:Number,
    address:{
        fullName : String,
        mobile: String,
        city : String,
        state : String,
        pincode : String,
        fullAddress : String,
        latitude : Number,
        longitude : Number
    },
    orderStatus:{
        type:String,
        enum:["pending","confirmed","shipped","delivered","cancelled"],
        default:"pending"
    },
},{timestamps:true})

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema)

export default Order;
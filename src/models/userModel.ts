import mongoose from "mongoose";
interface IAddress {
    _id?: mongoose.Types.ObjectId | string;
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
    _id?:mongoose.Types.ObjectId
    name:string
    email:string
    password?:string
    mobile?:string
    role:"user" | "deliveryBoy" | "admin"
    image?:string
    membershipStatus?: "Regular" | "Premium" | "Gold"
    addresses?: IAddress[]
    location?:{
        type:{
            type:StringConstructor;
            enum:string[];
            default:string;
        };
        coordinates:{
            type:NumberConstructor[];
            default:number[];
        }
    },
    socketId:string | null
    isOnline : Boolean;
}

const userSchema = new mongoose.Schema<Iuser>({
    name:{
        type:String
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:false
    },
    mobile:{
        type:String,
        required:false
    },
    role:{
        type:String,
        enum:["user","deliveryBoy","admin"],
        default:"user"
    },
    image:{
        type:String
    },
    membershipStatus:{
        type:String,
        enum:["Regular","Premium","Gold"],
        default:"Regular"
    },
    addresses:[
        {
            homeAddress: String,
            workAddress: String,
            otherAddress: String,
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            landmark: String,
            isDefault: { type: Boolean, default: false }
        }
    ],
    location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point"
        },
        coordinates:{
            type:[Number],
            default:[0,0]
        }
    },
    socketId:{
        type:String,
        default:null
    },
    isOnline:{
        type:Boolean,
        default:false
    }
},{timestamps : true})

userSchema.index({location:"2dsphere"})

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

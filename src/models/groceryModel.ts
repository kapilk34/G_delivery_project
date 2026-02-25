import mongoose from "mongoose"

interface IGrocery{
    _id ? : mongoose.Types.ObjectId,
    name:string,
    category:string,
    price:string,
    unit:string,
    image:string,
    createdAt ? : Date,
    updatedAt ? : Date
}

const grocerySchema = new mongoose.Schema<IGrocery>({
    name:{
        type:String, 
        required:true
    },
    category:{
        type:String,
        enum:[
            "Fruits & Vegetables",
            "Dairy & Eggs",
            "Rice, Atta & Biscuits",
            "Snacks & Branded Foods",
            "Beverages",
            "Personal Care",
            "Household & Cleaning",
            "Baby Care",
            "Pet Care",
        ],
        required:true
    },   
    price:{
        type:String,
        required:true
    },
    unit:{
        type:String,
        required:true,
        enum:[
            "kg", "g", "liter", "ml", "piece", "pack"
        ]
    },
    image:{
        type:String,
        required:true
    }
},{timestamps:true})

const Grocery = mongoose.models.Grocery || mongoose.model("Grocery", grocerySchema)

export default Grocery
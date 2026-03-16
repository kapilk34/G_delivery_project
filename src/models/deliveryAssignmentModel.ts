import mongoose from "mongoose";

interface IDeliveryAssignment{
    order:mongoose.Types.ObjectId,
    brodcastedTo:mongoose.Types.ObjectId[],
    assignedTo:mongoose.Types.ObjectId | null,
    status : "broadcasted" | "assigned" | "completed"
    acceptedAt : Date
    createdAt?: Date
    updatedAt?:Date
}

const deliveryAssignmentSchema = new mongoose.Schema<IDeliveryAssignment>({
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
    },
    brodcastedTo:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    ],
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    status:{
        type:String,
        enum:["broadcasted","assigned","completed"],
        default:"broadcasted"
    },
    acceptedAt:{
        type:Date
    }
},{timestamps:true})

if (mongoose.models.DeliveryAssignment) {
    delete mongoose.models.DeliveryAssignment;
}
const deliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);
export default deliveryAssignment;
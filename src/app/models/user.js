import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        require:true
    },
    phoneNumber:{
        type: String,
        require:true
    },
    email: {
        emailAddress: {
            type: String
        },
        isVerify: {
            type: Boolean,
            default: false
        }
    },
    password:{
        type: String,
        require:true
    },
    role:{
        type: Number,
        require: true
    },
    gender: {
        type: Number
    },
    dateOfBirth: {
        type: Date
    },
    image: {
        type: String
    },
    deliveryAddress: [{
        ward: {
            type: String,
            require: true
        },
        district: {
            type: String,
            require: true
        },
        province: {
            type: String,
            require: true
        },
        detail: {
            type: String,
            require: true
        }
    }],
    order: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        }
    ],
    favorite: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    notification:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification",
        }
    ],
    message:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    status: {
        type: Boolean,
        default: true
    },
},{
    timestamps:{createdAt:'created_at', updatedAt:'updated_at'}
})
userSchema.methods.toJSON= function(){
    const user=this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.order;
    delete userObject.notification;
    delete userObject.message;
    return userObject
}
const User=mongoose.model('User',userSchema);
export default User;
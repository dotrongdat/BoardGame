import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    code: {
        type: String,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    products:[
        {
            product : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Product'
            },
            quantity : {
                type : Number,
                require : true
            },
            price : {
                type : Number,
                require : true
            },
            // status : { // delivered or not yet or cancel
            //     type : Number,
            //     require : true
            // },
            // message:{
            //     type: String
            // }
        }
    ],
    info:{
        receiverName : {
            type : String,
            require : true 
        },
        email : {
            type : String
        },
        phone : {
            type : String,
            require : true
        },
        address : {
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
        },
        paymentMethod : {
            type : {
                type : Number
            },
            paymentInfo : [{
                title: {
                    type: String,
                    require: true
                },
                content: {
                    type: String,
                    require: true
                }
            }]
        }
    },
    message:{
        type: String
    },
    reason: {
      type: String  
    },
    total : {
        type : Number,
        require : true
    },
    statuses : [
        {
            type : Number,
            require : true
        }
    ],
    logDate: {
        type: Object,
        require: true
    },
    status: {
        type: Number,
        required: true
    }
},{
    timestamps:{createdAt:'created_at',updatedAt:'updated_at'}
})

const Order = mongoose.model('Order',orderSchema);

export default Order;
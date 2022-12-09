import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    users:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    data:[{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: {
            type: String,
            require:true
        },
        time: {
            type: Date,
            require:true
        },
        ignorant:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        checkedUser:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        status: {
            type: Number,
            require: true
        }
    }],
    name:{
        type: String
    },
    status: {
        type: Number,
        require: true
    }
},{
    timestamps:{
        createdAt:'created_at',
        updatedAt:'updated_at',
    }
});

const Message = mongoose.model('Message',messageSchema);
export default Message;
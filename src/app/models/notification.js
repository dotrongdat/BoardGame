import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    data:{
        type: Object
    },
    status:{
        type: Number,
        require: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receivers:[
        {
            type: String
        }
    ],
    checkedReceiver:[
        {
            type: String
        }
    ],
    type:{
        type: Number,
        require: true
    }
}, {
    timestamps : {createdAt:'created_at',updatedAt:'updated_at'}
});

const Notification = mongoose.model('Notification',notificationSchema);
export default Notification;
import Notification from '../../models/notification.js';
import statusCode from 'http-status-codes';
import User from '../../models/user.js';

const createNotification = async ({data,type,owner,receivers, title, content})=>{
    try {
        const notification = await Notification.create({
            data,
            type,
            title,
            content,
            owner,
            receivers,
            checkedReceiver: [],
            status: 0
        });
        for (const receiver of receivers) {
            await User.findByIdAndUpdate(receiver,{$push:{notification:notification._id}});
            global.io.to(receiver).emit('notification',notification);
        }
    } catch (error) {
        throw new Error(error);
    }
    // return new Promise((resolve,reject)=>{
    //     Notification.create({
    //         data,
    //         type,
    //         owner,
    //         receivers,
    //         checkedReceiver: [],
    //         status: 0
    //     })
    //     .then(notification => {
    //         receivers.forEach(user => {
    //             User.findByIdAndUpdate(user._id,{$push:{notification:notification._id}});
    //             global.io.to(user._id).emit('notification',notification);
    //         });
    //         resolve(notification)
    //     })
    //     .catch(err => reject(err));
    // })
}
const markNotificationRead = async (userId,_id) =>{
    try {
        return await Notification.updateMany({_id:{$in:_id}},{
            $push: {
                checkedReceiver : userId
            }
        })
    } catch (error) {
        throw new Error();
    }
}
const markRead = async (req,res) =>{
    try{
        const {payload,user} = req;
        const {_id} = req.body;
        await markNotificationRead(user._id,_id);
        return res.status(statusCode.OK).json({
            message: 'Update successfully',
            payload
        })
    } catch (error){
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const get = async (req,res) =>{
    try {
        let {payload,user} = req;
        const {from=0,itemPerPage = 6} = req.query;
        const getTotal = Notification.find({_id : {$in : user.notification}})
                                     .countDocuments();
        const getTotalUnread = Notification.find({
                                                _id : {$in : user.notification},
                                                checkedReceiver : {$ne: user._id}
                                            })
                                            .countDocuments();
        const getNotification = Notification.find({_id : {$in : user.notification}})
                                            .limit(parseInt(itemPerPage))
                                            .skip(parseInt(from))
                                            .sort({'created_at':-1})
                                            .lean();
        const [total,totalUnread,notification] = await Promise.all([getTotal,getTotalUnread,getNotification]);
        payload = {...payload,notification,total,totalUnread};
        return res.status(statusCode.OK).json({
            message: 'Get successfully',
            payload
        });
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
export {
    markNotificationRead,
    createNotification
}
export default {
    markRead,
    get
}
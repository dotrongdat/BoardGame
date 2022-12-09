import Message from '../../models/message.js';
import statusCode from 'http-status-codes';
import User from '../../models/user.js';
import moment from 'moment';
import { MESSAGE_STATUS } from '../../../constants/message.constant.js';

const createConservation = async (usersId, userId, message, status = MESSAGE_STATUS.COMPLETE_PROCESS) => {
    try {
        const data = (message) ? {
            user : userId,
            message,
            time : moment().format(),
            ignorant : [],
            checkedUser:[userId],
            status
        } : [];
        let promiseArray = [];
        promiseArray.push(
            Message.create({
                users: usersId,
                data,
                status: MESSAGE_STATUS.COMPLETE_PROCESS
            })
        );
        promiseArray.push(
            User.find({_id : {$in : usersId}})
                .select('_id name image')
                .lean()
        )
        let [messageData,users] =await Promise.all(promiseArray);

        await User.updateMany({_id : {$in : usersId}},{$push : {message: messageData._id}});
        usersId.forEach(i => {
            global.io.to(i).emit('message',{...messageData._doc,users});
        });
    } catch (error) {
        throw error;
    }
}

const getById = async (req,res) =>{
    try {
        let {payload} = req;
        const {message} = req.user;
        let {from=0,itemPerPage=20,messageId} = req.query;
        from = parseInt(from);
        itemPerPage = parseInt(itemPerPage);
        let _message = [];
        let total = 0;
        if(message.toString().includes(messageId)){
            _message = await Message.findById(messageId)
                                    .lean()
                                    .populate('users','_id name image')
            total = _message.data.length;
            let to = from + itemPerPage;
            if (to > total) to= total;
            _message.data = _message.data.slice(total-to,total-from);
        }
        payload = {...payload,message:_message,total};
        return res.status(statusCode.OK).json({
            message: 'Get successfully',
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
};
const sendToAdmin = async (req,res) => {
    try {
        let {payload,user} = req;
        let {message} = req.body;       
        if(global.socketAdminBasicQueue.peek()){
            const admin = global.socketAdminBasicQueue.dequeue().data;
            await createConservation([user._id,admin._id],user._id,message);
            global.socketAdminBasicQueue.push(admin,admin._id);
            return res.status(statusCode.OK).json({
                message : 'Successfully',
                payload
            })
        }else{
            global.messageBasicQueue.push({message,user});
            return res.status(statusCode.OK).json({
                message : 'Looking for user',
                payload
            })
        }
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const getByUserId = async (req,res) =>{
    try {
        let {payload,user} = req;
        const {message,_id} = user;
        const {userId} = req.query;
        let _message = await Message.findOne({
            $and :[
                {_id : {$in:message}},
                {users: {$all : [_id,userId]}}
            ]})
        .lean()
        .populate('users','name image')
        let total = 0;
        if(_message){
            total = _message.data.length;
            let to = 20;
            if (to > total) to=total;
            _message.data = _message.data.slice(total-to,total);
        }
        payload = {...payload,message:_message,total};
        return res.status(statusCode.OK).json({
            message: 'Get successfully',
            payload
        })        
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const get = async (req,res) => {
    try {
        let {payload,user} = req;
        const {message,_id} = user;
        const {from=0,itemPerPage = 6} = req.query;
        let messages = [];
        let total = 0;
        let messageIdUnread = [];
        if(message){
            messages = await Message.find({_id : {$in : message}})
                                    .lean()
                                    .populate('users','_id name image')
            total = messages.length;            
            messages.sort((a,b)=>{
                const aLength = a.data.length;
                const bLength = b.data.length;
                const aTime = a.data[aLength-1].time;
                const bTime = b.data[aLength-1].time;
                return moment(aTime).get()-moment(bTime).get();
            });
            messages = messages.slice(from,from+itemPerPage);
            messages.forEach((i,index)=>{
                const {data} = messages[index];
                messages[index].data = [data[data.length-1]];
            });
            messageIdUnread = messages.filter(i=>!i.data[0].checkedUser.some(u=>u._id.toString() === _id.toString()))
                                      .map(i=>i._id);
        }
        payload = {...payload,messages,total,messageIdUnread};
        return res.status(statusCode.OK).json({
            message: 'Get successfully',
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
// const sendToAdmin = async (req,res) => {
//     try {
        
//     } catch (error) {
//         return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
//             message: 'Error'
//         });
//     }
// }
const send = async (req,res) =>{
    try {
        let {payload,user} = req;
        //let {user} = payload;
        const {_id,message} = req.body;
        let _message;   

        const time = moment().format();
        const data = {
            user : user._id,
            message,
            time,
            ignorant : [],
            checkedUser:[user._id],
            status : 1
        }
        _message = await Message.findByIdAndUpdate(_id,{$push : {data}},{new:true})
                                .lean()
                                .populate('users','name image')
                                .select();
        _message.data = [_message.data.pop()];
        _message.users.forEach(i => {
                global.io.to(String(i._id)).emit('message',_message);
        });
        return res.status(200).json({
            message : 'Successfully',
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const create = async (req,res)=>{
    try {
        let {payload,user} = req;
        const {users,message} = req.body;
        await createConservation(users,user._id,message);
        return res.status(200).json({
            message : 'Successfully',
            payload
        });
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const markRead = async (req,res)=>{
    try {
        const {payload,user} = req;
        const {messageId} = req.body;
        const message = await Message.findById(messageId);
        message.data[message.data.length - 1].checkedUser.push(user._id);
        await message.save();
        message.users.forEach(_id=>{
            global.io.to(_id.toString()).emit('checkedUser',{messageId,userId:user._id});
        })
        return res.status(statusCode.OK).json({
            payload
        }); 
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
export default {
    get,
    getById,
    getByUserId,
    send,
    create,
    markRead,
    sendToAdmin
}
export {
    createConservation
}
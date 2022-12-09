import Order from '../../models/order.js';
import Product from '../../models/product.js';
import User from '../../models/user.js';
import statusCode from 'http-status-codes';
import {createNotification} from '../../controllers/api/notification.controller.js';
import moment from 'moment';
import {orderStatus, paymentMethodType, vnp_ResponseCode as vnp_ResponseCodeConstant} from '../../../constants/order.constant.js';
import { roles } from '../../../constants/credential.constant.js';
import { checkValidUrlReturn, createVNPayUrl } from '../../utils/vnpay.util.js';
import _ from 'lodash';
import { NOTIFICATION_TYPE } from '../../../constants/notification.constant.js';
import { sendMail } from '../../utils/mail.util.js';

const VNPAY_CODE_EXPIRE_IN = 60*60*2; 

const checkConfirmCart = async (confirmCart) => {
    const products = await Product.find({_id:Object.keys(confirmCart)}).select('_id quantity status').exec();
    let isValid = true;
    products.forEach(product=>{
        if(!(product.status && product.quantity>=confirmCart[product._id])) isValid=false;
    });
    return isValid;
}
const generateOrderCode = async ()=>{
    let count = await Order.estimatedDocumentCount();
    count ++;
    return count.toString().padStart(10,'0');
}
const validateConfirmCart = async (req,res) =>{
    try {
        const {payload} = req;
        const {cart} = req.body;
        let confirmCart = {};
        cart.forEach(i=>{
            confirmCart = {...confirmCart,[i._id]:i.quantity}
        })
        if(await checkConfirmCart (confirmCart)){
            return res.status(statusCode.OK).json({
                message : 'Valid cart',
                payload
            })
        } else return res.status(statusCode.BAD_REQUEST).json({
                message : 'Invalid cart',
                payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}

const pushOrderNotification = async (order, receiver , owner = undefined) => {
    try {
        delete order['products'];
        delete order['info'];
        delete order['message'];
        delete order['total'];
        let notificationData = {};
        notificationData.data = order;
        notificationData.owner = owner;
        notificationData.receivers = [receiver];
        switch (order.statuses[order.statuses.length-1]) {
            case orderStatus.WAITING_CONFIRM:
                notificationData.type = NOTIFICATION_TYPE.ORDER.WAITING_CONFIRM;
                notificationData.title = "Đơn hàng mới";
                notificationData.content = "Đơn hàng đang chờ được xác nhận";
                break;
            case orderStatus.CONFIRMED:
                notificationData.type = NOTIFICATION_TYPE.ORDER.CONFIRMED;
                notificationData.title = "Xác nhận đơn hàng";
                notificationData.content = "Đơn hàng đã được xác nhận";
                break;
            case orderStatus.WAITING_PICKUP:
                notificationData.type = NOTIFICATION_TYPE.ORDER.WAITING_PICKUP;
                notificationData.title = "Đang chờ lấy hàng";
                notificationData.content = "Đơn hàng đang đợi được đơn vị vận chuyển lấy hàng";
                break;
            case orderStatus.PICK_UP:
                notificationData.type = NOTIFICATION_TYPE.ORDER.PICK_UP;
                notificationData.title = "Đã lấy hàng";
                notificationData.content = "Đơn hàng đã được giao cho bên đơn vị vận chuyển";
                break;
            case orderStatus.DELIVERING:
                notificationData.type = NOTIFICATION_TYPE.ORDER.DELIVERING;
                notificationData.title = "Đang vận chuyển";
                notificationData.content = "Đơn hàng đang trong quá trình vận chuyển";
                break;
            case orderStatus.COMPLETE_DELIVERY:
                notificationData.type = NOTIFICATION_TYPE.ORDER.COMPLETE_DELIVERY;
                notificationData.title = "Hoàn thành";
                notificationData.content = "Đơn hàng đã được giao thành công";
                break;
            case orderStatus.CANCEL_BY_STORE:
                notificationData.type = NOTIFICATION_TYPE.ORDER.CANCEL_BY_STORE;
                notificationData.title = "Hủy đơn hàng";
                notificationData.content = "Đơn hàng đã bị hủy bởi cửa hàng vì một số lí do";
                break;
            case orderStatus.CANCEL_BY_CUSTOMER:
                notificationData.type = NOTIFICATION_TYPE.ORDER.CANCEL_BY_CUSTOMER;
                notificationData.title = "Hủy đơn hàng";
                notificationData.content = "Đơn hàng đã bị hủy";
                break;
            case orderStatus.WAITING_REFUND:
                notificationData.type = NOTIFICATION_TYPE.ORDER.WAITING_REFUND;
                notificationData.title = "Trả hàng/ hoàn tiền";
                notificationData.content = "Đang đợi xử lí";
                break;
            case orderStatus.COMPLETE_REFUND:
                notificationData.type = NOTIFICATION_TYPE.ORDER.COMPLETE_REFUND;
                notificationData.title = "Trả hàng/ hoàn tiền";
                notificationData.content = "Đã hoàn thành";
                break;
            default:
                break;
        }
        
        await createNotification(notificationData);
    } catch (error) {
        throw error;
    }
}
const matchOrderToSpecificAdminUser = async (order, userId) => {
    try {
        const promiseArray = [];
        promiseArray.push(
            User.findByIdAndUpdate(userId,{$push:{
                order : order._id
            }})
        );
        promiseArray.push(pushOrderNotification(order,userId, order.user ? order.user._id : undefined));
        await Promise.all(promiseArray);
        global.io.to(userId).emit('order',order);
    } catch (error) {
        throw error;
    }
}
const createOrder = async ({code,products,info,message,total},userId = undefined) => {
    let orderData = {
        code,
        products,
        info,
        message,
        total,
        statuses: [orderStatus.WAITING_CONFIRM],
        logDate: {[orderStatus.WAITING_CONFIRM]:new Date()},
        status: orderStatus.WAITING_CONFIRM
    };
    if(userId) orderData.user = userId;
    let promiseArray = [];
    promiseArray.push(Order.create(orderData));
    products.forEach((data)=>{
        promiseArray.push(
            Product.findByIdAndUpdate(
                data.product,
                {$inc:{
                    "quantity": -data.quantity
                }}
            )
        )
    });
    let [order] = await Promise.all(promiseArray);    
    if (userId) {
        order.user = await User.findByIdAndUpdate(userId,{
            $push : {order: order._id}
        }).select('_id name image');
    }
    if(global.socketAdminBasicQueue.peek()){
        const {_id,data} = global.socketAdminBasicQueue.peek();
        await matchOrderToSpecificAdminUser(order,_id);
        global.socketAdminBasicQueue.dequeue();
        global.socketAdminBasicQueue.push(data,_id);
    } else global.orderBasicQueue.push(order); 
    sendMail({to: order.info.email, subject: `Navita đã nhận đơn hàng #${order.code}`, html: 'Đơn hàng đang chờ được xác nhận'});
    return order;
}
const checkoutVNPay = async (req,res) => {
    try {
        const {payload} = req;
        if (checkValidUrlReturn(req.query)){
            const {vnp_BankCode, vnp_BankTranNo, vnp_CardType, vnp_PayDate, vnp_OrderInfo, vnp_TransactionNo, vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef} = req.query;
            if(vnp_ResponseCode === vnp_ResponseCodeConstant.success){
                //const rs = await global.redisClient.get("vnpay"+vnp_TxnRef);
                let order = global.nodeCache.get(`vnpay${vnp_TxnRef}`);
                if(order){
                    order.info.paymentMethod = {...order.info.paymentMethod,
                        paymentInfo: [
                            {title: 'Bank Code',content: vnp_BankCode},
                            {title: 'Bank Transaction No',content: vnp_BankTranNo},
                            {title: 'Card Type',content: vnp_CardType},
                            {title: 'Pay Date',content: vnp_PayDate},
                            {title: 'Message',content: vnp_OrderInfo},
                            {title: 'VNPay Transaction No',content: vnp_TransactionNo},
                        ]
                    }
                    const {userId} = order;
                    delete order.userId;
                    order = await createOrder(order,userId);
                    return res.status(statusCode.OK).json({
                        message: 'Checkout successfully',
                        payload: {...payload, order}
                    })
                }else return res.status(statusCode.NOT_ACCEPTABLE).json({
                    message: 'Something wrong'
                })
            }else return res.status(statusCode.METHOD_FAILURE).json({
                message: 'Checkout unsuccessfully',
                payload
            })
        }else return res.status(statusCode.NOT_ACCEPTABLE).json({
            message: 'Wrong parameter'
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const checkout = async (req,res)=>{
    try {
        var ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

        let {payload} = req;
        const {info,message='',userId = undefined} = req.body;
        const confirmCart = req.body.cart;
       
        let productsInStore = await Product.find({_id: Object.keys(confirmCart)}).select('_id quantity price status').exec();
        let isValid = true;
        productsInStore.every((product,index)=>{
            if(!(product.status && product.quantity>=confirmCart[product._id])) {
                isValid=false;
                return false;
            } else return true;
        });
        if(isValid){
            let products=[];
            let total = 0;
            const code = await generateOrderCode();
            productsInStore.forEach(product=>{
                product.quantity -= confirmCart[product._id];
                products.push({
                    product : product._id,
                    quantity : confirmCart[product._id],
                    price : product.price
                })
                total += confirmCart[product._id] * product.price;
            })
            const newOrder = {code,products,info,message,total};
            switch (info.paymentMethod.type) {
                case paymentMethodType.VNPAY:
                    const url = createVNPayUrl({amount: total, ipAddr, orderCode: code});
                    //global.redisClient.setEx("vnpay"+code,60*60*2,JSON.stringify({...newOrder,userId}));
                    global.nodeCache.set(`vnpay${code}`,{...newOrder,userId},VNPAY_CODE_EXPIRE_IN);
                    return res.status(statusCode.OK).json({
                        message: 'Wait for complete online payment',
                        payload : {...payload, url}
                    });
                //case paymentMethodType.PAYPAL:
                    // global.redisClient.setEx("paypal"+code,60*60*2,JSON.stringify({...newOrder,userId}));
                    // return res.status(statusCode.OK).json({
                    //     message: 'Wait for complete online payment',
                    //     payload : {...payload}
                    // });
                default:
                    const order = await createOrder(newOrder,userId);
                    return res.status(statusCode.OK).json({
                        message: 'Checkout successfully',
                        payload: {...payload, order}
                    });
            }
        }else return res.status(statusCode.METHOD_FAILURE).json({
            message : 'Invalid cart',
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
};
const get = async (req,res)=>{
    try {
        let {payload,user} = req;
        const {_id} = req.query;
        let order;
        if(_id){
            order = await Order.findById(_id)
                               .lean()
            const orderedUser = await User.findOne({order:_id},'_id name').lean();
            payload = {...payload,orderedUser};
        }else{
            order = await Order.find({_id: user.order})
                               .lean()
        }                       
        payload.order = order;
        return res.status(200).json({
            message:'Get successfully',
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const getByStatus = async (req,res) => {
    try {
        const {payload,user,query} = req;
        let {status=[],date,page=1, itemPerPage=10} = query;
        if(!Array.isArray(status)) status = [status];
        const dbQueries = status.map((s)=>{
                let promiseArray = [];
                let condition = {_id:{$in:user.order}}
                if (!_.isEmpty(s)) condition.status = parseInt(s);
                if (date){
                    const date = moment(date);
                    const beginOfDate = date.startOf('day').toISOString();
                    const endOfDate = date.endOf('day').toISOString();
                    condition.logDate[s] = {$and : [{$gte: beginOfDate},{$lte: endOfDate}]};
                }
                return Order
                .find(condition)
                .populate('user','_id name image')
                .lean();
            // })
        });       
        const rs = await Promise.all(dbQueries);
        payload.orders = rs.reduce((pre,cur,index)=>{
            pre[`${status[index]}`]=cur.reverse();
            return pre;
        },{});    
        return res.status(statusCode.OK).json({
            payload,
            message: 'Get Successfully'
        })      
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        });
    }
}
const getByCode = async (req,res)=>{
    try {
        let {payload,user} = req;
        const {code} = req.query;
        let order;

        order = await Order.findOne({code})
                            .lean()
                            .populate('products.product','album category name _id');                
        payload = {...payload,order};
        return res.status(200).json({
            message:'Get successfully',
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const refund = (req,res) => {
    try {
        
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const cancelOrder = async (req,res) => {
    try {
        let {payload,user} =req;
        let {orderId,reason} = req.body;
        const order = await Order.findByIdAndUpdate(orderId,{
            $push : {statuses: orderStatus.CANCEL_BY_CUSTOMER},
            $set : {
                [`logDate.${orderStatus.CANCEL_BY_CUSTOMER}`]:new Date()
            }, 
            reason,
            canceledByAdminDate: new Date()
        });
        const adminUserId = await User.findOne({order: order._id}).select('_id').lean();
        pushOrderNotification(order,user._id,adminUserId);
        return res.status(statusCode.OK).json({
            message: 'Cancel successfully'
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        });
    }
}
const updateStatus = async (req,res) => {
    try {
        let {payload,user} =req;
        let {order,statuses} = req.body;
        const date = new Date();
        let logDate = {};
        if (!Array.isArray(statuses)) statuses = [statuses];
        for (const status of statuses) {
            logDate = {...logDate,[`logDate.${status}]`] : date};
        }
        let updateData = {
            $push : {statuses: {$each:statuses}},
            $set : logDate,
            status: statuses[statuses.length -1]
        };
        let promiseArray = [];
        // switch (status) {
        //     case orderStatus.CONFIRMED:
        //         updateData.approvedDate = new Date();
        //         break;
        //     case orderStatus.PICK_UP:
        //         updateData.completedProcessingDate = new Date(); 
        //         break;
        //     case orderStatus.COMPLETE_DELIVERY:
        //         updateData.deliveredDate = new Date(); 
        //         break;
        //     case orderStatus.CANCEL_BY_STORE:
        //         updateData.canceledByStoreDate = new Date(); 
        //         break;
        //     default:
        //         break;
        // }
        if(order.user) promiseArray.push(pushOrderNotification(order,user._id,order.user));
        promiseArray.push(Order.findByIdAndUpdate(order._id,updateData,{new:true}));
        const rs = await Promise.all(promiseArray);
        payload.order = rs[rs.length-1];
        return res.status(statusCode.OK).json({
            message : 'Update successfully',
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        });
    }
}
export {
    matchOrderToSpecificAdminUser
}
export default {
    checkout,
    validateConfirmCart,
    get,
    updateStatus,
    getByCode,
    getByStatus,
    checkoutVNPay,
    cancelOrder,
    //getOrderManagement
}
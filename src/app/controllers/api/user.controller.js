import statusCode from 'http-status-codes';
import User from '../../models/user.js';
import Product from '../../models/product.js';
import { uploadFileToFireBase } from '../../utils/firebase.util.js';

// const addToCart = async (req,res) =>{
//     try {       
//         let {_id,quantity} = req.body;
//         quantity = Number.parseInt(quantity);        
//         let {payload,user} = req;
//         const product = await Product.findById(_id).lean();
//         if (product){
//             let isValid = true;
//             let cart = user.cart.map(i=>{return {
//                 product: i.product._id,
//                 quantity: i.quantity
//             }});
//             let index = -1;
//             if(cart.length>0) index=cart.findIndex(i=>i.product.toString()===_id);
//             if(index !==-1 ){
//                 (cart[index].quantity+quantity) <= product.quantity ? cart[index].quantity+=quantity : isValid=false; 
//             }else{
//                 (quantity <= product.quantity) ? cart.push({product:_id,quantity}) : isValid=false;
//             }
//             if(isValid) {
//                 let updateUser = await User.findByIdAndUpdate(user._id,{cart},{new:true}).lean().populate('cart.product','_id name category quantity price album status');
//                 global.io.to(user._id.toString()).emit('updateCart',updateUser.cart);
//                 return res.status(statusCode.OK).json({
//                     message:'Add to cart successfully',
//                     payload
//                 }); 
//             } else return res.status(statusCode.NOT_MODIFIED).json({
//                 message: 'Can\'t add more',
//                 payload
//             })
            
//         }else return res.status(statusCode.NOT_IMPLEMENTED).json({
//             message : 'This product has not been exist',
//             payload
//         })
//     } catch (error) {
//         return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
//             message: 'Error'
//         })
//     }
// }

// const updateCart = async (req,res) => {
//     try {
//         let {cart} = req.body;
//         let {payload,user} = req;
//         const _user = await User.findById(user._id).select('cart').populate('cart.product','_id quantity status').lean();
//         let oldCart = _user.cart.map(i=>{return {
//             product: i.product._id,
//             quantityInCart: i.quantity,
//             quantity: i.product.quantity}});
//         if(oldCart.length>0){
//             cart = cart.filter((item,index)=>{
//                 const rs = oldCart.findIndex(i=>i.product.toString() === item.product);
//                 if(rs!==-1 && oldCart[rs].quantity < item.quantity) 
//                 cart[index].quantity = oldCart[rs].quantity;
//                 return  rs !== -1;
//             })
//         }else cart = oldCart.map(i=>{return {
//             product: i.product,
//             quantity: i.quantityInCart
//         }});
//         let updateUser = await User.findByIdAndUpdate(user._id,{cart},{new:true}).lean().populate('cart.product','_id name category quantity price album status');
//         global.io.to(user._id.toString()).emit('updateCart',updateUser.cart);
//         return res.status(statusCode.OK).json({
//             message:'Update cart successfully',
//             payload
//         }); 
//     } catch (error) {
//         return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
//             message: 'Error'
//         })
//     }
// }

const findByUsername = async (req,res) =>{
    try {
        const {username} = req.query;
        let user = await User.findOne({username}).lean();
        return res.status(statusCode.OK).json({
            payload : {user}
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        });
    }
}
const getById = async (req,res) =>{
    try {
        let {userId} = req.query;
        if(!Array.isArray(userId)) userId = [userId];
        let user =await User.find({_id :{$in : userId}}).lean();
        user = user.map(i=>{
            return {_id:i._id,name:i._name};
        })
        return res.status(statusCode.OK).json({
            message : 'Get Successfully',
            payload : {user}
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const update = async (req,res) => {
    try {
        const {name,gender,dateOfBirth,email} = req.body;
        const {file,user} = req;
        let image = '';
        if(file){
            image = await uploadFileToFireBase(file,user._id+"."+file.originalname.split('.').pop());
        }
        const updatedUser = await User.findByIdAndUpdate(user._id,{
            name,
            gender,
            dateOfBirth,
            image,
            email
        },{new:true});
    return res.status(statusCode.OK).json({
        payload: {updatedUser},
        message: "Update successfully"
    }).send();       
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}
// const getCart = async (req,res) => {
//     try {
//         let {payload,user} = req;
//         user = await User.findById(user._id).lean().populate('cart.product','name category quantity price album status');
//         const {cart} = user;
//         payload = {...payload,cart}; 
//         return res.status(statusCode.OK).json({
//             message: 'Get successfully',
//             payload
//         })
//     } catch (error) {
//         return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
//             message: 'Error'
//         })
//     }    
// }
export default {
    // addToCart,
    // updateCart,
    findByUsername,
    // getCart,
    getById,
    update
}
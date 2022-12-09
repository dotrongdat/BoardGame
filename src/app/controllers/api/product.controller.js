import Product from '../../models/product.js'
import {productPagingConstant,ignoreInProductSearchFields} from '../../../constants/product.constant.js' 
import path from 'path';
import {writeFileSync} from '../../utils/image.util.js';
import {BUCKET_PATH, storagePath} from '../../../constants/image.constant.js';
import {statusCode} from '../../../constants/response.constant.js';
import { deleteFileFromFirebase, uploadFileToFireBase } from '../../utils/firebase.util.js';
import _ from 'lodash';


const create = async(req,res)=>{
    try {
        let {name, category, quantity, price, album, description, detailDescription, brand, blog}=req.body;
        let {files,payload}=req;
        const time = new Date().getTime();
        if(!Array.isArray(album)) album=[album];

        album.map((n,index)=>{
                const file=files.find(f=>f.originalname===n);
                const fileName = time.toString()+index.toString()+"."+n.split(".").pop();
                album[index] =  BUCKET_PATH + fileName;
                return uploadFileToFireBase(file,fileName);
        });

        if(!Array.isArray(detailDescription)) detailDescription = detailDescription ? [detailDescription] : [];
        detailDescription = detailDescription.map(val=>JSON.parse(val));
        const newProduct= await Product.create({
            name,
            category,
            quantity,
            price,
            album,
            description,
            detailDescription,
            brand,
            blog,
            promotion: null,
            status : true
        });
        payload ={...payload, product: newProduct};
        // global.redisClient.get('products').then(rs=>{
        //     if(rs){
        //         let products = JSON.parse(rs);
        //         products.push(newProduct);
        //         global.redisClient.set('products',JSON.stringify(products));
        //     }
        // });  
        let products = global.nodeCache.get("products");
        if(products){
            products.push(newProduct);
            global.nodeCache.set("products",products);
        }     
        return res.status(statusCode.OK).json({
            message:'Create new product successfully',
            payload
        })
    } catch (error) {
       return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
           message: 'Error'
       })
    }
}
const update = async(req,res)=>{
    try {
        let {_id, name, category, quantity, price, album, description, detailDescription, brand, promotion, blog}=req.body;
        let {files,payload}=req;
        if(files && files.length > 0){
            const time = new Date().getTime();
            if(!Array.isArray(album)) album=[album];
            album.forEach((n,index)=>{
                    const file=files.find(f=>f.originalname===n);
                    const fileName = time.toString()+index.toString()+"."+n.split(".").pop();
                    if(file){
                        album[index] =  BUCKET_PATH + fileName;
                        uploadFileToFireBase(file,fileName);
                    }                    
            });
        }
        
        if(!Array.isArray(detailDescription)) detailDescription = detailDescription ? [detailDescription] : [];
        detailDescription = detailDescription.map(val=>JSON.parse(val));
        if(promotion) promotion = JSON.parse(promotion);

        let updateData={
            name,
            category,
            quantity,
            price,
            album,
            description,
            detailDescription,
            brand,
            promotion,
            blog
        }     
        let product = await Product.findById(_id); 
        const deleteAlbum = product.album.filter(img=> !album.includes(img));
        for(let property in updateData){
            product[property] = updateData[property];
        }
        await product.save();  

        // global.redisClient.get('products').then(rs=>{
        //     if(rs){
        //         let products = JSON.parse(rs);
        //         const index = products.findIndex(i=>i._id === product._id.toString());
        //         products[index] = product;
        //         global.redisClient.set('products',JSON.stringify(products));
        //     } 
        // }); 
        let products = global.nodeCache.get("products");
        if(products){
            const index = products.findIndex(i=>i._id === product._id.toString());
            products[index] = product;
            global.nodeCache.set("products",products);
        }         
        deleteAlbum.forEach(img=>deleteFileFromFirebase(img));
        return res.status(statusCode.OK).json({
            message:'Update product successfully',
            payload: {...payload, product}
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const deleteProduct = async (req,res)=>{
    try {
        const {_id} = req.body;
        const {payload} = req;
        if(_.isArray(_id)){
            await Product.updateMany({
                _id: {$in: _id}
            },
            {
                $set: {status:false}
            })
        } else {
            await Product.findByIdAndUpdate(_id,{
                $set:{
                    status:false
                }
            })
        }     
        // global.redisClient.get('products').then(rs=>{
        //     if(rs){
        //         let products = JSON.parse(rs);
        //         products = products.filter(i=>_.isArray(_id) ? !_id.includes(i._id) : i._id !== _id);
        //         global.redisClient.set('products',JSON.stringify(products));
        //     }
        // });  
        let products = global.nodeCache.get("products");
        if(products){
            products = products.filter(i=>_.isArray(_id) ? !_id.includes(i._id) : i._id !== _id);
            global.nodeCache.set("products",products);
        }        
        return res.status(statusCode.OK).json({
            message:'Delete product successfully',
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}

const search = async (req,res)=>{
    try {
        let condition;
        let {
            name='',
            priceFrom=0,
            priceTo=Number.MAX_SAFE_INTEGER,
            page=productPagingConstant.DEFAULT_PAGE, 
            itemPerPage=productPagingConstant.ITEM_PER_PAGE,
            sortBy=productPagingConstant.SORT_BY,
            inc=productPagingConstant.SORT_INC
        }=req.query;
        let rawBody = req.query;
        
        for (let item in rawBody){
            if(ignoreInProductSearchFields.includes(item)) 
            delete rawBody[item]
        }
        const regex= new RegExp(name,'i');
        page=parseInt(page);
        itemPerPage=parseInt(itemPerPage);
        if(inc){
            if(inc==='true'){
                inc=productPagingConstant.SORT_INC;
            }else if(inc==='false'){
                inc=productPagingConstant.SORT_DES;
            }
        }
        condition = {
            $and : [
                {status:true},
                {name : {$regex:regex}},
                {price: {$gte: priceFrom}},
                {price: {$lte: priceTo}}
            ]
        }
        for(let property in rawBody){
            condition.$and.push({[property]:rawBody[property]})
        }
        let total=await Product.find(condition).countDocuments();
        total=Math.ceil(total/itemPerPage);
        const products=await Product.find(condition)
                                    .limit(itemPerPage)
                                    .skip((page-1)*itemPerPage)
                                    .sort({[sortBy]:inc})
                                    .lean();
        const payload={total,products}
        return res.status(statusCode.OK).json({
            message : 'Search product successfully',
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const get = async (req,res)=>{
    try {
        const {_id}=req.params;
        let products={};
        if(_id) products= await Product.findOne({_id,status:true}).lean();
        else products= await Product.find({status:true}).lean();
        return res.status(statusCode.OK).json({
            message:'Get product successfully',
            payload: {products}
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
const getAll =async (req,res)=>{
    try {
        //const rs = await global.redisClient.get('products');
        let products = global.nodeCache.get("products");
        // if(rs){
        //     products = JSON.parse(rs);
        // } else {
        //     products = await Product.find({status:true}).lean();
        //     global.redisClient.set('products',JSON.stringify(products));
        // }   
        if(!products){
            products = await Product.find({status:true}).lean();
            global.nodeCache.set("products",products);
        }     
        return res.status(statusCode.OK).json({
            message:'Get product successfully',
            payload: {products}
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}
// const getAllByAdmin =async (req,res)=>{
//     try {
//         const products = await Product.find().lean();
//         return res.status(statusCode.OK).json({
//             message:'Get product successfully',
//             payload: {products}
//         })
//     } catch (error) {
//         console.log(error)
//         return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
//             message: 'Error'
//         })
//     }
// }
export default {
    create,
    update,
    deleteProduct,
    search,
    get,
    getAll,
    //getAllByAdmin
}
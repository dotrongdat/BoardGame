import path from 'path';
import Category from '../../models/category.js';
import {writeFile,writeFileSync} from '../../utils/image.util.js';
import {storagePath} from '../../../constants/image.constant.js';

const create = async(req,res)=>{
    try {
        const {name} = req.body;
        let {payload} = req;
        const category = await Category.create({name,status:true})
        payload = {...payload, category};
        // global.redisClient.get('categories').then(rs=>{
        //     if(rs){
        //         let categories = JSON.parse(rs);
        //         categories.push(category);
        //         global.redisClient.set('categories',JSON.stringify(categories));
        //     }
        // })
        let categories = global.nodeCache.get("categories");                      
        if(categories){
            categories.push(category);
        } else categories = [category];
        global.nodeCache.set("categories",categories);
        return res.status(200).json({
            message:'Create new category successfully',
            payload
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    }
}
const getAll = async (req,res) =>{
    try {
        // const rs = await global.redisClient.get('categories');
        // let categories;
        // if(rs){
        //     categories = JSON.parse(rs);
        // } else {
        //     categories = await Category.find().lean();
        //     global.redisClient.set('categories',JSON.stringify(categories));
        // }    
        // const payload = {categories};
        let categories = global.nodeCache.get("categories");
        if(!categories){
            categories = await Category.find().lean();
            global.nodeCache.set('categories',categories);
        }    
        const payload = {categories};
        return res.status(200).json({
            message:'Get all categories successfully',
            payload
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    }
}

const disable = async (req,res) => {
    try {
        const {_id} = req.body;
        let {payload} = req;
        const category = await Category.findByIdAndUpdate(_id,{status: false},{new:true});
        // global.redisClient.get('categories').then((rs)=>{
        //     if(rs){
        //         let categories = JSON.parse(rs);
        //         const index = categories.findIndex(i=>i._id === category._id);
        //         categories[index] = category;
        //         global.redisClient.set('categories',JSON.stringify(categories));
        //     }
        // });   
        let categories = global.nodeCache.get("categories");                      
        if(categories){
            const index = categories.findIndex(i=>i._id === category._id);
            categories[index] = category;
            global.nodeCache.set("categories",categories); 
        }             
        return res.status(200).json({
            message:'Disable category successfully',
            payload
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    }
}
const enable = async (req,res) => {
    try {
        const {_id} = req.body;
        let {payload} = req;
        const category = await Category.findByIdAndUpdate(_id,{status: true},{new:true});
        // global.redisClient.get('categories').then((rs)=>{
        //     if(rs){
        //         let categories = JSON.parse(rs);
        //         const index = categories.findIndex(i=>i._id === category._id);
        //         categories[index] = category;
        //         global.redisClient.set('categories',JSON.stringify(categories));
        //     }
        // }); 
        let categories = global.nodeCache.get("categories");                      
        if(categories){
            const index = categories.findIndex(i=>i._id === category._id);
            categories[index] = category;
            global.nodeCache.set("categories",categories); 
        }     
        return res.status(200).json({
            message:'Enable category successfully',
            payload
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    }
}
const update = async (req,res) => {
    try {
        const {_id,name} = req.body;
        let {payload} = req;
        payload = {...payload, category : await Category.findByIdAndUpdate(_id,{name},{new:true})};
        return res.status(200).json({
            message:'Update category successfully',
            payload
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    }
}

export default {
    create,
    getAll,
    update,
    disable,
    enable
}
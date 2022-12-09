import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        require:true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    quantity:{
        type: Number,
        require:true
    },
    price: {
        type: Number,
        require:true
    },
    album: [{
        type: String
    }],
    description: {
        type: String
    },
    detailDescription:[{
        title: {
            type: String,
            require: true
        },
        content: {
            type: String,
            require: true
        }
    }],
    brand: {
        type: String,
        require: true
    },
    promotion: {
        value: Number,
        startDate: Date,
        endDate: Date
    },
    blog:{
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
},{
    timestamps:{createdAt:'created_at', updatedAt:'updated_at'}
})
const Product=mongoose.model('Product',productSchema);
export default Product;
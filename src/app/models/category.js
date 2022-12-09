import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        require:true
    },
    // logo:{
    //     type: String,
    //     require: true
    // },
    status: {
        type: Boolean,
        default: true
    },
},{
    timestamps:{createdAt:'created_at', updatedAt:'updated_at'}
})
const Category=mongoose.model('Category',categorySchema);
export default Category;
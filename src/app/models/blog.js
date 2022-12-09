import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    writer: {
        type: String,
        require: true
    },
    source:{
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        require: true
    }
},{
    timestamps: {
        updatedAt: "updated_at",
        createdAt: "created_at"
    }
});

const Blog = mongoose.model("Blog",blogSchema);
export default Blog;
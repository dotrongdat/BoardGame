import mongoose from 'mongoose'

const panelSchema = new mongoose.Schema({
    image: {
        type: String,
        require: true
    },
    type: {
        type: Number,
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

const Panel = mongoose.model("Blog",panelSchema);
export default Panel;
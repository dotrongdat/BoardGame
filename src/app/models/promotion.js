import mongoose from 'mongoose'
const promotionSchema = new mongoose.Schema({
    value: {
        type: Number,
        require: true
    },
    startDate: {
        type: Date,
        require: true
    },
    endDate: {
        type: Date,
        require: true
    },
    status: {
        type: Boolean,
        require: true
    }
},{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});
const Promotion = mongoose.model('Promotion',promotionSchema);
export default Promotion;
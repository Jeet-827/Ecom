import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true,
        trim: true
    },
    productdec: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    productimage: {
        type: String,
        default: ""
    },
    brand: {
        type: String,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const productModel = mongoose.model("Product", productSchema);
export default productModel;
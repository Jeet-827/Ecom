import productModel from "../../Model/Prodetc.Schema.js";

export const getProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

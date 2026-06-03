import productModel from "../../Model/Prodetc.Schema.js";
import jwt from "jsonwebtoken";

export const createProduct = async (req, res) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({
                message: "Please login"
            });
        }

        const token = header.split(" ")[1];

        const user = jwt.verify(
            token,
            process.env.ADMIN_TOKEN_KEY
        );

        if (
            user.role !== "admin" &&
            user.role !== "owner"
        ) {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        const product = await productModel.create({
            ...req.body
        });

        return res.status(201).json({
            message: "Product created successfully",
            product
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
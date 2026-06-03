import { Router } from "express";
import { createProduct } from "../controller/createProduct/createProduct.controller.js";
import { getProducts } from "../controller/ShowProduct/showProduct.controller.js";

const ProductRouter = Router();

ProductRouter.post("/create", createProduct);
ProductRouter.get("/", getProducts);

export default ProductRouter;

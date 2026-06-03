import express from "express"
import cors from 'cors'
import dotenv from "dotenv"
import mongoose from "mongoose"
import ProductRouter from "./routes/Product.route.js"

dotenv.config()
const app = express()

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Product DB connected successfully")
    } catch (error) {
        console.error("Product DB connection error:", error.message)
    }
}
connectDB()

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/products', ProductRouter)

app.listen(5002,()=>{
    console.log("product server run on port 5002")
})

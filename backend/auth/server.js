import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import AuthRouter from "./routes/Auth.route.js"

import { connect } from "./config/Mongodb.Config.js"

const app =express()
dotenv.config()
connect()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/auth',AuthRouter)
app.listen(process.env.PORT || 5001,()=>{
    console.log("the server is running on 5001")
})

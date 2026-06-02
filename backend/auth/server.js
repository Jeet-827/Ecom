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
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/auth',AuthRouter)

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`the server is running on ${PORT}`)
})

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Auth server failed to start: Port ${PORT} is already in use by another process.`);
    } else {
        console.error("Auth server error:", err.message);
    }
});

import mongoose from "mongoose";
export const connect = async()=>{
    try {
       const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log("mongodb Connected",conn.connection.host)
    } catch (error) {
        console.log(error,error.message)
    }
}
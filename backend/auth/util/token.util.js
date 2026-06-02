import jwt from "jsonwebtoken"

export const  genRateAccess = (prop)=>{
    const token = jwt.sign({id:prop},process.env.ACCESS_TOKEN,{expiresIn:'15m'})
    return token

}

export const  genRateRefresh = (prop)=>{
    const token = jwt.sign({id:prop},process.env.REFRESH_TOKEN,{expiresIn:'7d'})
    return token

}
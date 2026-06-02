import { Router } from "express";
import { SignIn,SignUp } from "../controller/Auth.controller.js";
const AuthRouter = Router()

AuthRouter.post('/signup',SignUp)
AuthRouter.post('/signin',SignIn)
export default AuthRouter
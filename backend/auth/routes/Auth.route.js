import { Router } from "express";
import { SignIn,SignUp,IsAdmin } from "../controller/Auth.controller.js";
const AuthRouter = Router()

AuthRouter.post('/signup',SignUp)
AuthRouter.post('/signin',SignIn)
AuthRouter.post('/admin/signin',IsAdmin)
export default AuthRouter
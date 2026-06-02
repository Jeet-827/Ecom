import bcrypt from "bcrypt";
import userModel from "../Model/useSchema.js";
import { genRateAccess, genRateRefresh } from "../util/token.util.js";

export const SignUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const findUser = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (findUser) {
            return res.status(409).json({
                message: "User already exists. Please login."
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            username,
            email,
            password: hash,
        });

        const accessToken = genRateAccess(user._id);
        const refreshToken = genRateRefresh(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "User created successfully",
            accessToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const SignIn = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if ( !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const findUser = await userModel.findOne({ email })

        if (!findUser) {
            return res.status(409).json({
                message: "User does not exist. Please Sign Up."
            });
        }
        const CheckPass = await bcrypt.compare(password, findUser.password)
        if(!CheckPass){
            return res.status(400).json({message:"password is wrong"})
        }


        const accessToken = genRateAccess(findUser._id);
        const refreshToken = genRateRefresh(findUser._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                _id: findUser._id,
                username: findUser.username,
                email: findUser.email,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

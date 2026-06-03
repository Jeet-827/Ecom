import userModel from "../Model/useSchema.js";
import admineSchema from "../Model/admine.Schema.js";

export const verifyAdmin = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Please login"
            });
        }
        if(user.role != 'admin'){
            return res.status(401).json({message:"You have not admin right "
            })
        }

        const adminUser = await admineSchema.findById(user._id);

        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        req.admin = adminUser;
        next();

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

11
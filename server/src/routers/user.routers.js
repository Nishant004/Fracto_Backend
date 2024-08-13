import { Router } from "express";
import { registerUser,
    loginUser, 
    logoutUser,
    refreshAccessToken , 
    getUserSessions ,
    getOnlineUsers } 
    from "../controllers/user.controlllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/sessions").get(verifyJWT, getUserSessions);
router.route('/online-users').get(verifyJWT, getOnlineUsers);

export default router;
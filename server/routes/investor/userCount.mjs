import { Router } from "express";
import Startup from "../../models/Startup.mjs"
const router = Router();

router.get("/investor/usercount", async (req, res) => {
    try {
        const startupCount = await Startup.countDocuments();
        return res.status(200).json({
            startupUsers: startupCount
    });
    }
    catch (error) {
        return res.status(400).send({message:error.message});
    }
});
console.log("investor count")
export default router


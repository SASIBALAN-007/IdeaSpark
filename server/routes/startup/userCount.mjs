import { Router } from "express";
import Investor from "../../models/Investor.mjs";
import { protect, authorize } from "../../middleware/auth.mjs";
const router = Router();


router.get("/startup/usercount", protect, authorize("startup"), async(req,res)=>{
    try{
        const investorCount = await Investor.countDocuments();
        return res.status(200).json({
            investorUsers : investorCount
        })
    }
    catch(error){
        return res.status(400).send({message:error.message})
    }
})
export default router

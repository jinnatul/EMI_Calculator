import { Router } from "express";
import { checkEMI } from "../controllers/EmiController";

const router = Router();

router.post("/check-emi", checkEMI);

export default router;

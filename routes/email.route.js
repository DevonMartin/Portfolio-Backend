import express from "express";
import { apiSendEmail } from "../controllers/email.controller.js";

const router = express.Router();

router.post("/", apiSendEmail);

export default router;

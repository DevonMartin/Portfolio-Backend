import express from "express";
import {
  apiIpGrabber
} from "../controllers/ipGrabber.controller.js";

const router = express.Router();

router.put("/", apiIpGrabber);

export default router;

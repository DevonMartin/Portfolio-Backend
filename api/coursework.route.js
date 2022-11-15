import express from "express";
import {apiGetCoursework, apiRefreshCoursework} from "../api/coursework.controller.js";

const router = express.Router();



router.get("/", apiGetCoursework);
router.get("/refresh", apiRefreshCoursework);

export default router;

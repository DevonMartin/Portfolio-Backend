import express from "express";
import CourseworkCtrl from "./coursework.controller.js";

const router = express.Router();

router.route("/").get(CourseworkCtrl.apiGetCoursework);
router.route("/refresh").get(CourseworkCtrl.apiRefreshCoursework);

export default router;

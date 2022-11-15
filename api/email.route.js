import express from "express";
import EmailCtrl from './email.controller.js';

const router = express.Router();

router
  .route("/")
  .post(EmailCtrl.apiSendEmail);

export default router;

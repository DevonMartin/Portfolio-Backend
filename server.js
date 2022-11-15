import express from "express";
import cors from "cors";

import coursework from './api/coursework.route.js';
import email from './api/email.route.js';


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/api/v1/coursework", coursework);
app.use('/api/v1/email', email);

export default app;

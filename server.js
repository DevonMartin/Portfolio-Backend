import express from "express";
import cors from "cors";

import emailRoutes from "./routes/email.route.js";
import courseRoutes from "./routes/coursework.route.js";
import ipGrabberRoutes from "./routes/ipGrabber.route.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://devonmartin.net",
      "https://devonmartin.onrender.com",
    ],
  })
);

app.use("/api/v1/coursework", courseRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/ipGrabber", ipGrabberRoutes);

export default app;

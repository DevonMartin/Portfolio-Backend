import app from "./server.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.MY_PORT || 8000;


mongoose.connect(process.env.MY_DB_URI).then(async () => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
  });
});

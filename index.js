import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import CourseworkDAO from './dao/courseworkDAO.js';
dotenv.config();
const MongoClient = mongodb.MongoClient;

const port = process.env.MY_PORT || 8000;

MongoClient.connect(process.env.MY_DB_URI)
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    await CourseworkDAO.injectDB(client);
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });

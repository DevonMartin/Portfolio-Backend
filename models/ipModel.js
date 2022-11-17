import mongoose from "mongoose";

const schema = mongoose.Schema({
    ip: String,
    city: String,
    count: Number
});

let ipModel = mongoose.model("ip", schema);

export default ipModel;
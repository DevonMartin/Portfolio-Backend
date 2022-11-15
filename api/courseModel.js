import mongoose from "mongoose";

const schema = mongoose.Schema({
  refresh_time: Number,
  courses: [],
});

let coursework = mongoose.model("coursework", schema);

export default coursework;
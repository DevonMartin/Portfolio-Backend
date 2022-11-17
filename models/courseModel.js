import mongoose from "mongoose";

const schema = mongoose.Schema({
  refresh_time: Number,
  courses: [],
});

let coursework = mongoose.model("course", schema);

export default coursework;
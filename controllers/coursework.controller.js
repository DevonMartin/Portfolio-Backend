import CourseworkDAO from "../dao/courseworkDAO.js";

export const apiGetCoursework = async (req, res) => {
  res.send(await CourseworkDAO.getCoursework());
};

export const apiRefreshCoursework = async (req, res) => {
  res.send(await CourseworkDAO.refreshCoursework());
};
import CourseworkDAO from "../dao/courseworkDAO.js";

export default class CourseworkController {
  static async apiGetCoursework(req, res) {
    const coursesData = await CourseworkDAO.getCoursework();
    res.json(coursesData);
  }

  static async apiRefreshCoursework(req, res) {
    const coursesData = await CourseworkDAO.refreshCoursework();
    res.json(coursesData);
  }
}

import fetch from 'node-fetch';
import model from "../api/courseModel.js";

export default class CourseworkDAO {
  static async refreshCoursework() {
    let cursor;
    try {
      // Get all data from db
      cursor = await model.findOne();
      // return cursor;
    } catch (e) {
      console.error(
        `Unable to find coursework data from db or convert results to an array, ${e}`
      );
      return { refresh_time: "error", courses: [] };
    }
    let result = await CourseworkDAO.getRefreshedCoursework(cursor);
    return {
      refresh_time: new Date(result.refresh_time).toUTCString(),
      courses: result.courses,
    };
  }

  // Fetches, updates and returns new course data. If API call limit has been reached, return null;
  static async getRefreshedCoursework(cursor) {
    let courses = [
      "CS50x",
      "CS61A",
      "CS61B",
      "FullStackOpen",
      "CS61C",
      "CS169",
      "CS170",
    ];
    // courseData contains the JSON, already parsed by fetchCourseData and ready to be returned.
    let courseData = { refresh_time: Date.now() };
    let data = courses.map(CourseworkDAO.fetchCourseData);
    courseData["courses"] = await Promise.all(data);
    if (courseData["courses"] === null) {
      return null;
    }
    cursor.refresh_time = courseData.refresh_time;
    cursor.courses = courseData.courses;
    await cursor.markModified(['refresh_time', 'courses']);
    await cursor.save((err) => {
      if (err) console.log(err);
    });

    return courseData;
  }

  // Fetches info on a course repository from Github, and if folders containing projects exist within the repository, fetches the project data as well. Returns data in JSON. If API call limit is reached, return null.
  static async fetchCourseData(course) {
    let jsonResponse;
    try {
      const response = await fetch(
        `https://api.github.com/repos/DevonMartin/${course}/contents`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_SECRET}`,
          },
        }
      );
      jsonResponse = await response.json();
    } catch (e) {
      console.error(`Unable to retrieve data for ${course}, ${e}`);
    }
    // If there's a message, either the API call limit was reached, or the repository was not found.
    if (jsonResponse.message) {
      if (jsonResponse.message === "Not Found") {
        return { name: course, projects: ["TBD"], status: "todo" };
      }
      return null;
    }
    let dirs = [];
    let links = [];
    jsonResponse.forEach((item) => {
      if (item.type === "dir") {
        dirs.push(item.name);
        links.push(item._links.self);
      }
    });
    let status = `${dirs.length > 1 ? "in progress" : dirs[0]}`;
    let projectData = links.map(CourseworkDAO.fetchCourseProjects);
    let dirProjects = await Promise.all(projectData);
    let allProjects = [];
    dirProjects.forEach((dir) => {
      dir.forEach((project) => {
        allProjects.push(project);
      });
    });
    return { name: course, projects: allProjects.sort(), status: status };
  }

  static async fetchCourseProjects(dirUrl) {
    let jsonResponse;
    try {
      const response = await fetch(dirUrl, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_SECRET}`,
        },
      });
      jsonResponse = await response.json();
    } catch (e) {
      console.error(`Unable to fetch project data, ${e}`);
    }
    let projects = [];
    jsonResponse.forEach((item) => {
      projects.push(item.name);
    });
    return projects;
  }

  static async getCoursework() {
    let cursor;
    try {
      // Get all data from db
      cursor = await model.findOne();
    } catch (e) {
      console.error(
        `Unable to find coursework data from db or convert results to an array, ${e}`
      );
      return { refresh_time: "error", courses: [] };
    }
    try {
      // Find time, refresh courses if 20+ minutes has passed since last refresh, and then return the refreshed courses.
      let data = await CourseworkDAO.checkForRefresh(await cursor);
      if (data) {
        cursor = data;
      }
    } catch (e) {
      console.error(`Unable to check whether a refresh is necessary, ${e}`);
    }
    return {
      refresh_time: new Date(cursor.refresh_time).toUTCString(),
      courses: cursor.courses,
    };
  }

  static async checkForRefresh(cursor) {
    let MINIMUM_TIME_BEFORE_REFRESH = 1200000; // 20 minutes in milliseconds
    if (cursor.refresh_time < Date.now() - MINIMUM_TIME_BEFORE_REFRESH) {
      try {
        let response = await CourseworkDAO.getRefreshedCoursework(cursor);
        return response;
      } catch (e) {
        console.error(`Unable to refresh coursework, ${e}`);
      }
    }
  }
}

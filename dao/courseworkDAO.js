import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let coursework;

export default class CourseworkDAO {
  static async injectDB(conn) {
    if (coursework) {
      return;
    }
    try {
      coursework = await conn.db(process.env.MY_DB_NS).collection("coursework");
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in courseworkDAO: ${e}`
      );
    }
  }

  static async refreshCoursework() {
    let cursor;
    try {
      // Get all data from db
      cursor = await coursework.find().toArray();
      // return cursor;
    } catch (e) {
      console.error(
        `Unable to find coursework data from db or convert results to an array, ${e}`
      );
      return { refresh_time: "error", courses: [] };
    }
    let result = await CourseworkDAO.getRefreshedCoursework(
      cursor[0].refresh_time
    );
    return {
      refresh_time: new Date(result.refresh_time).toUTCString(),
      courses: result.courses,
    };
  }

  // Fetches, updates and returns new course data. If API call limit has been reached, return null;
  static async getRefreshedCoursework(lastRefreshTime) {
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
    coursework.updateOne(
      { refresh_time: lastRefreshTime },
      {
        $set: {
          refresh_time: courseData.refresh_time,
          courses: courseData.courses,
        },
      }
    );
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
      cursor = await coursework.find().toArray();
      // return cursor;
    } catch (e) {
      console.error(
        `Unable to find coursework data from db or convert results to an array, ${e}`
      );
      return { refresh_time: "error", courses: [] };
    }
    try {
      // Find time, refresh courses if 20+ minutes has passed since last refresh, and then return the refreshed courses.
      let data = cursor.map(CourseworkDAO.checkForRefresh);
      let newCursor = await Promise.all(data);
      if (newCursor && newCursor[0]) {
        cursor = newCursor;
      }
    } catch (e) {
      console.error(`Unable to check whether a refresh is necessary, ${e}`);
    }
    return {
      refresh_time: new Date(cursor[0].refresh_time).toUTCString(),
      courses: cursor[0].courses,
    };
  }

  static async checkForRefresh(course) {
    let MINIMUM_TIME_BEFORE_REFRESH = 1200000; // 20 minutes in milliseconds
    if (course.refresh_time) {
      if (course.refresh_time < Date.now() - MINIMUM_TIME_BEFORE_REFRESH) {
        try {
          let response = await CourseworkDAO.getRefreshedCoursework(
            course.refresh_time
          );
          return response;
        } catch (e) {
          console.error(`Unable to refresh coursework, ${e}`);
        }
      }
    }
  }
}

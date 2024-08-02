"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_controller_1 = require("../controllers/course.controller");
const courseRouter = express_1.default.Router();
// courseRouter.post(
//   "/create-course",
//   isAutheticated,
//   authorizeRoles("admin"),
//   uploadCourse
// );
// courseRouter.put(
//   "/edit-course/:id",
//   isAutheticated,
//   authorizeRoles("admin"),
//   editCourse
// );
courseRouter.get("/get-course/:id", course_controller_1.getSingleCourse);
courseRouter.get("/get-courses", course_controller_1.getAllCourses);
// courseRouter.get(
//   "/get-admin-courses",
//   isAutheticated,
//   authorizeRoles("admin"),
//   getAdminAllCourses
// );
// courseRouter.get("/get-course-content/:id", isAutheticated, getCourseByUser);
// courseRouter.put("/add-question", isAutheticated, addQuestion);
// courseRouter.put("/add-answer", isAutheticated, addAnwser);
// courseRouter.put("/add-review/:id", isAutheticated, addReview);
// courseRouter.put(
//   "/add-reply",
//   isAutheticated,
//   authorizeRoles("admin"),
//   addReplyToReview
// );
// courseRouter.post("/getVdoCipherOTP", generateVideoUrl);
// courseRouter.delete(
//   "/delete-course/:id",
//   isAutheticated,
//   authorizeRoles("admin"),
//   deleteCourse
// );
exports.default = courseRouter;

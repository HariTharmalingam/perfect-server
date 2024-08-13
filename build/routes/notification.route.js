"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
// import { getNotifications, updateNotification } from "../controllers/notification.controller";
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRouter = express_1.default.Router();
// notificationRoute.get(
//   "/get-all-notifications",
//   isAutheticated,
//   authorizeRoles("admin"),
//   getNotifications
// );
// notificationRoute.put("/update-notification/:id", isAutheticated, authorizeRoles("admin"), updateNotification);
notificationRouter.post("/post-notification/v2", auth_1.isAutheticated, notification_controller_1.SubscriptionUpdate);
exports.default = notificationRouter;

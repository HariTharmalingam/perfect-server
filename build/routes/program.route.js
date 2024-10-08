"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const program_controller_1 = require("../controllers/program.controller");
const auth_1 = require("../middleware/auth");
const programRouter = express_1.default.Router();
programRouter.get("/get-program-content/", auth_1.isAutheticated, program_controller_1.getProgramsByUser);
programRouter.get("/get-programs", program_controller_1.getAllPrograms);
exports.default = programRouter;

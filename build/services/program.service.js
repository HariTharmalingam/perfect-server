"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProgramsService = exports.createProgram = void 0;
const program_model_1 = __importDefault(require("../models/program.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
// create course
exports.createProgram = (0, catchAsyncErrors_1.CatchAsyncError)(async (data, res) => {
    const program = await program_model_1.default.create(data);
    res.status(201).json({
        success: true,
        program
    });
});
// Get All Courses
const getAllProgramsService = async (res) => {
    const programs = await program_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        programs,
    });
};
exports.getAllProgramsService = getAllProgramsService;

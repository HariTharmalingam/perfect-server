"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgamsByUserId = exports.getAllProgramsService = exports.createProgram = void 0;
const program_model_1 = __importDefault(require("../models/program.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const moment_1 = __importDefault(require("moment"));
const redis_1 = require("../utils/redis");
// create program
exports.createProgram = (0, catchAsyncErrors_1.CatchAsyncError)(async (data, res) => {
    const program = await program_model_1.default.create(data);
    res.status(201).json({
        success: true,
        program
    });
});
// Get All Programs
const getAllProgramsService = async (res) => {
    const programs = await program_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        programs,
    });
};
exports.getAllProgramsService = getAllProgramsService;
//Get Programs of Users
const getProgamsByUserId = async (id, res) => {
    const userJson = await redis_1.redis.get(id);
    if (userJson) {
        const user = JSON.parse(userJson);
        const array = [];
        await Promise.all(user.programs.map(async (element) => {
            array.push(await program_model_1.default.findById(element.programId));
            const currentProgramWeek = (0, moment_1.default)().diff(element.purchasedDay, 'week');
            array.push({ "currentProgramWeek": currentProgramWeek });
        }));
        res.status(201).json({
            success: true,
            array,
        });
    }
};
exports.getProgamsByUserId = getProgamsByUserId;

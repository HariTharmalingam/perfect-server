"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgramByUser = exports.getAllPrograms = exports.getSingleProgram = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const program_model_1 = __importDefault(require("../models/program.model"));
const redis_1 = require("../utils/redis");
const program_service_1 = require("../services/program.service");
// get single program --- without purchasing
exports.getSingleProgram = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const programId = req.params.id;
        const isCacheExist = await redis_1.redis.get(programId);
        if (isCacheExist) {
            const program = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                program,
            });
        }
        else {
            const program = await program_model_1.default.findById(req.params.id).select("-programData.videoUrl -programData.suggestion -programData.questions -programData.links");
            await redis_1.redis.set(programId, JSON.stringify(program), "EX", 604800); // 7days
            res.status(200).json({
                success: true,
                program,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all programs --- without purchasing
exports.getAllPrograms = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        (0, program_service_1.getProgamsByUserId)(userId, res);
        const programs = await program_model_1.default.find();
        res.status(200).json({
            success: true,
            programs,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get program content -- only for valid user
exports.getProgramByUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userProgramList = req.user?.programs;
        const programId = req.params.id;
        const programExists = userProgramList?.find((program) => program._id.toString() === programId);
        if (!programExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this program", 404));
        }
        const program = await program_model_1.default.findById(programId);
        const content = program;
        res.status(200).json({
            success: true,
            content,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});

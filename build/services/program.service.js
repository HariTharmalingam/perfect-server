"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgamsByUserId = exports.getAllProgramsService = exports.createProgram = void 0;
const program_model_1 = __importDefault(require("../models/program.model"));
const program_model_2 = __importDefault(require("../models/program.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const moment_1 = __importDefault(require("moment"));
const user_model_1 = __importDefault(require("../models/user.model"));
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
const getProgamsByUserId = async (userId) => {
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const programsWithWeeks = await Promise.all(user.programs.map(async (userProgram) => {
        const program = await program_model_2.default.findById(userProgram.programId);
        if (!program) {
            throw new Error(`Program not found: ${userProgram.programId}`);
        }
        // Utiliser moment pour calculer précisément les semaines écoulées
        const purchaseDate = (0, moment_1.default)(userProgram.purchasedDay).startOf('day');
        const currentDate = (0, moment_1.default)().startOf('day');
        const weeksDiff = currentDate.diff(purchaseDate, 'weeks');
        // La semaine en cours est le nombre de semaines écoulées + 1
        const currentProgramWeek = weeksDiff + 1;
        return {
            program,
            currentProgramWeek
        };
    }));
    return programsWithWeeks;
};
exports.getProgamsByUserId = getProgamsByUserId;

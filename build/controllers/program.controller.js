"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgramsByUser = exports.getAllPrograms = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const warmup_model_1 = require("../models/warmup.model");
const program_model_1 = __importDefault(require("../models/program.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
const program_service_1 = require("../services/program.service");
// get all programs --- without purchasing
exports.getAllPrograms = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
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
exports.getProgramsByUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    const userId = req.user?._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("User ID not found", 400));
    }
    try {
        const user = await user_model_1.default.findById(userId).populate({
            path: 'programs.programId',
            populate: {
                path: 'month.session.warmupId',
                model: warmup_model_1.Warmup
            }
        });
        if (!user) {
            return next(new ErrorHandler_1.default("User not found", 404));
        }
        const currentDate = (0, moment_1.default)();
        let activeProgram = null;
        const upcomingPrograms = [];
        const updatedUserPrograms = [];
        for (let i = 0; i < user.programs.length; i++) {
            const userProgram = user.programs[i];
            // Vérification de type et conversion
            if (!(userProgram.programId instanceof mongoose_1.default.Types.ObjectId) && 'name' in userProgram.programId) {
                const program = userProgram.programId;
                const totalWeeks = program.month.reduce((acc, month) => acc + month.session[0].exercise[0].week.length, 0);
                const programEndDate = (0, moment_1.default)(userProgram.startDate).add(totalWeeks, 'weeks');
                if (currentDate.isBefore(programEndDate)) {
                    if (!activeProgram) {
                        // C'est le premier programme actif
                        const restructuredProgram = await (0, program_service_1.restructureProgram)(program, userProgram.startDate);
                        activeProgram = {
                            ...program.toObject(),
                            restructuredWeeks: restructuredProgram,
                            startDate: userProgram.startDate,
                            endDate: programEndDate.toDate()
                        };
                        updatedUserPrograms.push(userProgram);
                    }
                    else {
                        // C'est un programme à venir
                        upcomingPrograms.push({
                            _id: program._id,
                            name: program.name,
                            startDate: userProgram.startDate
                        });
                        updatedUserPrograms.push(userProgram);
                    }
                }
                else if (i === 0) {
                    // Le premier programme est terminé, mettons à jour la date de début du suivant
                    if (user.programs[1]) {
                        user.programs[1].startDate = programEndDate.toDate();
                    }
                }
            }
            else {
                console.error('Invalid program data:', userProgram.programId);
            }
        }
        // Mise à jour des programmes de l'utilisateur
        user.programs = updatedUserPrograms;
        await user.save();
        res.status(200).json({
            success: true,
            activeProgram: activeProgram,
            upcomingPrograms: upcomingPrograms
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});

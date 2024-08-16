"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProgramsService = exports.createProgram = void 0;
exports.restructureProgram = restructureProgram;
const program_model_1 = __importDefault(require("../models/program.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const moment_1 = __importDefault(require("moment"));
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
function restructureProgram(program, startDate) {
    const restructuredWeeks = [];
    const currentDate = (0, moment_1.default)();
    const startMoment = (0, moment_1.default)(startDate);
    const currentProgramWeek = currentDate.diff(startMoment, 'weeks') + 1;
    let globalWeekIndex = 0;
    for (const month of program.month) {
        for (const session of month.session) {
            const weeksInSession = session.exercise[0]?.week.length || 0;
            for (let weekIndex = 0; weekIndex < weeksInSession; weekIndex++) {
                globalWeekIndex++;
                if (globalWeekIndex <= currentProgramWeek) {
                    const restructuredWeek = {
                        weekNumber: globalWeekIndex,
                        isCurrent: globalWeekIndex === currentProgramWeek,
                        sessions: []
                    };
                    let restructuredWarmup = null;
                    if (session.warmupId && typeof session.warmupId !== 'string') {
                        // Si warmupId n'est pas une chaîne, c'est qu'il a été peuplé
                        const warmup = session.warmupId;
                        restructuredWarmup = {
                            name: warmup.name,
                            exercise: warmup.exercise.map(ex => ({
                                name: ex.name,
                                instructions: ex.instructions,
                                image: ex.image,
                                duration: ex.duration
                            }))
                        };
                    }
                    const restructuredSession = {
                        warmup: restructuredWarmup,
                        instructions: session.instructions,
                        exercises: []
                    };
                    for (const exercise of session.exercise) {
                        if (weekIndex < exercise.week.length) {
                            const weekData = exercise.week[weekIndex];
                            const restructuredExercise = {
                                name: exercise.name,
                                instructions: exercise.instructions,
                                image: exercise.image,
                                sets: weekData.sets,
                                reps: weekData.reps,
                                rest: weekData.rest,
                                duration: weekData.duration,
                                distance: weekData.distance
                            };
                            restructuredSession.exercises.push(restructuredExercise);
                        }
                    }
                    restructuredWeek.sessions.push(restructuredSession);
                    restructuredWeeks.push(restructuredWeek);
                }
            }
        }
    }
    return restructuredWeeks.sort((a, b) => a.weekNumber - b.weekNumber);
}

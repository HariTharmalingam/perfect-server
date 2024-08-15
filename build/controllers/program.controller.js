"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgramsByUser = exports.getAllPrograms = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const program_model_1 = __importDefault(require("../models/program.model"));
const program_model_2 = __importDefault(require("../models/program.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const moment_1 = __importDefault(require("moment"));
// // get single program --- without purchasing
// export const getSingleProgram = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const programId = req.params.id;
//       const isCacheExist = await redis.get(programId);
//       if (isCacheExist) {
//         const program = JSON.parse(isCacheExist);
//         res.status(200).json({
//           success: true,
//           program,
//         });
//       } else {
//         const program = await ProgramModel.findById(req.params.id).select(
//           "-programData.videoUrl -programData.suggestion -programData.questions -programData.links"
//         );
//         await redis.set(programId, JSON.stringify(program), "EX", 604800); // 7days
//         res.status(200).json({
//           success: true,
//           program,
//         });
//       }
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
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
exports.getProgramsByUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    const userId = req.user?._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("User ID not found", 400));
    }
    try {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return next(new ErrorHandler_1.default("User not found", 404));
        }
        const programs = await Promise.all(user.programs.map(async (userProgram) => {
            const program = await program_model_2.default.findById(userProgram.programId);
            if (!program) {
                throw new Error(`Program not found: ${userProgram.programId}`);
            }
            const purchaseDate = (0, moment_1.default)(userProgram.purchasedDay).startOf('day');
            const currentDate = (0, moment_1.default)().startOf('day');
            const weeksDiff = currentDate.diff(purchaseDate, 'weeks');
            const currentProgramWeek = weeksDiff + 1;
            // Restructurer le programme
            const restructuredProgram = restructureProgram(program, currentProgramWeek);
            return {
                _id: program._id,
                name: program.name,
                currentProgramWeek,
                weeks: restructuredProgram
            };
        }));
        res.status(200).json({
            success: true,
            programs
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
function restructureProgram(program, currentProgramWeek) {
    const restructuredWeeks = [];
    program.month.forEach((month, monthIndex) => {
        month.session.forEach((session, sessionIndex) => {
            session.exercise.forEach(exercise => {
                exercise.week.forEach((week, weekIndex) => {
                    const absoluteWeekNumber = monthIndex * 4 + weekIndex + 1; // Assuming 4 weeks per month
                    if (!restructuredWeeks[absoluteWeekNumber - 1]) {
                        restructuredWeeks[absoluteWeekNumber - 1] = {
                            weekNumber: absoluteWeekNumber,
                            isCurrent: absoluteWeekNumber === currentProgramWeek,
                            sessions: []
                        };
                    }
                    const restructuredExercise = {
                        name: exercise.name,
                        instructions: exercise.instructions,
                        image: exercise.image,
                        sets: week.sets,
                        reps: week.reps,
                        rest: week.rest,
                        duration: week.duration,
                        distance: week.distance
                    };
                    let restructuredSession = restructuredWeeks[absoluteWeekNumber - 1].sessions.find(s => s.warmup === session.warmup && s.instructions === session.instructions);
                    if (!restructuredSession) {
                        restructuredSession = {
                            warmup: session.warmup,
                            instructions: session.instructions,
                            exercises: []
                        };
                        restructuredWeeks[absoluteWeekNumber - 1].sessions.push(restructuredSession);
                    }
                    restructuredSession.exercises.push(restructuredExercise);
                });
            });
        });
    });
    return restructuredWeeks.filter(Boolean).sort((a, b) => a.weekNumber - b.weekNumber);
}

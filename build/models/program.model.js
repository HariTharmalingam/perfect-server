"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const weeksSchema = new mongoose_1.Schema({
    weekNumber: Number,
    sets: Number,
    reps: String,
    rest: String,
    duration: String,
});
const exercisesSchema = new mongoose_1.Schema({
    exerciseNumber: Number,
    exerciseName: String,
    exerciseDescription: String,
    image: String,
    weeks: [weeksSchema],
});
const sessionSchema = new mongoose_1.Schema({
    sessionNumber: Number,
    warmup: String,
    instructions: String,
    sessionType: String,
    exercises: [exercisesSchema],
});
const programSchema = new mongoose_1.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    session: [sessionSchema],
}, { timestamps: true });
const ProgramModel = mongoose_1.default.model("Program", programSchema);
exports.default = ProgramModel;

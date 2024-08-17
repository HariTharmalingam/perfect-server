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
const ImageSchema = new mongoose_1.Schema({
    public_id: String,
    url: String
});
const WeekSchema = new mongoose_1.Schema({
    sets: { type: Number, required: true },
    reps: [String],
    rest: [String],
    duration: [String],
    distance: [String]
}, { _id: false });
const ExerciseSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    instructions: [String],
    image: ImageSchema,
    week: [WeekSchema]
});
const SessionSchema = new mongoose_1.Schema({
    warmupId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Warmup'
    },
    instructions: String,
    exercise: [ExerciseSchema]
});
const MonthSchema = new mongoose_1.Schema({
    index: { type: Number, required: true },
    session: [SessionSchema]
});
const ProgramSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    month: [MonthSchema]
});
ProgramSchema.index({ warmupId: 1 });
const ProgramModel = mongoose_1.default.model('Program', ProgramSchema);
exports.default = ProgramModel;

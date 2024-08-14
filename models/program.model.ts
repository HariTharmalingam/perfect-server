import mongoose, { Document, Model, Schema } from "mongoose";

interface IWeek {
  weekNumber: number;
  sets: number;
  reps?: string[];
  rest?: string[];
  duration?: string[];
}

interface IExercise {
  exerciseNumber: number;
  exerciseName: string;
  exerciseDescription: string;
  image: string;
  weeks: IWeek[];
}

interface ISession {
  sessionNumber: number;
  warmup?: string;
  instructions: string;
  sessionType?: string;
  exercises: IExercise[];
}

export interface IProgram extends Document {
  id: number;
  name: string;
  session: ISession[];
}

const WeekSchema: Schema = new Schema({
  weekNumber: Number,
  sets: Number,
  reps: [String],
  rest: [String],
  duration: [String]
});

const ExerciseSchema: Schema = new Schema({
  exerciseNumber: Number,
  exerciseName: String,
  exerciseDescription: String,
  image: String,
  weeks: [WeekSchema]
});

const SessionSchema: Schema = new Schema({
  sessionNumber: Number,
  warmup: String,
  instructions: String,
  sessionType: String,
  exercises: [ExerciseSchema]
});

const ProgramSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  session: [SessionSchema]
});

export default mongoose.model<IProgram>('Program', ProgramSchema);


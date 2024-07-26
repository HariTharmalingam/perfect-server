import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface IProgram extends Document {
  id: number
  name: string
  session: ISession[]
}


interface ISession extends Document {
  sessionNumber: number
  warmup?: string
  instructions: string
  exercises: IExercises[]
  sessionType?: string
}
interface IExercises {
  exerciseNumber: number
  exerciseName: string
  exerciseDescription: string
  image: string
  weeks: IWeeks[]
}

interface IWeeks {
  weekNumber: number
  sets: number
  reps?: string[]
  rest?: string[]
  duration?: string[]
}

const weeksSchema = new Schema<IWeeks>({
  weekNumber: Number,
  sets: Number,
  reps: String,
  rest: String,
  duration: String,
});

const exercisesSchema = new Schema<IExercises>({
  exerciseNumber: Number,
  exerciseName: String,
  exerciseDescription: String,
  image: String,
  weeks: [weeksSchema],
});

const sessionSchema = new Schema<ISession>({
  sessionNumber: Number,
  warmup: String,
  instructions: String,
  sessionType: String,
  exercises: [exercisesSchema],
});


const programSchema = new Schema<IProgram>({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  session: [sessionSchema],
},{timestamps: true});

const ProgramModel: Model<IProgram> = mongoose.model("Program", programSchema);

export default ProgramModel;

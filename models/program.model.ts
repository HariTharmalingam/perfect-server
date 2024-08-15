import mongoose, { Schema, Document } from 'mongoose';

interface IImage {
  public_id: string;
  url: string;
}

interface IWeek {
  sets: number;
  reps?: string[];
  rest?: string[];
  duration?: string[];
  distance?: string[];
}

interface IExercise {
  name: string;
  instructions: string[];
  image: IImage;
  week: IWeek[];
}

interface ISession {
  warmup: string;
  instructions: string;
  exercise: IExercise[];
}

interface IMonth {
  session: ISession[];
}

export interface IProgram extends Document {
  name: string;
  month: IMonth[];
}

const ImageSchema: Schema = new Schema({
  public_id: String,
  url: String
});

const WeekSchema: Schema = new Schema({
  sets: { type: Number, required: true },
  reps: [String],
  rest: [String],
  duration: [String],
  distance: [String]
}, { _id: false });

const ExerciseSchema: Schema = new Schema({
  name: { type: String, required: true },
  instructions: [String],
  image: ImageSchema,
  week: [WeekSchema]
});

const SessionSchema: Schema = new Schema({
  warmup: String,
  instructions: String,
  exercise: [ExerciseSchema]
});

const MonthSchema: Schema = new Schema({
  session: [SessionSchema]
});

const ProgramSchema: Schema = new Schema({
  name: { type: String, required: true },
  month: [MonthSchema]
});

const ProgramModel = mongoose.model<IProgram>('Program', ProgramSchema);

export default ProgramModel;
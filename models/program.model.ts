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
  warmupId:  string;
  instructions: string;
  exercise: IExercise[];
}

interface IMonth {
  index: number;
  session: ISession[];
}
export interface IProgram extends Document {
  name: string;
  duration: number; 
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
  warmupId: { 
    type: String,
    ref: 'Warmup'
  },  
  instructions: String,
  exercise: [ExerciseSchema]
});

const MonthSchema: Schema = new Schema({
  index: { type: Number, required: true },
  session: [SessionSchema]
});

const ProgramSchema: Schema = new Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  month: [MonthSchema]
});
ProgramSchema.index({ warmupId: 1 });

const ProgramModel = mongoose.model<IProgram>('Program', ProgramSchema);

export default ProgramModel;
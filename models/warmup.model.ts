import mongoose, { Document, Schema } from 'mongoose';

// Interface pour l'image
interface IImage {
  public_id: string;
  url: string;
}

// Interface pour un exercice
interface IExercise {
  name: string;
  instructions: string[];
  image: IImage;
  duration: string;
}

// Interface principale pour le warmup
export interface IWarmup extends Document {
  name: string;
  exercise: IExercise[];
}

// Schéma pour l'image
const ImageSchema = new Schema<IImage>({
  public_id: { type: String, default: '' },
  url: { type: String, default: '' }
});

// Schéma pour un exercice
const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  instructions: { type: [String], required: true },
  image: { type: ImageSchema, required: true },
  duration: { type: String, required: true }
});

// Schéma principal pour le warmup
const WarmupSchema = new Schema<IWarmup>({
  name: { type: String, required: true },
  exercise: { type: [ExerciseSchema], required: true }
});

// Créer et exporter le modèle
export const Warmup = mongoose.model<IWarmup>('Warmup', WarmupSchema);
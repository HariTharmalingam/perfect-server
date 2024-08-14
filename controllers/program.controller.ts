import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createProgram, getAllProgramsService } from "../services/program.service";
import ProgramModel from "../models/program.model";
import Program, { IProgram } from '../models/program.model';
import CourseModel from "../models/course.model";
import userModel from "../models/user.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.Model";
import axios from "axios";
import { getProgamsByUserId } from "../services/program.service";
import User, { IUser, IUserProgram } from "../models/user.model";

import moment from 'moment';

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
export const getAllPrograms = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const programs = await ProgramModel.find();

      res.status(200).json({
        success: true,
        programs,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get program content -- only for valid user

interface ProgramWithWeek {
  program: IProgram;
  currentProgramWeek: number;
}

export const getProgramsByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) {
      return next(new ErrorHandler("User ID not found", 400));
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const programs = await Promise.all(
        user.programs.map(async (userProgram) => {
          const program = await Program.findById(userProgram.programId);
          if (!program) {
            throw new Error(`Program not found: ${userProgram.programId}`);
          }

          const purchaseDate = moment(userProgram.purchasedDay).startOf('day');
          const currentDate = moment().startOf('day');
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
        })
      );

      res.status(200).json({
        success: true,
        programs
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
interface Week {
  weekNumber: number;
  sets: number;
  reps?: string[];
  rest?: string[];
  duration?: string[];
}

interface Exercise {
  exerciseNumber: number;
  exerciseName: string;
  exerciseDescription: string;
  image: string;
  weeks: Week[];
}

interface Session {
  sessionNumber: number;
  warmup?: string;
  instructions: string;
  sessionType?: string;
  exercises: Exercise[];
}

interface Program {
  _id: string;
  id: number;
  name: string;
  session: Session[];
}

interface RestructuredExercise extends Omit<Exercise, 'weeks'> {
  sets: number;
  reps?: string[];
  rest?: string[];
  duration?: string[];
}

interface RestructuredSession extends Omit<Session, 'exercises'> {
  exercises: RestructuredExercise[];
}

interface RestructuredWeek {
  weekNumber: number;
  isCurrent: boolean;
  sessions: RestructuredSession[];
}

function restructureProgram(program: Program, currentProgramWeek: number): RestructuredWeek[] {
  const weeks: { [key: number]: RestructuredSession[] } = {};

  program.session.forEach(session => {
    session.exercises.forEach(exercise => {
      exercise.weeks.forEach(week => {
        if (!weeks[week.weekNumber]) {
          weeks[week.weekNumber] = [];
        }

        const restructuredExercise: RestructuredExercise = {
          ...exercise,
          sets: week.sets,
          reps: week.reps,
          rest: week.rest,
          duration: week.duration
        };
        delete (restructuredExercise as any).weeks;

        const existingSession = weeks[week.weekNumber].find(s => s.sessionNumber === session.sessionNumber);
        if (existingSession) {
          existingSession.exercises.push(restructuredExercise);
        } else {
          weeks[week.weekNumber].push({
            sessionNumber: session.sessionNumber,
            warmup: session.warmup,
            instructions: session.instructions,
            sessionType: session.sessionType,
            exercises: [restructuredExercise]
          });
        }
      });
    });
  });

  return Object.entries(weeks).map(([weekNumber, sessions]) => ({
    weekNumber: parseInt(weekNumber),
    isCurrent: parseInt(weekNumber) === currentProgramWeek,
    sessions
  })).sort((a, b) => a.weekNumber - b.weekNumber);
}
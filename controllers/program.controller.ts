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

          return {
            ...program.toObject(),
            currentProgramWeek
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
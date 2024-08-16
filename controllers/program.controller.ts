import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { IWarmup, Warmup } from "../models/warmup.model";
import ProgramModel from "../models/program.model";
import { IProgram } from '../models/program.model';
import User, { IUserProgram } from "../models/user.model";
import mongoose from 'mongoose';
import moment from 'moment';
import { restructureProgram } from "../services/program.service";

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

export const getProgramsByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) {
      return next(new ErrorHandler("User ID not found", 400));
    }

    try {
      const user = await User.findById(userId).populate({
        path: 'programs.programId',
        populate: {
          path: 'month.session.warmupId',
          model: Warmup
        }
      });

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const currentDate = moment();
      let activeProgram = null;
      const upcomingPrograms = [];
      const updatedUserPrograms: IUserProgram[] = [];

      for (let i = 0; i < user.programs.length; i++) {
        const userProgram = user.programs[i];
        
        // Vérification de type et conversion
        if (!(userProgram.programId instanceof mongoose.Types.ObjectId) && 'name' in userProgram.programId) {
          const program = userProgram.programId as unknown as IProgram;
          const totalWeeks = program.month.reduce((acc, month) => acc + month.session[0].exercise[0].week.length, 0);
          const programEndDate = moment(userProgram.startDate).add(totalWeeks, 'weeks');

          if (currentDate.isBefore(programEndDate)) {
            if (!activeProgram) {
              // C'est le premier programme actif
              const restructuredProgram = await restructureProgram(program, userProgram.startDate);
              activeProgram = {
                ...program.toObject(),
                restructuredWeeks: restructuredProgram,
                startDate: userProgram.startDate,
                endDate: programEndDate.toDate()
              };
              updatedUserPrograms.push(userProgram);
            } else {
              // C'est un programme à venir
              upcomingPrograms.push({
                _id: program._id,
                name: program.name,
                startDate: userProgram.startDate
              });
              updatedUserPrograms.push(userProgram);
            }
          } else if (i === 0) {
            // Le premier programme est terminé, mettons à jour la date de début du suivant
            if (user.programs[1]) {
              user.programs[1].startDate = programEndDate.toDate();
            }
          }
        } else {
          console.error('Invalid program data:', userProgram.programId);
        }
      }

      // Mise à jour des programmes de l'utilisateur
      user.programs = updatedUserPrograms;
      await user.save();

      res.status(200).json({
        success: true,
        activeProgram: activeProgram,
        upcomingPrograms: upcomingPrograms
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

import { Response } from "express";
import ProgramModel  from "../models/program.model";
import Program, { IProgram } from "../models/program.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import moment from 'moment';
import { redis } from "../utils/redis";
import User, { IUser, IUserProgram } from "../models/user.model";
import {Warmup, IWarmup } from "../models/warmup.model";
import mongoose from 'mongoose';

// create program
export const createProgram = CatchAsyncError(async(data:any,res:Response)=>{
    const program = await ProgramModel.create(data);
    res.status(201).json({
        success:true,
        program
    });
})

// Get All Programs
export const getAllProgramsService = async (res: Response) => {
    const programs = await ProgramModel.find().sort({ createdAt: -1 });
  
    res.status(201).json({
      success: true,
      programs,
    });
  };
  

  interface RestructuredExercise {
    name: string;
    instructions: string[];
    image: {
      public_id: string;
      url: string;
    };
    sets: number;
    reps?: string[];
    rest?: string[];
    duration?: string[];
    distance?: string[];
  }
  interface IImage {
    public_id: string;
    url: string;
  }
  
  interface IWarmupExercise {
    name: string;
    instructions: string[];
    image: IImage;
    duration: string;
  }
  
  // Interface pour le warmup restructuré (sans les champs Mongoose)
  interface RestructuredWarmup {
    name: string;
    exercise: IWarmupExercise[];
  }
  
  interface RestructuredExercise {
    name: string;
    instructions: string[];
    image: IImage;
    sets: number;
    reps?: string[];
    rest?: string[];
    duration?: string[];
    distance?: string[];
  }
  
  interface RestructuredSession {
    warmup: RestructuredWarmup | null;
    instructions: string;
    exercises: RestructuredExercise[];
  }
  
  interface RestructuredWeek {
    weekNumber: number;
    isCurrent: boolean;
    sessions: RestructuredSession[];
  }

  export function restructureProgram(program: IProgram, startDate: Date): RestructuredWeek[] {
    const restructuredWeeks: RestructuredWeek[] = [];
    const currentDate = moment();
    const startMoment = moment(startDate);
    const currentProgramWeek = currentDate.diff(startMoment, 'weeks') + 1;
  
    let globalWeekIndex = 0;
  
    for (const month of program.month) {
      for (const session of month.session) {
        const weeksInSession = session.exercise[0]?.week.length || 0;
  
        for (let weekIndex = 0; weekIndex < weeksInSession; weekIndex++) {
          globalWeekIndex++;
  
          if (globalWeekIndex <= currentProgramWeek) {
            const restructuredWeek: RestructuredWeek = {
              weekNumber: globalWeekIndex,
              isCurrent: globalWeekIndex === currentProgramWeek,
              sessions: []
            };
  
            let restructuredWarmup: RestructuredWarmup | null = null;
  
            if (session.warmupId && typeof session.warmupId !== 'string') {
              // Si warmupId n'est pas une chaîne, c'est qu'il a été peuplé
              const warmup = session.warmupId as unknown as IWarmup;
              restructuredWarmup = {
                name: warmup.name,
                exercise: warmup.exercise.map(ex => ({
                  name: ex.name,
                  instructions: ex.instructions,
                  image: ex.image,
                  duration: ex.duration
                }))
              };
            }
      
            const restructuredSession: RestructuredSession = {
              warmup: restructuredWarmup,
              instructions: session.instructions,
              exercises: []
            };
  
            for (const exercise of session.exercise) {
              if (weekIndex < exercise.week.length) {
                const weekData = exercise.week[weekIndex];
                const restructuredExercise: RestructuredExercise = {
                  name: exercise.name,
                  instructions: exercise.instructions,
                  image: exercise.image,
                  sets: weekData.sets,
                  reps: weekData.reps,
                  rest: weekData.rest,
                  duration: weekData.duration,
                  distance: weekData.distance
                };
                restructuredSession.exercises.push(restructuredExercise);
              }
            }
  
            restructuredWeek.sessions.push(restructuredSession);
            restructuredWeeks.push(restructuredWeek);
          }
        }
      }
    }
  
    return restructuredWeeks.sort((a, b) => a.weekNumber - b.weekNumber);
  }
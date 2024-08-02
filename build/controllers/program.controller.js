"use strict";
// import { NextFunction, Request, Response } from "express";
// import { CatchAsyncError } from "../middleware/catchAsyncErrors";
// import ErrorHandler from "../utils/ErrorHandler";
// import cloudinary from "cloudinary";
// import { createProgram, getAllProgramsService } from "../services/program.service";
// import ProgramModel from "../models/program.model";
// import { redis } from "../utils/redis";
// import mongoose from "mongoose";
// import path from "path";
// import ejs from "ejs";
// import sendMail from "../utils/sendMail";
// import NotificationModel from "../models/notification.Model";
// import axios from "axios";
// // upload program
// export const uploadProgram = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       const thumbnail = data.thumbnail;
//       if (thumbnail) {
//         const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
//           folder: "programs",
//         });
//         data.thumbnail = {
//           public_id: myCloud.public_id,
//           url: myCloud.secure_url,
//         };
//       }
//       createProgram(data, res, next);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
// // edit program
// export const editProgram = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       const thumbnail = data.thumbnail;
//       const programId = req.params.id;
//       const programData = await ProgramModel.findById(programId) as any;
//       if (thumbnail && !thumbnail.startsWith("https")) {
//         await cloudinary.v2.uploader.destroy(programData.thumbnail.public_id);
//         const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
//           folder: "programs",
//         });
//         data.thumbnail = {
//           public_id: myCloud.public_id,
//           url: myCloud.secure_url,
//         };
//       }
//       if (thumbnail.startsWith("https")) {
//         data.thumbnail = {
//           public_id: programData?.thumbnail.public_id,
//           url: programData?.thumbnail.url,
//         };
//       }
//       const program = await ProgramModel.findByIdAndUpdate(
//         programId,
//         {
//           $set: data,
//         },
//         { new: true }
//       );
//       res.status(201).json({
//         success: true,
//         program,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
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
// // get all programs --- without purchasing
// export const getAllPrograms = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const programs = await ProgramModel.find().select(
//         "-programData.videoUrl -programData.suggestion -programData.questions -programData.links"
//       );
//       res.status(200).json({
//         success: true,
//         programs,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
// // get program content -- only for valid user
// export const getProgramByUser = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userProgramList = req.user?.programs;
//       const programId = req.params.id;
//       const programExists = userProgramList?.find(
//         (program: any) => program._id.toString() === programId
//       );
//       if (!programExists) {
//         return next(
//           new ErrorHandler("You are not eligible to access this program", 404)
//         );
//       }
//       const program = await ProgramModel.findById(programId);
//       const content = program?.programData;
//       res.status(200).json({
//         success: true,
//         content,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
// // add question in program
// interface IAddQuestionData {
//   question: string;
//   programId: string;
//   contentId: string;
// }
// export const addQuestion = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { question, programId, contentId }: IAddQuestionData = req.body;
//       const program = await ProgramModel.findById(programId);
//       if (!mongoose.Types.ObjectId.isValid(contentId)) {
//         return next(new ErrorHandler("Invalid content id", 400));
//       }
//       const programContent = program?.programData?.find((item: any) =>
//         item._id.equals(contentId)
//       );
//       if (!programContent) {
//         return next(new ErrorHandler("Invalid content id", 400));
//       }
//       // create a new question object
//       const newQuestion: any = {
//         user: req.user,
//         question,
//         questionReplies: [],
//       };
//       // add this question to our program content
//       programContent.questions.push(newQuestion);
//       await NotificationModel.create({
//         user: req.user?._id,
//         title: "New Question Received",
//         message: `You have a new question in ${programContent.title}`,
//       });
//       // save the updated program
//       await program?.save();
//       res.status(200).json({
//         success: true,
//         program,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
// // add answer in program question
// interface IAddAnswerData {
//   answer: string;
//   programId: string;
//   contentId: string;
//   questionId: string;
// }
// export const addAnwser = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { answer, programId, contentId, questionId }: IAddAnswerData =
//         req.body;
//       const program = await ProgramModel.findById(programId);
//       if (!mongoose.Types.ObjectId.isValid(contentId)) {
//         return next(new ErrorHandler("Invalid content id", 400));
//       }
//       const programContent = program?.programData?.find((item: any) =>
//         item._id.equals(contentId)
//       );
//       if (!programContent) {
//         return next(new ErrorHandler("Invalid content id", 400));
//       }
//       const question = programContent?.questions?.find((item: any) =>
//         item._id.equals(questionId)
//       );
//       if (!question) {
//         return next(new ErrorHandler("Invalid question id", 400));
//       }
//       // create a new answer object
//       const newAnswer: any = {
//         user: req.user,
//         answer,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };
//       // add this answer to our program content
//       question.questionReplies.push(newAnswer);
//       await program?.save();
//       if (req.user?._id === question.user._id) {
//         // create a notification
//         await NotificationModel.create({
//           user: req.user?._id,
//           title: "New Question Reply Received",
//           message: `You have a new question reply in ${programContent.title}`,
//         });
//       } else {
//         const data = {
//           name: question.user.name,
//           title: programContent.title,
//         };
//         const html = await ejs.renderFile(
//           path.join(__dirname, "../mails/question-reply.ejs"),
//           data
//         );
//         try {
//           await sendMail({
//             email: question.user.email,
//             subject: "Question Reply",
//             template: "question-reply.ejs",
//             data,
//           });
//         } catch (error: any) {
//           return next(new ErrorHandler(error.message, 500));
//         }
//       }
//       res.status(200).json({
//         success: true,
//         program,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
// //TODO Reviews
// // // add review in program
// // interface IAddReviewData {
// //   review: string;
// //   rating: number;
// //   userId: string;
// // }
// // export const addReview = CatchAsyncError(
// //   async (req: Request, res: Response, next: NextFunction) => {
// //     try {
// //       const userProgramList = req.user?.programs;
// //       const programId = req.params.id;
// //       // check if programId already exists in userProgramList based on _id
// //       const programExists = userProgramList?.some(
// //         (program: any) => program._id.toString() === programId.toString()
// //       );
// //       if (!programExists) {
// //         return next(
// //           new ErrorHandler("You are not eligible to access this program", 404)
// //         );
// //       }
// //       const program = await ProgramModel.findById(programId);
// //       const { review, rating } = req.body as IAddReviewData;
// //       const reviewData: any = {
// //         user: req.user,
// //         rating,
// //         comment: review,
// //       };
// //       program?.reviews.push(reviewData);
// //       let avg = 0;
// //       program?.reviews.forEach((rev: any) => {
// //         avg += rev.rating;
// //       });
// //       if (program) {
// //         program.ratings = avg / program.reviews.length; // one example we have 2 reviews one is 5 another one is 4 so math working like this = 9 / 2  = 4.5 ratings
// //       }
// //       await program?.save();
// //       await redis.set(programId, JSON.stringify(program), "EX", 604800); // 7days
// //       // create notification
// //       await NotificationModel.create({
// //         user: req.user?._id,
// //         title: "New Review Received",
// //         message: `${req.user?.name} has given a review in ${program?.name}`,
// //       });
// //       res.status(200).json({
// //         success: true,
// //         program,
// //       });
// //     } catch (error: any) {
// //       return next(new ErrorHandler(error.message, 500));
// //     }
// //   }
// // );
// // // add reply in review
// // interface IAddReviewData {
// //   comment: string;
// //   programId: string;
// //   reviewId: string;
// // }
// // export const addReplyToReview = CatchAsyncError(
// //   async (req: Request, res: Response, next: NextFunction) => {
// //     try {
// //       const { comment, programId, reviewId } = req.body as IAddReviewData;
// //       const program = await ProgramModel.findById(programId);
// //       if (!program) {
// //         return next(new ErrorHandler("Program not found", 404));
// //       }
// //       const review = program?.reviews?.find(
// //         (rev: any) => rev._id.toString() === reviewId
// //       );
// //       if (!review) {
// //         return next(new ErrorHandler("Review not found", 404));
// //       }
// //       const replyData: any = {
// //         user: req.user,
// //         comment,
// //         createdAt: new Date().toISOString(),
// //         updatedAt: new Date().toISOString(),
// //       };
// //       if (!review.commentReplies) {
// //         review.commentReplies = [];
// //       }
// //       review.commentReplies?.push(replyData);
// //       await program?.save();
// //       await redis.set(programId, JSON.stringify(program), "EX", 604800); // 7days
// //       res.status(200).json({
// //         success: true,
// //         program,
// //       });
// //     } catch (error: any) {
// //       return next(new ErrorHandler(error.message, 500));
// //     }
// //   }
// // );
// // get all programs --- only for admin
// export const getAdminAllPrograms = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       getAllProgramsService(res);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// // Delete Program --- only for admin
// export const deleteProgram = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { id } = req.params;
//       const program = await ProgramModel.findById(id);
//       if (!program) {
//         return next(new ErrorHandler("program not found", 404));
//       }
//       await program.deleteOne({ id });
//       await redis.del(id);
//       res.status(200).json({
//         success: true,
//         message: "program deleted successfully",
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// // generate video url
// export const generateVideoUrl = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { videoId } = req.body;
//       const response = await axios.post(
//         `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
//         { ttl: 300 },
//         {
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//             Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
//           },
//         }
//       );
//       res.json(response.data);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

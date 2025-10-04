import { ScoreSheet, Lecturer, GeneralScoreSheet } from '../models/index';
import mongoose from 'mongoose';


export default class ScoreSheetService {
    static async createDeptScoreSheet(criteria: { name: string; weight: number }[], userId: string) {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) throw new Error("Criteria weights must add up to 100");

    const lecturer = await Lecturer.findOne({ user: userId });
    if (!lecturer || !lecturer.department) {
      throw new Error("Lecturer not found or department = Lecturer.findById(userId) not set");
    }

    const tempId = new mongoose.Types.ObjectId();


    const scoreSheet = await ScoreSheet.create({
      defence: tempId,
      department: lecturer.department,
      criteria,
      entries: [],
    });

    return scoreSheet;
  }

  static async getDeptScoreSheet(department: string) {
    return await ScoreSheet.findOne({ department })

  }

  static async UpdateCriterionDeptScoreSheet(
    userId: string,
    criterionId: string,
    update: { name?: string; weight?: number }
  ) {
    const lecturer = await Lecturer.findOne({ user: userId });
    if (!lecturer || !lecturer.department) {
      throw new Error("Lecturer not found or department not set");
    }

    const scoreSheet = await ScoreSheet.findOne({ department: lecturer.department });
    if (!scoreSheet) {
      throw new Error("ScoreSheet not found for department");
    }

    const criterion = scoreSheet.criteria.find((c: any) => c._id.toString() === criterionId);
    if (!criterion) {
      throw new Error("Criterion not found");
    }

    if (update.name !== undefined) criterion.name = update.name;
    if (update.weight !== undefined) criterion.weight = update.weight;

    // validate sum
    const totalWeight = scoreSheet.criteria.reduce((sum, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      throw new Error("Criteria weights must add up to 100");
    }

    await scoreSheet.save();
    return scoreSheet;
  }

  static async deleteCriterionDeptScoreSheet(userId: string, criterionId: string) {
    const lecturer = await Lecturer.findOne({ user: userId });
    if (!lecturer || !lecturer.department) {
      throw new Error("Lecturer not found or department not set");
    }

    const scoreSheet = await ScoreSheet.findOne({ department: lecturer.department });
    if (!scoreSheet) {
      throw new Error("ScoreSheet not found for department");
    }

    const criterionIndex = scoreSheet.criteria.findIndex((c: any) => c._id.toString() === criterionId);
    if (criterionIndex === -1) {
      throw new Error("Criterion not found");
    }

    scoreSheet.criteria.splice(criterionIndex, 1);

    // validate sum
    const totalWeight = scoreSheet.criteria.reduce((sum, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100 && scoreSheet.criteria.length > 0) {
      throw new Error("Criteria weights must add up to 100 after deletion");
    }

    await scoreSheet.save();
    return { success: true, deletedId: criterionId };
  }

  static async createGeneralScoreSheet(criteria: { name: string; weight: number }[]) {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) throw new Error("Criteria weights must add up to 100");

    const tempId = new mongoose.Types.ObjectId();


    const scoreSheet = await GeneralScoreSheet.create({
      defence: tempId,
      criteria,
      entries: [],
    });

    return scoreSheet;
  }

  static async updateGenCriterion(
    criterionId: string,
    update: { name?: string; weight?: number }
  ) {
    let scoreSheet = await GeneralScoreSheet.findOne();
    if (!scoreSheet) {
      throw new Error("General ScoreSheet not found");
    }

    const criterion = scoreSheet.criteria.find((c: any) => c._id.toString() === criterionId);
    if (!criterion) {
      throw new Error("Criterion not found");
    }

    if (update.name !== undefined) criterion.name = update.name;
    if (update.weight !== undefined) criterion.weight = update.weight;

    // validate sum
    const totalWeight = scoreSheet.criteria.reduce((sum, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      throw new Error("Criteria weights must add up to 100");
    }

    await scoreSheet.save();
    return criterion;
  }


  static async getGenScoreSheet() {
    return await ScoreSheet.find()
  }

  static async deleteGenCriterion(criterionId: string) {
    let scoreSheet = await GeneralScoreSheet.findOne();
    if (!scoreSheet) {
      throw new Error("General ScoreSheet not found");
    }

    const criterionIndex = scoreSheet.criteria.findIndex((c: any) => c._id.toString() === criterionId);
    if (criterionIndex === -1) {
      throw new Error("Criterion not found");
    }

    scoreSheet.criteria.splice(criterionIndex, 1);

    // validate sum
    const totalWeight = scoreSheet.criteria.reduce((sum, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100 && scoreSheet.criteria.length > 0) {
      throw new Error("Criteria weights must add up to 100 after deletion");
    }

    await scoreSheet.save();
    return criterionId;
  }

}
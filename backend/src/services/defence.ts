import { Defence, Student, User} from '../models/index';
import NotificationService from '../services/notification'
import {Types} from 'mongoose';


interface CreateDefenceInput {
  stage: string;              // e.g., "proposal"
  session: string;            // session ID (string)
  date: Date;
  panelMembers: string[];     // array of user IDs from frontend
}


export default class DefenceService {
  static async getAllDefenses() {
    return Defence.find().populate('students');
  }
  static async getDefenceById(defenceId: string) {
    return Defence.findById(defenceId).populate('students');
  }

  static async createDefence(defenceData: CreateDefenceInput) {
  const { stage, session, date, panelMembers } = defenceData;

  // Validate session and stage students
  const students = await Student.find({
    currentStage: stage,
    session: new Types.ObjectId(session),
  }).select('_id');

  if (!students.length) {
    throw new Error('No students found for this stage and session.');
  }

  // Validate that each panelMember ID is a real user with isPanelMember: true
  const validPanelMembers = await User.find({
    _id: { $in: panelMembers.map(id => new Types.ObjectId(id)) },
    isPanelMember: true,
  }).select('_id');

  if (validPanelMembers.length !== panelMembers.length) {
    throw new Error('One or more panel members are invalid.');
  }

  const defence = new Defence({
    stage,
    session: new Types.ObjectId(session),
    date,
    students: students.map(s => s._id),
    panelMembers: validPanelMembers.map(u => u._id),
  });

   await defence.save()
  await NotificationService.sendStudentDefenceNotifications(students, stage, date);
await NotificationService.sendPanelDefenceNotifications(panelMembers, stage, date);
return defence
}
}
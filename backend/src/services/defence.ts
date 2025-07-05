import { Lecturer, User, Defence } from '../models/index';


export default class DefenceService {
  static async getAllDefenses() {
    return Defence.find().populate('students');
  }

 

  

//   static async getAllSessions() {
//     return Session.find().populate('students');
//   }
}
import { Defence, IDefence} from '../models/index';


export default class DefenceService {
  static async getAllDefenses() {
    return Defence.find().populate('students');
  }
  static async getDefenceById(defenceId: string) {
    return Defence.findById(defenceId).populate('students');
  }

  static async addDefence(defenceData: IDefence) {
    const defence = new Defence(defenceData);
    return defence.save();
  }
}
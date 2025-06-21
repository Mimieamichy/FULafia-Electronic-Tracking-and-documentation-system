import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import { UserRole } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecretkey';
const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || '3600');

export class AuthService {
  static async register(data: {
  firstName: string;
  lastName: string;
  matricNo: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<IUser> {
  const { firstName, lastName, matricNo, email, password, role } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('Email already in use');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    firstName,
    lastName,
    matricNo,
    email,
    password: hashedPassword,
    role,
  });

  return await user.save();
}


  static async login(email: string, password: string): Promise<{
  user: IUser;
  token: string;
  expiresIn: number;
}> {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: expiresIn });
  if (!token) throw new Error('Error generating token');

  return { user, token, expiresIn };
}

}





import mongoose, { Schema, Model, Document } from 'mongoose';
import { User } from '../entities/User';

export interface IUser {
  userId: string;
  username: string;
  displayName: string;
  profileImage?: string | null;
  isBlocked: boolean;
}

interface IUserDocument extends Document, IUser {}

const UserSchema: Schema = new Schema({
  userId: { type: String, required: true }, 
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  profileImage: { type: String, required: false },
  isBlocked: { type: Boolean, default: false },
});

export const MongooseUserModel: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);

export class UserModel {
  private model: Model<IUserDocument>;

  constructor() {
    this.model = MongooseUserModel;
  }

  async createUser(user: IUser): Promise<IUser> {
    const userDoc = new this.model({
      userId: user.userId,
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage,
      isBlocked: user.isBlocked,
    });

    const savedUser = await userDoc.save();
    return {
      userId: savedUser.userId,
      username: savedUser.username,
      displayName: savedUser.displayName,
      profileImage: savedUser.profileImage ?? null, 
      isBlocked: savedUser.isBlocked
    };
  }

  async findUserById(userId: string): Promise<IUser | null> {
    const userDoc = await this.model.findOne({ userId });
    if (!userDoc) return null;

    return {
      userId: userDoc.userId,
      username: userDoc.username,
      displayName: userDoc.displayName,
      profileImage: userDoc.profileImage ?? null,
      isBlocked: userDoc.isBlocked
    };
  }

  async findById(id: string): Promise<IUser | null> {
    const userDoc = await this.model.findById(id);
    if (!userDoc) return null;

    return {
      userId: userDoc.userId,
      username: userDoc.username,
      displayName: userDoc.displayName,
      profileImage: userDoc.profileImage ?? null,
      isBlocked: userDoc.isBlocked
    };
  }
  
}

export { IUserDocument };

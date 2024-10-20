import { User } from "../entities/User";
import { IUserRepository } from "../interfaces/IUserRepository";
import { MongooseUserModel, UserModel } from "../Models/UserModel";
import CustomError from "../utils/CustomError";



export class UserRepository implements IUserRepository {
  async saveUser(userData: User): Promise<void> {
    try {
      const user = new UserModel()
      await new UserModel().createUser(userData)
    } catch (error) {
      throw new CustomError("Error saving user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async updateUser(userData: User): Promise<void> {
    try {
      const updatedUser = await MongooseUserModel.findOneAndUpdate(
        { userId: userData.userId }, 
        {
          username: userData.username,
          displayName: userData.displayName,
          profileImage: userData.profileImage,
          isBlocked: userData.isBlocked,
        },
        { new: true } 
      );
  
      if (!updatedUser) {
        throw new CustomError("User not found", 404);
      }
    } catch (error) {
      throw new CustomError(
        "Error updating user: " + (error instanceof Error ? error.message : "Unknown error"),
        500
      );
    }
  }

  async updateProfileImage(userData: Partial<User>): Promise<void> {
    try {
      if (!userData.userId) {
        throw new CustomError("User ID is missing", 400);
      }
      const user = await MongooseUserModel.findOne({userId: userData.userId});
      if (!user) {
        throw new CustomError("User not found", 404);
      }
      user.profileImage = userData.profileImage
      await user.save()
    } catch (error) {
      throw new CustomError(
        "Error updating user: " + (error instanceof Error ? error.message : "Unknown error"),
        500
      );
    }
  }
  
  
}
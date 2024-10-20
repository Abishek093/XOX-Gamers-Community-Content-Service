import { User } from "../entities/User";
import { IUserInteractor } from "../interfaces/IUserInteractor";
import { IUserRepository } from "../interfaces/IUserRepository";
import CustomError from "../utils/CustomError";

export class UserInteractor implements IUserInteractor {
  constructor(private repository: IUserRepository) { }

  async createUser(userData: User): Promise<void> {
    try {
      await this.repository.saveUser(userData)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async updateUser(userData: User): Promise<void> {
    try {
      await this.repository.updateUser(userData)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async updateProfileImage(userData: Partial<User>): Promise<void>{
    try {
      await this.repository.updateProfileImage(userData)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }
}
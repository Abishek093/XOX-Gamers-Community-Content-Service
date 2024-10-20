import { User } from "../entities/User";

export interface IUserRepository{
    saveUser(userData: User):Promise<void>
    updateUser(userData: User):Promise<void>
    updateProfileImage(userData: Partial<User>): Promise<void>
}
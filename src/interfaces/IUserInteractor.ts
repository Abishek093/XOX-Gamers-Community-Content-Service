import { User } from "../entities/User";

export interface IUserInteractor{
    createUser(userData: User):Promise<void>
    updateUser(userData: User):Promise<void>
    updateProfileImage(userData: Partial<User>): Promise<void>
}
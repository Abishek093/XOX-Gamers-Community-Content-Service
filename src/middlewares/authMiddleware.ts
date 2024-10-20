// import { NextFunction, Response, Request } from "express";
// import jwt, { JwtPayload } from 'jsonwebtoken';
// // import UserModel, { IUser } from "../data/UserModel";
// import { UserModel, IUser } from '../Models/UserModel'
// export const protectUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const token = req.header("Authorization");

//   if (!token || !token.startsWith("Bearer ")) {
//     console.log("No token or invalid format");
//     res.status(401).json({ message: "Not authorized, no token or invalid format" });
//     return;
//   }

//   try {
//     const tokenWithoutBearer = token.replace("Bearer ", "").trim();
//     console.log("Token without Bearer:", tokenWithoutBearer);

//     const secretKey: string = process.env.JWT_SECRET_KEY || "";
//     const decoded = jwt.verify(tokenWithoutBearer, secretKey) as JwtPayload & { userId: string };
//     console.log({ decoded });

//     if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
//       const userId = decoded.userId;
//       const user: IUser | null = await UserModel.findById(userId);
//       if (!user) {
//         res.status(401).json({ message: "User not found" });
//         return;
//       }
//       if (user.isBlocked) {
//         res.status(401).json({ message: "User is blocked" });
//         return;
//       }
//       (req as any).locals = { user };
//       next();
//     } else {
//       throw new Error('Invalid token format');
//     }
//   } catch (error) {
//     console.error("Error verifying token:", error);
//     res.status(401).json({ message: "Not authorized, invalid token" });
//   }
// };




import { NextFunction, Response, Request } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserModel, IUser, MongooseUserModel } from '../Models/UserModel';  // Correct import now

export const protectUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    console.log("No token or invalid format");
    res.status(401).json({ message: "Not authorized, no token or invalid format" });
    return;
  }

  try {
    const tokenWithoutBearer = token.replace("Bearer ", "").trim();
    console.log("Token without Bearer:", tokenWithoutBearer);

    const secretKey: string = process.env.JWT_SECRET_KEY || "";
    const decoded = jwt.verify(tokenWithoutBearer, secretKey) as JwtPayload & { userId: string };
    console.log({ decoded });

    if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
      const userId = decoded.userId;
      // const user: IUser | null = await new UserModel().findById(userId);  // Use the correct findById method
      const user: IUser | null = await MongooseUserModel.findOne({userId: userId})
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      if (user.isBlocked) {
        res.status(401).json({ message: "User is blocked" });
        return;
      }
      (req as any).locals = { user };
      next();
    } else {
      throw new Error('Invalid token format');
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
